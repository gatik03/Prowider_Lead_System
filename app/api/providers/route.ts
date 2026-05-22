import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  console.log('[API GET /api/providers] Fetching providers list');

  try {
    const providers = await prisma.provider.findMany({
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

    const result = providers.map((provider) => ({
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

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[API GET /api/providers] Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
