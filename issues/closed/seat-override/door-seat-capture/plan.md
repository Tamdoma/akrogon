# Plan: door-seat-capture

Prose-only leaf: three file edits, no code. `debate: no`; synthesized directly from brief and design.

## Decisions

- D1 — Block home (locked design Q1): the optional `slots:` front matter block lives only at the top of `EPIC.md` and `ISSUE.md`. `state.yaml` gains no seat field; shapes.md states this rule outright.
- D2 — Accepted shape (locked design Q2 + strictness 3a): keys `a`/`b` only, each optional; each seat is exactly `{harness, model, effort}`; every value nonblank after trim with no `'` or `"` in the decoded value; no other key at any level, meaning a front matter block on an index holds `slots:` and nothing else; `harness` names a template in the machine `config.yaml` `harnesses:` map. This mirrors `seat`/`slotConfigSchema`/`indexSchema` at `src/config.ts:12-21` and the harness-template check at `src/config.ts:135-141`. YAML delimiters are fine: `model: 'opus'` decodes to `opus`.
- D3 — Resolution order stated verbatim: `ISSUE.md`, then `EPIC.md`, then repo `issues/config.yaml`, then machine `config.yaml`; nearest set seat wins per seat (matches `indexSlots`/`seats` at `src/config.ts:99-148`). An issue inside an epic may carry its own block for its leaves.
- D4 — Write order: the door writes the block into the chosen owner's index before any leaf `state.yaml`; it is never copied per leaf.
- D5 — Door question rule (locked design visibility Q2, 2a): the door asks one seat question at the handoff review only when the intake, map or a leaf design names model-sensitive work; the default is no block; an answer is written into the owner index of the operator's chosen scope; the handoff review lists each leaf's effective seats. The sentence sits in the first Handoff paragraph in the same style as the `debate` election sentence there.
- D6 — Index contract amendment: "Container indexes hold no lifecycle state or global order" is amended to permit the `slots` block as configuration.
- D7 — `docs/guide/chart.md` gains exactly one sentence mentioning the seat question, placed in "Turn the answers into a buildable contract". `docs/guide/cheat.md` and `docs/guide/files.md` already document index `slots` and stay unchanged.
- D8 — Restatement stability (criterion 3): no edit touches any line matched by `grep -rn restatement skills/chart-issues` — currently SKILL.md:51,53, questions.md:52, shapes.md:126,130,138, chart-usage.ts. The `seats.yaml` chart-record section in shapes.md is unrelated to the `slots:` index block and stays verbatim.

## Read-first

- `skills/chart-issues/SKILL.md` — Handoff section, first paragraph (`debate` election style).
- `skills/chart-issues/assets/shapes.md` — Handoff tree, index templates, contract sentence, seats.yaml section.
- `docs/guide/chart.md` — "Turn the answers into a buildable contract".
- `src/config.ts:12-21,83-148` — the schema and resolution the prose must match.
- `docs/guide/cheat.md:27-43`, `docs/guide/files.md:19-31` — existing slot prose to stay consistent with (unchanged).
- `skills/chart-issues/assets/standing-design.md` — proof rules for prose leaves.

## Interface

The index templates show this verbatim (design's literal block):

```markdown
---
slots:
  a: {harness: claude, model: opus, effort: high}
  b: {harness: codex, model: gpt-6.1-sol, effort: medium}
---
# Epic: <epic>
```

Front matter detection is literal (`src/config.ts:84-88`): the file's first line must be `---` and a later line must close it with `---`.

## Waves

Wave 1 — three independent units; disjoint owned paths, no shared test resource, no dependencies.

- U1 owns `skills/chart-issues/assets/shapes.md`. Proves criterion 1: show the optional front matter in both index templates (EPIC.md and ISSUE.md), state the complete accepted shape per D2, the resolution order per D3, the write order and no-`state.yaml`-field rules per D1/D4, and amend the contract sentence per D6. Constraint: do not touch the seats.yaml section or any restatement-matching line.
- U2 owns `skills/chart-issues/SKILL.md`. Proves criterion 2: one addition in the first Handoff paragraph stating trigger, default, write target and the effective-seats review listing per D5. Constraint: Handoff section only; do not touch restatement-matching lines 51,53.
- U3 owns `docs/guide/chart.md`. Proves the first half of criterion 3: one sentence mentioning the seat question per D7.

## Verification

Each criterion's proof is a presence/absence read; per LESSONS 2026-10-01 no committed test asserts wording.

| Criterion | Proof | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `grep -n 'slots' skills/chart-issues/assets/shapes.md` shows the block in both index templates; read the seats paragraph against `src/config.ts:12-21,99-148` confirming every stated rule is enforced there; `grep -n 'lifecycle state' shapes.md` shows the amended sentence | Missing or under-specified shape, wrong resolution order, door writes a block the command rejects, unamended contract sentence | Seconds | Any edit to shapes.md |
| 2 | `grep -n 'seat' skills/chart-issues/SKILL.md`; read the Handoff paragraph for all four elements of D5 | Missing trigger condition, default, write target or effective-seats listing | Seconds | Any edit to SKILL.md |
| 3 | `grep -n 'seat' docs/guide/chart.md` (one sentence); capture `grep -rn restatement skills/chart-issues` before and after edits and compare byte-identical; `git status --porcelain` shows only the three owned paths changed | Extra doc touched, restatement prose drifted, missing guide sentence | Seconds | Any edit |
| All | `bun run format`, `bun run typecheck`, `bun test --timeout=30000` | Format or type regressions, broken suite | Minutes | Once after all edits |

Concrete scenario (door agent trace): handoff of an epic whose intake names model-sensitive work → door asks the seat question once → operator picks the epic scope with `b: {harness: codex, model: gpt-6.1-sol, effort: medium}` → door writes the verbatim block into `ISSUE.md`/`EPIC.md` before any leaf `state.yaml` and lists each leaf's effective seats in the review. Every key the prose permits parses through `indexSeats` and resolves through `seats`.

## Docs affected

- `skills/chart-issues/SKILL.md` (agent doc): Handoff seat-question rule.
- `skills/chart-issues/assets/shapes.md` (agent doc): index templates, accepted-shape statement, contract sentence.
- `docs/guide/chart.md` (human doc): one seat-question sentence.
- Explicitly unchanged: `assets/questions.md`, `assets/standing-design.md`, `docs/guide/cheat.md`, `docs/guide/files.md`, and everything under `src/`, `tests/`, `config.yaml`.

## Blockers and limitations

- None blocking: `blocked-by: [index-seats]` is satisfied in-branch — `indexSeats`/`indexSlots`/`seats`/`SeatIndexError` are live in `src/config.ts` (verified by read). readiness.yaml names no inputs, produces or grants; `akrogon status door-seat-capture` shows no `Missing:` lines.
- Open limitation to preserve: the question rule is door guidance in prose; nothing enforces when the door asks it. Schema enforcement lives in the resolver, outside this leaf.
