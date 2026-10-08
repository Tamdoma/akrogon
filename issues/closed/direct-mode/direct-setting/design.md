# Design: direct-setting

## Binding decisions, verbatim

### Eligibility and setting, Q2 (issues/chart/direct-mode/forks/eligibility.md)
Operator 2026-10-08: `1a | 2a |`
Q2 2a: offer only. Boolean repo setting, default off. When on and eligible, the handoff review asks direct or lifecycle
with the door's recommendation; explicit session authorization counts as the answer; debate stays as today for lifecycle
work. The chosen route is recorded in the chart; a later setting change does not alter an approved job.
Foreclosed: 2b automatic direct.

Exclusions: container, landing, growth and eligibility Q1 bind the door protocol only and are owned by leaf direct-route.
Hand-built removal is owned by leaf hand-built-removal.

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md: no auth, secrets or live calls here. Proof is
the smallest test at the CLI boundary: run `akrogon config` against an isolated registered repo (tests/helpers.ts) with
and without the key and with a non-boolean value. New behavior shows one deliberate break (remove the key from the schema)
turning its test red.

## Leaf architecture
- Owned: `repoSchema` in src/config.ts (one `direct: z.boolean().default(false)` entry), tests/config.test.ts,
  docs/guide/setup.md.
- Interface: key name `direct`, boolean, default false. Leaf direct-route's skill text reads this exact name.
- Excluded: any behavior change in commands; the setting is read only by the chart-issues skill. No machine-level key.
  No change to `issues/config.yaml` in this repo (records stay on main; enabling it is an operator step).
