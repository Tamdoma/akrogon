# Review B: build-pictures (check.review, initial, blind)

- Base: `f6fb18643f6dfc31f8e7e801660f80d1887947c8`
- Reviewed head: `6c31f7e6e6eec98f8eb742e7f0b1f19fa075d2cd`
- Verdict: `fix`

## Scope read

brief.md, design.md, plan.md, implementation/report.md, the full diff (14 SVGs, 14 embed lines on pages 09 and 10, `tests/docs-pictures.test.ts`), pages 09 and 10 in full, `docs/reference/where-things-go.md` § Pictures, `docs/reference/commands.md`, `docs/guide/12-when-work-stops.md`, `src/stop.ts`, `src/next.ts`.

No `AREA.md` in the diff. No documented behavior changed: the diff adds pictures and embed lines only, and guide text is otherwise untouched.

## Test-Change trailers in f6fb1864..HEAD

- `b25fdcf9`: `Test-Change: tests/docs-pictures.test.ts build-pictures plan.md criteria 1 and 2: add pages 09-10 cases and a retired-phrase case`. Accepted. Two new tests and one new synthetic case. The existing `expected` list keeps all 7 old entries and only appends the retired-phrase one, so no old expectation was weakened. The file at HEAD matches the `frozen` hash `1dfcedd8`.

## Verification evidence

- Criterion 1 and 2 tests: `check crit-1-2: 0 .../implementation/check-crit-1-2-1795791353068-2639011.log` on `6c31f7e6` (9 pass, 0 fail). It ran after the last test change (`b25fdcf9`), so it proves the current cases. The command equals plan's `build-pictures-crit` command with only the label changed.
- Report search: `check crit-2-search: 0 .../implementation/check-crit-2-search-1795791353253-2639141.log`. All 14 files: `href=0 <script=0 @import=0 @font-face=0 animation=0 —=0 created by=1 <title>Tamdoma</title>=1`.
- Criterion 4: `akrogon verify` leaf receipt for `6c31f7e6` in `issues/verify-runs.jsonl` (run `b3189fc8`), green.
- Alt text equals each SVG's `<desc>` for all 14 (my own script over both pages).
- Shares: none. 14 sections, 14 distinct pictures. No share to accept.
- No paid launches, grants or fixtures in this leaf.

## Criterion 3: renders read by B

Rendered with `/usr/bin/rsvg-convert -b white` for all 14 and `-b '#0d1117'` for `slot-a-and-b.svg`. Mark group sits on the "created by" text line in every render.

| Picture | What it shows | Matches section |
| --- | --- | --- |
| next-pass | the four `akrogon next` forms in `t-client-portal`, then one pass in five steps ending in "Exits, does not stay running" | yes |
| why-a-task-waits | a picked leaf fanning out to six wait reasons with their line or command | no, see F1 |
| start-order | rules 1 and 2 with csv-export ahead of an unrelated leaf, capacity refill longest-waiting first | yes |
| leaf-start | worktree, `.env` keys, setup, leaf tab, then listener and progress files | yes |
| lifecycle-phases | the phase chain with the check.repair and check.fix loop and `failed` from active phases | yes (N1) |
| slot-a-and-b | slot A's four steps passing the work to slot B's review, repair, merge | yes |
| slot-a-and-b (dark) | opaque card fills the page, reads the same | yes |
| slot-b-review | blind review by both slots, verdict chips, B repairs, Handed to A to check.fix, re-check by B only | yes |
| watching-progress | three boxes for `akrogon status`, `akrogon status csv-export`, `akrogon log <path>` | yes |
| merge-turn | one queue with holder, 2, 3, the three order rules, the `TURN` column | yes |
| merge-landing | no seat, reconcile, fetch and rebase, apply and start `akrogon-land-<id>`, conflict or dirty to check.repair | yes |
| land-run | verify, six gates, fast-forward push and its four outcomes | yes |
| merge-exit | four `merge-exit=` causes into check.repair, the two covers, slot B's four outcomes | yes |
| issue-complete | csv-export lands and wakes scheduled-email, then the issue completes and moves to `issues/closed/` | yes |
| announcement | `broadcast pending`, slot B runs broadcast-issue, one Discord update, a failed send never undoes the merge | yes |

## Fixes

### F1. `why-a-task-waits.svg` gives `akrogon start <slug>` as the command for a failed leaf

- Defect: the last row reads "Stopped or failed leaf" with the command `akrogon start <slug>` under it (`docs/pictures/why-a-task-waits.svg`). That command only clears a stopped mark. On a failed leaf it throws `Leaf is not stopped: <key>` (`src/stop.ts:131`). Page 09's own text for this section says a failed leaf "usually exits 1 with `Leaf is failed and needs phase recovery`" (`src/next.ts:1074`), and page 12 line 133 says `akrogon start` exits with an error if the leaf is not stopped.
- Realistic source: a reader whose leaf is `failed` reads this picture to learn what to run and types `akrogon start <slug>`.
- Consequence today: the command errors, and the picture points the reader away from phase recovery, the step page 12 describes.
- Criterion hit: done-criterion 3, "A picture that does not show its section's content ... is a Fix". The picture contradicts the section text it illustrates.
- Repair: a picture edit only. Either split the row so the command reads as stopped-only (for example `akrogon start <slug>` for stopped, "needs phase recovery" for failed), or replace the command with a label true for both. Keep alt text and `<desc>` equal. Existing tests in `tests/docs-pictures.test.ts` stay the accepting proof, and B rereads the render.

## Nits

- N1. `lifecycle-phases.svg` has no `merge` to `check.repair` arrow, and labels `check.review` "slot A and slot B" without "slot B only after a repair round". The table right under the picture shows both, and `slot-b-review.svg` and `merge-exit.svg` draw them. Deferred because the picture is a glance and states nothing false. Promote to a Fix if a reader question or the cold read on page 09 shows someone concluding that a merge cannot return to repair.
- N2. `merge-exit.svg` places its title at x=32 while the other 13 use x=40. Visual only, no reader impact. Promote only if where-things-go.md gains a fixed title position.

## Information for merge

- `origin/main` (`15453437`) also changed `tests/docs-pictures.test.ts` (setup-pictures). `git merge-tree --write-tree origin/main HEAD` reports a conflict. The merge turn's rebase will route it to `check.repair` as `merge-exit=conflict`, so repair may as well rebase onto `origin/main` while fixing F1. Not a Fix by itself.

## Operator actions

None.

## check.repair 2026-11-27

Fixes for reviewed head `6c31f7e6`: review-A has none (verdict `nits`); review-B has F1.

### F1 repaired

- Commit `539a3ed0` `docs(pictures): failed leaf needs phase recovery, not akrogon start`. Picture-only docs Fix, routed to B: the existing unchanged tests in `tests/docs-pictures.test.ts` and B's render read accept it.
- Before (`docs/pictures/why-a-task-waits.svg:62`): `<text class="mono" ...>akrogon start &lt;slug&gt;</text>` under "Stopped or failed leaf".
- After: `stopped: akrogon start &lt;slug&gt;, failed: needs phase recovery`. Matches page 09 (`Leaf is failed and needs phase recovery`, `src/next.ts:1074`) and `akrogon start` refusing a leaf that is not stopped (`src/stop.ts:131`). Alt text and `<desc>` unchanged and still equal: they say "a stopped or failed leaf" with no command.
- Render on white read by B: the line fits inside its row, nothing overlaps, the mark group is unchanged.
- Proof on `539a3ed0`: `check repair-f1-crit: 0 .../implementation/check-repair-f1-crit-1795791676125-3317384.log` (9 pass, 0 fail, includes the forbidden-markup, mark-group and em-dash checks).
- `akrogon verify` on `539a3ed0`: `verify leaf 539a3ed0d35e8b69fc62e59bd7667102012a815c: green` (format, typecheck, test 0).

### Not repaired

- N1, N2 (B) and A's N1, N2: Nits, no repair. None names a reusable mechanism, so no lesson line is written.

Handed to A: none. Operator actions: none.

The conflict with `origin/main` on `tests/docs-pictures.test.ts` stays for the merge turn's rebase.

## check.repair 2026-11-27, merge-exit=conflict

- Prompt fields: `merge-exit=conflict`, `base=154534374fe4f8ac0e905af0f95bdf4cff483513`. No `run`, `refusal`, `base_verdict` or `top`.
- Target: `154534374fe4f8ac0e905af0f95bdf4cff483513` (`origin/main` after fetch). Prior head: `539a3ed0d35e8b69fc62e59bd7667102012a815c`. Resolved head: `215f2216ca5879a268072d89c69717757854d168`.
- Conflict: `tests/docs-pictures.test.ts` only, in `b25fdcf9`. Main (setup-pictures) added `SETUP_PAGES`, `HERO`, `heroAlt` and three tests for README and pages 01 to 03. The leaf added `BUILD_PAGES` and two tests for pages 09 and 10. Both sides kept whole, no assertion changed or dropped. The resolved commit `ca942166` keeps its `Test-Change:` trailer, so the frozen-file gate (last touch cites the path) holds.
- Retired-lesson re-removal one-liner: `none`, no commit.
- `git range-diff f6fb1864..539a3ed0 154534374f..215f2216`: commit 1 (`b25fdcf9` to `ca942166`) differs only in hunk context (main's setup-page block above and before the new tests). Commits 2 to 4 are `=` (`9357c4ae`=`f4e0e364`, `6c31f7e6`=`5d8f41f3`, `539a3ed0`=`215f2216`).
- `akrogon verify` on `215f2216`: `verify leaf 215f2216ca5879a268072d89c69717757854d168: green` (setup, format, typecheck, test 0; test log `.../implementation/check-test-1795792040339-3779737.log`).

Handed to A: none. Operator actions: none.

## check.repair 2026-11-27, merge-exit=conflict (second)

- Prompt fields: `merge-exit=conflict`, `base=8db9e27b0305121a2cf64acac3acf3752440d056`. Main gained away-pictures (pages 11 and 12, old picture deletion, folder-wide mark test).
- Target: `8db9e27b0305121a2cf64acac3acf3752440d056` (`origin/main` after fetch). Prior head: `215f2216ca5879a268072d89c69717757854d168`. Resolved head: `0397395a3acfe16bf535a147ed7164779a132c0d`.
- Conflict: `tests/docs-pictures.test.ts` only, in `ca942166`. Main added `AWAY_PAGES`, a page 11 and 12 section test and a folder-wide mark test, and split `pictureProblems` into a call to `markProblems`. The leaf's retired-phrase line auto-merged into `markProblems`, so it now also runs on every SVG in `docs/pictures/`. Both sides kept whole, no assertion changed or dropped. `179fbcd2` keeps its `Test-Change:` trailer.
- Retired-lesson re-removal one-liner: `none`, no commit.
- `git range-diff 154534374f..215f2216 8db9e27b..0397395a`: commit 1 (`ca942166` to `179fbcd2`) differs only in hunk context (`AWAY_PAGES` line, main's folder-wide test above the new tests). Commits 2 to 4 are `=`.
- `akrogon verify` on `0397395a`: `verify leaf 0397395a3acfe16bf535a147ed7164779a132c0d: green` (setup, format, typecheck, test 0; test log `.../implementation/check-test-1795792203572-128109.log`).

Handed to A: none. Operator actions: none.
