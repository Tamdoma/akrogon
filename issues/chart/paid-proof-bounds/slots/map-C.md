# Slot C territory map

## 102: unknown leaf-state keys block unrelated repository commands

**Verdict: confirmed.**

### Cause and deeper root

F102-1. `stateSchema` is a strict top-level object. `readState` removes only four hard-coded legacy keys before parsing, so any other top-level extension such as `reported` or `notes` throws. Repository-wide readers such as `allLeaves` and `leavesUnder` do not isolate that failure. One leaf can therefore stop configuration, phase, check, and verification paths that inventory all leaves. The concrete path is `src/state.ts` in `stateSchema`, `readState`, `leavesUnder`, and `allLeaves`; `src/config.ts` in `effectiveConfig`; and the callers of `allLeaves` in `src/run-check.ts`, `src/phase.ts`, and `src/verify.ts`.

F102-2. The test suite currently treats this behavior as intentional: an unrecognized key must make `readState` reject. The defect is therefore in the contract, not an accidental Zod default (`tests/state.test.ts:93-109`).

F102-3. The deeper cause is that an extensible, seat-authored YAML document is treated as a closed wire format. The four-key compatibility filter duplicates schema evolution as a second list and only postpones the next failure. Whole-repository inventory then amplifies one local parse error into a repository outage (`src/state.ts`, `readState` and `allLeaves`).

### Smallest simplification

D102. Make only the top-level state object stripping rather than strict, and delete the four-key filter from `readState`. Zod still validates every owned field and nested owned structure, while harmless foreign metadata is ignored and removed on the next owned save. This removes a compatibility list instead of adding more accepted keys (`src/state.ts`, `stateSchema` and `readState`).

New production code is not needed beyond that simplification. The strict-unknown-key test must become a tolerance test, while malformed known fields must remain rejected (`tests/state.test.ts:93-109`).

### Material fork

O102-1. **Top-level extension tolerance, recommended.** It removes the reported problem class with a small contract change. A misspelled manually authored optional key could be ignored, but akrogon's owned fields are written through typed commands rather than free-form user input (`src/state.ts`, `writeState` and state-mutating helpers).

O102-2. **Fault-isolated inventory.** Keep strict state and make repository scans return valid leaves plus per-leaf errors. This would also stop malformed known fields or broken YAML from blocking unrelated leaves, but it changes every inventory consumer and introduces partial-repository semantics. `src/next.ts` already has a separate tolerant discovery path, showing that this approach would require consolidation rather than another wrapper (`src/next.ts`, `discover`; `src/state.ts`, `allLeaves`).

Q102-1. Is the required contract only tolerance of unknown metadata, or must unrelated commands survive every malformed leaf?

Q102-2. Are external seats allowed to add arbitrary top-level metadata permanently, or should such metadata be preserved through akrogon writes? Stripping accepts it but does not preserve it (`src/state.ts`, `saveState`).

R102-1. Do not loosen nested owned objects. Their strictness catches malformed lifecycle state rather than harmless extension data (`src/state.ts`, nested schemas under `stateSchema`).

R102-2. Do not append `reported` and `notes` to the hard-coded filter. That repeats the same defect for the next key (`src/state.ts`, `readState`).

## 103: merged sourced leaves can lose the checkout required for completion

**Verdict: partly confirmed. The failure exists, but the reported cleanup sequence is too broad.**

### Cause and deeper root

F103-1. `closeSources` refuses to run without `leaf.state.worktree`, then obtains the comment identifier with `git rev-parse HEAD` inside that checkout. Source completion therefore depends on an ephemeral directory after merge (`src/pull.ts`, `closeSources`).

F103-2. `commitMove` saves the leaf as merged before `completeOwner` closes sources. A later source/API failure leaves a merged leaf that must recover on a future pass (`src/phase.ts`, `commitMove` and `completeOwner`).

F103-3. Reconciliation removes a merged checkout unless the leaf is still open **and** its whole completion owner is complete. A fully complete open owner is retained, contrary to the broad report. An incomplete epic can lose one merged member's checkout while waiting for siblings, which makes later source closure impossible (`src/reconcile.ts`, `ownerCompletes`, `mergedWorktree`, and `removeMergedWorktree`; retained-complete-owner coverage at `tests/next.test.ts:2310-2354`; first-pass-only incomplete-owner coverage at `tests/next.test.ts:2356-2376`).

F103-4. Current framework state contains open merged sourced leaves with no `worktree`, including `forms-wiring/forms-declaration-scope`, `forms-wiring/cadence-inputs`, `account-access`, `admin-csp`, and `media-range`. Their owner groups still contain unfinished work, matching the narrower incomplete-owner path (`/home/ivan/Work/infra/tamdoma/framework/issues/open/forms-wiring/forms-declaration-scope/forms-declaration-scope/state.yaml:1-9,27` and sibling state files under `/home/ivan/Work/infra/tamdoma/framework/issues/open/`).

The deeper cause is not cleanup timing alone. Source closure uses checkout-derived presentation data, `merged <commit>`, as if it were durable completion state. Cleanup and external API retry are then coupled to a disposable resource (`src/pull.ts`, `closeSources`; `src/reconcile.ts`, `removeMergedWorktree`).

### Smallest simplification

D103. Stop requiring the exact checkout HEAD in the source-closing comment. Use the durable leaf slug already available to `closeSources`, matching the existing `delivered by <slug>` form used elsewhere, and remove the worktree guard and `rev-parse`. Source completion then survives checkout cleanup without adding state (`src/pull.ts`, `closeSources` and `closeCommand`).

Only the comment construction and tests need new code. Existing retry/error behavior can remain.

### Material fork

O103-1. **Durable slug comment, recommended.** It removes the ephemeral dependency and minimizes state.

O103-2. **Persist `merged_commit`.** If the exact SHA is a product requirement, capture it before cleanup and make all merge, recovery, and member-stack paths write it. This preserves the current comment but adds a lifecycle field whose completeness must hold across every landing route (`src/phase.ts`, `commitMove`; `src/next.ts`, merge-turn recovery paths; `src/reconcile.ts`, cleanup paths).

Q103-1. Is an exact merged SHA contractual in GitHub source comments, or is a durable leaf identifier sufficient?

Q103-2. Should a private issue source close when its leaf merges, or only when the entire epic completes? `completeOwner` currently closes the leaf's private sources before testing owner completion (`src/phase.ts`, `completeOwner`).

Q103-3. How should existing merged leaves without worktrees be repaired after the code fix: normal reconciliation retry, or an explicit one-time command?

R103-1. Retaining every merged checkout until an epic closes avoids this one sequence but leaks worktrees for long-running epics and keeps completion dependent on local disk.

R103-2. Persisting a SHA only on the normal holder path creates another partial-state failure for recovered or stacked members. If exact SHA is selected, all landing paths must establish it.

## 104: speculative merge stacks almost never land

**Verdict: confirmed, with one correction. Ordinary member rebase conflicts are not recorded as red membered attempts.**

### Cause and deeper root

F104-1. `pickMembers` admits every eligible waiter after the holder. Its only historical exclusion is a red attempt for the same member head on the same `built_on` base. There is no cap or durable culprit memory (`src/batch.ts`, `pickMembers`; `src/attempts.ts`, `attemptSchema` and `redMemberHeads`).

F104-2. Once the base changes, the same unchanged head is eligible again. `mergeTurn` snapshots all selected members, builds the stack, and verifies the combined tree, so one bad member makes the useful holder share one all-or-nothing verification result with the whole queue (`src/next.ts`, `mergeTurn`; `src/batch.ts`, `buildStack`).

F104-3. The report's uncertainty about short red attempts being ordinary member build conflicts is wrong. `buildStack` omits a member whose rebase conflicts, and a holder conflict falls back to a holder-only turn. Those omitted members are not in the applied attempt's `members` list (`src/batch.ts`, `buildStack`; `src/next.ts`, `mergeTurn`).

F104-4. Current framework evidence is worse than the original snapshot. Of 266 attempt records, 51 have members: 46 red, 4 merged, and 1 ejected. Forty-seven unchanged member heads recur across more than one base. This was counted from `/home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl` by parsing each JSONL record and grouping member heads by `built_on`.

F104-5. Earlier design explicitly chose all eligible waiters, no cap, and allowed red heads back after the base moved. The observed history disproves the practical assumption that this extra verify is usually repaid (`issues/chart/overnight-recs/CHART.md:8-13`; `issues/closed/merge-batch/stacked-turn/design.md:3-8`).

The deeper cause is all-or-nothing speculative composition. Batch value requires every included leaf and their combination to pass, while selecting the whole queue maximizes the chance that at least one member prevents landing. Base-scoped exclusion mistakes a changed base for changed evidence and repeatedly spends checks on unchanged suspect heads (`src/batch.ts`, `pickMembers`; `src/attempts.ts`, `redMemberHeads`).

### Smallest simplification

D104. Remove member stacking and make every merge turn holder-only. Delete member selection, member stack construction, member attempt state, and member-specific reconciliation/push paths. This removes 46 observed wasted combined verifies and the machinery that keeps re-admitting unchanged heads. It does not make the underlying holder check faster (`src/batch.ts`; `src/attempts.ts`; `src/next.ts`, `mergeTurn`; framework attempt evidence above).

No replacement scheduling mechanism is needed. Tests and skill text that promise member stacking must be removed or rewritten.

### Material forks

O104-1. **Return to solo turns, recommended.** Four successful grouped landings are lost, but failed speculative work and its recovery state disappear.

O104-2. **Bound or adapt stack size.** This can reduce blast radius but adds a cap, configuration, or performance heuristic. It retains opaque combined failures and reopens an earlier explicit no-cap decision (`issues/chart/overnight-recs/CHART.md:8-13`).

O104-3. **Identify culprits by split or bisection.** This can preserve batching but adds more verification runs and resurrects the complex isolation machinery the operator asked to avoid.

Q104-1. Is batching itself required, or is the required outcome useful leaves landed per unit of verification time?

Q104-2. If batching remains, what measured green threshold justifies enabling it?

Q104-3. Are the approximately 13-minute holder checks a separate throughput problem? Removing stacking avoids waste but does not shorten them.

R104-1. Do not treat a new base as evidence that an unchanged red member is safe. Current attempt history shows repeated unchanged heads across bases.

R104-2. Do not mix test-runtime reduction into this chart. It has a separate destination and no dependency on removing stack speculation.

## 105: a literal done-criterion test command was already red on base

**Verdict: confirmed. Known-red handling behaved correctly but could not repair a wrongly locked criterion.**

### Cause and deeper root

F105-1. The leaf originally locked a literal non-isolated Bun test command as criterion 4. That command failed nine tests at both leaf head and base, while the repository's isolated runner passed 32 of 32 and `bun run hooks:verify` passed. The operator later amended criterion 4 to include `--isolate` (`/home/ivan/Work/infra/tamdoma/framework/issues/open/stray-rule-loading/registered-rule-loading/brief.md:12-17,20-23,34-38`; canonical self-test at `/home/ivan/Work/infra/tamdoma/framework/package.json:8`).

F105-2. The process says a done criterion should be an observable result rather than a test file, assertion, or count, but it still allows proof commands from blocking checks or leaf-owned tests. That boundary allowed a runner invocation to become an immutable outcome (`skills/chart-issues/assets/shapes.md:353`).

F105-3. Review correctly blocks on each named done criterion, and known-red only classifies a red check as pre-existing. It cannot declare a literal red criterion satisfied (`skills/check-issue/SKILL.md:63,69`).

F105-4. Implementation guidance is internally tense: it says a wrong criterion is an A-side correction, but also routes inability to satisfy a locked criterion into a stop requiring operator action. The live leaf followed the latter path until amendment (`skills/implement-issue/SKILL.md:35-40,61`; framework `issues/log.jsonl` entries for `registered-rule-loading` around its failed and resumed attempts).

F105-5. The earlier chart-audit work already permitted criteria to cite blocking checks or own tests and rejected stale base probes. This recurrence shows that it did not separate acceptance outcomes from proof procedures strongly enough (`issues/chart/leaf-run-stalls/CHART.md`; `issues/closed/leaf-run-stalls/chart-audit-rules/brief.md`). The active lesson already says ad hoc commands must be compared with the configured runner (`learnings/history/2026-10-16-review-test-command-equivalence.md`).

The deeper cause is that outcome and proof procedure are fused. Runner flags and file ordering become operator-locked product acceptance even when the repository already defines the equivalent supported test environment.

### Smallest simplification

D105. Prohibit a test-runner invocation from being the done outcome. The criterion locks observable behavior; the plan owns the exact proof command and must prefer an equivalent canonical repository script. A wrong proof command can then be corrected without changing the operator-approved destination. Product CLI commands remain valid criteria when the command's behavior is itself the product (`skills/chart-issues/assets/shapes.md`; `skills/check-issue/SKILL.md`; `skills/implement-issue/SKILL.md`).

This needs only coordinated skill-text and scenario changes. No runtime code is needed. If the rule fully absorbs the active equivalence lesson, retire that lesson rather than duplicating it (`learnings/history/2026-10-16-review-test-command-equivalence.md`).

### Material forks

O105-1. **Outcome-only criteria, recommended.** Review still requires evidence for every outcome, but runner correction belongs to planning and review rather than operator amendment.

O105-2. **Run every literal criterion command against base during handoff.** This detects the current case early but adds expensive/stale base probes and preserves commands as immutable outcomes.

O105-3. **Let known-red waive the literal criterion.** This avoids the stall but weakens the contract: the final leaf still does not meet its written criterion.

Q105-1. Was the exact Bun invocation intended as product acceptance, or only as proof of rule-loading behavior?

Q105-2. Which repository script is canonical when several scripts cover overlapping tests?

Q105-3. Is test file combination/order itself behavior under test? If yes, the criterion is not equivalent to the isolated runner and the leaf must own the shared-state defect.

R105-1. Do not give A unrestricted proof substitution. B must judge semantic equivalence and coverage, using the configured-runner lesson.

R105-2. Do not ban product commands from criteria. The rule applies to proof machinery, not command behavior that users consume.

## 106: sync rejects an identical ignored file before moving a checkout

**Verdict: confirmed.**

### Cause and deeper root

F106-1. Shared `integrate` preflight lists ignored paths and marks a collision from path or ancestor membership alone. It never compares content or object type. `syncCommand` then uses `git rebase --autostash` only after this coarse gate (`src/sync.ts`, `integrate` and `syncCommand`).

F106-2. Self-update already has a more precise fallback. When `read-tree` fails, `moveCheckout` computes dirty/changed paths, compares current and target hashes for colliders, adopts the target index when all colliders are equal, and otherwise leaves an explicit pending state. The shared preflight blocks that logic before it can decide safely (`src/self-update.ts`, `moveCheckout`).

F106-3. Tests pin refusal for differing file/directory and nested-path shapes but do not cover an identical ignored regular file (`tests/sync.test.ts:358-406` and following harmless-sibling cases).

F106-4. A scratch Git reproduction under a temporary directory showed that `git rebase --autostash FETCH_HEAD` exits successfully when an ignored file becomes tracked, both when bytes match and when they differ; in the differing case it overwrites the local ignored bytes. Therefore deleting all collision protection from explicit sync would cause data loss. Search method: two temporary repositories, an ignored untracked file on the local branch, a remote commit tracking the same path, then the exact rebase command used by `syncCommand` (`src/sync.ts`, `syncCommand`).

The deeper cause is one shared coarse preflight in front of two different movement engines. Self-update already owns precise collision recovery. Rebase can silently overwrite and needs its own precise safety decision. Sharing the path-only gate duplicates policy for one route and under-specifies it for the other (`src/sync.ts`, `integrate`; `src/self-update.ts`, `moveCheckout`).

### Smallest simplification

D106. Remove ignored-collision policy from shared `integrate`. Let self-update use its existing `moveCheckout` comparison. Add a sync-specific comparator before rebase that accepts only an identical regular-file collision and refuses differing bytes or file/type/ancestor shapes. Preserve the current differing and shape tests, and add the identical-file case (`src/sync.ts`, `integrate` and `syncCommand`; `src/self-update.ts`, `moveCheckout`; `tests/sync.test.ts:358-406`).

New code is limited to the sync comparator and its tests. The shared duplicate gate is deleted.

### Material fork

O106-1. **Route-specific precise checks, recommended.** Each move engine protects the data it can actually destroy, and self-update stops duplicating its own logic.

O106-2. **Add a hash-equality exception to shared `integrate`.** This is the smallest diff but retains duplicate self-update policy and makes shared code reason about destination/replay semantics it does not execute.

Q106-1. Does “identical” require byte identity only, or matching Git type and executable mode too?

Q106-2. How should symlinks be treated? A regular-file hash match must not authorize a type change.

Q106-3. Should sync compare against the incoming tree or the final replayed tree when a local commit also changes the path?

R106-1. Do not simply remove the guard. The scratch reproduction showed that the rebase can overwrite differing ignored content without stopping.

R106-2. Avoid filtered working-tree hashes for byte identity. Filters can make unlike working bytes appear equivalent; comparison must include object type and unfiltered bytes.

## Shared territory

S1. Reports 102 and 106 share a policy error: a harmless local difference is treated as fatal by a coarse shared boundary. In 102 it is unknown YAML metadata; in 106 it is an identical ignored file. Their implementation surfaces and outcomes differ, so they do not belong in one chart (`src/state.ts`, `readState`; `src/sync.ts`, `integrate`).

S2. Reports 103 and 104 make ephemeral context durable by accident. Report 103 requires a disposable checkout to recover an external completion. Report 104 scopes bad-member memory to a base that changes independently of the suspect head (`src/pull.ts`, `closeSources`; `src/attempts.ts`, `redMemberHeads`).

S3. Reports 104 and 105 both spend verification without obtaining new useful evidence. Report 104 repeats unchanged heads after base movement; report 105 repeats a noncanonical command after the canonical isolated runner proves the intended behavior. One is merge scheduling code and the other is acceptance-contract process, so combining them would give one chart two destinations (`src/batch.ts`, `pickMembers`; `/home/ivan/Work/infra/tamdoma/framework/package.json:8`; `skills/implement-issue/SKILL.md:35-40,61`).

There is no implementation dependency among the five fixes. Shared themes do not order work.

## Source tiers and searches

- **Operator tier:** The verbatim intake and preference for removal over added machinery come from `map-brief.md`.
- **Primary local evidence:** akrogon source, tests, skills, charts, and lessons at release `9e0df5b0`; current framework state, logs, briefs, and attempt JSONL under `/home/ivan/Work/infra/tamdoma/framework`.
- **Searches run:** local `rg`/file reads for named functions and related tests; a Bun parse/group of framework `merge-attempts.jsonl`; a temporary local Git rebase reproduction for report 106.
- **Practitioner, better-than-training, and model-knowledge tiers:** none used. No web search or uncited external claim informed the recommendations.

## Recommended chart split

C1. **State extension tolerance:** Unknown top-level leaf-state metadata cannot stop unrelated repository commands, while owned state fields remain validated.

C2. **Source completion without a checkout:** A merged completion owner can close all configured sources and move closed after its leaf checkout has been cleaned up.

C3. **Solo merge turns:** Every merge turn verifies one useful holder, with speculative member-stack selection, state, and recovery removed.

C4. **Outcome-only done criteria:** Done criteria lock observable behavior, while an equivalent proof runner can be corrected without operator amendment.

C5. **Content-aware sync collisions:** Checkout movement accepts an identical ignored regular file and refuses ignored content or type changes that would lose data.

Keep all five charts separate and unordered. Each has one destination, and none is a prerequisite for another.
