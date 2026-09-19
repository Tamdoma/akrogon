# Intake: env-file-rule

## Scope
The akrogon half of Tamdoma/akrogon#22: the phase skills state one rule for the operator env file so a seat never opens, prints or writes it with a tool. The enforcement half (refusal and scrubbing in pi's tools) is charted and handed off in pi-extensions at `~/.pi/agent/extensions/issues/chart/env-file-guard/` (leaf `env-guard-hooks`, sources `Tamdoma/akrogon#22`). That leaf owns the GitHub identity; this chart lists #22 as related only.

## Provenance
- GitHub: Tamdoma/akrogon#22, copied verbatim in the pi-extensions chart intake (`~/.pi/agent/extensions/issues/chart/env-file-guard/INTAKE.md`); not duplicated here.
- Operator: 2026-09-19, "1-A 2-A 3-A 4-A" on the pi-extensions fork `guard-scope.md`, and "I want to kill the vulnerability, but still give the most freedom to the subagents and agents over there."

## Agent findings
See `slots/map-merged.md`. The seat that leaked the value appended to the env file with the bash tool and inspected it with `cat`, `tail`, `sed` and `awk`; credentialed calls used `bun --env-file=.env` throughout. On origin/main, `skills/plan-issue/SKILL.md:57` tells the plan seat to check each named credential "in the registered repo's gitignored `.env`", which invites opening the file; `skills/implement-issue/SKILL.md:41`, `skills/check-issue/SKILL.md:25` and `skills/merge-issue/SKILL.md:25` name the missing-value stop but no way to read values; `skills/AREA.md` has no env rule. Verified this pass: `bun --env-file=.env -e '<script>'` (bun 1.4.2) loads the file and a script can print `present`/`absent` per variable name without printing a value.
