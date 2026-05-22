import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { assignProvidersToLead } from '../../../lib/allocation';
import { broadcast } from '../../../lib/sse';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { customerName, phone, city, serviceId, description } = body;

  console.log(`[API POST /api/leads] Request received:`, body);

  // Validation
  if (
    !customerName || typeof customerName !== 'string' ||
    !phone || typeof phone !== 'string' ||
    !city || typeof city !== 'string' ||
    typeof serviceId !== 'number' ||
    !description || typeof description !== 'string'
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  let lead;
  try {
    // Rely strictly on @@unique([phone, serviceId]) database unique constraint
    lead = await prisma.lead.create({
      data: {
        customerName,
        phone,
        city,
        serviceId,
        description,
      },
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      console.log(`[API POST /api/leads] Duplicate lead detected. phone: ${phone}, serviceId: ${serviceId}`);
      return NextResponse.json(
        { error: 'You have already submitted a request for this service.' },
        { status: 409 }
      );
    }
    console.error('[API POST /api/leads] Database error during creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // Assign providers to the created lead
  try {
    const assignments = await assignProvidersToLead(lead.id, serviceId);

    // Fetch and broadcast updated providers via SSE
    try {
      const updatedProviders = await prisma.provider.findMany({
        include: {
          assignments: {
            include: {
              lead: true,
            },
            orderBy: {
              assignedAt: 'desc',
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      });

      const providerData = updatedProviders.map((provider) => ({
        id: provider.id,
        name: provider.name,
        monthlyQuota: provider.monthlyQuota,
        leadsReceived: provider.leadsReceived,
        quotaRemaining: Math.max(0, provider.monthlyQuota - provider.leadsReceived),
        assignedLeads: provider.assignments.map((a) => ({
          assignmentId: a.id,
          assignedAt: a.assignedAt,
          leadId: a.lead.id,
          customerName: a.lead.customerName,
          phone: a.lead.phone,
          city: a.lead.city,
          serviceId: a.lead.serviceId,
          description: a.lead.description,
          createdAt: a.lead.createdAt,
        })),
      }));

      broadcast('new_lead', providerData);
    } catch (broadcastErr: unknown) {
      const errMsg = broadcastErr instanceof Error ? broadcastErr.message : String(broadcastErr);
      console.error('[API POST /api/leads] SSE broadcast failed:', errMsg);
    }

    return NextResponse.json({
      lead,
      assignments: assignments.map((a) => ({
        id: a.id,
        providerId: a.providerId,
        assignedAt: a.assignedAt,
        provider: {
          id: a.provider.id,
          name: a.provider.name,
          leadsReceived: a.provider.leadsReceived,
          monthlyQuota: a.provider.monthlyQuota,
        },
      })),
    }, { status: 201 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[API POST /api/leads] Allocation failed for lead ${lead.id}:`, errMsg);

    // Rollback lead creation to keep database clean
    try {
      await prisma.lead.delete({
        where: { id: lead.id },
      });
      console.log(`[API POST /api/leads] Cleaned up lead ${lead.id} due to allocation rollback.`);
    } catch (deleteErr) {
      console.error(`[API POST /api/leads] Failed to rollback lead ${lead.id}:`, deleteErr);
    }

    const isQuotaError = errMsg === 'Not enough providers with remaining quota';
    return NextResponse.json(
      { error: errMsg },
      { status: isQuotaError ? 400 : 500 }
    );
  }
}
