# Walk-through: watch-issues tick rules by hand (scratch repos)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/watch-issues-skill`
Scratch: `/tmp/watch-issues-wt.KAhLXA` (`home/` + `repo/`)
Leaf: `/home/ivan/Work/infra/akrogon/issues/open/watch-issues/watch-issues-skill`
Date: 2026-09-19. Real `akrogon` via `bun <worktree>/src/akrogon.ts`, real `observe.ts`, fake `herdr` below.
Env for every scenario: `HOME=<scratch>/home AKROGON_HOME=<scratch>/home FAKE_HERDR=<scratch>/home/herdr.json PATH=<scratch>/home/bin:$PATH HERDR_PANE_ID=''`.
Cron simulated by hand per fire; exact job prompt is `/watch-issues tick <root>` with `<root>=/tmp/watch-issues-wt.KAhLXA/repo`.

Judgment was by hand from `skills/watch-issues/SKILL.md`. No fire judgment scripted.
Fixture setup edited `issues/` before a fire only; watcher fires never edited `state.yaml`/worktrees/`issues/`.
All `issues/` writes below are labeled fixture vs watcher.

## 0. Scratch build + smoke

Fixture setup (before any fire):
- `home/config.yaml`: slots a/b harness `fake`, `harnesses: {fake: "fake --model {model} --effort {effort}"}`, `repos: {repo: <scratch>/repo}`.
- `home/bin/akrogon`: `#!/bin/sh\nexec bun <worktree>/src/akrogon.ts "$@"`.
- `home/bin/herdr`: extended copy of `tests/fake-herdr.ts` (appendix). Adds `screens` map, `agent list` from `db.panes`, `agent read/send-keys/wait`, relaxes `agent prompt` to accept plain form.
- `repo/`: `git init -b main`, commit `afa12da initial`, `git update-ref refs/remotes/origin/main HEAD`, `issues/config.yaml` with `checks: {test: bun test}`.
- `OBSERVE_*` unset; `observe.ts` run as `bun <skill>/scripts/observe.ts <root>` with `herdr`/`akrogon` found via `PATH` shims.

Smoke (real outputs, trimmed):
```
$ akrogon config
repo: repo   # plus full global+repo YAML, exit=0
$ bun <skill>/scripts/observe.ts <root>   # empty open
exit=0, empty output, no .calls file (herdr not called)
$ # fixture: issues/open/demo/smoke-leaf implement, then observe:
slug=smoke-leaf phase=implement attempts=A0,B0 blocked= A=-/- B=-/- notified=
.calls: ["agent","list"]
$ herdr agent list
{"result":{"type":"agent_list","agents":[]}}
$ akrogon next smoke-leaf   # exit=0, dispatched B
tab: w1:t1, pane A w1:p2 B w1:p3, prompted B session-4
.calls excerpt: tab create, pane split, agent start (B), agent prompt B --wait --until working --timeout 5000
$ herdr agent read w1:p3 --lines 80 -> {"result":{"text":"line1\nline2"}}
$ herdr agent send-keys w1:p3 esc -> {"result":{}}
$ herdr agent wait w1:p3 --timeout 10000 -> {"result":{"status":"idle"}}
$ herdr agent prompt w1:p3 "evidence; the brief wants X; next: Y" -> working
```
Smoke proves config, observe, dispatch, and all extended fake commands. Cleaned before scenario 1.

Cron note (smoke): single manual check, no job created.

## 1-3. Recovery bound: one leaf, three identical failures (criteria 1-3)

Slug `rec-leaf`. Fixture setup before fire1: hand-wrote `issues/open/demo/rec-leaf/state.yaml` implement, then real failure injection:

```
$ akrogon phase rec-leaf failed --reason "fix rounds exhausted" --slot B
moved failed
```
State after (relevant):
```
phase: failed
failure: {cause: blocked, phase: implement, slot: B, reason: fix rounds exhausted, delivery: shown}
```
Log:
```
{"slug":"rec-leaf","from":"implement","to":"failed","slot":"B",...}
```

Mismatch note (see Limitations): brief criteria 1-3 say `failure.cause=attempts`, but real `akrogon phase <slug> failed` always writes `cause: blocked` (src/phase.ts `requested === 'failed'` branch). Genuine `attempts` only comes from fix-rounds exhaustion or prompt-delivery failures. SKILL.md Judge ignores `cause` and keys only on whether `failure.reason` names a human prerequisite, so the recovery behavior below is exactly what criteria 1-3 intend; the `cause` label differs. Evidence kept verbatim as `blocked`.

### Fire1 (criterion 1: recover, seat dispatched)

Observe:
```
slug=rec-leaf phase=failed attempts=A0,B0 blocked= A=-/- B=-/- notified= failed=blocked@implement delivery=shown reason="fix rounds exhausted"
```
Rule applied: SKILL.md Judge “- Failed otherwise: re-read state first. Recover only when every required seat of failure.phase is idle or absent. … Otherwise run `akrogon phase <slug> <failure.phase>` then `akrogon next <slug>`.”
Reason “fix rounds exhausted” names no credential/permission/operator decision/external step, so otherwise. Required seat of implement is B, absent (no panes), so recover. Log filtered to repo+slug in order shows only `1: implement -> failed`, zero `failed -> P` recoveries, so 0 unproductive cycles.

Watcher commands (real outputs):
```
$ akrogon phase rec-leaf implement
moved implement
$ akrogon next rec-leaf
exit=0
# state: phase implement, tab w1:t1, pane A w1:p2 B w1:p3, prompted B session-4
```
Log after: `1: implement->failed, 2: failed->implement`.

.calls excerpt (full fire1 in calls-scen1-3.txt lines 1-13):
```
["notification","show","repo/rec-leaf failed","--body","blocked: fix rounds exhausted","--sound","request"]
["agent","list"]
["pane","list"]
["tab","list"]
["pane","list"]
["workspace","list"]
["tab","create","--label","rec-leaf",...]
["pane","list"]
["pane","split","w1:p2",...]
["pane","get","w1:p3"]
["agent","start","akrogon-322c84c51539aa7a2310a7a7","--kind","fake","--pane","w1:p3",...]
["pane","get","w1:p3"]
["agent","prompt","w1:p3","implement-issue rec-leaf slot=B phase=implement leaf=.../rec-leaf","--wait","--until","working","--timeout","5000"]
["pane","get","w1:p3"]
```
First notification is fixture fail’s announceFailed, not watcher. Watcher’s recover is phase (no herdr, no tab yet) + next (tab/panes/start/prompt B).

Cron (tick): no create (tick never creates); stop rule not met (leaf not human-blocked-shown, open non-empty), so no CronList/CronDelete.

### Fire2 (criterion 2: same leaf failing again recovered second time)

Fixture setup before fire2: set B idle in fake DB (agent finished), then real fail:
```
$ akrogon phase rec-leaf failed --reason "fix rounds exhausted" --slot B
moved failed
```
Observe:
```
slug=rec-leaf phase=failed attempts=A0,B0 blocked= A=w1:p2/unknown B=w1:p3/idle notified= failed=blocked@implement delivery=shown reason="fix rounds exhausted"
```
Rule: same “Failed otherwise”. Required B idle passes (A unknown irrelevant, not required). Log: `1 implement->failed, 2 failed->implement, 3 implement->failed`. One recovery (r2) whose next is P->failed, so 1 unproductive cycle, fewer than 2, so recover.

Watcher:
```
$ akrogon phase rec-leaf implement
moved implement
$ akrogon next rec-leaf
exit=0
```
.calls new since observe (10 lines):
```
["tab","rename","w1:t1","rec-leaf"]
["pane","list"]
["pane","list"]
["tab","list"]
["workspace","list"]
["pane","list"]
["pane","get","w1:p3"]
["pane","get","w1:p3"]
["agent","prompt","w1:p3","implement-issue rec-leaf slot=B phase=implement leaf=...", "--wait","--until","working","--timeout","5000"]
["pane","get","w1:p3"]
```
Tab rename is recovery’s rename back to slug; prompt is B-only re-dispatch (no agent start, agent already exists).

Cron: same as fire1, no action.

### Fire3 (criterion 3: third identical failure notify-only, no phase)

Fixture: idle B, then:
```
$ akrogon phase rec-leaf failed --reason "fix rounds exhausted" --slot B
moved failed
```
Observe:
```
slug=rec-leaf phase=failed attempts=A0,B0 blocked= A=w1:p2/unknown B=w1:p3/idle notified= failed=blocked@implement delivery=shown reason="fix rounds exhausted"
```
Rule: “Failed otherwise … a `failed -> P` record whose next record for that slug is `P -> failed` is one unproductive cycle; two consecutive cycles end recovery. … When the two most recent recoveries were both unproductive, notify and leave the leaf.”
Log: `1 implement->failed, 2 failed->implement, 3 implement->failed, 4 failed->implement, 5 implement->failed`. r2 and r4 both unproductive, two most recent, so notify-only.

Watcher:
```
$ herdr notification show "repo/rec-leaf needs you" --body "fix rounds exhausted (2 unproductive cycles, recovery bound reached)" --sound request
{"result":{"shown":true,"reason":"shown"}}
```
Verified no phase: log lines before=5 after=5, state sha unchanged. .calls new (1 line):
```
["notification","show","repo/rec-leaf needs you","--body","fix rounds exhausted (2 unproductive cycles, recovery bound reached)","--sound","request"]
```
No tab rename, no prompt, no log append.

Cron: tick, no create; stop not met (failed otherwise, not human-prerequisite-shown), no delete.

Saved: /tmp/walk-evidence/calls-scen1-3.txt (33 lines), log-scen1-3.jsonl (5 lines). Reset: removed rec-leaf leaf+worktree/branch, reset herdr DB.

## 1b. Genuine failed-attempts leaf recovered (literal attempts)

Slug `att-leaf`. Fresh scratch `/tmp/watch-issues-1b.3ZGi4T` (`home/` + `repo/`), same env conventions as section 0: `HOME=<scratch>/home AKROGON_HOME=<scratch>/home FAKE_HERDR=<scratch>/home/herdr.json PATH=<scratch>/home/bin:$PATH HERDR_PANE_ID=''`, same `home/config.yaml` (slots a/b harness fake, repos repo), same `home/bin/akrogon` shim, same extended fake herdr, `repo/` git init + `issues/config.yaml` checks test. Root=`/tmp/watch-issues-1b.3ZGi4T/repo`. No other leaves.

Fixture setup (before fire): hand-wrote `issues/open/demo/att-leaf/state.yaml` implement, then real dispatch + committed change (scenario 4 pattern):
```
$ akrogon next att-leaf
exit=0  # tab w1:t1, pane A w1:p2 B w1:p3, prompted B session-4
$ # in issues/worktrees/att-leaf
$ echo "progress change" > feature.txt && git add feature.txt && git commit -m "progress: add feature"
[att-leaf 37e7ebf] progress: add feature
$ git diff --name-only origin/main...HEAD
feature.txt
```
Then fixtured (disclosed) `state.yaml`: `phase: check.review`, `fix_rounds: 3`, `done: []`, `verdict: {}` (kept tab/worktree/pane/prompted). Repo default `fix_rounds` is 3, so cap triggers. Idled both panes in fake DB (A unknown->idle, B working->idle).

Genuine failure via real command (correction disclosed: brief said requested `check.review`, but from `check.review` legal moves are `merge, check.fix, failed`, so requested is `check.fix`; destination still caps via verdict fix + fix_rounds>=3):
```
$ akrogon phase att-leaf check.fix --slot A --verdict fix
moved failed
```
State after:
```
failure:
  cause: attempts
  phase: check.review
  slot: A
  reason: fix rounds exhausted
  delivery: shown
```
Log (1 line):
```
{"slug":"att-leaf","from":"check.review","to":"failed","slot":"A","fix_rounds":3,"verdict":{"A":"fix"},"diff":" 1 file changed, 1 insertion(+)"}
```
.calls fixture fail (notification + rename + logMove pane list):
```
["notification","show","repo/att-leaf failed","--body","attempts: fix rounds exhausted","--sound","request"]
["tab","rename","w1:t1","att-leaf failed"]
["pane","list"]
```
Tab label now `att-leaf failed`.

Fire (criterion 1 shape, literal attempts):
Observe:
```
slug=att-leaf phase=failed attempts=A0,B0 blocked= A=w1:p2/idle B=w1:p3/idle notified= failed=attempts@check.review delivery=shown reason="fix rounds exhausted"
```
Rule: SKILL.md Judge “Failed otherwise: re-read state first. Recover only when every required seat of failure.phase is idle or absent. … Otherwise run `akrogon phase <slug> <failure.phase>` then `akrogon next <slug>`.” Re-read shows same attempts record. Reason names no human prerequisite, so otherwise. Required of check.review with fix_rounds 3 is A only, A idle passes (B idle quiescent, not required). Log filtered repo+slug: `1 check.review->failed`, zero `failed->P` recoveries, so 0 unproductive cycles, fewer than 2, so recover.

Watcher:
```
$ akrogon phase att-leaf check.review
moved check.review
$ akrogon next att-leaf
exit=0
# state: phase check.review, fix_rounds 0 (reset on failed->P), prompted A session-5 + B session-4, tab back to att-leaf
```
.calls new for recover (15 lines):
```
["tab","rename","w1:t1","att-leaf"]
["pane","list"]
["pane","list"]
["tab","list"]
["workspace","list"]
["pane","list"]
["pane","get","w1:p2"]
["agent","start","akrogon-e923617775648a9d896e38fd","--kind","fake","--pane","w1:p2",...]
["pane","get","w1:p2"]
["agent","prompt","w1:p2","check-issue att-leaf slot=A phase=check.review leaf=.../att-leaf","--wait","--until","working","--timeout","5000"]
["pane","get","w1:p2"]
["pane","get","w1:p3"]
["pane","get","w1:p3"]
["agent","prompt","w1:p3","check-issue att-leaf slot=B phase=check.review leaf=.../att-leaf","--wait","--until","working","--timeout","5000"]
["pane","get","w1:p3"]
```
First rename is phase recovery; next dispatches A (start, session-5) + B (re-prompt session-4) because fix_rounds reset to 0 makes check.review require A+B. DB prompts: `[B impl, A review, B review]`.

Cron (tick): no create; stop not met (failed otherwise, open non-empty), no delete.

Saved: scratch kept at `/tmp/watch-issues-1b.3ZGi4T`; .calls 32 lines total (1 line is a manual `herdr agent list` probe between observe and recover, disclosed).

## 4. Progress resets count (criterion 4)

Slug `prog-leaf`. Isolated by slug filter; rec-leaf log kept but ignored.

Fixture fail1:
```
$ akrogon phase prog-leaf failed --reason "fix rounds exhausted" --slot B
moved failed
slug=prog-leaf phase=failed attempts=A0,B0 blocked= A=-/- B=-/- notified= failed=blocked@implement delivery=shown reason="fix rounds exhausted"
```
Fire1 rule “Failed otherwise”, 0 cycles, recover:
```
$ akrogon phase prog-leaf implement
moved implement
$ akrogon next prog-leaf
exit=0  # tab w1:t1, B session-4 working
```
Progress (fixture/agent real move before next fire, disclosed): committed change in worktree:
```
$ # in issues/worktrees/prog-leaf
$ echo "progress change" > feature.txt && git add feature.txt && git commit -m "progress: add feature"
[prog-leaf c5d52be] progress: add feature
$ git diff --name-only origin/main...HEAD
feature.txt
$ akrogon phase prog-leaf check.review --slot B
moved check.review
```
Log: `1 implement->failed, 2 failed->implement, 3 implement->check.review (diff 1 file)`.

Fixture fail2: idled both panes in fake DB, then:
```
$ akrogon phase prog-leaf failed --reason "fix rounds exhausted" --slot A
moved failed
```
Observe:
```
slug=prog-leaf phase=failed attempts=A0,B0 blocked= A=w1:p2/idle B=w1:p3/idle notified= failed=blocked@check.review delivery=shown reason="fix rounds exhausted"
```
Rule: “Failed otherwise”. Required seats of check.review (fix_rounds 0) are A+B, both idle, so eligible. Log: `1 implement->failed, 2 failed->implement, 3 implement->check.review, 4 check.review->failed`. r2’s next is implement->check.review, not implement->failed, so 0 unproductive cycles, fewer than 2, so recover again rather than notifying.

Watcher:
```
$ akrogon phase prog-leaf check.review
moved check.review
$ akrogon next prog-leaf
exit=0  # prompted A session-5 (needed start) + B session-4
```
Log adds `5 failed->check.review`.

.calls new for fire2 recover (15 lines):
```
["tab","rename","w1:t1","prog-leaf"]
["pane","list"]
["pane","list"]
["tab","list"]
["workspace","list"]
["pane","list"]
["pane","get","w1:p2"]
["agent","start","akrogon-e923617775648a9d896e38fd","--kind","fake","--pane","w1:p2",...]
["pane","get","w1:p2"]
["agent","prompt","w1:p2","check-issue prog-leaf slot=A phase=check.review leaf=...", "--wait","--until","working","--timeout","5000"]
["pane","get","w1:p2"]
["pane","get","w1:p3"]
["pane","get","w1:p3"]
["agent","prompt","w1:p3","check-issue prog-leaf slot=B phase=check.review leaf=...", "--wait","--until","working","--timeout","5000"]
["pane","get","w1:p3"]
```
Cron: tick, no create/delete.

Saved calls-scen4.txt (34 lines). Reset leaf+worktree, herdr DB.

## 5. Human-prerequisite never recovered (criterion 5)

Fixture setup (hand-written, disclosed): `issues/open/demo/human-leaf/state.yaml`:
```
slug: human-leaf
phase: failed
repo: repo
failure: {cause: blocked, phase: implement, slot: B, reason: "needs operator decision: approve production credentials"}
# no delivery field
```
Observe:
```
slug=human-leaf phase=failed attempts=A0,B0 blocked= A=-/- B=-/- notified= failed=blocked@implement delivery=- reason="needs operator decision: approve production credentials"
```
Rule: SKILL.md Judge “- Failed on a human prerequisite, or record is unknown: `failure.reason` names a credential, permission, operator decision or external step, or the line ends with `failed=unknown`. Never recover. When `failure.delivery` is not `shown` and this fire has not yet shown it, run `herdr notification show \"<repo>/<slug> needs you\" --body \"<reason>\" --sound request`.”
Reason names operator decision + credential, delivery absent, so notify, never phase/next.

Watcher:
```
$ herdr notification show "repo/human-leaf needs you" --body "needs operator decision: approve production credentials" --sound request
{"result":{"shown":true,"reason":"shown"}}
```
Verified: log 10->10, state sha 57677… unchanged. Full .calls (2 lines):
```
["agent","list"]
["notification","show","repo/human-leaf needs you","--body","needs operator decision: approve production credentials","--sound","request"]
```
No phase/next mutation.

Cron: tick would check stop after judging. Single human-blocked leaf with notice shown this fire counts as shown for stop, but this walk-through isolates per-scenario; no CronList/CronDelete run here (stop fully exercised in scenario 8).

Saved calls-scen5.txt. Reset leaf, herdr DB.

## 6. Waiting dispatches idle seat only (criterion 6)

Slug `review-leaf`. Fixture via real moves:
```
$ akrogon next review-leaf  # implement dispatch, B working, A unknown
$ # commit feature.txt in worktree
$ akrogon phase review-leaf check.review --slot B
moved check.review
$ akrogon next review-leaf  # fixture setup to get A working; B working skipped, A started+prompted
# herdr: A fake/working, B fake/working, prompts: B(impl), A(review)
$ # fixture: set B idle, keep A working
```
Observe (fire):
```
slug=review-leaf phase=check.review attempts=A0,B0 blocked= A=w1:p2/working+0h00m B=w1:p3/idle+0h00m notified=
```
Rule: SKILL.md Judge “- Waiting: phase is not merged or failed and at least one required unfinished seat is idle or absent: run `akrogon next <slug>`; the command guards the other seats.”
check.review requires A+B, B idle, so run next.

Watcher:
```
$ akrogon next review-leaf
exit=0
# state prompted A session-5 (kept) + B session-4 (new)
```
.calls new (10 lines, no prompt to A):
```
["pane","list"]
["pane","list"]
["tab","list"]
["workspace","list"]
["pane","list"]
["pane","get","w1:p2"]
["pane","get","w1:p3"]
["pane","get","w1:p3"]
["agent","prompt","w1:p3","check-issue review-leaf slot=B phase=check.review leaf=...", "--wait","--until","working","--timeout","5000"]
["pane","get","w1:p3"]
```
DB prompts: `[B impl, A review, B review]` — exactly one new prompt to B’s pane, none to A’s. A guarded by busy check.

Cron: tick, no action.

Saved calls-scen6.txt (35 lines). Reset leaf+worktree, herdr DB.

## 7. Looping seat stop-and-resteer once, then notify (criterion 7)

Slug `loop-leaf`, implement (requires B). Fixture: real dispatch then looping screen:
```
$ akrogon next loop-leaf  # B working session-4
$ # fixture: screens[w1:p3] = "$ bun test\nFAIL src/foo.test.ts: expected 1 got 2\n" x3
```
Fire1 observe:
```
slug=loop-leaf phase=implement attempts=A0,B0 blocked= A=w1:p2/unknown B=w1:p3/working+0h00m notified=
```
Evidence read (Busy rule: “run `herdr agent read <pane> --lines 80` for every busy seat” — B is required busy seat; A not required, no agent, no read):
```
$ herdr agent read w1:p3 --lines 80
{"result":{"text":"$ bun test\nFAIL src/foo.test.ts: expected 1 got 2\n$ bun test\nFAIL src/foo.test.ts: expected 1 got 2\n$ bun test\nFAIL src/foo.test.ts: expected 1 got 2\n"}}
```
Rule: SKILL.md Judge “- Busy: … Act only on loop evidence (same command or edit three or more times with the same result, …). … Stop and resteer once per seat per watch: run `herdr agent send-keys <pane> esc`, then `herdr agent wait <pane> --timeout 10000`, then read the pane to confirm an idle seat with empty input and the same session, else notify instead of prompting. Then send one corrective prompt with `herdr agent prompt <pane> \"<evidence>; the brief wants <target>; next: <step>\"` … A mid-turn steer without the stop may be tried first only when the pane shows tools completing.”
Loop evidence met (bun test 3x same FAIL), tools not completing new work, so full stop-and-resteer.

Watcher resteer (real outputs):
```
$ herdr agent send-keys w1:p3 esc
{"result":{}}
$ herdr agent wait w1:p3 --timeout 10000
{"result":{"status":"idle"}}
$ herdr agent read w1:p3 --lines 80
{"result":{"text":"$ bun test\nFAIL ...\n$ bun test\nFAIL ...\n$ bun test\nFAIL ...\n"}}
# wait shows idle, read shows same transcript with no new input, session still session-4 (see prompt result), so prompt
$ herdr agent prompt w1:p3 "loop: bun test 3x same FAIL src/foo.test.ts expected 1 got 2; the brief wants loop-leaf implemented; next: inspect failure and edit code, do not rerun same command"
{"result":{"agent":{"pane_id":"w1:p3","agent_status":"working","agent_session":{"kind":"id","value":"session-4"}}}}
```
.calls new since before resteer (exactly 4, in order):
```
["agent","send-keys","w1:p3","esc"]
["agent","wait","w1:p3","--timeout","10000"]
["agent","read","w1:p3","--lines","80"]
["agent","prompt","w1:p3","loop: bun test 3x same FAIL src/foo.test.ts expected 1 got 2; the brief wants loop-leaf implemented; next: inspect failure and edit code, do not rerun same command"]
```
Prompt names evidence, brief target, next step. Session same (session-4).

Fire2 (screen still looping, disclosed: screens unchanged):
```
slug=loop-leaf phase=implement attempts=A0,B0 blocked= A=w1:p2/unknown B=w1:p3/working+0h00m notified=
$ herdr agent read w1:p3 --lines 80
{"result":{"text":"$ bun test\nFAIL ... x3"}}
```
Rule: same Busy bullet “The same seat still looping on the next fire is notified with the evidence, never stopped a second time.”
Watcher:
```
$ herdr notification show "repo/loop-leaf needs you" --body "seat B still looping: bun test 3x same FAIL src/foo.test.ts (already stopped once, not stopping again)" --sound request
{"result":{"shown":true,"reason":"shown"}}
```
.calls new (1 line, no esc):
```
["notification","show","repo/loop-leaf needs you",...]
```
Full-file esc count = 1 (`grep -c send-keys` = 1).

Cron: tick, no action (busy leaf remains).

Saved calls-scen7.txt (22 lines). Reset leaf+worktree, herdr DB.

## 8. Empty open reaches stop (criterion 8)

Fixture: `issues/open/` empty (removed demo leaves, disclosed). No other leaves.
Observe:
```
$ bun <skill>/scripts/observe.ts <root>
exit=0, empty output (0 bytes verified)
```
No `.calls` file — observe returned before herdr call, as implemented.
Rule: SKILL.md Stop “After judging, when the observe script prints no leaf and the inventory was readable, or every remaining leaf is failed on a human prerequisite with shown evidence, use CronList to find jobs with the exact prompt `/watch-issues tick <root>`: one match is deleted with CronDelete and reported; several matches are reported and none are deleted.”
Inventory readable (empty dir, exit 0), so stop triggers.

Simulated cron (no real Cron tools in this env; Claude Code only):
- Would run CronList for exact prompt `/watch-issues tick /tmp/watch-issues-wt.KAhLXA/repo`.
- Walk-through simulates one match (the watch job) → would run CronDelete on that id and report “stopped watch, deleted 1 job”.
- Tick itself never creates; no CronCreate.

This satisfies “observe prints nothing, and notes simulated CronList + CronDelete of exact-prompt job.”

## Verification

In `skills/watch-issues` (no source changed):
```
$ bun run test
20 pass, 0 fail
$ bun run typecheck
exit=0
```

## Known limitations / mismatches

- F1: Criteria 1-3 say `failure.cause=attempts`, but ordered step 2’s real command `akrogon phase <slug> failed --reason "fix rounds exhausted" --slot B` always writes `cause: blocked` with `delivery: shown` (announceFailed notification + tab rename). Source: `src/phase.ts` transition `if (requested === 'failed') … cause: 'blocked'`. Literal `attempts` evidence now exists in section 1b: `check.review` + `fix_rounds: 3` + real `akrogon phase att-leaf check.fix --slot A --verdict fix` caps to `failed` with `cause: attempts, phase: check.review, reason: fix rounds exhausted` (requested must be `check.fix`, not `check.review`, from `check.review`), recovered via the same Failed-otherwise rule. Scenarios 1-3 keep verbatim `blocked@implement` outputs per step 2; SKILL.md Judge never checks `cause`, only whether reason names human prerequisite.
- No other SKILL rule failed as written. Busy second-fire notification text is not templated in SKILL; used `repo/<slug> needs you` pattern consistent with Failed rules.

## Appendix: fake herdr source (self-contained)

Scratch path was `<scratch>/home/bin/herdr`, import rewired to absolute worktree `src/shell`. DB adds `screens`.

```ts
#!/usr/bin/env bun
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { z } from 'zod';
import { paneSchema, tabSchema, workspaceSchema, type Pane, type Tab } from '/home/ivan/Work/infra/akrogon/issues/worktrees/watch-issues-skill/src/shell';

const scriptEntrySchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  stderr: z.string().optional(),
  append: z.string().optional(),
});
const databaseSchema = z.object({
  panes: z.array(paneSchema),
  tabs: z.array(tabSchema),
  workspaces: z.array(workspaceSchema).default([
    { workspace_id: 'w1', label: 'repo' },
    { workspace_id: 'w3', label: 'other' },
  ]),
  serial: z.number(),
  paneListStdout: z.string().optional(),
  failPrompts: z.boolean().default(false),
  blockOnStart: z.boolean().default(false),
  failSplitOnce: z.boolean().default(false),
  failNotification: z.boolean().default(false),
  failNotificationOnce: z.boolean().default(false),
  failRename: z.boolean().default(false),
  prompts: z.array(z.object({ pane: z.string(), text: z.string() })).default([]),
  starts: z.array(z.array(z.string())).default([]),
  startScript: z.array(scriptEntrySchema).default([]),
  promptScript: z.array(scriptEntrySchema).default([]),
  screens: z.record(z.string(), z.string()).default({}),
});
export type Database = z.infer<typeof databaseSchema>;
const path: string = z.string().parse(process.env.FAKE_HERDR);
const db: Database = databaseSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
const args: string[] = process.argv.slice(2);
appendFileSync(path + '.calls', JSON.stringify(args) + '\n');
function save(): void {
  writeFileSync(path, JSON.stringify(db));
}
function result(value: object): never {
  save();
  console.log(JSON.stringify({ result: value }));
  process.exit(0);
}
function failure(code: string): never {
  save();
  console.error(JSON.stringify({ error: { code, message: 'fixture failure' } }));
  process.exit(1);
}
function scriptedFailure(entry: z.infer<typeof scriptEntrySchema> | undefined): void {
  if (entry?.stderr !== undefined) {
    save();
    console.error(entry.stderr);
    process.exit(1);
  }
  if (entry?.code !== undefined) {
    save();
    console.error(JSON.stringify({ error: { code: entry.code, message: entry.message ?? '' } }));
    process.exit(1);
  }
}
function flag(name: string): string {
  const index: number = args.indexOf(name);
  if (index === -1) throw new Error(`Missing flag ${name}`);
  return args[index + 1];
}
function pane(id: string): Pane {
  const found: Pane | undefined = db.panes.find((p) => p.pane_id === id);
  if (found === undefined) throw new Error(`Missing pane ${id}`);
  return found;
}
if (args[0] === 'notification' && args[1] === 'show') {
  z.string().min(1).parse(args[2]);
  if (args.includes('--body') || args.includes('--sound')) {
    flag('--body');
    flag('--sound');
  }
  if (db.failNotificationOnce) {
    db.failNotificationOnce = false;
    failure('timeout');
  }
  if (db.failNotification) failure('fixture_notification_failed');
  result({ shown: true, reason: 'shown' });
}
if (args[0] === 'integration' && args[1] === 'install') {
  z.tuple([z.literal('integration'), z.literal('install'), z.string().min(1)]).parse(args);
  result({});
}
if (args[0] === 'plugin' && args[1] === 'link') {
  z.tuple([z.literal('plugin'), z.literal('link'), z.string().min(1)]).parse(args);
  result({});
}
if (args[0] === 'pane' && args[1] === 'list') {
  if (db.paneListStdout !== undefined) {
    console.log(db.paneListStdout);
    process.exit(0);
  }
  result({ panes: db.panes });
}
if (args[0] === 'pane' && args[1] === 'get') result({ pane: pane(args[2]) });
if (args[0] === 'tab' && args[1] === 'list') result({ tabs: db.tabs });
if (args[0] === 'workspace' && args[1] === 'list') result({ workspaces: db.workspaces });
if (args[0] === 'tab' && args[1] === 'create') {
  const workspace: string = args.includes('--workspace') ? flag('--workspace') : 'w1';
  const tab: Tab = { tab_id: `${workspace}:t${++db.serial}`, label: flag('--label') };
  const root: Pane = {
    pane_id: `w1:p${++db.serial}`,
    tab_id: tab.tab_id,
    cwd: flag('--cwd'),
    agent: null,
    agent_status: 'unknown',
  };
  db.tabs.push(tab);
  db.panes.push(root);
  result({ tab, root_pane: root });
}
if (args[0] === 'pane' && args[1] === 'split') {
  if (args.includes('--workspace')) failure('unknown option: --workspace');
  if (db.failSplitOnce) {
    db.failSplitOnce = false;
    failure('fixture_split_failed');
  }
  const sibling: Pane = {
    pane_id: `w1:p${++db.serial}`,
    tab_id: pane(args[2]).tab_id,
    cwd: flag('--cwd'),
    agent: null,
    agent_status: 'unknown',
  };
  db.panes.push(sibling);
  result({ pane: sibling });
}
if (args[0] === 'agent' && args[1] === 'start') {
  const target: Pane = pane(flag('--pane'));
  if (!/^[a-z][a-z0-9_-]{0,31}$/.test(args[2])) failure('invalid_agent_name');
  if (
    db.starts.some(
      (start) =>
        start[2] === args[2] &&
        db.panes.some((p) => p.pane_id === start[start.indexOf('--pane') + 1] && p.agent !== null),
    )
  )
    failure('agent_name_taken');
  scriptedFailure(db.startScript.shift());
  target.agent = flag('--kind');
  target.agent_status = db.blockOnStart ? 'blocked' : 'idle';
  target.agent_session = { kind: 'id', value: `session-${++db.serial}` };
  db.starts.push(args);
  result({ agent: target });
}
if (args[0] === 'agent' && args[1] === 'list') {
  result({ type: 'agent_list', agents: db.panes.map((p) => ({ pane_id: p.pane_id, agent_status: p.agent_status })) });
}
if (args[0] === 'agent' && args[1] === 'read') {
  const target: Pane = pane(args[2]);
  const text: string = db.screens[target.pane_id] ?? '';
  result({ text });
}
if (args[0] === 'agent' && args[1] === 'send-keys') {
  const target: Pane = pane(args[2]);
  target.agent_status = 'idle';
  result({});
}
if (args[0] === 'agent' && args[1] === 'wait') {
  const target: Pane = pane(args[2]);
  result({ status: target.agent_status });
}
if (args[0] === 'agent' && args[1] === 'prompt') {
  const target: Pane = pane(args[2]);
  if (!['idle', 'done'].includes(target.agent_status)) throw new Error('Prompt sent to non-idle fixture');
  const strict: boolean = args.includes('--wait') || args.includes('--until') || args.includes('--timeout');
  if (strict && (flag('--until') !== 'working' || !args.includes('--wait') || flag('--timeout') !== '5000'))
    throw new Error('Wrong prompt wait contract');
  const scripted = db.promptScript.shift();
  if (scripted?.append !== undefined && target.agent_session?.kind === 'path') {
    appendFileSync(target.agent_session.value, scripted.append);
  }
  scriptedFailure(scripted);
  db.prompts.push({ pane: target.pane_id, text: args[3] });
  if (db.failPrompts) failure('agent_prompt_stalled');
  target.agent_status = 'working';
  result({ agent: target });
}
if (args[0] === 'tab' && args[1] === 'close') {
  db.panes = db.panes.filter((p) => p.tab_id !== args[2]);
  db.tabs = db.tabs.filter((t) => t.tab_id !== args[2]);
  result({});
}
if (args[0] === 'tab' && args[1] === 'rename') {
  const found: Tab | undefined = db.tabs.find((t) => t.tab_id === args[2]);
  if (found === undefined) failure('tab_not_found');
  if (db.failRename) failure('timeout');
  found.label = args[3];
  result({ tab: found });
}
throw new Error(`Unexpected fixture invocation: ${JSON.stringify(args)}`);

```
