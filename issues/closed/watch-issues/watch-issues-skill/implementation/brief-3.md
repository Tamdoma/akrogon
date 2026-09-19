# Brief 3: recorded walk-through against scratch repos

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/watch-issues-skill`
Leaf folder (artifact destination): `/home/ivan/Work/infra/akrogon/issues/open/watch-issues/watch-issues-skill`

## 1. Goal

Produce the end-to-end evidence artifact for done-criterion 5: `implementation/walkthrough.md` in the leaf folder, recording a real execution of the SKILL.md tick rules by hand against a temporary registered repo, real `akrogon` (`bun <worktree>/src/akrogon.ts`), real `observe.ts`, and a fake `herdr`. Cron is simulated by invoking the tick rules by hand and noting the CronList/CronCreate/CronDelete step that would run.

## 2. Acceptance criteria

The artifact records, with pasted command outputs and fake-herdr call logs:

1. A failed-attempts leaf (`failure.cause=attempts`, non-human reason such as `fix rounds exhausted`) is recovered: `akrogon phase <slug> <failure.phase>` then `akrogon next <slug>`, seat dispatched.
2. The same leaf failing again from the same phase is recovered a second time.
3. A third identical failure is notify-only: `notification show` called, no `phase` call.
4. Progress between two failures resets the count: after a recovery, a real move to a later phase (e.g. `implement -> check.review`) then a failure leaves fewer than two consecutive unproductive cycles, so the watcher recovers again rather than notifying.
5. A failed-blocked leaf whose reason names a human prerequisite is never recovered: notification sent when `failure.delivery` is absent, no `phase`/`next` mutation for it.
6. A leaf at `check.review` with seat A working and seat B idle dispatches B only (fake records `agent prompt` to B's pane, none to A's).
7. A looping seat (fake `agent read` transcript showing the same command 3+ times with the same result) yields exactly `send-keys esc` → `agent wait --timeout 10000` → `agent read` → one corrective `agent prompt`; on the next fire with the loop still showing, a notification and no second `esc`.
8. An empty `issues/open` reaches the stop rule: observe prints nothing, and the artifact notes the simulated CronList + CronDelete of the exact-prompt job.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/watch-issues/SKILL.md` — the procedure under test; follow its Judge rules literally.
- `skills/watch-issues/scripts/observe.ts` — run it with `OBSERVE_HERDR`/`OBSERVE_AKROGON` unset against the scratch repo (real akrogon via a PATH shim or `OBSERVE_AKROGON="bun <worktree>/src/akrogon.ts"` handled per its implementation — check how the script parses the override; if it takes a single binary path, write a one-line `akrogon` shim script into the scratch `bin/`).
- `tests/helpers.ts` (`fixture`, `fakeHerdr`) and `tests/fake-herdr.ts` — the fixture pattern to copy: scratch `AKROGON_HOME` config.yaml, git repo with `refs/remotes/origin/main`, `issues/config.yaml`, fake herdr db + `.calls` log.
- `src/next.ts` — which herdr commands `next` issues (`pane list`, `tab list`, `workspace list`, `tab create`, `pane split`, `agent start`, `agent prompt --wait --until working --timeout 5000`, `pane get`, `notification show`, `tab rename`).
- `src/phase.ts` — `announceFailed` calls (`notification show`, `tab rename`); `transition` guards (`requireClean`, `requireNoIssueFiles`, `requireNonEmpty` for `check.review`).
- `src/log.ts` — the `issues/log.jsonl` records your moves produce.

## 4. Change list and needed interfaces

No worktree source changes. You create:

- A scratch area under `$(mktemp -d /tmp/watch-issues-wt.XXXXXX)`: `home/config.yaml` (slots a/b harness `fake`, `harnesses: {fake: "fake --model {model} --effort {effort}"}`, `repos: {repo: <scratch-root>}`), `home/bin/herdr` (fake), `home/bin/akrogon` (shim: `#!/bin/sh\nexec bun <worktree>/src/akrogon.ts "$@"`), `repo/` (git init, initial commit, `git update-ref refs/remotes/origin/main HEAD`, `issues/config.yaml`, `issues/open/`).
- The fake `herdr`: copy `tests/fake-herdr.ts` and extend it in the scratch copy with the commands the watcher needs but the test fake lacks: `agent list` → `{result:{type:"agent_list",agents:[...]}}` built from `db.panes`; `agent read <pane> [--lines N]` → `{result:{text:<contents of db.screens[pane]>}}` where `db.screens` is a new map you add; `agent send-keys <pane> esc` → set that pane's `agent_status` to `idle`, `{result:{}}`; `agent wait <pane> [--until S] [--timeout N]` → `{result:{status: pane.agent_status}}` immediately. Relax the fake's `agent prompt` contract so a plain `herdr agent prompt <pane> "<text>"` (no flags) is accepted and recorded in `db.prompts`, in addition to the existing strict form. Keep the `.calls` append log.
- Leaf fixtures: hand-written `state.yaml` files (fixture setup may write state directly; only the watcher must never). For scenario 4, give the leaf a real worktree with one committed file change so `phase <slug> check.review` passes `requireNonEmpty`; create it via `akrogon next` dispatch or `git worktree add` + `state.worktree`.
- The artifact `implementation/walkthrough.md` in the leaf folder: per scenario, the fixture setup, the observe output line, the rule applied (quote the SKILL.md rule name), the commands run with pasted output, the fake `.calls` excerpt proving what happened, and the simulated cron step where relevant. Embed the full fake-herdr source in an appendix so the artifact is self-contained after the tmpdir is gone.

Run everything with `HOME=<scratch-home> AKROGON_HOME=<scratch-home> FAKE_HERDR=<scratch-home>/herdr.json PATH=<scratch-home>/bin:$PATH`. Never touch the live `~/.config/akrogon`, the live issues tree, or a real herdr socket.

## 5. Do-not, reasons and exceptions

- Do not modify `skills/watch-issues/`, `src/`, `tests/`, or any worktree file — this unit produces evidence only; a defect found is a mismatch return with reproduction, not a fix.
- Do not run the watcher rules against the live repo or real herdr — scratch only; no exception.
- Do not write inside the scratch repo's `issues/` except as fixture setup before a fire, and say so in the artifact — the watcher itself never edits state; no exception.
- Do not simulate a fire's judgment with a script — the value is the SKILL.md prose being followed by an agent; record the rule you applied per step.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: evidence only, scratch only, no watcher-side state edits, judgment by hand from SKILL.md, defects come back as mismatch.

## 6. Ordered steps

1. Build the scratch area and fake herdr; smoke-test `akrogon config`, `observe.ts`, and one `akrogon next` dispatch on a waiting leaf (criterion 6 setup also proves dispatch works).
2. Scenarios 1–3 (recovery bound): one leaf, fail via `akrogon phase <slug> failed --reason "fix rounds exhausted" --slot B` from `implement` (real move, real log record), then apply the tick rules by hand; repeat to the third failure (criteria 1–3).
3. Scenario 4: reset fixtures, recover, move to `check.review` with a real committed change, fail again, apply rules (criterion 4).
4. Scenario 5: hand-written `failed`/`blocked` leaf with a human-prerequisite reason and no `delivery` (criterion 5).
5. Scenario 6: `check.review` leaf, fake panes A `working`, B `idle` (criterion 6).
6. Scenario 7: `implement` leaf, pane B `working`, screen file showing a 3× repeated command; run the stop-and-resteer sequence, then a second fire with the screen still looping (criterion 7).
7. Scenario 8: empty `issues/open` (criterion 8).
8. Write `implementation/walkthrough.md` with all evidence and the fake source appendix.

Advisory size: 1 artifact plus scratch tooling, under 40 turns.

## 7. Commands

- `bun run test` and `bun run typecheck` in `skills/watch-issues` must still pass at the end (you change nothing, but verify).
- All scenario commands run with the env in section 4; paste real outputs into the artifact.

## 8. Done-when, evidence and report

`implementation/walkthrough.md` exists in the leaf folder covering all eight criteria with pasted evidence; the fake-herdr source is embedded; every herdr/akrogon call in the scenarios is visible in `.calls` excerpts. Report any SKILL.md rule that could not be executed as written as a limitation or mismatch.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
