import { z } from 'zod';
export const phaseSchema = z.enum([
  'plan.synthesis',
  'implement',
  'check.review',
  'check.repair',
  'check.fix',
  'merge',
  'merged',
  'failed',
]);

export const slotSchema = z.enum(['A', 'B']);

export const verdictSchema = z.enum(['ready', 'nits', 'fix']);

export type Phase = z.infer<typeof phaseSchema>;

export const retiredPhaseSchema = z.enum(['plan.positions', 'plan.rebuttal']);

export type RetiredPhase = z.infer<typeof retiredPhaseSchema>;

// issues/log.jsonl history is never rewritten, so history schemas accept retired phases.
export const historicalPhaseSchema = z.enum([...retiredPhaseSchema.options, ...phaseSchema.options]);

export type HistoricalPhase = z.infer<typeof historicalPhaseSchema>;

export type Slot = z.infer<typeof slotSchema>;

export type Verdict = z.infer<typeof verdictSchema>;

type Route = { skill: string | null; slots: readonly Slot[]; next: readonly Phase[] };

export const routing: Record<Phase, Route> = {
  'plan.synthesis': { skill: 'plan-issue', slots: ['A'], next: ['implement', 'failed'] },
  implement: { skill: 'implement-issue', slots: ['A'], next: ['check.review', 'failed'] },
  'check.review': { skill: 'check-issue', slots: ['A', 'B'], next: ['merge', 'check.repair', 'failed'] },
  'check.repair': { skill: 'check-issue', slots: ['B'], next: ['merge', 'check.fix', 'failed'] },
  'check.fix': { skill: 'implement-issue', slots: ['A'], next: ['check.review', 'failed'] },
  merge: { skill: null, slots: [], next: ['merged', 'check.repair', 'failed'] },
  merged: { skill: null, slots: [], next: [] },
  failed: {
    skill: null,
    slots: [],
    next: ['plan.synthesis', 'implement', 'check.review', 'check.repair', 'check.fix', 'merge'],
  },
};

// Direct leaves have no allocated seats: implement/repair/fix/merge/failed are the door's own work
// and the reviewer alone owns check.review at every round, round 0 included (plan D6).
const directSlots: Partial<Record<Phase, readonly Slot[]>> = {
  implement: ['A'],
  'check.review': ['B'],
  'check.repair': ['A'],
  'check.fix': ['A'],
  merge: ['A'],
  failed: ['A'],
};

export function requiredSlots(phase: Phase, rounds: number, direct: boolean = false): readonly Slot[] {
  if (direct) return directSlots[phase] ?? routing[phase].slots;
  return phase === 'check.review' && rounds > 0 ? ['B'] : routing[phase].slots;
}

const retiredSlots: Record<RetiredPhase, readonly Slot[]> = {
  'plan.positions': ['A', 'B'],
  'plan.rebuttal': ['A', 'B'],
};

export function historicalSlots(phase: HistoricalPhase, rounds: number, direct: boolean = false): readonly Slot[] {
  return phase === 'plan.positions' || phase === 'plan.rebuttal'
    ? retiredSlots[phase]
    : requiredSlots(phase, rounds, direct);
}
