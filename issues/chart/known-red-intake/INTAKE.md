# Intake: known-red-intake

## Scope

Destination repo: akrogon. Handed work: Tamdoma/akrogon#121 (mirrored seed `issues/seeds/121-a-red-that-is-also-red-on-base-leaves-no.md`). The operator's note also names Tamdoma/akrogon#120, which is already owned by chart `killed-check-log` (handed off 2026-10-27, leaf `killed-check-log/durable-check-capture` in `sources`), so it is skipped here. Grouping proposed after the map.

## Provenance

- GitHub: Tamdoma/akrogon#121
- Operator: 2026-10-27T15:44Z, door pane w8:pNP

## Source: operator 2026-10-27T15:44Z

Look at the two new pulled issues. chart them out on autopilot. Use consultant slot b (codex, active in this herdr tab).

## Source: Tamdoma/akrogon#121

# A red that is also red on base leaves no lasting intake: the known-red notice is a transient herdr notice for configured checks only, so the broken test stays red and leaves keep paying for it

Source: Tamdoma/akrogon#121
URL: https://github.com/Tamdoma/akrogon/issues/121

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

Framework leaf `config-helper-require` (issue `astro-config-site-loading`) spent over an hour in check.fix on 2026-10-27 proving that 38 reds in `test:emdash-conversion` (`bun test ./.claude/skills/dev-build-emdash/test/`) were also red on base `aac40283d`. The reds came from a cross-file `globalThis.fetch` stub leak in `launch-sequence.test.ts`, which had been red on main before the leaf started (Tamdoma/tamdoma-framework#446). The seat ran the base comparison by hand through `akrogon run-check`; one run was killed by the seat's tool timeout (Tamdoma/akrogon#120).

Nothing in the lifecycle turned "red on base, no cause in the diff" into a lasting record against the broken test. The leaf concluded "no leaf-caused regression" and moved on. The broken test stayed red for the next leaf.

## Location

- `skills/implement-issue/SKILL.md`, Shared context known-red rule (red with no cause in the diff, retry, `akrogon verify --known-red`)
- `skills/check-issue/SKILL.md`, check.review known-red rule
- `src/verify.ts` known-red notice (`noticeCovers`, herdr notice delivery)
- Framework `package.json`: `test:emdash-conversion` is not part of `framework:verify` or `framework:verify:cheap`, so it is not a configured check
- Leaf report: framework `issues/open/astro-config-site-loading/config-helper-require/implementation/report.md`

## Reproduction

1. Have main red in a test command that is a leaf's done-criterion proof or an ad-hoc suite, not a configured `checks` entry.
2. Run a leaf whose diff does not touch the failing tests.
3. The seat judges "no cause in the diff", compares against base by hand, records it in `implementation/report.md`, and continues. No seed or lasting record is created; the next leaf repeats the comparison.

Seen 2026-10-27 in the framework. Earlier cases of the same toil: Tamdoma/akrogon#47, #76, #105.

## Expected behavior

Reporter (operator, 2026-10-27): a red that is also red on main gets filed as a bug automatically.

## Urgency

Each leaf that meets a pre-existing red pays for its own base comparison, from minutes up to over an hour here. The broken test is only fixed when the operator notices and charts it by hand. Workaround: the operator reads leaf reports and files the broken test manually, which is how Tamdoma/tamdoma-framework#446 was filed.

## Suspected cause

Agent view. The 2026-10-17 `base-red` chart (`issues/chart/base-red/forks/red-base-policy.md`, `## Taken`) lets known reds pass inside `akrogon verify` and sends one herdr notice per new red. It records as an accepted cost that "main stays red until the operator charts the repair from a notice" and that no repair owner is assigned. Two conditions then let the broken test persist:
- The notice is a herdr notification, so it leaves no record once dismissed or missed.
- The notice exists only inside `akrogon verify` for configured `checks`. Done-criterion proofs and ad-hoc suites like `test:emdash-conversion` are compared by the seat itself (implement-issue Shared context, check-issue check.review), which produces a report line and no notice at all.

Files read: `skills/implement-issue/SKILL.md` (Shared context), `skills/check-issue/SKILL.md` (check.review), `src/verify.ts` (notice code, grep level), `issues/chart/base-red/CHART.md` and `forks/red-base-policy.md`, `issues/chart/red-base-wait/CHART.md`, framework `package.json` scripts, the framework leaf report.

Not inspected: whether a known-red notice was shown for any configured framework check on 2026-10-27; whether other consumers see the same pattern.

Related reports:
- Tamdoma/tamdoma-framework#446: the broken test behind this case.
- Tamdoma/akrogon#120: the seat's base run killed by its tool timeout, losing the log.
- Tamdoma/akrogon#76 (closed): red main rediscovered by each leaf; led to the known-red notice.
- Tamdoma/akrogon#105, #47, #98 (closed): earlier red-on-base toil.
Searched Tamdoma/akrogon, all states, for "known-red seed" and "known red base" (limit 10), plus @me reports since 2026-10-25 (limit 40).

## Agent findings

- #120 skip: exact identity in `issues/chart/killed-check-log/INTAKE.md` and `issues/open/killed-check-log/durable-check-capture/state.yaml` `sources`.
- `skills/seed-issue/SKILL.md` already routes a filing to the consumer repo (`akrogon.yaml` `issues_repo` or origin) or to akrogon for akrogon-owned paths, and already dedupes by two read-only `gh issue list` lookups before `gh issue create`. It is linked into claude, codex and pi skill folders (`~/.{claude,codex}/skills/seed-issue`, `~/.pi/agent/skills/seed-issue` -> `~/.akrogon/current/skills/seed-issue`).
- No lifecycle seat skill calls seed-issue today; only `skills/learn-issues/SKILL.md:31` prints a `/seed-issue` line.
- Known-red judgment gates: `skills/implement-issue/SKILL.md:40`, `skills/check-issue/SKILL.md:69`, `skills/merge-issue/SKILL.md:79`. The herdr notice: `src/verify.ts` `sendMainRedNotice`, `noticeCovers`.
