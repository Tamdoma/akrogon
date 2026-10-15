# Log coverage, slot C blind notes

Sources: akrogon main f3557d8, skills/chart-issues/SKILL.md, framework checkout at /home/ivan/Work/infra/tamdoma/framework, both repos' `issues/chart/*/direct`, host facts 2026-10-15. Read-only.

## Q1 chart direct logs

### Pick: commit plain, as today. Pack only when the chart's direct attempt hands off into a leaf, and then by the leaf's own close pack.

Reason. The direct folder is small, read while the chart is open, and the chart has no code-level end. Packing needs a trigger that does not exist, and the operator's correction ("need to be read often when I refer to them") applies most to charts, which the operator reads directly, not through seats.

What the direct folder holds (host, 2026-10-15):

| folder | entries | logs | distinct check names | size | tracked |
|---|---|---|---|---|---|
| akrogon handoff-gaps/direct | 8 | 8 | 4 | 184K | 8 |
| akrogon merge-green-rate/direct | 9 | 7 | 7 | 116K | 9 |
| akrogon overnight-recs/direct | 12 | 12 | 4 | 276K | 12 |
| akrogon system-flow/direct | 18 | 18 | 5 | 2.2M | 0 |
| akrogon system-speed/direct | 9 | 8 | 7 | 116K | 10 |
| framework merge-green-rate/direct | 3 | 2 | 2 | 1.8M | 3 |

Total log bytes across both repos: 4,535,765. Non-log entries: `plan.md`, `report.md` (implement-issue direct route, SKILL.md:102), and the chart's `slots/review-B-<n>.md` from check-issue direct (SKILL.md:103, 6 files today). Logs are `check-<name>-<ms>-<pid>.log` written by `akrogon verify --holder <chart>/direct` (SKILL.md:108), through run-check's `--holder` target (src/run-check.ts:99-127, copy at :208-209). Repeats per name come from reruns after rebase (SKILL.md:106, step 2) and repair rounds, so a chart holds 1 to 4 logs per check name.

Who reads them and when:
- Seat B in the direct review reads `report.md` and cites log names: `slots/review-B-1.md:18` (handoff-gaps), `overnight-recs/slots/review-B-2.md:16`, `review-B-3.md:14`. This is during the chart, before landing.
- The operator, from CHART.md: `handoff-gaps/CHART.md:17` cites `direct/check-*-17920450*`. During and after the chart.
- `direct-guards.ts` (SKILL.md:109) reads only the receipt (`requireGreenReceipt` over `issues/verify-runs.jsonl`, src/verify.ts:36-37), never a log.
- `akrogon status --charts` reads the CHART.md stage line only (src/status.ts:308-322).
- `akrogon flaky` (src/flaky.ts:10-17) reads leaf logs under open/closed; it never looks under `issues/chart/`.
- No src code moves, packs, or deletes anything under `issues/chart/`. The `akrogon close <id> --by ...` at landing step 6 (SKILL.md:110) is `closeCommand` in src/pull.ts:208, which closes pull sources, not the chart.

Costs of the pick:
- Repo growth about 0.1 to 2.2 MiB per direct chart (table above). Today 4.3 MiB total over 6 charts, versus 115.7 MiB of log blobs in the framework pack from leaf logs.
- Two naming rules stay in the chart folder: `direct/check-*` for landing checks and `slots/review-B-<n>.md` for review. Acceptable, both are chart-local.
- `system-flow/direct` (18 logs, 2.2M, tracked 0) shows the gap in "as today": a handed-off chart whose direct logs were never committed. The skill's handoff step (SKILL.md:120) says nothing about the folder. The pick needs one sentence there: on `Handed off`, the direct folder's logs are committed or deleted before the branch is adopted by the leaf, since the leaf's own `implementation/check-*` logs replace them.

### Rejected options

- Pack when the chart ends. Rejected because the chart's three ends are text appends by a skill step (`Closed <date>` SKILL.md:114, `Held <date>` :121, `Handed off <date>` :85), with no command in the path for `Held` or `Handed off`. A pack needs a new command (`akrogon chart close`?) or a skill sentence that seats run by hand, which is the same hand-written-log problem Q2 is trying to remove. The reader (`akrogon log <path>`, taken fork) would work, but the operator's stated reading habit for charts is direct file reads. Gain is about 4 MiB today.
- Ignore, host-only. Rejected because CHART.md and review-B files cite these logs by name (`handoff-gaps/CHART.md:17`, `review-B-1.md:18`) and the framework checkout is the only copy (no backup job, evidence-C.md host facts). An ignored log is gone on the next worktree cleanup or disk loss, and the cite becomes a dangling name. It also conflicts with the taken gitignore shape, which is scoped to `issues/open/**` and `issues/parked/**` (src/init.ts:67-76 writer), so a chart ignore would be a third pattern.

### Evidence

| claim | tier | source | date |
|---|---|---|---|
| direct logs written only by verify `--holder` | code | src/run-check.ts:99-127, :208-209; SKILL.md:108 | 2026-10-15 |
| no code reads or moves chart folders | code | grep of src for `issues/chart` → status.ts:308-322 only; flaky.ts:10-17 open/closed only | 2026-10-15 |
| chart ends are text appends | skill | SKILL.md:85, :114, :121 | 2026-10-15 |
| `akrogon close` at landing is pull-source close | code | SKILL.md:110; src/akrogon.ts:101; src/pull.ts:208 | 2026-10-15 |
| sizes, counts, tracked state | host | `ls`, `du`, `git ls-files` per direct folder, both repos | 2026-10-15 |
| readers cite logs by name | host | handoff-gaps/CHART.md:17; slots/review-B-1.md:18; overnight-recs/slots/review-B-2.md:16, review-B-3.md:14 | 2026-10-15 |
| handed-off chart with untracked direct logs | host | system-flow/CHART.md:31 `Handed off 2026-10-15`; `git ls-files issues/chart/system-flow/direct` empty | 2026-10-15 |

### Pitfalls

- The taken run-check refusal rule ("refuse targets under `issues/closed/` or an owner holding `.closing`") must keep explicit `--holder` paths under `issues/chart/` allowed, or the direct route breaks at SKILL.md:108. Removed by: the refusal checks only the leaf-derived target, not the holder branch of `leafTarget` (src/run-check.ts:99-127).
- A chart that hands off and later lands as a leaf has the same check output twice: `chart/direct/check-*` plain and the leaf's `evidence.tar.zst`. Removed by: the handoff sentence above (commit or delete direct logs at handoff), so only one copy survives.
- Reruns pile up per name (overnight-recs: 12 logs, 4 names). Removed by: nothing in this fork; the reruns are legitimate evidence of repair rounds. If the pile matters, a later fork can keep only the last green per name at `Closed`.
- `system-speed/direct` shows tracked 10 against 9 entries: a tracked file was removed from the folder on disk (`review-B-1.md` moved to slots). Harmless, but it is why "committed plain as today" must say what gets committed, not assume the folder and the index agree.

### Questions the fork does not ask

- Does `Handed off` commit or delete the direct folder? (system-flow shows neither happens today.)
- Should `akrogon flaky` read chart direct logs? Today it cannot, and a flaky landing check on a chart leaves no trace in its output.
- Are `slots/review-B-<n>.md` files, which hold B's verdict on the direct attempt, evidence in the same sense as logs? They are small and tracked; the question matters only if "ignore" or "pack" is chosen.

## Q2 hand-saved logs

### Pick: every check output goes through `akrogon run-check`. Hand-saved files stay allowed only for outputs run-check cannot produce (merge-step outputs such as push and trailer-gate results, and filtered excerpts), and those must be named in the skill step that asks for them.

Reason. Hand-saved logs in framework are, with few exceptions, the same raw stdout that run-check already copies, produced by the same package scripts, from before run-check existed. Their only distinct value today is the handful of non-check outputs and the excerpts. One writer gives one naming rule, one timings record per run (src/run-check.ts:211-216), and one place the close pack and `akrogon flaky` can trust.

Sample (framework, `git ls-files`, heads read 2026-10-15):

| file | bytes | added | head | same as a run-check log? |
|---|---|---|---|---|
| `closed/worktree-isolation/check-scratch/implementation/repair-B-round4-evidence/selftest.log` | 521,393 | 2026-10-12 | `bun install v1.4.2` … `$ bun .claude/hooks/scripts/run-with-root-state-guard.ts -- --check-scratch bun test --timeout=30000 --isolate ./.claude/hooks/tests` | yes, raw stdout of one package script |
| `…/repair-B-round4-evidence/test_changed.log` | 6,144 | 2026-10-12 | `$ bun test --isolate ./.claude/hooks/tests/enforcement-parity.test.ts` | yes, but a narrower command than any configured check |
| `…/repair-B-round4-evidence/contracts.log` | 4,228 | 2026-10-12 | `$ bun .claude/workflow/scripts/contracts-verify.ts` | yes, one stage of `framework:verify:cheap` (package.json:168) |
| `closed/worktree-isolation/root-influence/implementation/merge-0fd25f81/verify.log` | 1,606,120 | 2026-10-12 | `framework:verify:cheap \| bun:verify-pin …` | yes, same as a `check-verify-*.log` |
| `closed/verify-speed/hot-suite-concurrency/implementation/merge-verify.log` | 1,726,034 | | `$ bun .claude/hooks/scripts/run-with-root-state-guard.ts -- -- bun run --sequential --no-exit-on-error framework:verify:fast framework:verify:core` | yes |
| `closed/backlink-audit-run/run-unblock/pass-two-review-notes/implementation/repair-B-F1-red.log` | 3,389 | | `FAIL: validation-pass-1 …` lines only | no: a filtered excerpt, not a command's stdout |
| `…/merge-evidence/rebased-1e53697b4/push.log` | 454 | | rejected non-fast-forward push output | no: a merge step, not a check |
| `…/merge-evidence/…/trailer-gate.log` | 2 | | `ok` | no: a merge step |
| `…/merge-evidence/…/runner.log` | 0 | | empty | no content |

Host facts:
- Hand-saved logs under framework `issues/closed`: 2,854 files, 466.5 MiB; run-check copies: 1,606 files, 478.4 MiB. 118 hand-saved files are byte-identical to a `check-*` copy in the same leaf. 56 leaves hold run-check copies, 119 hold hand-saved logs, 47 hold both.
- Hand-saved logs sit in named subfolders, not flat: `merge-<hex>/` (69), `merge-evidence/` (40), `merge-B-<hex>/` (30), `rebased-<hex>/` (24), `<hex>/` (21), `merge-<hex>-evidence/` (20), `check-repair-B/` (20), `repair-B/` (15). Each is a seat's own naming scheme for one round.
- Dates: first hand-saved `selftest.log` added 2026-04-20; first `check-*` copy 2026-10-12; hand-saved files still added 2026-10-15 (a leaf closed since 10-13 holds `recheck-B-F2-red.log` beside 12 `check-*` copies).
- Names map to package scripts, not akrogon check names: selftest, contracts, parity, test_changed, verify, merge-verify (package.json:10, :168, :172, :173). Framework `issues/config.yaml` defines only `cheap`, `verify` (merge), so run-check names on this repo are `check-setup`, `check-cheap`, `check-verify`.
- Provenance lines in 59 closed `report.md` files cite `selftest.log`, `test_changed.log`, `verify.log`; 12 `review-B.md` cite `merge-evidence/`; 41 `report.md` cite `check-<name>-<ms>`. Old lines carry the retired temp root: "Log: `/tmp/akrogon-1000/<leaf>-<hash>/…`", so seats copied from temp into the leaf by hand.

Which skill step makes seats write them. No skill names a log file. Three sentences cause the copying:
- implement-issue/SKILL.md:25, check-issue/SKILL.md:18, merge-issue/SKILL.md:18: "Temp files and logs go under `$TMPDIR` … anything needed later goes in the leaf folder." A seat that reads "needed later" as "B must see it" copies the temp log into `implementation/`.
- merge-issue/SKILL.md:41, :53: "records its output in review-B.md under the leaf folder", and :75 "with both logs … failing output". "Output" with no file rule yields `merge-B-<hex>/verify.log` and the `merge-evidence/*` folders.
- implement-issue/SKILL.md:65: "commands run with pasted results and artifact paths", and check-issue:67, :83, :85 asking for a red log and a green log per finding. That is the source of `repair-B-F1-red.log` and `recheck-B-F2-red.log` excerpts.

Cost of the pick:
- Skill edits in three skills (the three sentences above), plus a line that the red/green proof for a finding is a `run-check --name repair-<id>-red` run, not a pasted excerpt. The old wrapper already exists: `withSetup` (src/config.ts:316-328) wraps every configured check; seats must use `akrogon run-check --name <x> -- <cmd>` for ad-hoc commands, which the CLI supports today (src/run-check.ts:146-220).
- Excerpts lose their filtering: a full `bun test` log is 500 KiB where the excerpt was 3 KiB. The close pack handles size (taken fork); readers get the full context. If an excerpt is still wanted, it goes in `report.md` as pasted lines, not as a `.log`.
- Merge-step outputs (push, trailer-gate) have no run-check home. They stay hand-saved, named in merge-issue, under one folder name (`merge-evidence/`). Today's 219 files show the shape already exists.

### Rejected option

- Keep allowing hand-saved logs. Rejected because the 466.5 MiB of hand-saved files duplicate what run-check copies (118 byte-identical in the same leaf, the rest the same commands run a round earlier or later), carry at least eight folder naming schemes, never reach `timings.jsonl`, and are the files `akrogon flaky` cannot find (it opens `check-*` by path from timings, src/flaky.ts:35). Size being handled by the pack does not make a second writer harmless: a seat deciding what to copy is the step that produced the retired `/tmp/akrogon-1000` paths in reports and 0-byte `runner.log` files.

### Evidence

| claim | tier | source | date |
|---|---|---|---|
| hand-saved heads equal run-check raw stdout | host | the four `repair-B-round4-evidence/*.log` and `merge-0fd25f81/verify.log` heads above, versus `check-selftest-1791794542056-635533.log` head | 2026-10-15 |
| 118 byte-identical, 47 leaves with both | host | sha256 over `git ls-files 'issues/closed/*.log'` grouped by leaf | 2026-10-15 |
| folder naming schemes | host | parent-dir histogram over hand-saved paths | 2026-10-15 |
| dates | host | `git log --diff-filter=A` on first/last files | 2026-10-15 |
| no skill names a log file | skill | grep `\.log` over skills/*/SKILL.md: only the `$TMPDIR` sentence and "records its output" | 2026-10-15 |
| run-check accepts ad-hoc names | code | src/run-check.ts:146-220; src/config.ts:316-328 | 2026-10-15 |
| flaky reads only run-check logs | code | src/flaky.ts:10-17, :35 | 2026-10-15 |

### Pitfalls

- A seat running `akrogon run-check --name test_changed -- bun test <file>` in a worker worktree: `leafTarget` maps `-u<N>` worker worktrees to the owner's implementation folder (src/run-check.ts:99-127), so the copy lands correctly. In a chart direct worktree it needs `--holder`. Removed by: the skill sentence naming the command once, with `--holder` for the direct route.
- run-check records every run in `timings.jsonl` (:211-216). Ad-hoc repair runs will inflate `check_end` counts that `akrogon flaky` and status read. Removed by: nothing today; name it so the flaky reader can filter names by prefix (`repair-`).
- Filtered excerpts vanish; a reviewer reading `report.md` must open a 500 KiB log for one FAIL line. Removed by: `akrogon log <path>` from the taken fork plus a grep, or pasted lines in `report.md`.
- The old `$TMPDIR` sentence stays true for scratch; only the "anything needed later goes in the leaf folder" half changes. Removing the whole sentence would send seats back to writing scratch into the leaf.

### Questions the fork does not ask

- What happens to the 2,854 existing hand-saved files at the close-time pack? The pack takes every `*.log` under the owner, so they go in as they are. Nothing needs to move. The fork should say so to stop a migration.
- Who runs the excerpt proof for a finding (red then green)? Today it is seat A with hand filtering. Under the pick it is two run-check runs with names, which the readiness or check skill must spell out.
- Does the merge-issue skill want `merge-evidence/` as one fixed folder name? Eight schemes exist because no name was given.
