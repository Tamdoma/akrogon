# Intake: prompt-stalls

## Scope

One destination, akrogon: an unattended seat or chart door no longer waits all night on an in-tab confirmation prompt. #139 is one producer of such prompts (Claude Code's rm guard on unguarded variable paths). #135 is the missing consumer (the watch confirms what is safe). Grouping into issues and leaves is decided at the split.

## Provenance

- GitHub: Tamdoma/akrogon#135
- GitHub: Tamdoma/akrogon#139
- Operator: 2026-11-16T19:59Z chart-issues switch-on

## Source: operator 2026-11-16T19:59Z switch-on

I just pulled the two issues. They need to be consolidated and charted, and then you have to give them to the W Akragon tab watcher agent, which is active in this space. Use slot B consultant and make it codex default. Full autopilot mode, including the signposts.

## Source: Tamdoma/akrogon#135

# watch-issues cannot confirm prompts in agent tabs, so work stalls until the operator returns

Source: Tamdoma/akrogon#135
URL: https://github.com/Tamdoma/akrogon/issues/135

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-11-15 in framework, agent tabs in hc session `infra` stopped on in-tab confirmation prompts and waited for the operator. These were a tool permission prompt asking to confirm an action and a seat's AskUserQuestion dialog. The `/watch-issues` agent was running the whole time, saw the work stall, and confirmed nothing. The operator had to come back and confirm one prompt by hand.

Related case the same day: chart row N11b ("yes 12" or "keep 10", which gates `ia-skill-revamp` through the readiness `file` input `issues/chart/ia-revamp/approvals/n11b.md`) went unanswered because the question scrolled away when the door reset its tab.

When the watch tried to act, Claude Code's auto-mode classifier denied it as "[Undermining Oversight]". Once it was an `hc keys` answer to a seat's AskUserQuestion, and once an `hc send` relaying an approval to the chart door.

Operator's position: "It's your job to confirm it if it's not that dangerous, to keep everything moving." Confirming these prompts belongs to the `/watch-issues` agent, not the operator.

## Location

`skills/watch-issues/SKILL.md`, installed at `~/.claude/skills/watch-issues`, which links to `~/.akrogon/releases/8532a1f786367d9e521e24567e7294d6660dd743/skills/watch-issues`. This is the operator-away watch over seats and chart doors.

## Reproduction

1. Run `/watch-issues` while the operator is away.
2. A seat or chart door tab shows a permission prompt or a question dialog.
3. Every tick reports or ignores it, and the tab waits until the operator returns.

Frequency: every in-tab confirmation prompt during a watch.

## Expected behavior

The watch detects a tab waiting on a confirmation prompt and confirms it when the action is not dangerous. The skill should define:
- what counts as dangerous (for example, destructive, outward-facing, or above a cost bound)
- which keys or message to send for each harness
- how the watch records that it confirmed

Dangerous prompts are left for the operator, with a notice.

## Urgency

Leaves and chart doors stall for the whole time the operator is away, which can be a full night. Workaround: the operator confirms by hand when they return.

## Suspected cause

Supported hypothesis: the skill's Never list includes "Answer a seat." (`SKILL.md:56`) and "Edit `state.yaml`, worktrees or `issues/`", and it has no rule for detecting or confirming in-tab prompts. So the watch has no allowed action. A contributing factor is that Claude Code's auto-mode classifier blocks an agent from answering another agent's prompt unless a permission rule allows the watch's `hc keys` and `hc send` calls.

Whose view: reporter and agent.

Files read: `~/.akrogon/releases/8532a1f78636…/skills/watch-issues/SKILL.md` (installed release copy, not the source checkout), `framework/issues/open/ia-revamp/ia-skill-revamp/readiness.yaml`, `framework/issues/open/ia-revamp/ia-skill-revamp/design.md:230,245`, `framework/issues/chart/ia-revamp/CHART.md:70`.

Not inspected: the akrogon source checkout's copy of the skill, how hc reports a terminal blocked on a prompt, and Claude Code permission settings.

Related reports: none found. Searched Tamdoma/akrogon, all states: the filing account's reports since 2026-11-13 (limit 30), and the query "watch-issues approval" (limit 10).

## Source: Tamdoma/akrogon#139

# Seat worker subagents write rm -rf $VAR/$VAR, which triggers a Claude Code permission prompt and stalls the seat

Source: Tamdoma/akrogon#139
URL: https://github.com/Tamdoma/akrogon/issues/139

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-11-16, seat A (t1xv) of framework leaf `competition-read-skill` (phase `implement`) stalled in status `blocked` for about 20 minutes. Its U6 general-purpose worker subagent ran:

```
D=/var/tmp/akr-1000/.../scratchpad; for c in buffalo:city national:area ecommerce:area; do n=${c%%:*}; ...; rm -rf $D/$n; bun $S/plan-reads.ts ...; done
```

Claude Code showed: "Dangerous rm operation on possibly-empty variable path: $D/$n in `rm -rf $D/$n` (rewrite it as "${D:?}"/"${n:?}" or use a literal path)". It waited on "Do you want to proceed?". This prompt appears even though seats run with `--dangerously-skip-permissions`. The watch cannot answer it, because the auto-mode classifier denies `hc keys` to another seat as undermining oversight (see #135). So the seat waits for the operator.

## Location

Worker sub-briefs and inline execution in `implement-issue` (and any seat skill that writes shell commands), run by Claude Code seats.

## Reproduction

A seat or worker runs `rm -rf` on a path built from unguarded shell variables. Seen once today. Frequency: Not provided.

## Expected behavior

Not provided.

## Urgency

Every such command stalls the seat until the operator presses 1 in its terminal. Overnight runs stop. Workaround: the operator answers the prompt, or types `! HC_SESSION=<session> hc keys <address> 1` from a watch session.

## Suspected cause

Supported hypothesis: Claude Code's built-in rm guard fires on `rm -rf` with unguarded variable paths regardless of permission mode, and seat and worker guidance does not tell agents to write `"${VAR:?}"` or literal paths. So agents write plain `$VAR` paths.
Whose view: agent.
Files read: none of the skill sources. This comes from the seat screen (`hc read t1xv`) only.
Not inspected or would disprove: whether existing implement-issue or worker-brief text already covers rm path guarding.
Related reports: Tamdoma/akrogon#135 (watch cannot confirm prompts, a different defect but the same stall). Search "rm possibly-empty variable" (all states, limit 5): none.

## Agent findings

- Tamdoma/akrogon#135 is already in the intake of handed-off chart issues/chart/unattended-runs, recorded there as a partial match left out of every leaf's `sources` with "Close or re-scope it is the operator's call" (Pending steps). The operator hands it here by name ("the two issues"), which is that call: this chart takes its uncovered part, the watch confirming prompts in tabs. The delivered parts landed in issues/closed/unattended-runs/blocked-seats (claude seats run with `--disallowedTools=AskUserQuestion`, src/seat.ts; one attention notice per blocked episode).
- Tamdoma/akrogon#139 is in no leaf `sources` and no other chart intake.
