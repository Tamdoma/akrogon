# Review A: fresh-first-worktree

Slot A, check.review, 2026-11-25. Base `8d0df9dd2cc0274401346de5fb89ccc48174f570`, reviewed head `7adb11a700cac79ad76560670786b84282550ccd` (range `8d0df9dd..HEAD`, three commits: red-first tests, the fix, the test correction).

## Verification evidence read

- `akrogon verify` receipt `8db66d72-3f07-4693-bfb3-e59a8b6533a5` on the reviewed head: completed, format 0 / typecheck 0 / test 0 (1449 tests across 90 files), `verify leaf …green`.
- All six criterion proofs green on this head through the exact commands `plan.md` names; logs read in `implementation/check-first-alloc-c{1..6}-*.log` (the post-correction rerun set `…179559318…`), plus the red-first and deliberate-break logs recorded in plan.md `## Red evidence` (`check-first-alloc-break{,2,3}-*.log`): criterion 3's checked-out case goes red because the branch moved under another checkout, criterion 4 because the own commit is reset away — both discriminating.
- No proof-command corrections claimed in `implementation/report.md`; none needed. No planned test skipped, filtered or disabled: the runner configuration is untouched, and the proof reruns happened after the latest change to any test input (`7adb11a7` touched only `tests/next.test.ts`, a different file, but the rerun covered everything anyway).

## Judgment against brief, design, plan

- Criteria 1–6 each have a test or diff proof that would catch their failure, at the real git boundary (temp bare remote, clone, real worktrees, real `git`, real `akrogon next` dispatch on a real core). No mocks of the unit under test. The 20-file truncation shape, the MERGE_HEAD-on-clean-tree shape and the "whether or not the branch has commits" parameterization match the brief's exact scenario list.
- The gate order matches the design's leaf-review correction (HEAD rule first, whatever the branch holds), the lock covers removal → guard → reset and is released before `createSparseWorktree` (non-reentrant `flock -x` respected, verified by reading `createSparseWorktree`'s own lock acquisition), and the bound reset is `git update-ref refs/heads/<slug> <trackingSha> <provenSha>` exactly as locked.
- `worktreeRemovable` is exported unchanged — one definition shared with reconcile, verified by diff (the only change is the `export` keyword plus prettier line-wrapping).
- Adoption of a branch with own commits is byte-identical behavior to before; the direct-route growth-stop shape (branch with commits, worktree on the slug branch) is preserved, and `skills/chart-issues/assets/direct-route.md`'s claim stays true.
- The `mustCreate` comment update is accurate: a replaced leftover resets to `localBase`, which is exactly what `checkBase`'s local proof reads; no network behavior changed.
- Concurrency: dispatches serialize on the global `.lock` in `nextCommand`/`phaseWake`, and the reset's `update-ref` old-value bind fails loudly in the residual race (concurrent manual ref mutation) — the failure mode is a spurious skip on stderr, safe and retryable, matching the design's recorded residual.
- Lesson retirement (criterion 6) checked against the lesson rule's Retire clause: the lesson's mechanism — a commit-free branch/worktree reused as found, opening the first seat on a stale base — is stopped on every reachable path. First allocation replaces or refuses; `state.worktree`-set leaves are excluded by the locked design and their later work (implement refresh, merge rebase) is driven by the branch tip as recorded at allocation, not a stale first base; adopt-with-commits is the lesson's own carve-out. The `Applied` line cites the gate (`src/next.ts:315`). Removal accepted.
- AREA.md path check: every `` `src/…` `` path in `src/AREA.md` exists (listed mechanically); `tests/reconcile.test.ts` and `tests/first-allocation.test.ts` named in `tests/AREA.md` exist. The new `src/AREA.md` line describes the implemented behavior accurately. No human doc describes first-allocation semantics beyond what stays true (`docs/examples/recovery-story.md` is the adopt-with-commits shape; `docs/reference/commands.md`/`files.md` describe no reuse promise) — no documented behavior contradicted.
- Test-Change trailers in range: `tests/next.test.ts` cites brief done-criterion 2 — valid: the old unignored-`.env` setup contradicted the locked refusal order, since a commit-free leftover with uncommitted changes never reaches `.env` logic, and the corrected setup is the only production shape of that hazard; the green run after correction is `check-env-refusal-fix-1795593168624-2321948.log`. `tests/AREA.md` is a test-matched path whose doc-line addition carries the required trailer. Both judged correct.

## Findings

Nits:

- N1 — `symbolic.stdout.slice('refs/heads/'.length)` in the other-branch refusal names the branch wrongly when HEAD is a symref outside `refs/heads/` (e.g. hand-set to a tag): the message would print `s/tags/other` instead of the ref. Reproduction requires hand-crafting a HEAD symref git itself never creates; the refusal itself is correct in substance (criterion 3's outcome holds — loud refusal, nothing moved), only the naming text degrades. Deferred: no realistic source produces such a HEAD in operation. Promotion evidence: a real user action or integration that leaves HEAD a symref outside `refs/heads/`.

No Fixes. The remaining imperfections I examined and rejected as findings: the double `registeredWorktrees` read inside the lock (microsecond-cost porcelain parse, no consequence); the clumsy `then: inspect or save` wording in the unreachable-in-practice racy-lock arm of the removal error (correct content); recreate-on-retry churn when `.env` writing fails after a successful replace (the design's recorded cost, self-healing).

## Verdict

nits — one cosmetic nit, no Fixes. Checks green on the reviewed head, every done-criterion proven, no operator actions, no unverified criteria.
