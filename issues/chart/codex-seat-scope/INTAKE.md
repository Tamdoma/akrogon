# Intake: codex-seat-scope

## Scope

Destination: a codex B seat starts and stays inside its leaf scope again, so leaves stop failing at check.review with "seat B was lost 3 times before ending a turn". One destination, the akrogon repo (the seat launch and the tool entry are akrogon's). Grouping: one outcome.

## Provenance

- Operator: chart-issues door t126, 2026-11-25T15:49Z (screenshot of framework tab h1-from-seo-plan)
- Watch consult case: /home/ivan/.akrogon/watch/framework/consults/h1-from-seo-plan-1/case.md
- No GitHub identity. Pull at 2026-11-25T15:51:50Z found no matching seed.

## Source: operator chart-issues door t126 2026-11-25

> framework workspace, look at h1-from-seo-plan failed tab. Chart it and see whatt's going on. It's been lost everywhere across all spaces in this session. Manual rooute. Slot b, c and d consultants. Slot e (codex sol 6.2 high) as reviewer

Screenshot text (A seat of h1-from-seo-plan, last lines):

> The leaf is failed, but not from my work: the state records reason: seat B was lost 3 times before ending a turn — the B-seat dispatch erred (seat outside its leaf scope cgroup error) on three consecutive launches after my successful move to check.review. That is infrastructure requiring the operator, not a leaf defect.

## Source: watch consult case h1-from-seo-plan-1 (verbatim, Failure section)

> Two leaves failed at check.review with reason "seat B was lost 3 times before ending a turn":
>
> - h1-from-seo-plan (anchor, one-home-copies)
> - canonical-list-binding (framing-plus-items)
>
> On recovery (`akrogon phase <slug> check.review` then `akrogon next <slug>`), the B seat spawn failed both times with `seat outside its leaf scope`: the terminal process landed in a cgroup `.../tools/t-<pid>` inside the expected scope path but not in the scope akrogon expects, and akrogon moved each leaf back to failed.

## Agent findings

A's own observations, 2026-11-25, not operator words:

1. Recorded refusal cgroup (watch consult brief): `0::/user.slice/user-1000.slice/user@1000.service/akrogon.slice/akrogon-lb35bbd026155.slice/akrogon-lb35bbd026155-fw-canonical-list-binding-b-c12d3257.scope/tools/t-3559863-9659049`. The seat pid sits in the scope's `tools/` child, not the scope.
2. `src/seat.ts` scopeEntry (`cgroup.endsWith(scope)`) accepts only the scope itself; a seat pid in `<scope>/tools/t-…` reads `outside` after PANE_WAIT_MS and startSeat ends the seat and throws `seat outside its leaf scope`.
3. bd358f3f (deployed in release e3ec4b02 at 2026-11-25T15:06:45Z) added `BASH_ENV=<home>/tool-entry/bash-env` to every harness kind other than claude and agy, plus `AKROGON_SEAT_CGROUP=<scope cgroup>`. The bash-env script moves any bash whose cgroup equals AKROGON_SEAT_CGROUP into `tools/t-$$-<start>`.
4. Probe (A, free, 2026-11-25): `env BASH_ENV=<probe> sh -c 'exec codex --version'` shows the BASH_ENV file sourced in the SAME pid as the launch, cmd `/bin/bash /usr/share/omarchy/bin/omarchy-agent-account-exec codex --version` (codex resolves through the mise command wrapper `~/.local/share/mise/command-wrappers/bin/codex -> /usr/bin/mise`, which execs that bash script), and once more in its child `omarchy-agent-account-home codex`. The same probe for `pi` sources nothing. So for a codex seat the seat's own process is a bash that sources the tool entry and moves itself into `tools/`.
5. Every leaf failed since the deploy (all repos) is these two framework leaves at check.review, slot B, slots.b = codex gpt-6.2-sol. A seats (pi) are unaffected. The one codex B start after the deploy that worked (h1-from-seo-plan check.review at 15:26Z) fits a race: scopeEntry can read the cgroup before the wrapper bash moves itself.
6. Consultant seats (`akrogon seat --slot`, startConsultant/launch) start without systemd-run, BASH_ENV or AKROGON_SEAT_CGROUP, so they are unaffected.
7. `sweepToolCgroups` (src/tool-cgroup.ts) kills or defers every `tools/t-*` cgroup of the leaf's slice at a phase move; a seat process living in `tools/t-<seat pid>` would be treated as a tool shell.
8. Release state: `~/.akrogon/current` is e3ec4b02; origin/main is 9a7cf416 (not yet deployed). self-update runs from `akrogon next` on merge and from listen passes (src/next.ts).
