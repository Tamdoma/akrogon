# Design: door-seat-capture

## Binding decisions, verbatim

### Where the seat setting lives (forks/setting-home.md Q1)

Taken: 1a without the leaf level. The seat setting lives only in YAML front matter at the top of `EPIC.md` and `ISSUE.md`; `state.yaml` gains no field. Resolution per seat, nearest index wins: parent `ISSUE.md`, then grandparent `EPIC.md` at depth 3, then repo `issues/config.yaml`, then machine `config.yaml`. An issue inside an epic may carry its own block for its leaves. Reason: one place per owner. Foreclosed: leaf `state.yaml` override, copy at handoff, slug-keyed repo map, new file.

### Shape of the block (forks/setting-home.md Q2)

Taken: whole seat `{harness, model, effort}`, identical shape in every file, nonblank, keys `a`/`b` only, strict. The machine `harnesses:` launch templates differ per CLI and never appear in an issue file. Foreclosed: field patch.

### Door capture (forks/visibility.md Q2)

Taken: 2a. The door asks about seats once at the handoff review only when the intake, map or a leaf design names model-sensitive work; otherwise it writes no block. The index block is written before any leaf `state.yaml`. Foreclosed: asking on every handoff.

### Strictness (forks/visibility.md Q3)

Taken: 3a. One seat schema at machine, repo and index level: `harness`, `model`, `effort` nonblank after trim, no quote characters. Foreclosed: a second schema for index blocks only. For this leaf: shapes.md states the full accepted shape so a door agent writes a block the command accepts: keys `a`/`b` only, exactly the three fields per seat, values nonblank after trim, no `'` or `"` in the decoded value (YAML delimiters are fine, `model: 'opus'` decodes to `opus`), no extra key at any level, `harness` naming a machine template. (A,B)

### Excluded here

Resolver, launch, config and status behavior and the enforcement of the schema above (`index-seats`); the claude template (`subagent-seat-model`).

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md. Interpretation: this leaf changes skill prose only; its proof is the presence of the stated rules in the named files read as an operator would, with the blocking `checks` (format, typecheck, test) still green; no test asserts wording (LESSONS 2026-10-01), so the criteria name what the files must state, not the sentence.

## Leaf architecture

Owned surfaces: `skills/chart-issues/SKILL.md` (Handoff section), `skills/chart-issues/assets/shapes.md` (Handoff tree, index templates, seats paragraph), `docs/guide/chart.md`.

Interfaces: the front matter block in the index templates, verbatim, with the accepted shape stated beside it:

```markdown
---
slots:
  a: {harness: claude, model: opus, effort: high}
  b: {harness: codex, model: gpt-6.1-sol, effort: medium}
---
# Epic: <epic>
```

Exclusions: `questions.md` and `standing-design.md` unchanged; no change under `src/`, `tests/` or `config.yaml`; no new question for charts without model-sensitive work.

Dependencies: `blocked-by: [index-seats]`. The door rule becomes active only after the resolver reads index front matter, so an explicit operator answer is never written into an index that the current `src/config.ts:60-64` resolver ignores. (A,B)
