# Chart: watch-consultants

## Destination

When a leaf fails in a way the watch today only notifies on, `/watch-issues` starts one consultant (recipe from `~/.akrogon/config.yaml`, default agy neon high) over hc, exchanges with it over `hc send`, and acts on the result: a base fix pushed fast-forward to main, a leaf resumed, or a notice only for an operator stop. Proven by a real paid run in a throwaway repo.

Route: lifecycle

## Forks taken

- [signposts](forks/signposts.md): operator 1a 2b 3a+ 4 5 6a, N1 and N2 supplied
- [seed-decision](forks/seed-decision.md): taken at import, decided by ivanjuras
- [consult-loop](forks/consult-loop.md): A's pick, failed-only trigger, case per root cause, case folder outside the repo, turn files over hc send, coalesced dues
- [fix-and-config](forks/fix-and-config.md): A's pick, case-folder base worktree with ff push, leaf commit only on a clean idle worktree, check.fix resume, `slots.consultant`, `akrogon seat --watch-consultant`, `<prefix>-watch-consult`

## Open forks

none

## Fog

## Off route

## Pending steps

- After watch-consults lands on main: the door adds `slots.consultant: {harness: agy, model: neon, effort: high}` to the real `~/.akrogon/config.yaml` (signposts N2), runs `akrogon config` to verify it, and records the result here. Tamdoma/akrogon#146 closes on the code's delivery; this default is the operator's setting, not part of the report (A's reading).

## Mode record

- mode 2026-11-21T17:12:23Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/5d8542a8-366c-477b-b80b-1a7c0cdf14df.jsonl: on full autopilot; handed watch-consultants; consultants B codex gpt-6.2-astra high, C agy neon high (door-created)
- mode 2026-11-21T17:12:23Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/5d8542a8-366c-477b-b80b-1a7c0cdf14df.jsonl: changed to autopilot (operator answers signposts, A answers forks): "I'll do the signposts myself, ok"

## Autopilot

- switch-on: INTAKE.md `## Source: operator 2026-11-21 door t126`
- consultant: B codex gpt-6.2-astra high; C agy neon high
- signposts: operator — original in watch-consultants
- route: lifecycle
- N1a supplied 2026-11-21T18:06:26Z by the operator (forks/signposts.md); wait cleared
- handoff review 2026-11-21T18:07:00Z, answered by A: tree issues/open/watch-consultants/ (ISSUE.md; consultant-seat, failed-merge-resume, then watch-consults blocked-by both); registered repo akrogon; locks: seed-decision (Tamdoma/akrogon#146, decided by ivanjuras), signposts, consult-loop and fix-and-config (A's picks with standing dissents held in each design); grants: watch-consults holds N1+N1a (operator), the other two none; seats: repo defaults, no `slots:` block (no model-sensitive work named); route: lifecycle; usage: chart watch-consultants operator wait 34.3 min, 4 turns, A=102516, B=16415, C=unmeasured output, outcome partial; skill change: watch-issues reaches doors only at the next release link.
- live-run line (estimate): watch-consults runs at most 6 prompted sessions one at a time (shared hc session akr-e2e-watch), likely 2 per run (watcher and consultant) over up to 3 runs, about 30 to 45 minutes; worst case 6 x 15 = 90 minutes; timeout basis the operator's N1 bound of 15 minutes per session; machinery tests/e2e/watch-tier.ts.
- key parts: consultant start (proof: akrogon seat --slot codex and agy starts this session); a watcher waking on its consultant's send inside its turn (proof: this door's hc wait wakes, claude watcher); one-alive by name and parent exit ending the child (proof: akr-probe-wc); fast-forward push after the remote moved (proof: scratch bare remote). Unproven and in the live run: codex, pi and agy watchers.
- recorded only: 16 flaky tests from 2026-10 (akrogon flaky); no failed leaves (akrogon status: no open leaves)

Handed off 2026-11-21
