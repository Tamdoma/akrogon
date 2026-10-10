# Review B: batch-limit-repo

Date: 2026-10-10
Base: `2e78945849eed87c42abd56f224909f4d2050b36`
Reviewed head: `65215177beab3baf5f65fa842fb1e48e33156eb2`
Verdict: **ready**

## Scope and findings

Reviewed the full diff against brief, design, plan, implementation report, repository reference index and affected area pointers. Debate is off, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No Fixes, Nits or operator actions remain.

The repo schema rejects invalid limits and supplies default 4. The follower slice counts the holder separately and honors the smaller split limit. Leaf solo is removed from both writers and the state schema, with legacy values dropped at readState. Batch solo remains supported for holder conflicts. Initial-build and restack member conflicts append excluded slugs while retaining branch restoration and future queue eligibility. Split limits still clear when leaving merge.

Changed behavior is documented in docs/guide/setup.md, docs/guide/merge.md, docs/guide/state.md and skills/merge-issue/SKILL.md. Their cap, exclusion and holder-solo claims match the live command paths. No AREA.md was changed or deleted.

## Verification

Specific concern: removal of leaf solo altered existing handoff and completion fixtures. Traced their source, including regression commit e243a78, and reviewed the replacement fixtures against reconciliation and phase paths. Memberless holder handoffs still check commit preservation. Existing solo-record push and restack tests retain batch-solo coverage. The phase fixtures preserve sequential completion and the asymmetric-source worktree HEAD checks.

Reran `bun test tests/batch-dispatch.test.ts tests/batch-merge.test.ts tests/batch.test.ts tests/config.test.ts tests/phase.test.ts tests/docs-links.test.ts --timeout=30000`: exit 0, **144 pass, 0 fail, 1375 assertions**, 12.98 seconds.

Criteria 1–2: default six-leaf queue carries bb/cc/dd, and configured cap/split cases pass. Criterion 3: 0, -1 and 1.5 are refused with batch_limit named. Criterion 4: initial conflict records cc and preserves its head, then dissolution and a fresh attempt carry cc. This uses bb leaving merge rather than plan D6's aa leaving merge, but proves the same required eligibility outcome without a persistent mark. Restack conflict tests also check excluded membership and preserved heads. Criterion 5: config default/override output and guide links pass.

Criterion 6: implementation report records format, typecheck, full test (607/0) and changed test (486/0) checks passing at this reviewed head. No new code change or unresolved concern warrants repeating those full checks. `git diff --check 2e78945849eed87c42abd56f224909f4d2050b36...HEAD` passed. Worktree remains clean. No code or test mutations or commits were made during review.

## Test-Change trailers

```text
Test-Change: tests/batch-dispatch.test.ts plan batch-limit-repo: prettier rewrap of an edited line, no expectation changed
Test-Change: tests/batch-merge.test.ts plan batch-limit-repo: leaf solo mark replaced by per-attempt batch.excluded record
Test-Change: tests/batch.test.ts plan batch-limit-repo: solo state key removed; added excluded parse and legacy-key drop case
Test-Change: tests/batch-dispatch.test.ts plan batch-limit-repo: leaf solo mark replaced by per-attempt batch.excluded record
Test-Change: tests/config.test.ts plan batch-limit-repo: added batch_limit print/refusal cases, no existing expectation changed
Test-Change: tests/phase.test.ts plan batch-limit-repo: leaf solo mark removed; serial-merge fixtures moved to batch_limit: 0 and a seeded solo batch record
```

All five changed old test paths match src/test-files.ts and are cited. Dispatch and batch assertions follow plan D3–D5's removal of persistent solo and replacement with attempt exclusions. Config changes add effective-limit assertions and refusal cases. Phase fixture changes preserve original completion/source outcomes under the removed leaf-solo contract, as explained in the report. The final dispatch trailer covers formatting only. No existing expectation was removed without an applicable source.

## Merge 2026-10-10: solo attempt cfbdaa4c-b17b-4fac-9f75-b7a1cd0ec223

Rebased reviewed head 65215177beab3baf5f65fa842fb1e48e33156eb2 from old base 2e78945849eed87c42abd56f224909f4d2050b36 onto origin/main 3d223c853b51ffcc9a826ce0a4a9f3a20d60da9a. Resolved head 15b1e494afe98bf65ac579a7369540afd92e277d. Conflicts: src/next.ts retains hold-fix guard and selects capped followers only when not fixing a hold. Setup retains merge-bounce counting and adds the batch cap. State retains culprit-ejection behavior and removes leaf solo. Guide links will be checked by the full suite.

```text
1:  ab7ef69 ! 1:  58769a9 merge: repo batch_limit cap and per-attempt member exclusion
    @@ src/next.ts: async function restoreDrifted(repo: Repo, members: BatchMember[], l
      
      async function worktreeDirty(repo: Repo, worktree: string | undefined): Promise<boolean> {
     @@ src/next.ts: async function mergeTurn(
    -     const members: BatchMember[] = [];
    -     for (const candidate of mergeQueue(global, leaves, () => readLog(repo.root))
    -       .slice(1)
    --      .filter((entry) => fresh.state.solo !== true && entry.leaf.state.solo !== true)
    --      .slice(0, fresh.state.batch_limit)) {
    -+      .slice(0, Math.min(repo.config.batch_limit - 1, fresh.state.batch_limit ?? Number.POSITIVE_INFINITY))) {
    -       const sha: string | undefined = await branchSha(repo, candidate.leaf.state.slug);
    -       const head: string = sha ?? builtOn;
    -       members.push({
    +     if (!fixHeld)
    +       for (const candidate of mergeQueue(global, leaves, () => readLog(repo.root))
    +         .slice(1)
    +-        .filter((entry) => fresh.state.solo !== true && entry.leaf.state.solo !== true)
    +-        .slice(0, fresh.state.batch_limit)) {
    ++        .slice(0, Math.min(repo.config.batch_limit - 1, fresh.state.batch_limit ?? Number.POSITIVE_INFINITY))) {
    +         const sha: string | undefined = await branchSha(repo, candidate.leaf.state.slug);
    +         const head: string = sha ?? builtOn;
    +         members.push({
     @@ src/next.ts: async function mergeTurn(
            built_on: builtOn,
            holder: { base: await memberBase(repo, builtOn, holderHead), head: holderHead },
    @@ src/next.ts: async function mergeTurn(
     
      ## src/phase.ts ##
     @@ src/phase.ts: export async function commitMove(
    -     busy_notified: to === 'failed' || to === 'merged' ? {} : recorded.busy_notified,
    -     fix_rounds: to === 'check.fix' && recorded.phase === 'check.repair' ? recorded.fix_rounds + 1 : recorded.fix_rounds,
    +         ? recorded.fix_rounds + 1
    +         : recorded.fix_rounds,
          merge_stamp: to === 'merge' ? new Date().toISOString() : recorded.merge_stamp,
     -    solo: to === 'merge' ? recorded.solo : undefined,
          batch_limit: to === 'merge' ? recorded.batch_limit : undefined,
2:  c97a6f9 ! 2:  a4a0dab docs: batch_limit key and per-attempt member exclusion
    @@ Commit message
      ## docs/guide/merge.md ##
     @@ docs/guide/merge.md: Seat B merges reviewed work. It runs every `checks` command not named in `merge_
      
    - Each registered repo has one merge turn, held by the earliest eligible leaf in `merge` (merge stamp, then the last `to: merge` log record, then slug; a leaf with neither sorts last). Only the holder's seat B is prompted; a waiting leaf keeps its tab, panes and `max_active` slot, and `akrogon status` names the holder and each place. For a waiting leaf, `akrogon phase <slug> merged` (with or without `--check`) and `check.fix` are refused naming the holder; `failed` is never refused. When the turn frees, the next holder is prompted without a manual `akrogon next`.
    + Each registered repo has one merge turn. A leaf holding a batch record keeps it; otherwise it is held by the eligible leaf in `merge` with the most unmerged leaves waiting on it through `blocked-by`, directly or transitively (ties keep merge stamp, then the last `to: merge` log record, then slug; a leaf with no record sorts last among equal counts). Only the holder's seat B is prompted; a waiting leaf keeps its tab, panes and `max_active` slot, and `akrogon status` names the holder and each place. For a waiting leaf, `akrogon phase <slug> merged` (with or without `--check`) and `check.fix` are refused naming the holder; `failed` is never refused. When the turn frees, the next holder is prompted without a manual `akrogon next`.
      
     -The command batches waiting leaves into the holder's merge. It records a batch on the holder, then outside the global lock builds one stack — every member branch in turn order, then the holder's, onto the fetched default branch — moves each live branch to its built tip and prompts the holder's B with the attempt id and the stack top. Carried members are never prompted and never run their own checks: one check run on the top and one push land every member with the holder. While the batch is in flight a member keeps its tab, panes and worktree; after it lands, sweeps remove its worktree and branch like any merged leaf, and its tab closes once the record clears — when the holder has left `merge` and no carried member remains there. A leaf entering `merge` after the record is written is not carried and waits for a later batch. A member whose branch cannot be stacked mechanically is restored to its saved head, marked `solo` and merges alone when its own turn comes; if the holder's own branch is the one that conflicts, every member is restored and the holder is prompted `solo` so its B resolves the rebase by hand.
     +The command batches waiting leaves into the holder's merge, carrying at most `batch_limit` - 1 members (default 3). It records a batch on the holder, then outside the global lock builds one stack — every member branch in turn order, then the holder's, onto the fetched default branch — moves each live branch to its built tip and prompts the holder's B with the attempt id and the stack top. Carried members are never prompted and never run their own checks: one check run on the top and one push land every member with the holder. While the batch is in flight a member keeps its tab, panes and worktree; after it lands, sweeps remove its worktree and branch like any merged leaf, and its tab closes once the record clears — when the holder has left `merge` and no carried member remains there. A leaf entering `merge` after the record is written is not carried and waits for a later batch. A member whose branch cannot be stacked mechanically is restored to its saved head and excluded from that attempt only — its slug stays on the attempt record and the next attempt can carry it; if the holder's own branch is the one that conflicts, every member is restored and the holder is prompted `solo` so its B resolves the rebase by hand.
    @@ docs/guide/merge.md: rerun tested=<T1-sha|none> pushed=<T2-sha>
     -`reuse` means old and new main are equal outside `issues/` and `learnings/`, the tested top and the restacked top are equal outside them too, `issues/config.yaml` is unchanged and the restack had no conflict, so the earlier green check run stays valid: B copies the line into `review-B.md`, then runs `--check`, the briefs and `merged` under the same attempt without rerunning the checks. `rerun` means the worktree already sits at `<T2-sha>` and fresh checks are required, so B reruns its checks, `--check` and `merged` under the same attempt; `none` means no `--check` ran before the refusal. A member that conflicted during the restack is restored and dropped to merge solo, and `rerun rebase` means the holder's branch itself no longer fits the new base, so B rebases by hand first.
     +`reuse` means old and new main are equal outside `issues/` and `learnings/`, the tested top and the restacked top are equal outside them too, `issues/config.yaml` is unchanged and the restack had no conflict, so the earlier green check run stays valid: B copies the line into `review-B.md`, then runs `--check`, the briefs and `merged` under the same attempt without rerunning the checks. `rerun` means the worktree already sits at `<T2-sha>` and fresh checks are required, so B reruns its checks, `--check` and `merged` under the same attempt; `none` means no `--check` ran before the refusal. A member that conflicted during the restack is restored and excluded from that attempt, its slug kept on the record, and `rerun rebase` means the holder's branch itself no longer fits the new base, so B rebases by hand first.
      
    - If checks fail, B reports `check.fix --attempt <id>`: with carried members this prints `batch split, holder keeps <n> of <m> members` — each member is restored to its saved head and the holder keeps the turn with at most the first half of them, so repeated red runs narrow to the leaf that breaks the checks while the others land in batches — and with none the leaf moves to `check.fix` as before. Other push errors are reported with their cause.
    + If checks fail, B first judges the cause. A red run with no cause in the stack's diff reruns the same command once on the fetched default branch; red there means main is broken, and B reports `check.fix --attempt <id> --red-on-base <sha> --command <exact command>` with that sha. The leaf stays in `merge`, the batch record is cleared without halving, and the repository is held against further merge attempts until fetched main differs from the held sha outside `issues/` and `learnings/`; a `--red-on-base` refusal means main already moved, so B refetches and re-judges. `akrogon unhold` clears a hold by hand. A hold may name one merge leaf via `akrogon hold-fix <slug>` to take the turn solo while the hold exists. When the evidence attributes the red run to the holder or one carried member, B writes the finding into that culprit's `review-B.md` and reports `check.fix --attempt <id> --culprit <slug>`: every member and the holder restore to saved heads, the record clears, and only the culprit moves to `check.fix`. An unattributed red run reports `check.fix --attempt <id>` as before: with carried members this prints `batch split, holder keeps <n> of <m> members` — each member is restored to its saved head and the holder keeps the turn with at most the first half of them, so repeated red runs narrow to the leaf that breaks the checks while the others land in batches — and with none the leaf moves to `check.fix` as before. Other push errors are reported with their cause.
      
     @@ docs/guide/merge.md: epic complete <epic>
      
    @@ docs/guide/setup.md
     @@ docs/guide/setup.md: Check these choices:
      - **rebuttal** controls the paired planning rebuttal.
      - **direct** (default false) lets the chart door offer the direct route at the handoff review. The operator still chooses per chart.
    - - **fix_rounds** limits review repair handoffs to A.
    + - **fix_rounds** limits review repair handoffs to A and merge `check.fix` bounces.
     +- **batch_limit** (integer at least 1, default 4) caps the whole merge batch including the holder.
      - **slots** optionally replaces a machine seat for this repo — a full {harness, model, effort} per seat (a or b); it applies at the next agent start.
      - **setup** optionally runs before your checks, usually to install dependencies.
    @@ docs/guide/setup.md: Check these choices:
      ## docs/guide/state.md ##
     @@ docs/guide/state.md: To keep work away from agents, park its issue with `akrogon park <issue>`. Parki
      
    - Akrogon records the worktree, Herdr tab, completed seats, review verdicts, prompt delivery attempts and the `merge_stamp` ordering the merge turn. It also records failure details.
    + Akrogon records the worktree, Herdr tab, completed seats, review verdicts, prompt delivery attempts and the `merge_stamp` breaking ties in the merge turn's dependent-count ordering. It also records failure details.
      
     -The merge holder's state carries `batch`, the record the command wrote for its merge pass, kept after the push for reconciliation: `attempt` (the id every batched phase call must repeat), `built_on` (the remote base the stack was built on), `members` (each carried leaf as `{ slug, base, head, tip }`, its saved merge-base, pre-batch head and applied tip), then `top` (the applied stack head), `tested_top` (the head the merge seat checked), `tested_main` (the remote base that head stood on), `candidate` (the head submitted for the push), `decision` (`reuse` or `rerun` after a refused push), `applied` and `solo` (the holder rebases itself instead of using a recorded top).
     +The merge holder's state carries `batch`, the record the command wrote for its merge pass, kept after the push for reconciliation: `attempt` (the id every batched phase call must repeat), `built_on` (the remote base the stack was built on), `members` (each carried leaf as `{ slug, base, head, tip }`, its saved merge-base, pre-batch head and applied tip), then `top` (the applied stack head), `tested_top` (the head the merge seat checked), `tested_main` (the remote base that head stood on), `candidate` (the head submitted for the push), `decision` (`reuse` or `rerun` after a refused push), `applied`, `excluded` (slugs excluded from the attempt by stack-build conflicts) and `solo` (the holder rebases itself instead of using a recorded top).
      
    --A merge leaf can also carry `solo: true`, set when it drops out of a batch over a conflict or a dirty worktree: it is excluded from later batches until it leaves `merge`. A holder whose batch ran red carries `batch_limit`, half its red batch's member count: its next batch carries at most that many members. Both flags clear on any move out of the phase.
    -+A holder whose batch ran red carries `batch_limit`, half its red batch's member count: its next batch carries at most that many members. The flag clears on any move out of the phase.
    +-A merge leaf can also carry `solo: true`, set when it drops out of a batch over a conflict or a dirty worktree: it is excluded from later batches until it leaves `merge`. A holder whose batch ran red carries `batch_limit`, half its red batch's member count: its next batch carries at most that many members, while a red ending that ejects a culprit clears the record without setting `batch_limit`. Both flags clear on any move out of the phase.
    ++A holder whose batch ran red carries `batch_limit`, half its red batch's member count: its next batch carries at most that many members, while a red ending that ejects a culprit clears the record without setting `batch_limit`. The flag clears on any move out of the phase.
      
      Leave those fields to the commands. Editing them by hand can make the file disagree with the running agents.
      
3:  3fd07a9 = 3:  1faa5a4 tests: merge fixtures use batch_limit and a seeded solo record for serial merges
4:  3543189 = 4:  30e6e71 tests: batch_limit cap, config refusal, and per-attempt member exclusion
5:  800d31a = 5:  d294023 tests: leaf solo mark removed; assert batch.excluded at conflict drops
6:  6521517 = 6:  15b1e49 format: apply prettier to leaf-changed files

```

Merge check found a rebase-exposed fixture error in tests/phase.test.ts: full `bun test --timeout=30000` at 15b1e49 exited 1, 645 pass/1 fail, log /tmp/akrogon-1000/batch-limit-repo-534d5ca49ab8/tmp.klZ4bBKlXA. The asymmetric-source fixture preseeded two with an active batch before calling phase one merged. A diagnostic rerun (`bun test tests/phase.test.ts -t "asymmetric and empty leaf sources" --timeout=30000`) showed `Merge turn refused for one: holder is two`, which is correct under dependents-first criterion 2 and hold-fix-leaf criterion 6. Commit 0f13951 keeps two in review until one merges, then starts its solo attempt. No existing assertions changed. The same filtered run then passed: 1 pass, 0 fail, 11 assertions. This is a wrong fixture exposed by rebase, repaired in its own commit per the solo merge rule.

Format exited 0 twice; each run only rewrote pre-existing src/status.ts formatting, which was restored. Typecheck initially exited 0. Remaining final gates are running after fixture repair.

Final head 0f13951aa8d1bce42f97a321a461cbcbf7455424: format exit 0 (unrelated status.ts formatting restored), typecheck exit 0, full `bun test --timeout=30000` exit 0: 646 pass/0 fail, 7040 assertions, 52.62 seconds. Full log: /tmp/akrogon-1000/batch-limit-repo-534d5ca49ab8/tmp.6dijFEtkoe. No merge_covers or merge_checks are configured. Changed-test check is running with refreshed AKROGON_BASE=3d223c853b51ffcc9a826ce0a4a9f3a20d60da9a. All eight merge-throughput leaf briefs gathered before completion.

Changed-test command `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, with AKROGON_BASE=3d223c853b51ffcc9a826ce0a4a9f3a20d60da9a, exited 0. Log: /tmp/akrogon-1000/batch-limit-repo-534d5ca49ab8/tmp.nyeFFewiWE

```text

 521 pass
 0 fail
 4866 expect() calls
Ran 521 tests across 18 files. [48.37s]
```

`akrogon phase batch-limit-repo merged --slot B --check --attempt cfbdaa4c-b17b-4fac-9f75-b7a1cd0ec223` exited 0, printed ok. The corresponding merged call exited 0, printed moved merged and issue complete merge-throughput. Owner folder moved to issues/closed/merge-throughput. Remote read-back `git ls-remote origin refs/heads/main` confirmed 0f13951aa8d1bce42f97a321a461cbcbf7455424, and the worktree is clean. The completion update was delivered by broadcast-issue to both configured Discord targets, sender exit 0.
