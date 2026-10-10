# Review B: guard-retires-lesson

Date: 2026-10-10
Base: `2d9becac4365ec4a1079853364d561d90e356b5e`
Reviewed head: `e8be1870f19969c703b8ae4fc9362ad13fd32e25`
Verdict: **fix**

## Fixes

### F1 — Solo cleanup imports akrogon code from the consumer repository

Location: `skills/merge-issue/SKILL.md:60`.

Realistic source: the installed shared merge-issue workflow runs in any registered repository's leaf worktree (skill opening paragraph), including `repos.framework` from `akrogon config`. A solo attempt, or the `rerun rebase` route that inherits the solo instructions, executes the new one-liner there. `./src/lessons.ts` resolves relative to that consumer repository, not the installed akrogon checkout. Framework has no such module.

Read-only reproduction in `/home/ivan/Work/infra/tamdoma/framework`, with the configured/default branch substituted:

```sh
bun -e "import {mergeBase, removeRetiredLessons} from './src/lessons.ts'; const b=await mergeBase(process.cwd(),'origin/main','HEAD'); const r=await removeRetiredLessons(process.cwd(),b,'HEAD'); console.log(r.length?r.join('\n'):'none')"
```

Exit 1, before any mutation:

```text
error: Cannot find module './src/lessons.ts' from '/home/ivan/Work/infra/tamdoma/framework/[eval]'
Bun v1.4.2 (Linux x64)
```

Consequence today: every consumer-repository solo merge following this unconditional instruction fails, including merges with no retired lessons. A union-resurrected line cannot be cleaned up by the prescribed step. The check guard can refuse the line but cannot make this command run.

Contract hit: brief criterion 2 (solo retirement survives integration), plan D5, and the shared workflow's existing contract to operate in the registered target worktree. Resolve the helper from the installed akrogon checkout while retaining the consumer worktree as the operation's cwd. Verify the shipped command in a consumer repository, including an actual solo union-resurrection fixture. Existing solo tests manually overwrite LESSONS.md before retrying --check; they do not execute the command and cannot catch this defect. The report's successful one-liner run in the akrogon worktree does not establish the consumer path.

## Verification

- Read brief, complete plan, design, implementation report, ponytail guidance and changed behavior's guides (`docs/guide/learn.md`, `docs/guide/merge.md`), then the full diff and merge callers in batch/next/phase. Debate is off, so no positions/rebuttal artifacts are expected. No peer review read and no code changes or commits made.
- `bun test tests/batch.test.ts tests/phase.test.ts tests/docs-links.test.ts --timeout=30000`: exit 0, **76 pass / 0 fail**, 691 expectations, 6.45s. Rerun justified by the specific merge-path concern and missing consumer-command evidence. Stack test exercises actual union resurrection and top-only fixup. Both push-check refusals pass. Solo cleanup proof is missing as described in F1.
- Reused unchanged-head implementation evidence for full suite (651 pass), changed tests (155 pass), typecheck and formatting. No failed configured check. The failing F1 probe is the new workflow command, directly caused by this diff, not an unrelated base failure.
- Fresh-agent artifacts read: guard brief names retirement history path, touching brief preserves the line, and uncalled-guard review returns fix. Report identifies the independent agent and transcript. Criteria 1, 3 and 5 have their requested live evidence.
- Shared retirement rule, implement clause, review bar, learn guide and unchanged learn-issues guarded removal agree on full mechanical coverage. No closure/duplicate/rejection removal path added (criterion 4). Edited guide/skill links pass (criterion 6).
- Direct chart route remains the explicit D10 exclusion. No additional acceptance criterion imposed.
- Worktree clean at reviewed head after verification. No credentials or live mutation needed. No operator actions.

## AREA path listings

Separate repository-root listing commands extracted named paths from each changed AREA page and tested existence.

`src/AREA.md`: `src/akrogon.ts`, `tests/phase.test.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `issues/`, `docs/reference-index.md`, `tests/helpers.ts` all exist.

`skills/AREA.md`: `src/akrogon.ts`, `tests/install.test.ts`, `tests/phase.test.ts`, all eight named skill/supporting files, `src/routing.ts`, `docs/reference-index.md` exist. Root-relative `scripts/observe.ts` and `scripts/log-tail.ts` are absent. Both references are unchanged from base; the live watch skill correctly runs `<skill-folder>/scripts/...`, and both files exist under `skills/watch-issues/scripts/`. No changed dead-pointer consequence established, so no Fix for those existing abbreviated index references.

## Test-Change trailers

Path rule read from `src/test-files.ts`. Trailers in `2d9becac4365ec4a1079853364d561d90e356b5e..HEAD`:

- `d195e0e`: `Test-Change: tests/batch.test.ts added buildStack re-removal and no-fixup cases; no existing expectation changed`
- `e659ae1`: `Test-Change: tests/phase.test.ts added stack and solo refusal cases; no existing expectation changed`
- `e8be187`: `Test-Change: tests/batch.test.ts prettier formatting only; no expectation changed`
- `e8be187`: `Test-Change: tests/phase.test.ts prettier formatting only; no expectation changed`

All four agree with their diffs. Added tests and import changes leave previous assertions/fixtures intact. Formatting changes have no behavior change, so no external contradictory-expectation source is required.

## Nits

None.
