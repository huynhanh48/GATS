import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import { mailService } from '@src/common/utils/mail';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateLeadInput,
  LeadListQuery,
  UpdateLeadInput,
} from '@src/models/Lead.model';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as LeadRepo from '@src/repos/LeadRepo';
import NotificationService from '@src/services/NotificationService';

async function create(input: CreateLeadInput) {
  const phone = input.phone.trim();
  const duplicate = await LeadRepo.findRecentByPhone(phone);
  if (duplicate) {
    return {
      lead: {
        id: duplicate.id,
        createdAt: duplicate.createdAt,
      },
      message: 'Đã ghi nhận đăng ký tư vấn (trùng SĐT gần đây)',
      deduplicated: true,
    };
  }

  const lead = await LeadRepo.create({
    name: input.name.trim(),
    phone,
    email: input.email?.trim() ? input.email.trim() : null,
    message: input.message?.trim() ? input.message.trim() : null,
    source: input.source?.trim() || 'homepage_cta',
  });

  void NotificationService.notify({
    type: 'lead_created',
    title: `Lead tư vấn mới: ${lead.name}`,
    body: [lead.phone, lead.message].filter(Boolean).join(' · '),
    href: '/leads',
    entityId: lead.id,
  });

  const notifyTo = EnvVars.LeadNotifyEmail || EnvVars.EmailUser;
  const lines = [
    `Tên: ${lead.name}`,
    `SĐT: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.message ? `Nội dung: ${lead.message}` : null,
    `Nguồn: ${lead.source}`,
    `Thời gian: ${lead.createdAt.toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await mailService.sendEmail(
      notifyTo,
      `[GATS] Lead tư vấn mới — ${lead.name}`,
      lines,
    );
  } catch (err) {
    console.error('Lead notify email failed', err);
  }

  return {
    lead: {
      id: lead.id,
      createdAt: lead.createdAt,
    },
    message: 'Đã gửi đăng ký tư vấn',
    deduplicated: false,
  };
}

function serializeLead(
  lead: Awaited<ReturnType<typeof LeadRepo.list>>['data'][number] | Awaited<ReturnType<typeof LeadRepo.findById>>,
  assigneeName?: string | null,
) {
  if (!lead) return null;
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    source: lead.source,
    status: lead.status,
    assigneeUserId: lead.assigneeUserId,
    assigneeName:
      assigneeName ??
      ('assigneeName' in lead ? (lead.assigneeName ?? null) : null),
    notes: lead.notes,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

async function list(query: LeadListQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const [{ data, total }, counts] = await Promise.all([
    LeadRepo.list({
      skip,
      take: limit,
      q: query.q,
      status: query.status,
      createdFrom: query.createdFrom,
      createdTo: query.createdTo,
    }),
    LeadRepo.countByStatus(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: data.map((lead) => serializeLead(lead)),
    counts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

async function getById(id: string) {
  const lead = await LeadRepo.findById(id);
  if (!lead) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Lead not found');
  }
  const auditLogs = await AuditLogRepo.listByResource({
    resourceType: 'lead',
    resourceId: id,
    limit: 30,
  });
  return {
    lead: serializeLead(lead),
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      actorUserId: log.actorUserId,
      meta: log.meta,
      createdAt: log.createdAt,
    })),
  };
}

async function update(
  id: string,
  input: UpdateLeadInput,
  actorUserId?: number,
) {
  const existing = await LeadRepo.findById(id);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Lead not found');
  }

  const updated = await LeadRepo.update(id, {
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.assigneeUserId !== undefined
      ? { assigneeUserId: input.assigneeUserId }
      : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  });

  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Lead not found');
  }

  if (input.status !== undefined && input.status !== existing.status) {
    await AuditLogRepo.record({
      actorUserId,
      action: 'lead.status_changed',
      resourceType: 'lead',
      resourceId: id,
      meta: { from: existing.status, to: input.status },
    });
  }

  if (
    input.assigneeUserId !== undefined &&
    input.assigneeUserId !== existing.assigneeUserId
  ) {
    await AuditLogRepo.record({
      actorUserId,
      action: 'lead.assignee_changed',
      resourceType: 'lead',
      resourceId: id,
      meta: { from: existing.assigneeUserId, to: input.assigneeUserId },
    });
  }

  return {
    lead: serializeLead(updated),
    message: 'Đã cập nhật lead',
  };
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function adminExportLeadsCsv(query: LeadListQuery) {
  const rows = await LeadRepo.listForExport({
    q: query.q,
    status: query.status,
    createdFrom: query.createdFrom,
    createdTo: query.createdTo,
  });

  const header = [
    'ID',
    'Thời gian',
    'Tên',
    'SĐT',
    'Email',
    'Trạng thái',
    'Người phụ trách',
    'Nguồn',
    'Nội dung',
    'Ghi chú',
  ];
  const lines = [header.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.createdAt.toISOString(),
        row.name,
        row.phone,
        row.email,
        row.status,
        row.assigneeName,
        row.source,
        row.message,
        row.notes,
      ]
        .map(csvEscape)
        .join(','),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return {
    csv: `\uFEFF${lines.join('\n')}`,
    filename: `leads-${stamp}.csv`,
  };
}

export default {
  create,
  list,
  getById,
  update,
  adminExportLeadsCsv,
};
