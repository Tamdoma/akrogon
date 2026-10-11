# Brief: locked-setting-proof

## What
The chart door proves a locked third-party setting in the exact form the decision locks. The Take operation-proof rule in `skills/chart-issues/SKILL.md` gains one sentence: when a decision locks a setting of an outside tool (a config key, file setting, flag or environment variable), its proof uses that same key, location and value and observes the property the decision relies on. A proof of a different form, such as the CLI flag for a locked config key, does not count for it.

Owned: `skills/chart-issues/SKILL.md` (the Take operation-proof paragraph).

## Why
Tamdoma/akrogon#81: locked decision install-sharing 1a named a `bunfig.toml` key that bun 1.4.2 ignores silently. The charted proofs only ran the CLI flag, so leaf `copyfile-install` failed at `check.fix` and sat about 7 hours until the operator rewrote the decision by hand. B and C proposed this rule independently in the night-flow map (L7).

## Done-criteria
1. `skills/chart-issues/SKILL.md` states the rule above in its Take operation-proof paragraph.
2. A sweep of `skills/chart-issues/` by meaning finds no line allowing a different form to prove a locked setting; hits outside scope are listed in the report.
