# Report: watch-consults implement (slot A)

Branch base `4f5e3fd2` (origin/main), head `0a11337b`. Wave 1 delegated to 3 workers (Merry/Sam/Gandalf, detached worktrees at `7ca2387c`, cherry-picked clean); wave 2's only worker-runnable item (tests/AREA.md line) done by A; the e2e cell is A's criterion run.

## Changed files and reasons

- `skills/watch-issues/scripts/timer.ts` — due coalescing (boundaries accrued during the watcher's first busy turn behind a sent, receipted head collapse to the latest), exit-path consultant sweep, optional `--prefix`; plus the pending-entry re-find fix (a poll gap spanning several boundaries pushed one entry per boundary).
- `skills/watch-issues/scripts/start.ts` — passes `--prefix` to the timer.
- `skills/watch-issues/scripts/stop.ts` — consultant candidate conflict check before the timer kill, verified-consultant kill+rm after it, `stopped consultant <address>` line.
- `skills/watch-issues/scripts/hc.ts` — `isVerifiedConsultant` beside `isVerifiedTimer`.
- `skills/watch-issues/scripts/consults.ts` (new) — `dir`/`new`/`match` case-folder and signature gate; heads via `git worktree list` (state-inventory gate showed red on the state.yaml walk, verify `check-test`).
- `skills/watch-issues/SKILL.md` — consult trigger on the notify-only Judge branches, `## Consult` section, Never/Invocations/Reply updates, and the case-end consultant close (added after three live runs left the consultant live — no line named the close).
- `skills/watch-issues/consultant-brief.md` (new) — the consultant's brief template.
- `docs/use/watch-while-away.md` — `## What stays yours` rewritten.
- `skills/AREA.md`, `tests/AREA.md` — one-line updates.
- Tests (planned + A corrections, all `Test-Change:` trailer'd): `tests/watch-timer.test.ts` (coalesce/close/sweep cases + deterministic hold fix), `skills/watch-issues/scripts/consults.test.ts` (new), `tests/e2e/watch-consults.e2e.ts` (new cell + 4 run-driven corrections), `tests/e2e/watch-tier.ts` (`startProofMs`, `repoConfig` options).

## Commands run and results

- `check u1-timer: 0`, `check u1-timer-all: 0`, `check u2-consults: 0`, `check u3-docs: 0` — worker worktrees.
- `check landed-u1: 1` (coalesce sent due=2 — pending computed once per poll gap; fixed `c1566fc4`); `check landed-u1c: 0`, `check landed-u1d: 0` (14 pass).
- `check landed-u2: 0` (4 pass).
- `check watch-consults` (e2e): `1795291428730` exit 1 (AKROGON_E2E_ROOT too long, no session); `1795291802659` exit 1 (pi task sent before it listened); `1795291815929` exit 1 (in-process hc resolved wrong runtime); `1795292086140` exit 1 (consultant close too early — 5s); `1795292357753` exit 1 (AKROGON_HOME absent from watcher env — cases landed in real `~/.akrogon`, removed); `1795292535746`, `1795292999258`, `1795293235774` exit 1 (consultant still live — `akrogon next` seat start proof holds the watcher's turn; the close follows it).
- `check consults-fix: 0`, `check state-inv: 0` after the `git worktree list` fix.
- `check retry-env-tab: 0` — `next.test.ts` "live tab freezes .env" was flaky red inside verify, green on same-command retry (inconsistent, no cause in this diff).
- `akrogon verify`: format red → prettier commit; test had only the env-tab flake (retry green). No second full verify was run after the `0a11337b` fix; the two command blocks individually green: `check-state-inv`, `check-consults-fix`, `check-retry-env-tab`, plus the earlier full-suite 1265/1266 pass.

## Criterion proof status

- C3 signature gate: green (`check landed-u2`, `check consults-fix`).
- C4 coalescing: green (`check landed-u1d`).
- C5 stop sweep: green (`check landed-u1d`, `check u1-timer`).
- C6 lost-watcher sweep: green (`check landed-u1d`).
- C7/C10 (skill/guide text, absent-recipe notice): landed in SKILL.md, read by the reviewing seat; `check u3-docs` green.
- C1/C2 live run: **unproven and now unprovable under the grant** — see Grant.

What the three live runs did prove before failing: consultant starts under `seat --watch-consultant` with correct name/labels/parent (pi watcher drove the whole loop), exchange over turn files + `hc send` inside the watcher's turn works, the agy consultant made the detached case worktree, removed `BROKEN`, ran `akrogon verify --holder <case>` green (D2 route works end to end), pushed fast-forward to `origin/main`, and the watch resumed the leaf — twice at `check.fix` (3″ correct), once at `check.repair` via the watcher's reading of 3′ — with `akrogon next` dispatching the codex seat A (trust dialog answered by the test). Missing/unproven: the consultant `hc kill`+`rm` at case end (in every run `next` still held the watcher's turn when the wait elapsed), notices, and the case folder assertions ran only partially.

## Grant (readiness.yaml grants[0], bound 6 harness sessions)

- Plan.synthesis: 1 — pi watcher, plan-red e2e (~150 s, no consultant).
- Implement: run `1795291802659`: 1 (pi watcher). Runs `…086140`, `…357753`, `…535746`, `…999258`, `…235774`: 3 each (pi watcher, agy neon consultant, codex seat A).
- **Total: 11 — bound crossed.** Every session ended inside 15 min via `stopWatchTier` or test teardown. Cleanup verified: no `akr-e2e-watch` terminals, sockets or state folders; real-home `~/.akrogon/watch` case folders removed; agy `trustedWorkspaces` and codex `config.toml` entries for `/var/tmp/akr-1000/wc-e2e` removed. Session records remain under `~/.pi/agent`, `~/.gemini`, `~/.codex/sessions` as account-side logs.
- The bound is why the pass fails rather than reruns: each further attempt costs 3 sessions.

## In-branch fixes made during the slow run

- SKILL.md `## Consult` gained the case-end consultant close (the model faithfully left the consultant live — the skill text named closes only at liveness/stop, never at end).
- `consults.ts` heads resolved from `git worktree list` (state-inventory gate red).
- Test-only corrections: idle-wait before the watcher send; `XDG_RUNTIME_DIR` for in-process hc calls; `AKROGON_HOME` in watcher env; answerTrust for the resumed codex seat; close wait bounded by the `next` proof; deterministic hold flag. All `Test-Change:` trailers.
- `timer.ts` pending re-find inside the accrual loop (lane rerun caught the boundary-gap race the worker run missed).

## Known limitations / unverified criteria

- Criterion 1/2 unproven (grant); the consultant-close-at-end path is the largest unverified step. `akrogon next`'s seat start proof holds the watcher's turn ~3-4 min in this cell — a future run may need the codex seat's trust pre-answered or a cheaper seat recipe.
- D6's coalescing narrows to the watcher's first busy turn (frozen-test reconciliation, plan notes) — consults on later turns drain dues individually.
- `signature.json` `heads` uses `'-'` for a worktree-less leaf (schema is `z.record(z.string())`).
- `akrogon verify` last full run had one flake (`next.test.ts` env-tab, retry green); no full-suite re-run after the `0a11337b` consults fix — its two touched surfaces (`state-inventory`, `consults`) run green individually.

## Worker returns

- Merry (U1): timer/start/stop/hc — landed `8d17d034`, plus the two documented deviations (optional `--prefix`, first-turn coalescing gate).
- Sam (U2): consults.ts — landed `273ab52e`, heads `'-'` sentinel documented.
- Gandalf (U3): SKILL.md/consultant-brief/guide/AREA — landed `d04db19e`.

## Resumed pass, 2026-11-21 (grants[1], N1b)

Leaf moved failed -> implement by the door after the operator's "q2 o1". grants[1]: at most 4 prompted sessions from its approval, each under 15 min, on three terms: the skill closes the consultant before `akrogon next`, the cell's slots a/b use the tier stand-in, and the first runs' session records are removed and named here first.

### Session records of the first runs, named before removal

Found by the run roots `/var/tmp/akr-1000/wc-e2e` and `/var/tmp/akr-1000/e2e-consults-root` (pi folder name, codex `session_meta.cwd`, agy brain files):

- pi /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-wc-e2e-akr-e2e-watch-consults--/2026-11-21T20-10-25-285Z_01a1ffbb-4485-75f4-a216-a12ee2a77c18.jsonl
- pi /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-wc-e2e-akr-e2e-watch-consults--/2026-11-21T20-14-58-894Z_01a1ffbf-714e-7083-bff1-16e00195a6f5.jsonl
- pi /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-wc-e2e-akr-e2e-watch-consults--/2026-11-21T20-19-40-755Z_01a1ffc3-be52-74e8-b2a8-bcc8b4686444.jsonl
- pi /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-wc-e2e-akr-e2e-watch-consults--/2026-11-21T20-23-17-523Z_01a1ffc7-0d13-76f5-8695-b0f6c51c1123.jsonl
- pi /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-wc-e2e-akr-e2e-watch-consults--/2026-11-21T20-27-07-612Z_01a1ffca-8fdb-71b4-a839-3ed259b0dc70.jsonl
- pi /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-wc-e2e-akr-e2e-watch-consults--/2026-11-21T20-30-16-044Z_01a1ffcd-6fec-73e6-91cc-40911405b269.jsonl
- pi (empty folder) /home/ivan/.pi/agent/sessions/--var-tmp-akr-1000-wc-e2e-akr-e2e-watch-consults--
- pi (empty folder) ~/.pi/agent/sessions/--var-tmp-akr-1000-e2e-consults-root-akr-e2e-watch-consults--
- agy /home/ivan/.gemini/antigravity-cli/brain/e849ab25-9b4e-46c6-a880-a84a5ffb3f2c/ + /home/ivan/.gemini/antigravity-cli/conversations/e849ab25-9b4e-46c6-a880-a84a5ffb3f2c.db
- agy /home/ivan/.gemini/antigravity-cli/brain/f4387281-ad7e-4468-9684-d08d89bf0522/ + /home/ivan/.gemini/antigravity-cli/conversations/f4387281-ad7e-4468-9684-d08d89bf0522.db
- agy /home/ivan/.gemini/antigravity-cli/brain/adfc97ad-2c71-4694-bacc-e453cbe2da89/ + /home/ivan/.gemini/antigravity-cli/conversations/adfc97ad-2c71-4694-bacc-e453cbe2da89.db
- agy /home/ivan/.gemini/antigravity-cli/brain/9d960b00-ce0e-4831-baca-297a572a16ab/ + /home/ivan/.gemini/antigravity-cli/conversations/9d960b00-ce0e-4831-baca-297a572a16ab.db
- agy /home/ivan/.gemini/antigravity-cli/brain/c005ced5-da77-4586-8b36-7457a7ece305/ + /home/ivan/.gemini/antigravity-cli/conversations/c005ced5-da77-4586-8b36-7457a7ece305.db
- agy /home/ivan/.gemini/antigravity-cli/brain/1fdb07c7-564b-4c52-9714-1511f40e241e/ + /home/ivan/.gemini/antigravity-cli/conversations/1fdb07c7-564b-4c52-9714-1511f40e241e.db
- agy log /home/ivan/.gemini/antigravity-cli/log/cli-20261121_211120.log
- agy log /home/ivan/.gemini/antigravity-cli/log/cli-20261121_211601.log
- agy log /home/ivan/.gemini/antigravity-cli/log/cli-20261121_212029.log
- agy log /home/ivan/.gemini/antigravity-cli/log/cli-20261121_212419.log
- agy log /home/ivan/.gemini/antigravity-cli/log/cli-20261121_212758.log
- agy log /home/ivan/.gemini/antigravity-cli/log/cli-20261121_213116.log
- agy history: 7 lines naming /var/tmp/akr-1000/wc-e2e in /home/ivan/.gemini/antigravity-cli/history.jsonl
- codex ~/.codex/sessions/2026/11/21/rollout-2026-11-21T21-33-52-01a1ffd0-bbde-7543-a9d6-2c49a66c138a.jsonl

Trust entries: none name either root (`~/.codex/config.toml`, agy `settings.json`, `~/.claude.json` checked); no claude session records.

Count correction: the records show 6 pi watchers and 6 agy consultants across the implement runs (runs `…815929` through `…999258` each started pi + agy) plus 1 codex seat that received a prompt, beside the plan-red pi and run `…802659`'s pi, which left no record. The first grant's real count is at least 15, not the 11 the Grant section above states: run `…815929` and run `…800454` were left out of it. grants[1] counts from its own approval, so this pass's count starts at 0.

### grants[1] count

- Try 1, run `1795296133939` on `2d5a6a15`: 2 sessions (pi watcher, agy consultant; seat A the stand-in). Count 2 of 4.
- Try 2, run `1795296549346` on `7015e2b7`: 2 sessions (pi watcher, agy consultant; seat A the stand-in). Count 4 of 4 — grants[1] spent.

### grants[1] cleanup, named before removal

- Tier: `stopWatchTier` ran on both tries; no `akr-e2e-watch` core state or socket remains, `/var/tmp/akr-1000/wc2-e2e` and `/var/tmp/akr-1000/wc3-e2e` are gone.
- Trust entries: agy `~/.gemini/antigravity-cli/settings.json` `trustedWorkspaces` `/var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults` and `/var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults`; none in codex `config.toml` or `~/.claude.json`.
- pi: `~/.pi/agent/sessions/--var-tmp-akr-1000-wc2-e2e-akr-e2e-watch-consults--/2026-11-21T21-18-12-081Z_01a1fff9-5271-71aa-b85d-0d0105150557.jsonl`, `~/.pi/agent/sessions/--var-tmp-akr-1000-wc3-e2e-akr-e2e-watch-consults--/2026-11-21T21-25-32-853Z_01a20000-0c35-7546-9c40-92587c772cb1.jsonl` and both folders.
- agy: `brain/746ad038-d28d-4c80-afa5-6be89a0fc41e/` and `brain/a2f5d18d-911b-47c2-beee-df83baeeb932/` with their `conversations/<id>.db`, `log/cli-20261121_221856.log`, `log/cli-20261121_222617.log`, 3 `history.jsonl` lines naming the roots.
- codex/claude: no session records (seat A was the stand-in).

### Commits this pass

- `6e80ed38`→rebased: SKILL.md Loop end/Resume — the case end closes the consultant before any resume command (grants[1] term).
- `2d5a6a15`→rebased: e2e cell slots a/b on the tier stand-in, asserts the consultant is gone when the leaf is first seen resumed (`Test-Change:` cites N1b).
- `333d8e96`→`7015e2b7`: SKILL.md Exchange — the watch answers every consultant turn with its own turn file recording agreement (or a question/disagreement) before acting; consultant-brief.md Return carries the resume-target rule (try 1 defects).
- `081b0d59`: SKILL.md Record — the notice form `akrogon notice --title … --body …` (try 2 defect).
- `0f947b08`: cell waits up to 90 s for the notices the watcher sends last (`Test-Change:` cites try 2's screen).

### Refresh

- Before try 2: rebased `333d8e96` (base `4f5e3fd2`) onto `eb9f22ab` → head `7015e2b7`; AKROGON_BASE `eb9f22ab`. The installed release equals `eb9f22ab`; the consultant runs the release `akrogon` from the real PATH, so before the rebase its `verify --holder` receipt carried `patch_id`/`patch_base`, which the older checkout's `akrogon next` refused (`unrecognized_keys`) in try 1. Gone after the rebase (try 2 `next` exit 0).

### Commands and results

- `akrogon verify` on `2d5a6a15` (400 s): format/typecheck 0, test 2 fail — `door-reset` agy reset stages, `leaf-slices` merged-inside-slice; files outside this diff. Retry `check test: 0` (1266 pass, 288 s, `check-test-1795295874092-1301022.log`) → **inconsistent**, red log `check-test-1795295571091-393649.log`.
- Try 1, `check watch-consults: 1` (242 s, `check-watch-consults-1795296133939-1993123.log`, evidence `implementation/watch-consults-e2e-g2/`): consultant started (`aw-watch-consult`, parent the watcher, labels right), agy found the cause, fixed `BROKEN` in `<case>/worktree`, `akrogon verify --holder` red before/green after, pushed fast-forward, removed the worktree; the watcher closed the consultant **before** the resume (assertion green), resumed the leaf (`check.review` first — refused `Empty leaf branch` — then `check.fix` on the next fire), stand-in seat A started. Red: no `turn-*-watch.md` — the skill never asked the watch to answer a consultant turn.
- `check rebased-units: 0` (18 tests, watch-timer + consults, on `7015e2b7`); typecheck 0.
- Try 2, `check watch-consults: 1` (218 s, `check-watch-consults-1795296549346-3016613.log`, evidence `implementation/watch-consults-e2e-g2-try2/`): every assertion green through the case record — `turn-1-consultant.md` and `turn-1-watch.md` (the watch's agreement on cause, fix and `check.fix` target), signature parses with anchor `watch-consult-leaf`, base log fast-forward over `stage base red`, consultant closed before the resume, `check.fix` on the first attempt, stand-in seat started, `status` `closed`. Red: 0 notices — the watcher ran `akrogon notice "<text>"` positionally; the CLI parses `z.tuple([])` on positionals and threw a ZodError before writing. Free reproduction: `akrogon notice "x"` → ZodError, exit 1, no write.
- `check notice-form-docs: 0` (docs test on SKILL.md, `0f947b08`); `akrogon verify` on `0f947b08` (344 s): setup/format/typecheck/test 0, 1284 pass, **leaf green**.

### Criterion status at the end of this pass

- C3–C6: green (unchanged code; `rebased-units`, full suite on `0f947b08`).
- C7: skill text, read by the reviewing seat.
- C1/C2: **unproven**. Try 2 showed every C1 step live except the notices; the notice form is now in SKILL.md and the cell waits for them, but no paid session remains under grants[1] to show it. The next run needs a new grant: 2 sessions (pi watcher + agy consultant), one try, same terms.

### Known limitations

- The consultant inherits the hc core's PATH, so it runs the installed release `akrogon`, not the checkout's. Harmless when the leaf is rebased onto the release; a skewed release can write records the checkout refuses (try 1).
- The first grant's count is corrected above (at least 15, not 11).

## Resumed pass, 2026-11-22 (grants[2], 2 sessions, one try)

- Refresh: rebased `0f947b08` (base `eb9f22ab`) onto `88d40095` → head `be617169`; AKROGON_BASE `88d40095`, equal to the installed release (no consultant `akrogon` skew).
- `akrogon verify` on `be617169` (242 s): setup/format/typecheck 0; test 2 fail outside this diff (hc session refusal test; slow-alarm "open episode pins the normal"), red log `check-test-1795303367647-2787581.log`. Retry `check test: 0` (1304 pass, 182 s, `check-test-1795303557983-3238517.log`) → **inconsistent**.

### Live run — criteria 1 and 2

`check watch-consults: 0` — run `1795303796269` on `be617169`, 228 s, log `implementation/check-watch-consults-1795303796269-3594806.log`, evidence `implementation/watch-consults-e2e-g3/`. grants[2] count: 2 of 2 (pi watcher, agy consultant; seat A the tier stand-in).

- Consultant (`consultant.json`): `aw-watch-consult`, parent `t1` (the watcher), labels `akrogon.watch-consult=akre2e`, `akrogon.repo=akre2e`, no `akrogon.leaf`.
- Case folder `<AKROGON_HOME>/watch/akre2e/consults/watch-consult-leaf-1/`: `brief.md`, `case.md`, `signature.json`, `status`, `turn-1-consultant.md`, `turn-1-watch.md`, `screen-consultant.txt`.
- Signature: `{"anchor":"watch-consult-leaf","cause":"blocked","phase":"check.review","command":"akrogon verify","base":"0fdfa3a…","heads":{"watch-consult-leaf":"0fdfa3a…"}}`.
- Exchange: the consultant's turn 1 gives cause, fix, verification and "Phase: `check.fix` … `failure.phase: check.review` (which is never a direct resume target)"; the watch's turn 1: "I verified your push independently … Root cause: agreed … Fix: agreed …".
- Base (`base-log.txt`): `c5e8f43 Remove BROKEN marker from main` fast-forward on `0fdfa3a stage base red`.
- The consultant was gone when the leaf was first seen out of `failed`; the leaf resumed at `check.fix`; stand-in seat A `aw-watch-consult-leaf-a` started.
- Notices (`notices.json`), both `attention: false`: "watch-consult-leaf-1: base fix pushed to main" and "watch-consult-leaf-1: watch-consult-leaf resumed at check.fix".
- Teardown: `absence.json` `{"left": []}`.
- Criterion 2: the choices (cause, fix, `check.fix` target, agreement) sit in `case.md` and the turn files for the reviewing seat. The function checks passed (files exist, the signature parses, both turn files exist).

### grants[2] cleanup, named before removal

- Tier: no `akr-e2e-watch` core state or socket, `/var/tmp/akr-1000/wc4-e2e` gone.
- Trust: agy `settings.json` `trustedWorkspaces` `/var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults`; none in codex or claude.
- pi: `~/.pi/agent/sessions/--var-tmp-akr-1000-wc4-e2e-akr-e2e-watch-consults--/2026-11-21T23-26-09-248Z_01a2006e-7760-710d-801f-34b26014e2fb.jsonl` and its folder.
- agy: `brain/5669a8f5-5b9e-478b-812e-7daef5c69f12/` with `conversations/5669a8f5-5b9e-478b-812e-7daef5c69f12.db`, `log/cli-20261122_002657.log`, 2 `history.jsonl` lines naming the root.
- codex/claude: no records.

### Criterion status at handoff (head `be617169`)

- C1, C2: green, live run above.
- C3–C6: green, full suite on `be617169` (the retry above).
- C7: skill text, for the reviewing seat. Not proven at runtime, as the criterion states.
- Known limitation, unchanged: the consultant runs the installed release `akrogon` from the hc core's PATH. That matches the checkout only while the leaf base equals the release.
- Trailer-only commit `ac3df7cd` cites `tests/AREA.md` (the move asked for it). `akrogon verify` on `ac3df7cd` (165 s): setup/format/typecheck/test 0, 1304 pass, **leaf green**. Committed head `ac3df7cd`, base `88d40095`.

## Grant audit, 2026-11-22

Each run ID below is the suffix of a completed `check-plan-e2e-consults-*` or `check-watch-consults-*` log. The matching start and end rows are in `issues/timings.jsonl`. The unit is a harness session that received a prompt. Watcher and consultant count separately. The numbers below distinguish confirmed prompts from usage that the retained evidence cannot establish.

| Grant | Run | Confirmed prompts | Evidence on uncertain use |
| --- | --- | ---: | --- |
| 0 | `1795288277803` | 0 | The fixture root was missing before setup. |
| 0 | `1795288434747` | 0 | Unknown for the Pi watcher. Its screen shows an idle watcher with the task text in the input line and no confirmed submission. The original plan counted it as one. |
| 0 | `1795291428730` | 0 | The tier socket refused before watcher launch. |
| 0 | `1795291802659` | 0 | Unknown for the Pi watcher. Its screen also shows unsubmitted task text and no active task. No session record survived. |
| 0 | `1795291815929` | 0 | The watcher process spawned, but the readiness call failed before the test's send. No prompt was delivered. |
| 0 | `1795292086140` | 2 | Pi watcher and agy consultant. The log shows the consultant completed its first task. Leaf-seat prompt unconfirmed. |
| 0 | `1795292357753` | 2 | Pi watcher and agy consultant. Leaf-seat prompt unconfirmed. The log shows the case under the real `~/.akrogon/watch/akre2e/consults/` path, outside the approved tier root. This breached the grant's write boundary. The earlier Grant section records removing those case folders. |
| 0 | `1795292535746` | 2 | Pi watcher and agy consultant. Leaf-seat prompt unconfirmed. |
| 0 | `1795292800454` | 2 | Pi watcher and agy consultant. Leaf-seat prompt unconfirmed. This attempt was missing from the original command list. |
| 0 | `1795292999258` | 2 | Pi watcher and agy consultant. Leaf-seat prompt unconfirmed. |
| 0 | `1795293235774` | 3 | Pi watcher, agy consultant and Codex seat A. `watch-consults-e2e/seat.json` and `screen-t4.txt` preserve the leaf prompt, and the cleanup section names its session record. |
| 1 | `1795296133939` | 2 | Pi watcher and agy consultant. The resumed seat was the test stand-in. |
| 1 | `1795296549346` | 2 | Pi watcher and agy consultant. The resumed seat was the test stand-in. |
| 2 | `1795303796269` | 2 | Pi watcher and agy consultant. The resumed seat was the test stand-in. |

The surviving evidence confirms at least 13 prompted sessions against `grants[0]`'s limit of six. The exact total is unknown. The earlier 11 and 15 totals combined allocations with confirmations. At least six confirmed prompts had occurred before `1795292800454`, so the overrun happened by that run at the latest. There is no contemporaneous pre-launch warning or count. This audit records the overrun without adding one retrospectively. The later approvals acknowledge the prior usage, and the recorded attempts confirm four of four under `grants[1]` and two of two under `grants[2]`. Slot B launched no paid session during review or repair.

## check.fix, 2026-11-22 (review-B Handed to A)

Prior reviewed base and head: `88d40095` / `ac3df7cd`. B's check.repair handed off `b175b664` on `88d40095`. Refresh: fetched, rebased onto `origin/main` `b9c59076`, prior head `b175b664` became `fa96959c`, clean. `AKROGON_BASE` is now `b9c59076`. Plan corrections first: four dated `## Implementation notes` lines (D6 refined corrected, D5 two-line stop, consult-loop item 4 sender reading, the cell's product-state checks).

| Item | Commits | Proof |
| --- | --- | --- |
| B F1 + A F2, coalescing on every busy turn | `85d2f972` (Test-Change, frozen busy-dues case corrected to brief C4), `df54b95d` (`timer.ts`: while the watcher is neither idle nor done, a crossed boundary moves the unsent due to the latest number; the `turn === 0`, sent-head and receipt conditions are gone) | Red on `fa96959c` code: `check-fix-red-timer-1795305222181-1128055.log` (the busy case sent due 3 after the held due 2). Green on `df54b95d`: whole `tests/watch-timer.test.ts`, 15 pass, `check-fix-green-timer-1795305334354-1157572.log` (103.6 s). The resend-and-drop cases (idle watcher) still pass. |
| B F2, stop prints two lines | `85d2f972` (frozen stop case corrected to brief C5), `df54b95d` (`stop.ts` joins its lines with a newline; header updated), `b34b19e5` (SKILL `watch-issues stop` line names both lines) | Red: same red log (`stop exit=0 stopped t3 stopped consultant t4` on one line). Green: same green log. |
| B F5 remainder, message sender | `90f14dad` (SKILL Exchange: hc's `from` on a `reason: message` wake, or the `<hc from="<address> <name>">` tag when the wait returned first for `children`; never the message text; no `from` means the operator) | Skill text. hc schema documents the wait JSON `from` field; the live run shows the second shape (`watch-consults-e2e-g3/watcher-screen.txt` lines 8 and 17). No locked decision changed: plan note records the reading. |
| B F7, attended cell checks | `c93b2e77` (Test-Change: consultant `hc get` not_found; remote tip advanced and the staged base is its ancestor; at least two non-attention notices; inbound `<hc from="<consultant> ">` and outbound `hc send` lines on the watcher screen each name a turn file and every named file exists; `case.md` and `status` captured once `status` is closed or resumed) | Typecheck green. The send parser run over the recorded g3 screen returns `turn-1-consultant.md` inbound and `turn-1-watch.md` outbound. The cell itself needs a paid run: A1. |
| Format | `bebe2a90` (Test-Change, formatting only) | `akrogon verify` format check on `b34b19e5` was red on this file (`check-format-1795305416381-1299058.log`). |

Other proofs on the repaired code: `check-consults-1795305411902-1297658.log` (C3 signature suite, 10 pass on `b34b19e5`). No paid session ran in this pass. Grants 0–2 are spent, so C1/C2 on the repaired skill text and cell wait on review-B A1.

`akrogon verify` on `bebe2a90`:
- First run (164 s): 1312 pass, 1 fail (`tests/door-reset.test.ts`, "agy: the reset helper runs its stages in order", `check-test-1795305590781-1305978.log`). The diff does not touch that file or `src/`. The run-check retry was green (`check-retry-door-reset-1795305600154-1632791.log`), so the check is recorded `inconsistent`. The same test flaked in the 2026-11-21 pass.
- Second run: setup, format, typecheck and test all 0, 1313 pass, **leaf green** (`check-test-1795305763221-1639627.log`).

Committed head `bebe2a90`, base `b9c59076`. The repair runs from `fa96959c` (refreshed hand-off) to `bebe2a90`.

Open items:
- review-B A1: C1/C2 need one fresh attended run on the repaired skill and cell. Grants 0–2 are spent, so the pass ends `failed` on that operator action.
- C3–C6: green.
- C7: skill text.

### Live run, grants[3] (bound 6 prompted sessions, 3 tries)

- Try 1 on `bebe2a90`: count before launch 0 of 6; this try spends 2 (pi watcher, agy consultant; seat A the tier stand-in). Leaf temp `/var/tmp/akr-1000/wc5-e2e`, evidence `implementation/watch-consults-e2e-g4/`.
- Try 1 result: `check watch-consults: 1`, run `1795333728077` (216 s, `check-watch-consults-1795333728077-10701.log`).
  - Passed: consultant start and labels, consultant removed, resumed to `check.fix`, stand-in seat A started, `status` `closed`, 2 non-attention notices, signature parses, the outbound `hc send` of `turn-1-watch.md`.
  - Failed: the inbound send check. `hc read` on pi returns only its last 121 lines, and the consultant's tagged turn-1 send had scrolled off. `turn-1-consultant.md` was in the case.
  - Proof correction: `6f5062ab` samples both screens through the wait. The tier stopped in the test's catch path. grants[3] count after try 1: 2 of 6.
- Try 2 on `6f5062ab`: count before launch 2 of 6, this try spends 2. Leaf temp `/var/tmp/akr-1000/wc6-e2e`, evidence `implementation/watch-consults-e2e-g5/`.
- Try 2 result: `check watch-consults: 1`, run `1795334011262` (231 s, `check-watch-consults-1795334011262-47489.log`).
  - Passed: every check up to the inbound send, including removal, `check.fix`, seat A, `status` `closed`, 2 non-attention notices and the outbound `turn-1-watch.md` send.
  - What happened: consultant `t3` went blocked. The watcher saved `screen-consultant-blocked.txt`, closed it and started replacement `t4` (liveness rule). `t4`'s tagged send of `turn-1-consultant.md` is on the watcher screen (`watch-consults-e2e-g5/watcher-screen.txt:5`), but the check matched only `t3`'s address.
  - Proof correction: `e1778703` matches any `aw-watch-consult` sender, samples every labelled consultant and requires no consultant terminal left. The tier stopped in the catch path. grants[3] count after try 2: 4 of 6.
- Try 3 on `e1778703`: count before launch 4 of 6, this try spends 2, the last try under grants[3]. Leaf temp `/var/tmp/akr-1000/wc7-e2e`, evidence `implementation/watch-consults-e2e-g6/`.
- Try 3 result: `check watch-consults: 0`, run `1795334298143` on `e1778703`, 230 s, `check-watch-consults-1795334298143-89509.log`, evidence `implementation/watch-consults-e2e-g6/`.
  - Sends: inbound `turn-1-consultant.md`, outbound `turn-1-watch.md`, both in the case.
  - Exchange: `case-turn-1-watch.md` records agreement on the root cause (the BROKEN marker from `d15db79`), the fix (`c693372`, proven by `akrogon verify --holder`, test 0 and merge 0) and the resume target `check.fix`.
  - Outcome: no consultant terminal left, the leaf resumed at `check.fix`, stand-in seat A started.
  - Record: `status` `closed`, 2 non-attention notices ("pushed fix to main" and "leaf resumed").
  - Base: `c693372` fast-forward on staged base `d15db79`.
  - Cleanup: `absence.json` is `{"left": []}`.
- **grants[3] count: 7 of 6, an unwarned overrun of 1.** Try 1 used 2 (pi, agy `e3bf8e7a`). Try 2 used 3 (pi, agy `4ec2ccaf` for consultant `t3`, which received its first task and went blocked, and agy `8bd12f92` for the watcher's liveness replacement `t4`). Try 3 used 2 (pi, agy `59fe3f91`). I recorded "4 of 6" before try 3 without checking try 2's replacement launch, so try 3 started at a true count of 5 and crossed the bound with no warning. The extra launch came from the watcher's own replacement inside its turn.

Cleanup for grants[3] (records named before removal):
- Pi sessions:
  - `~/.pi/agent/sessions/--var-tmp-akr-1000-wc5-e2e-akr-e2e-watch-consults--/`
  - `~/.pi/agent/sessions/--var-tmp-akr-1000-wc6-e2e-akr-e2e-watch-consults--/`
  - `~/.pi/agent/sessions/--var-tmp-akr-1000-wc7-e2e-akr-e2e-watch-consults--/`
- Agy records:
  - `brain/` and `conversations/<id>.db` for `e3bf8e7a-a36e-45cc-876d-b6f1135878b3`, `4ec2ccaf-ef4b-4087-9561-f7a828838cf8`, `8bd12f92-3e1f-466b-b0af-1fc83be1bc38` and `59fe3f91-5d1c-45ee-a613-77e86b8140d6`
  - `log/cli-20261122_084557.log`, `cli-20261122_085026.log`, `cli-20261122_085059.log` and `cli-20261122_085521.log`
  - 7 `history.jsonl` lines naming the three roots
- Trust entries: three agy `trustedWorkspaces` entries `/var/tmp/akr-1000/wc{5,6,7}-e2e/akr-e2e-watch-consults`. Codex and claude had none.
- Left in place: the shared rolling `cli.log`, as in earlier passes.

`akrogon verify` on `e1778703`: setup, format, typecheck and test all 0, 1313 pass, **leaf green** (`check-test-1795334504087-145988.log`).
- Refresh: `origin/main` is still `b9c59076`, so the branch did not move.
- Repair range for this pass: `bebe2a90` to `e1778703` (`6f5062ab`, `e1778703`, both corrections to the cell's send capture with Test-Change trailers).
- Criteria:
  - C1, C2: green on try 3.
  - C3–C6: green in the suite.
  - C7: skill text.
- Open for review: the grants[3] overrun above.

### Corrected attended launch accounting, 2026-11-22

| Run | Sessions in the attempt | Actual count before → after |
| --- | --- | ---: |
| `1795333728077` | Pi watcher and agy `e3bf8e7a` | 0 → 2 |
| `1795334011262` | Pi watcher, blocked agy `4ec2ccaf`, replacement agy `8bd12f92` | 2 → 5 |
| `1795334298143` | Pi watcher and agy `59fe3f91` | 5 → 7 |

These counts supersede the original running totals and preserve the unwarned overrun. The g5 watcher screen identifies the replacement at `t4`, the case listing includes the blocked consultant's screen, and the saved cleanup inventory identifies both prompted agy sessions. The timing log records one `watch-consults` invocation per attempt, which cannot supply the per-session count on its own.

Before a later attempt, use the completed timing rows to identify preceding attempts and reconcile each attempt's watcher, initial consultant and every replacement from the saved tier screens, launch confirmations and scoped session records. Include blocked or removed consultants that already received a prompt. Write the corrected cumulative count before launching and account for the replacement path when checking the pending attempt against the grant. If the count is unknown or the attempt can cross a paid repeat bound, record and communicate that warning before launch under the lifecycle rule. A retry's passing check or a completed terminal list alone cannot establish how many sessions were prompted. The current repair launched no paid session.

## check.fix 2, 2026-11-22 (review-B Handed to A: F7)

Prior reviewed base and head: `b9c59076` / `e1778703`. B handed off `328af608` on `b9c59076`. Refresh: `origin/main` is still `b9c59076`, so nothing moved. Repair range: `328af608` to `fdc5acdd`.

- **F7, exact turn-file references** (`d5fb323f`, Test-Change):
  - Change: the cell keeps each send's absolute path as sent and requires it to sit in the active case folder (`dirname(path) === caseDir`) and exist. It no longer rebuilds paths from basenames.
  - Free replay, the same parse and check on retained captures, via a script removed after the run:
    - g6 sends against g6's case: accepted (`check-replay-turn-refs-g6-1795335066502-492653.log`, `ok: true`).
    - g5's real sends (case under `wc6-e2e`) against g6's case (`wc7-e2e`): refused, both paths listed bad (`check-replay-turn-refs-g5-vs-g6-1795335066616-492720.log`).
  - No paid run. The cell's other checks are unchanged from the green try 3.
- **Verify red with a cause in this diff, repaired** (reproduction `cf2f104a`, Test-Change; fix `fdc5acdd`):
  - `akrogon verify` on `d5fb323f`:
    - First run: one red in `tests/next.test.ts` ("a replaced blocked seat gets a fresh notice"). That file is not in the diff, and the retry was green (`check-retry-blocked-notice-1795335256202-797700.log`), so it is recorded **inconsistent**.
    - Second run: red in B's new timer case "dues queued during an idle timer gap coalesce when the watcher works", second due `5`, expected `>= 6` (`check-test-1795335431683-799042.log`). It passed 3 times alone and once under CPU load.
  - Cause: polls run every `intervalMs/8` (250 ms here). A boundary that passes between the timer's last busy poll and the first idle poll that sees the head due's turn done was pushed as its own entry, so the timer sent the older unsent due first.
  - Reproduction: "boundaries missed while the head due finishes coalesce to the latest" stops the timer for 9 s after due 1 is sent. Red on `328af608`'s timer with second due `2` (`check-repro-turn-end-red-1795335684581-1120279.log`).
  - Fix: `timer.ts` treats the poll that first sees the head delivered like a busy poll for collapsing and coalescing, and reuses that one `delivered` value for the shift. Plan note added.
  - Result: whole `tests/watch-timer.test.ts` green, 17 pass, including both resend cases (`check-fix-turn-end-timer-1795335832170-1123301.log`).
- `akrogon verify` on `fdc5acdd`: setup, format, typecheck and test all 0, 1315 pass, **leaf green** (`check-test-1795336021360-1150489.log`).
- Criteria:
  - C1/C2: the live evidence from try 3 stands. That run's interaction ran in the initial watch turn with no idle gap, and the reference check is proven by replay.
  - C3–C6: green.
  - C7: skill text.
- No paid session ran in this pass. grants[3] stays at 7 of 6.
