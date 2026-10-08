# Brief: direct-setting

## What
Add one repo setting, `direct`, a boolean defaulting to `false`, to the repo config schema, so a consuming repo can write
`direct: true` in its `issues/config.yaml`. `akrogon config` prints the effective value for every registered repo,
`false` when the key is absent. The operator guide's setup page lists the key and its meaning in one line: when true,
the chart door may offer the direct route at the handoff review; the operator still chooses per chart.

## Why
The chart door's direct route (leaf direct-route) is off unless a repo opts in. Repo config is strict
(`repoSchema`, src/config.ts:38-60), so `direct: true` fails every command until the schema knows the key. The door reads
the value from `akrogon config` output.

## Done-criteria
1. In a registered repo whose `issues/config.yaml` has `direct: true`, `akrogon config` prints `direct: true` and every
   other command parses the config as before.
2. In a registered repo with no `direct` key, `akrogon config` prints `direct: false`.
3. `direct: yes`, `direct: 1` or any non-boolean value makes `akrogon config` fail with the config validation error naming the key, as other invalid repo keys do today.
4. docs/guide/setup.md lists `direct` with its default and its effect (offer only, operator chooses).
