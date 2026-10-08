# Review A: door-seat-capture

Base: `1c3a1ca08e1039f0061be4b7cae6826c5226a81e`. Reviewed head: `e5e6775`. Diff: 3 files, prose only.

## Criterion verification

- **Criterion 1 (shapes.md): PASS.** Both index templates (lines 111, 123) show the verbatim `slots:` front matter; the amended contract sentence (line 132) permits `slots:` as configuration. Probed the documented block through the real `indexSchema`/`slotConfigSchema` in `src/config.ts:12-21`: parses `{a,b}`, rejects an extra key, decodes `model: 'opus'` to `opus`. Resolution order and `---`-first-line detection match `indexSlots`/`indexSeats` (lines 84-88, 99-148). Write order before any leaf `state.yaml` and the no-seat-field rule are stated.
- **Criterion 2 (SKILL.md Handoff): PASS.** Line 67 adds the rule in the `debate`-election sentence style: asked at the handoff review only when intake, map or a leaf design names model-sensitive work; default writes no block; answer goes into the operator's chosen owner index (`ISSUE.md`/`EPIC.md`) before any leaf `state.yaml`; the review lists each leaf's effective seats. All four required elements present.
- **Criterion 3 (chart.md + restatement stability): PASS.** Line 209 adds one sentence mentioning the seat question. `grep -n restatement` output diffed against base `1c3a1ca` for all four matching files (SKILL.md, questions.md, shapes.md, chart-usage.ts): byte-identical, including line numbers 126/130/138 in shapes.md. `git diff` touches only the three owned files; no other skill or doc changed.
- **Blocking checks green** at the content-identical earlier head (format: unchanged; typecheck: exit 0; `bun test`: 533 pass / 0 fail). The only later commit is a whitespace revert in shapes.md — no code, no rerun needed.

## Cross-checks

- Grep for stale referents: "Container indexes" and "lifecycle state" appear only in shapes.md. `docs/guide/files.md` and `docs/guide/cheat.md` already document the same shape/resolution — consistent and correctly unchanged per criterion 3.
- No AREA.md in the diff; no documented behavior outside the owned pages changed (the door's seat rule is new prose documenting new handoff behavior).
- No test files touched; no `Test-Change:` trailers required. `learnings` not review input.

## Nits

- **N1 — whitespace tightening in shapes.md.** Blank lines between paragraphs and code fences were removed to keep `grep -n restatement` output at base line numbers. Renders identically; deferred because criterion 3's "stays as it is" was satisfied literally at zero functional cost. Promotes to a Fix only if a maintainer reads criterion 3 as content-only and restores spacing.
- **N2 — commit/revert pair in history.** `a4d5e08` + `e5e6775` net to zero; recorded for transparency, deferred because rewriting the branch post-review is worse than two small commits.

## Verdict

`nits` — no Fixes; all done-criteria proven on the reviewed head.
