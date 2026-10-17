# Intake: door-handover

## Scope
Under autopilot the chart-issues door seat A restarts itself with an empty context in its own pane and the new A continues the same autopilot pass unattended; attended mode and the pane layout stay as they are; every change minimal.

## Provenance
- GitHub: Tamdoma/akrogon#101
- Operator: 2026-10-17 autopilot switch-on (2026-10-17T15:43:32Z)
- Operator: 2026-10-17 self-restart probe requests ("probe", "I want to see the same structure of panes as it is right now", "but the old A has to close itself as well")

## Source: operator 2026-10-17 autopilot switch-on
/chart-issues yes, and solve it via autopilot yourself. Use slot b as the consultant for this. The next session should start unattended, so the self-handover needs to be changed. Keep in mind, every change needs to be minimal, and the entire system has to be taken into context without breaking anything. The manual mode still has to work the same.

## Source: operator 2026-10-17 earlier words in this door pane
"but the old A has to close itself as well. That must be possible. I want to see the same structure of panes as it is right now"

## Source: Tamdoma/akrogon#101
# chart-issues door A keeps one long session across every chart under autopilot, and a fresh A session cannot continue autopilot without the operator

Source: Tamdoma/akrogon#101
URL: https://github.com/Tamdoma/akrogon/issues/101

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

Under autopilot the chart-issues door seat A keeps one session for the whole pass. After #99 restarted consultants per chart, the usage-spans savings check (issues/closed/usage-windows/usage-spans/implementation/report.md, 2026-10-17) showed A at 122k–164k average context per call and about 4.4–5.8M cache-read tokens per chart, while consultant B fell 46–57% per call. The operator wants A to hand itself to a fresh A in the same pane at chart boundaries and keep running autopilot unattended, with the pane layout unchanged and attended mode unchanged.

Probe 2026-10-17 on a throwaway pane (w8:pS9, herdr 0.9.1, claude): a claude ran a self-detaching helper against its own pane; the helper waited for the turn end (`herdr agent wait`), killed the claude process group, the shell returned in 0.5 s, and `herdr agent start <new name> --kind claude --pane <same pane> -- "<prompt>"` started a fresh session that ran the prompt (`HANDOVER-OK`). Same pane id, layout unchanged, about 11 s total.

Constraints seen in the probe:
- herdr keeps the old agent name on the pane after the kill (`agent_name_taken`), so each restart needs a new name.
- Claude Code prefix allow rules cannot approve `setsid` (exec wrapper), so the helper must detach itself.
- Auto mode blocked the detached spawn ("Unauthorized Persistence") until an allow rule covered the helper's command.

## Location

akrogon `skills/chart-issues/SKILL.md` (`## Autopilot`, mode record), chart-issues door under herdr.

## Reproduction

Run an autopilot door pass over several charts; A's session id stays the same across charts. Start a fresh A session mid-pass: it starts attended until the operator says "continue autopilot".

## Expected behavior

Under autopilot, A restarts itself with an empty context in the same pane and the new session continues the same autopilot pass without the operator. Attended mode works as today.

## Urgency

A is the largest per-chart cost in the 2026-10-17 measurements. Workaround: the operator restarts A by hand and says "continue autopilot".

## Suspected cause

Supported hypothesis: no step restarts A, and SKILL.md `## Autopilot` says "a different session id starts attended until the operator says \"continue autopilot\"", so any automatic restart of A would drop autopilot. #99 added consultant restarts only.
Whose view: both.
Files read: skills/chart-issues/SKILL.md (`## Autopilot`, consultant restart paragraph), issues/closed/usage-windows/usage-spans/implementation/report.md.
Not inspected: other harnesses as A (codex, pi); whether a slash command in the start prompt invokes the skill.
Related reports: Tamdoma/akrogon#99 (consultant restarts, same growth for B and C, closed); searched Tamdoma/akrogon, all states, "door session handover" limit 8 and author @me since 2026-10-15 limit 20.
