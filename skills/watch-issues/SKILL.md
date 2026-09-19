---
name: watch-issues
description: Watch every open leaf of one repo on a 20-minute cron while the operator is away, started and stopped only by the operator.
---

# Watch issues

Operator-invoked watch over every leaf under `issues/open` of the registered repo, re-read at each fire. `<root>` is the registered repo root. All akrogon commands run with cwd `<root>`.

## Invocations

Claude Code only. When CronCreate is absent, say "This watch needs Claude Code cron, so no watch is running." and claim no watch.

Job identity is the exact prompt `/watch-issues tick <root>`.

- `/watch-issues` from `<root>`: run one check now. If that check already satisfies the stop rule, report it and create nothing. Otherwise use CronList to find jobs with the exact prompt: zero matches creates one job with CronCreate, schedule `*/20 * * * *` recurring and that exact prompt, then reports its id and 7-day expiry; one match is reported and no job is created; several matches are reported and no job is created or deleted.
- `/watch-issues tick <root>`: one check only. It never creates a job, even when zero match. It may delete through the stop rule.
- `/watch-issues stop`: use CronList for the exact prompt: one match is deleted with CronDelete and reported; zero matches is reported as already stopped; several matches are reported and none are deleted.

## Observe

Run `bun <skill-folder>/scripts/observe.ts <root>` under a Bash timeout; it prints one line per leaf sorted by slug, nothing when the open tree is empty.

`OBSERVE_HERDR` and `OBSERVE_AKROGON` override the herdr and akrogon binaries for tests only.

Line format, stable field order:

`slug=<slug> phase=<phase> attempts=A<n>,B<n> blocked=<comma-list|empty> A=<pane|->/<status|->[+HhMMm] B=<pane|->/<status|->[+HhMMm] notified=<seats-with-busy_notified|empty>` and for `phase=failed` either ` failed=<cause>@<phase> delivery=<value|-> reason="<reason>"` or ` failed=unknown` when no failure record exists.

When the evidence warrants a closer look, run `herdr agent read <pane> --lines 80`. Read `issues/log.jsonl` filtered to this repo and slug in order for the recovery bound. Only read-only commands run under a Bash timeout; `next`/`phase` never do, and an interrupted mutation is re-read before anything else.

## Judge

Required seats by phase: plan.positions A+B, plan.rebuttal A+B, plan.synthesis B, implement B, check.review A+B (A only when `fix_rounds > 0`), check.fix B, merge A; merged and failed need none. Unfinished means not in `done`.

- Waiting: phase is not merged or failed and at least one required unfinished seat is idle or absent: run `akrogon next <slug>`; the command guards the other seats. When several leaves wait, run `akrogon next --all` from the root instead.
- Merged still under open: run `akrogon next <slug>` once; if the leaf stays, report the completion error and keep the watch.
- Failed on a human prerequisite, or record is unknown: `failure.reason` names a credential, permission, operator decision or external step, or the line ends with `failed=unknown`. Never recover. When `failure.delivery` is not `shown` and this fire has not yet shown it, run `herdr notification show "<repo>/<slug> needs you" --body "<reason>" --sound request`. Delivery `shown` and a notice shown this fire both count as shown for the stop rule. After a lost context carry the notice may repeat.
- Failed otherwise: re-read state first. Recover only when every required seat of `failure.phase` is idle or absent. Compute the cycle count from `issues/log.jsonl` filtered to this repo and slug in order: a `failed -> P` record whose next record for that slug is `P -> failed` is one unproductive cycle; two consecutive cycles end recovery. Missing or malformed log means unknown history, so notify-only. When the two most recent recoveries were both unproductive, notify and leave the leaf. Otherwise run `akrogon phase <slug> <failure.phase>` then `akrogon next <slug>`.
- Busy: run `herdr agent read <pane> --lines 80` for every busy seat and judge it against the leaf brief. Working normally, or waiting on a long command: no action. Act only on loop evidence (same command or edit three or more times with the same result, three or more consecutive errors, an edit-undo cycle), a concrete action outside the brief, or a hung tool with concrete evidence such as a fatal message or an exited process. This rule covers all harnesses the same way; subagents have no pane, so judge them through the parent screen and correct them through the parent. Stop and resteer once per seat per watch: run `herdr agent send-keys <pane> esc`, then `herdr agent wait <pane> --timeout 10000`, then read the pane to confirm an idle seat with empty input and the same session, else notify instead of prompting. Then send one corrective prompt with `herdr agent prompt <pane> "<evidence>; the brief wants <target>; next: <step>"`, naming the evidence, the brief target, the next step, and a looping subagent by name so the parent corrects it with its own controls. The existing akrogon pass re-prompts the phase itself. A mid-turn steer without the stop may be tried first only when the pane shows tools completing. The same seat still looping on the next fire is notified with the evidence, never stopped a second time. Insufficient evidence on screen is reported as such with no action.
- Command error from `next` or `phase`: run the observe script again, report the error, and take no further mutation this fire.

## Stop

After judging, when the observe script prints no leaf and the inventory was readable, or every remaining leaf is failed on a human prerequisite with shown evidence, use CronList to find jobs with the exact prompt `/watch-issues tick <root>`: one match is deleted with CronDelete and reported; several matches are reported and none are deleted.

## Never

- Kill an agent process.
- Close a pane.
- Run `esc` twice on one seat per watch.
- Run `phase failed`.
- Edit `state.yaml`, worktrees or `issues/`.
- Open `.env`.
- Answer a seat.
- Create a job from a tick.
- Put a Bash timeout on `next`/`phase`.

## Reply

Reply with at most five lines per fire, naming what was seen and what was done.
