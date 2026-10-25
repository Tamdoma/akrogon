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
  merge: { skill: 'merge-issue', slots: ['B'], next: ['merged', 'check.fix', 'failed'] },
  merged: { skill: null, slots: [], next: [] },
  failed: {
    skill: null,
    slots: [],
    next: ['plan.synthesis', 'implement', 'check.review', 'check.repair', 'check.fix', 'merge'],
  },
};

export function requiredSlots(phase: Phase, rounds: number): readonly Slot[] {
  return phase === 'check.review' && rounds > 0 ? ['B'] : routing[phase].slots;
}

const retiredSlots: Record<RetiredPhase, readonly Slot[]> = {
  'plan.positions': ['A', 'B'],
  'plan.rebuttal': ['A', 'B'],
};

export function historicalSlots(phase: HistoricalPhase, rounds: number): readonly Slot[] {
  return phase === 'plan.positions' || phase === 'plan.rebuttal' ? retiredSlots[phase] : requiredSlots(phase, rounds);
}
