# Brief 2: seat-override docs

## 1. Goal

Update the human and agent docs the plan names for the new per-repo `slots` override (plan checklist item 8, leaf criterion 8 and 9). Code already landed: `issues/config.yaml` accepts optional `slots: { a?, b? }`, each a complete `{harness, model, effort}` triple naming a harness from the global `harnesses` registry; a present seat replaces the global seat, an absent seat inherits; `akrogon config` prints the merged pair inside a repo; the override applies at the next agent start and running seats are untouched; `akrogon init` and `akrogon next` refuse an override naming an unknown harness.

## 2. Acceptance criteria

1. `skills/init-issues/SKILL.md` proposal block lists `slots` as optional, states repeat setup preserves an existing stored override, and states the skill never copies inherited effective seats into the proposal.
2. `docs/guide/setup.md` "Repo config, the parts you'll care about" list gains a `slots` line with an example and the next-start rule.
3. `docs/guide/cheat.md` shows the field with an example and the next-start rule.
4. `README.md` machine-config paragraph says a repo may override seats.
5. `src/AREA.md` names the `seats` resolver, keeps its four-section shape and stays at most 40 lines.
6. `bun test tests/docs-links.test.ts` passes; `docs/reference-index.md` is unchanged unless a pointer actually moved.

## 3. Read-first list

- `skills/init-issues/SKILL.md` — proposal yaml block (~line 25) and the broadcast-routing sentence after it.
- `docs/guide/setup.md` — "Repo config" bullet list (~lines 41–60).
- `docs/guide/cheat.md` — config check block (~line 24) and common-paths block (~line 95).
- `README.md` — machine-config paragraph (~line 68).
- `src/AREA.md` — Key files and Non-obvious patterns sections.
- `tests/docs-links.test.ts` — link/anchor contract.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `skills/init-issues/SKILL.md`: add `slots` to the proposal yaml as an optional key (commented or marked optional, matching the block's style) and one sentence: on repeat setup preserve a stored `slots` override, and never write the effective merged seats from `akrogon config` into the proposal — `slots` is proposed only when the repo needs a different seat.
- `docs/guide/setup.md`: one bullet in the Repo config list, e.g. `**slots** optionally replaces a machine seat for this repo — a full {harness, model, effort} per seat (a or b); it applies at the next agent start.`
- `docs/guide/cheat.md`: a short example block showing `slots:` in `issues/config.yaml` with the next-start rule in one line.
- `README.md`: extend the machine-config sentence to note a repository may override either seat in `issues/config.yaml`.
- `src/AREA.md`: name `seats` where `src/config.ts` is described (e.g. "resolves registered repositories and merges per-repo seat overrides (`seats`)").

## 5. Do-not, reasons and exceptions

- Do not edit `src/`, `tests/` code or anything under `issues/` — code landed in brief 1; exception: none.
- Do not document field-level merge, per-repo templates or flags — they are foreclosed by the design; exception: none.
- Do not add new sections or files; keep `src/AREA.md` within its four-section 40-line contract; exception: none.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: docs only, locked exclusions stay undocumented, existing file shapes hold; conflicts come back as a mismatch.

## 6. Ordered steps

1. `skills/init-issues/SKILL.md` proposal block + preservation sentence (criterion 1).
2. `docs/guide/setup.md` bullet (criterion 2).
3. `docs/guide/cheat.md` example (criterion 3).
4. `README.md` sentence (criterion 4).
5. `src/AREA.md` resolver mention (criterion 5).
6. Run the section 7 command (criterion 6).

Advisory size: about 5 files and under 20 turns.

## 7. Commands

```sh
bun test tests/docs-links.test.ts
```

Run from the worktree root. This is the targeted docs contract, not the full suite; B runs the full suite separately.

## 8. Done-when, evidence and report

All criteria met with the docs-links test pasted green. Wording is by judgment; only real links and anchors must resolve.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
