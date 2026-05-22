import { Prisma } from '@prisma/client';
import prisma from './prisma';

interface ServiceRule {
  mandatory: number[];
  pool: number[];
}

const SERVICE_RULES: Record<number, ServiceRule> = {
  1: {
    mandatory: [1],
    pool: [2, 3, 4],
  },
  2: {
    mandatory: [5],
    pool: [6, 7, 8],
  },
  3: {
    mandatory: [1, 4],
    pool: [2, 3, 5, 6, 7, 8],
  },
};

/**
 * Allocates a lead to exactly 3 providers according to service rules,
 * quotas, and round-robin persisted pointer.
 *
 * Concurrency Protection:
 * - Uses a SERIALIZABLE transaction to prevent phantom reads and serialization anomalies.
 * - Uses SELECT FOR UPDATE raw SQL query on the AllocationPointer row to lock database
 *   access for the specific serviceId, preventing concurrent threads from allocating
 *   leads for the same service simultaneously.
 *
 * @param leadId The ID of the Lead to assign.
 * @param serviceId The ID of the Service of the lead.
 */
export async function assignProvidersToLead(leadId: string, serviceId: number) {
  const rule = SERVICE_RULES[serviceId];
  if (!rule) {
    throw new Error(`No allocation rules defined for serviceId: ${serviceId}`);
  }

  const MAX_RETRIES = 5;
  let attempt = 0;

  while (true) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          console.log(`[ALLOCATION] Starting allocation for lead ${leadId} (Service ${serviceId}), attempt ${attempt + 1}`);

          // 1. Lock the AllocationPointer for this serviceId using SELECT ... FOR UPDATE
          // This forces other transactions allocating for the same serviceId to wait,
          // preventing race conditions on the round-robin pointer.
          interface AllocationPointerRow {
            id: number;
            serviceId: number;
            pointer: number;
          }
          const pointers = await tx.$queryRaw<AllocationPointerRow[]>`
            SELECT * FROM "AllocationPointer"
            WHERE "serviceId" = ${serviceId}
            FOR UPDATE
          `;

          if (pointers.length === 0) {
            throw new Error(`AllocationPointer not found for serviceId: ${serviceId}`);
          }

          const dbPointer = pointers[0];
          const currentPointerVal = dbPointer.pointer;

          // 2. Fetch all candidate providers to check quotas
          const candidateIds = Array.from(new Set([...rule.mandatory, ...rule.pool]));
          const providers = await tx.provider.findMany({
            where: { id: { in: candidateIds } },
          });

          const providerMap = new Map(providers.map((p) => [p.id, p]));

          const selectedProviders: number[] = [];
          const selectedSet = new Set<number>();

          // Helper to try selecting a provider
          const trySelect = (providerId: number, isMandatory: boolean) => {
            const provider = providerMap.get(providerId);
            if (!provider) {
              console.log(`[ALLOCATION] Provider ${providerId} not found in database.`);
              return false;
            }

            if (provider.leadsReceived >= provider.monthlyQuota) {
              console.log(
                `[ALLOCATION] SKIP Provider ${providerId} (${provider.name}): Quota exceeded (${provider.leadsReceived}/${provider.monthlyQuota})`
              );
              return false;
            }

            if (selectedSet.has(providerId)) {
              return false;
            }

            selectedProviders.push(providerId);
            selectedSet.add(providerId);
            console.log(
              `[ALLOCATION] SELECT Provider ${providerId} (${provider.name}) [${
                isMandatory ? 'Mandatory' : 'Pool'
              }]`
            );
            return true;
          };

          // 3. Select mandatory providers first
          for (const mandatoryId of rule.mandatory) {
            trySelect(mandatoryId, true);
          }

          // 4. Fill remaining spots using the round-robin pool
          let lastSelectedIndexInPool: number | null = null;

          if (selectedProviders.length < 3 && rule.pool.length > 0) {
            const startIndex = currentPointerVal % rule.pool.length;
            console.log(
              `[ALLOCATION] Pool selection start index: ${startIndex} (pointer: ${currentPointerVal}, pool size: ${rule.pool.length})`
            );

            for (let i = 0; i < rule.pool.length; i++) {
              if (selectedProviders.length === 3) break;

              const poolIndex = (startIndex + i) % rule.pool.length;
              const providerId = rule.pool[poolIndex];

              const success = trySelect(providerId, false);
              if (success) {
                lastSelectedIndexInPool = poolIndex;
              }
            }
          }

          // 5. Verify we selected exactly 3 providers
          if (selectedProviders.length < 3) {
            console.log(
              `[ALLOCATION] Failed to assign lead ${leadId}. Only found ${selectedProviders.length} providers with quota.`
            );
            throw new Error('Not enough providers with remaining quota');
          }

          // 6. Create LeadAssignment rows and increment Provider leadsReceived
          for (const providerId of selectedProviders) {
            await tx.leadAssignment.create({
              data: {
                leadId,
                providerId,
              },
            });

            await tx.provider.update({
              where: { id: providerId },
              data: {
                leadsReceived: { increment: 1 },
              },
            });
          }

          // 7. Update round-robin pointer if we selected any pool providers
          if (lastSelectedIndexInPool !== null) {
            const newPointerVal = (lastSelectedIndexInPool + 1) % rule.pool.length;
            await tx.allocationPointer.update({
              where: { serviceId },
              data: {
                pointer: newPointerVal,
              },
            });
            console.log(
              `[ALLOCATION] Pointer for service ${serviceId} advanced from ${currentPointerVal} to ${newPointerVal}`
            );
          }

          console.log(
            `[ALLOCATION] Lead ${leadId} successfully assigned to providers: ${selectedProviders.join(
              ', '
            )}`
          );

          // Fetch the created assignments with provider details to return
          return await tx.leadAssignment.findMany({
            where: { leadId },
            include: {
              provider: true,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );
    } catch (error: unknown) {
      attempt++;
      let isSerializationError = false;
      if (error && typeof error === 'object') {
        const errObj = error as { code?: string; meta?: { code?: string }; message?: string };
        isSerializationError =
          errObj.code === 'P2034' ||
          errObj.meta?.code === '40001' ||
          errObj.message?.includes('could not serialize access') === true;
      }

      if (isSerializationError && attempt < MAX_RETRIES) {
        console.log(`[ALLOCATION] Serialization conflict detected. Retrying attempt ${attempt}/${MAX_RETRIES}...`);
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10));
        continue;
      }
      throw error;
    }
  }
}
