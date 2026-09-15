# Implementation report: chart-prose

Base: 735cd630afe03fe21b773aafeabdddddc88ca612
Head: f466617dfd65b2326f6d80ac856477e17ddef8c8 (branch chart-prose)

## Changed files and reasons

- `skills/chart-issues/assets/questions.md` — D1: replaced the never-cut sentence with the locked small-round wording.
- `skills/chart-issues/assets/shapes.md` — D2–D5: deleted `## Forks open` block from the CHART template; replaced the correction sentence and appended the open-inventory sentence; replaced the standing-block placeholder with the installed-path placeholder; added `# plan.positions when debate: 'yes'` to the sample phase line; appended the handoff refusal to the preflight paragraph; inserted the write-order sentence before `akrogon status`.
- `skills/chart-issues/assets/standing-design.md` — D4: last line now names the installed-path convention.

One worker (brief-1) applied all edits; all quoted targets matched, no mismatch.

## Commands run

- `AKROGON_BASE=735cd630afe03fe21b773aafeabdddddc88ca612 bun test --changed="$AKROGON_BASE"` — no test file reads these assets; no changed tests.
- Criterion greps (all from worktree root):
  - `grep -n "never cut" skills/chart-issues/assets/questions.md` → empty
  - `grep -rn "Forks open" skills/chart-issues/` → empty; `grep -c "^## Fog$" skills/chart-issues/assets/shapes.md` → 1
  - `grep -n "binding only for the answer it changes" skills/chart-issues/assets/shapes.md` → one line (77)
  - `grep -n "verbatim into each leaf design" skills/chart-issues/assets/standing-design.md` → empty; `grep -n "installed path"` → one line each in shapes.md (139) and standing-design.md (13)
  - `grep -n "before state.yaml" skills/chart-issues/assets/shapes.md` → one line (167); `grep -n "plan.positions when debate"` → sample phase line (149)
  - `git diff origin/main --stat` → only the three files under `skills/chart-issues/`
- `bun test` → 217 pass, 0 fail
- `bun run typecheck` → clean
- `bun run format` → clean, no changes

## Known limitations

Charts already written under `issues/chart/*` keep their Forks open sections and copied standing blocks; excluded by design, not retrofitted.

## Unverified criteria

None.
