import { createCase, getCases, updateCase, type Case, type CasePriority, type CaseStatus } from '@/lib/api';

type CaseEntityType = 'user' | 'transaction' | 'wallet' | 'ip';

type LinkCaseArgs = {
  entityType: CaseEntityType;
  entityId: string;
  title: string;
  note: string;
  priority?: CasePriority;
  preferredStatus?: CaseStatus; // usually 'open' or 'investigating'
};

export async function linkOrCreateCaseAndAppendNote(args: LinkCaseArgs): Promise<Case | null> {
  const entityId = String(args.entityId || '').trim();
  if (!entityId) return null;

  const preferredStatus = args.preferredStatus || 'open';

  // Find an existing case first (open/investigating), then fallback to any.
  const probe = async (status?: CaseStatus) => {
    const res = await getCases(5, 0, {
      entity_type: args.entityType,
      entity_id: entityId,
      status,
    });
    return res.data?.items?.[0] || null;
  };

  const existing = (await probe(preferredStatus)) || (await probe('investigating')) || (await probe(undefined));
  if (existing) {
    await updateCase(existing.id, { note: args.note });
    return existing;
  }

  const created = await createCase({
    title: args.title,
    priority: args.priority || 'medium',
    entity_type: args.entityType,
    entity_id: entityId,
    note: args.note,
  });

  return created.data || null;
}

