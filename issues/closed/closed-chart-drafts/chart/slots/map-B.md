# Territory map B

Blind inspection only. No map A read, no live files changed, no runtime reproduction after the manual rename. Repository references below are relative to `/home/ivan/Work/infra/akrogon`; evidence references are relative to `/home/ivan/Work/infra/tamdoma/framework`.

## Findings

- F1: The mechanism matches the report. Completion moves the chart wholesale into the closed owner (`src/phase.ts:171-174`). Discovery recursively treats any `state.yaml` as a candidate, then rejects depths other than 2 or 3 (`src/next.ts:95-113`, `src/state.ts:86-101`). The archived draft depth is 5.
- F2: One unreadable entry changes capacity from live nonterminal leaves to every readable non-failed leaf plus unreadable entries. Merged and idle leaves therefore consume capacity. This sum spans registered repositories, so the blast radius can exceed framework (`src/next.ts:265-302`). Lines 639-643 handle empty selection diagnostics, not the allocation gate.
- F3: Current evidence is already repaired by filename. Archived `comparison-log` and `prose-variance` drafts still say `plan.synthesis`, while their real states say `merged` (`issues/closed/audit-prose-and-log/chart/slots/leaf-draft/comparison-log/state.draft.yaml:1-4`, sibling `prose-variance/state.draft.yaml:1-4`; real `comparison-log/state.yaml:1-2` and `prose-variance/state.yaml:1-2`). Open chart drafts persist too (`issues/chart/route-source-map/slots/leaf-draft/page-map/state.draft.yaml:1-4`). Code supports the historical failure, but the renamed files cannot reproduce it unchanged.

## Material forks and practitioner questions

- Q1: Where is the enforceable boundary between archived chart evidence and lifecycle state? Choose a reserved archived-chart subtree excluded from inventory, relocate archives outside leaf stores, or depend on draft naming alone. Recommend preserving the archive location and excluding the exact reserved archive subtree across leaf readers. Renaming future drafts alone cannot protect existing archives. Do not globally skip every folder named `chart` without deciding whether that is a permitted issue/leaf slug. Grounding: `src/phase.ts:173-174`, `src/state.ts:93-107`, `src/next.ts:108-113`.
- Q2: What capacity should a genuinely unreadable lifecycle leaf reserve? Separately settle whether archived failures reserve anything, whether each unreadable active candidate reserves one slot, and whether directory/registration failures retain the current full-capacity hold. Recommend counting known readable leaves by actual activity even when another leaf is unreadable, while retaining conservative treatment of genuinely unknown active work. This changes an existing tested policy, not just a typo (`src/next.ts:265-280`, `tests/next.test.ts:699-715`).
- Q3: What exactly may the door persist during peer review? The skill says drafts go to “the scratchpad”, exchange guidance permits chart slots, and shapes already says charts have no `state.yaml` (`skills/chart-issues/SKILL.md:61`, `assets/questions.md:46`, `assets/shapes.md:15`, all assets under that skill). Recommend specifying draft location and a non-dispatchable representation explicitly, with `state.yaml` created only at approved handoff. Is the existing manual repair sufficient for framework, or is any operator recovery still needed?

## Pitfalls and verification

- R1: A next-only exclusion leaves `findLeaf`, detailed status and park checks exposed through recursive `leavesUnder`. Overview status scans open only, so it can look healthy while detailed status fails (`src/state.ts:104-135`, `src/status.ts:77-78,292`, `src/park.ts:39-42`).
- R2: Depth limits alone are not an archive boundary and silently truncating traversal would discard existing invalid-depth diagnostics. Preserve rejection outside the reserved evidence subtree (`tests/state.test.ts:114-135`, `tests/next.test.ts:2102-2133`). These drafts currently fail before slug comparison, so duplicate slug errors are a secondary risk, not the observed cause (`src/next.ts:97-104,120-128`).
- R3: Existing completion coverage archives only CHART.md. Add coverage with nested draft states and duplicate real slugs, then verify lookup and dispatch after completion. Capacity coverage needs merged history plus corruption at a tight limit and another registered repo. Existing tests miss this combination (`tests/phase.test.ts:169-185`, `tests/next.test.ts:2144-2174,2334-2358`).

## Proposed destination split

- D1: Akrogon, one issue with two independently checkable parallel leaves: archive/evidence isolation including the door contract and affected readers; unreadable-capacity accounting after Q2 settles. Shared `next.ts` ownership does not create a dependency.
- D2: Framework, operator verification/recovery only if still needed. The supplied evidence shows renamed drafts already. Do not create a consumer code leaf for issue-record repair: handoff rules explicitly exclude `issues/` edits from leaves (`skills/chart-issues/assets/shapes.md:168`).

Resolve Q1 first because it defines which failures Q2 must still handle. Q3 should be quick once that boundary is chosen. No locks supplied.
