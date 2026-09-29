# Unreadable capacity: independent round B

Archive-boundary lock accepted: charts stay in issues/chart, existing archives stay where they are, and completion writes no Closed marker. Read only this fork's Question/Carries, the related fork sections, and primary code/tests/docs. No competing capacity round or Findings read. This is repository-owned policy, so no outside source was needed or searched. No tests or runtime probes were run.

## Evidence and correction

- F1: The old policy was deliberate. `issues/closed/loop-hardening/chart/forks/dispatch-error-report.md:13` records A choosing to count all leaves when any leaf is unreadable after the operator delegated the decision. Current code excludes failed leaves but includes merged and unallocated readable leaves (`src/next.ts:273-280`). Changing this requires explicitly superseding that capacity sentence, while retaining its reporting policy.
- F2: Carries incorrectly lists foreign leaves as unreadable entries. Valid states with another repo key enter `foreign`, not `unreadable`, and contribute zero capacity (`src/next.ts:99-104,130-143`; `tests/next.test.ts:1294-1320`). Duplicate identities contribute one unreadable count per conflicting leaf path and are removed from readable inventory (`src/next.ts:120-143`).
- F3: Unknown population is separate from known unreadable entries. Failed directory enumeration sets `unknown`; unreadable repo configuration sets registration unknown. Either reserves at least max_active (`src/next.ts:85-93,146-158,268-272`). Existing matching tabs bypass admission, so allocations already in progress can continue (`src/next.ts:293-302`; `tests/next.test.ts:1496-1511`).

## Q1. What should each entry reserve?

**O1 (recommended): normal activity count for readable leaves, plus one slot per unreadable entry.**

For a fully enumerated repo, contribution is the number of readable, non-merged, non-failed leaves having a live pane in their recorded tab or worktree, plus `inventory.unreadable`. Count a leaf once regardless of its pane count. Preserve the existing activity predicate (`src/next.ts:275-280`). Keep unknown-population holds and foreign exclusions unchanged.

Why: a malformed neighbor supplies no reason to discard valid knowledge about other leaves. Merged history and waiting leaves cannot inflate occupancy merely because an unrelated file fails parsing. One unreadable entry still reserves capacity for potentially running work whose state cannot establish ownership. This replaces the old all-readable-leaves rule without new inventory categories or alternate parsing.

Concrete outcome: max_active=3, one unreadable entry, twenty readable merged leaves, and two readable waiting leaves with no panes. Both waiting leaves can allocate sequentially, bringing occupancy to three. Today the merged history alone blocks them (`src/next.ts:273-274,301-302`).

**O2: exclude merged leaves from the conservative branch, but keep counting every readable nonterminal leaf plus unreadable entries.** This is a smaller behavioral change, but waiting work still reserves its own admission slot before allocation. With one malformed entry and one waiting healthy leaf at max_active=2, neither starts. Existing tests explicitly encode this problem (`tests/next.test.ts:1353-1373`). It removes the reported merged-history multiplier but retains the same failure mechanism for a queue.

**O3: normal readable activity count, zero reservation for unreadable entries.** This gives healthy work the most access to capacity, but a damaged state could belong to a running leaf. Counting it as zero can admit more work than the configured limit. The prior reasoning explicitly rejected zero occupancy for unreadable work (`issues/closed/loop-hardening/chart/forks/dispatch-error-report.md:10`). Recommend only if the operator chooses availability over that conservative reservation.

## Practitioner challenges and pitfalls

- R1: “Can one unreadable entry still block dispatch?” Yes, with max_active=1, or when other live work uses the remaining slots. O1 prevents unrelated readable history/queue from multiplying occupancy. It does not promise dispatch under every configured limit. If the expected behavior literally requires that promise, choose O3 and accept its tradeoff.
- R2: “Why reserve for malformed files under closed or at invalid depths?” O1 preserves the existing counter's meaning: each rejected candidate reserves one, including those locations and each duplicate path. Neither the folder name nor a partly parsed state proves safe occupancy under the current mechanism (`src/next.ts:95-104,110-128`). Exempting these categories would be an additional policy requiring richer inventory data. Do not imply O1 makes old archived drafts invisible.
- R3: “Will healthy dispatch hide errors or unblock dependents?” No. Preserve structured diagnostics and nonzero aggregate exit, exclude unreadable identities from dispatch, and keep dependency lookup strict (`src/next.ts:161-164,506-510,537-540`). Capacity admission does not repair a corrupted dependency or guarantee that completion can traverse a malformed sibling.

## Verification required by O1

- A1: Update policy-sensitive tests. At max_active=2, one malformed entry plus two waiting leaves should allocate one, not zero (`tests/next.test.ts:699-715`). One active leaf plus two unreadable entries should reject another at limit 3 but admit it at limit 4 (`tests/next.test.ts:1111-1134`). Mixed foreign/unreadable coverage should admit the healthy leaf at limit 2 (`tests/next.test.ts:1353-1373`).
- A2: Add merged-history plus unreadable coverage with healthy work in the same and another registered repo. Preserve machine-wide counting, failed exclusions, duplicate rejection, and existing-tab continuation (`tests/next.test.ts:722-734,1216-1237,1496-1511,2334-2359`). Include a limit-1 case to make the remaining conservative hold explicit.

Decision requested: adopt O1 and explicitly replace the prior all-readable-leaves reservation, preserving one reservation per unreadable candidate, full holds for unknown population, foreign exclusion, and error reporting.
