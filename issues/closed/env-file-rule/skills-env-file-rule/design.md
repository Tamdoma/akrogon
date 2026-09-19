# Design: skills-env-file-rule

## Binding decisions, verbatim
Operator 2026-09-19 on the pi-extensions fork `~/.pi/agent/extensions/issues/chart/env-file-guard/forks/guard-scope.md`: "1-A 2-A 3-A 4-A". Q3-A: reads of the file are not refused by the guard; the refusal reason names `bun --env-file=<file> <script>` and the seat stop. This leaf carries the same loader and the same stop into the skill prose so the two halves say one thing.

Operator 2026-09-19: "I want to kill the vulnerability, but still give the most freedom to the subagents and agents over there."

Standing lock (skills-never-ask, merged): seats never ask; a missing value ends the pass with `akrogon phase <slug> failed --reason ... --slot <A|B>`.

## Standing design
Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

Interpretation for this leaf:
- **Every secret lives in the consumer repo's gitignored .env and agents may read it.** Reading stays legal through the loader; what the rule removes is the tool opening the file and echoing its lines.
- **No hardcoded secrets.** The skill text contains the loader form and variable names only.
- **Mandatory negative and edge-case tests.** Criterion 3 is the negative check on the whole `skills/` tree.
- **User-visible flow with an artifact.** Prose leaf; the artifact is the diff of the five files and the grep output in the implementation report. Not a browser flow.
- **Agent-owned:** no human-only prerequisite; no env values.

## Leaf architecture
Owned surfaces: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/AREA.md`. Each skill keeps its own voice; the substance is fixed, the wording is not.

Literal interface, the rule's substance: (1) the env file (`.env`, `.env.*`) is never opened, printed, appended to or written by a tool; (2) a script that needs values runs as `bun --env-file=<file> <script>` and prints results, never values; (3) presence is checked by name with such a script printing `present` or `absent`; (4) an absent required value ends the pass with the existing stop.

Verified form of the presence check (bun 1.4.2, synthetic file): `bun --env-file=.env -e 'console.log(["VAR_A","VAR_B"].map(k => k + ": " + (process.env[k] === undefined ? "absent" : "present")).join("\n"))'`. An empty assignment (`VAR=`) reports `present`; the skill may say so.

Exclusions: no akrogon code; no test on skill prose beyond the existing suite; no change to `broadcast-issue` (`~/.config/akrogon/env` is the sender's file, not the repo env file); no change to `chart-issues` (the door lists credentials by name already); no change to the pi-extensions guard.
