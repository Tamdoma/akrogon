# Same work

## Question

Q1. When a bare name passed to `akrogon next` matches more than one target (an issue or epic and a leaf, or an epic and its issue), what should `next` do? Candidates: (a) treat matches selecting the identical leaf set as one and refuse otherwise; (b) a leaf slug always wins over owner names, owners searched only when no leaf matches; (c) keep refusing every collision and change the watch loop to pass leaf paths.

### Carries

- Lock 2026-10-08, issues/chart/next-named-targets/forks/names.md Taken 3a: every collision refuses, including an issue and its same-name leaf even when they select the same work. Reason: a name keeps one meaning as an issue grows. #109 asks to reverse that part.
- Same lock, still binding unless changed: open owners only; existing folder from cwd keeps path meaning; owners recognized from folders above discoverable leaves; closed owner name does not block a new open owner; refusal starts no Herdr call.
- Related: issues/chart/next-named-targets/forks/names.md, skills/watch-issues/SKILL.md, docs/guide/parts.md.

## Findings

Blind notes: [B](../slots/same-work-B.md), [C](../slots/same-work-C.md). Merged: [slots/same-work-merged.md](../slots/same-work-merged.md). Rebuttals: [B](../slots/same-work-rebuttal-B.md), [C](../slots/same-work-rebuttal-C.md).
- (A,B,C) pick (a) equal leaf-path sets collapse; (b) rejected for silent subset starts and closed-leaf wins; (c) rejected as leaving #109 unfixed for operators.
- better-than-training · src/next.ts resolveName/ownerCandidates/selectLeaves, 2026-10-21 · each match carries its leaf set; refusal is by count; cwd folder resolves first (A,B,C).
- better-than-training · repo counts 2026-10-21 · 72-74 closed same-name single-leaf issues; one same-name leaf inside a multi-leaf issue across 11 repos (varhop overlay-rework) (A,C).
- Rebuttal outcome: unreadable or unknown leaf under a matched owner keeps today's refusal, since equality is unproven (C, B revised, A accepts). Compare every candidate's set without relying on findLeaf slug uniqueness (B).
- Off route by agreement: closed-leaf vs open-owner matching (C U2), watch path passing (U3), shared next/phase resolver (U4), leaf counts in refusal (U5).

## Taken
Operator answer 2026-10-21: `1a`
- A bare name whose matches all select the identical set of leaf paths resolves to that set once; any difference refuses with today's kind+path listing and starts no Herdr call. Covers issue/leaf and epic/issue equal sets.
- An unreadable or unknown leaf under any matched owner keeps the refusal, because equality is unproven.
- Compare every candidate's full leaf-path set as built in resolveName, before scheduling or phase filtering; no reliance on findLeaf slug uniqueness.
- docs/guide/parts.md drops the path workaround for same-work pairs and says to pass a path once readings differ.
- Reason: refusal protects nothing when every reading starts the same leaves; growth turns a working name into a refusal, never into different work.
- Foreclosed: (b) leaf slug wins (silent subset starts, closed leaf over open owner); (c) keep refusing and give watch paths (#109 unfixed for operators).
- Changes names.md Taken 3a (2026-10-08) for equal sets only; its other locks stay binding.
