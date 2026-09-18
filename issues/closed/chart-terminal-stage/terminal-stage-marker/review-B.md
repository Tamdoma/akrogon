# Review B: terminal-stage-marker

Base: `b538c238ba374fe2adf9bb1e23e5b0b77cc93d35`
Reviewed head: `2edea9ca09c2073b5aac72a73a91b1d6d977759e` on `terminal-stage-marker`
Diff: 4 files, +58/-3. No `issues/` paths on the branch; worktree clean.

## Verification evidence

- `src/status.ts:247-251` — `markdown.match(/^(Handed off|Closed|Held)\b/gm)?.at(-1)?.toLowerCase() ?? (files.length + fog > 0 ? 'charting' : 'empty')`. Line-start anchor, word boundary, last match wins, fallback untouched. Matches D1/D2 and criterion 1.
- `tests/status.test.ts` new test uses real fixture repos and the real `src/akrogon.ts` entrypoint — no stubbed reader, satisfying the design's end-to-end line. Assertions are on the STAGE column value (fixed vocabulary), not prose.
- Criteria coverage: 2 (`trailing`), 3 both orders (`forward`/`backward`), 4 (`buried` reads `empty` — marker mid-line ignored), 5 (`shuttered` reads `closed` with retained fork), 6 (multi-folder plus single `issues/chart/CHART.md` → `held`).
- `skills/chart-issues/SKILL.md:57` and `assets/shapes.md:33` both state the four contract facts: three markers, `<YYYY-MM-DD>`, own line, last-wins. Grep confirms no other file under `skills/`, `docs/`, `README.md` or `plugin/` names `Handed off` — the two edited sentences are the only contract sites, as the design claimed.
- Evidence artifact `.evidence/terminal-stage-marker/status-charts.txt` exists and shows all five stages from a real `status --charts` run (criterion 8).
- Report complete: base/head, commands with pasted results, limitations, no unverified criteria. Framework `Closed` markers verified present (`hooks-test-isolation`, `legacy-lifecycle-residue`).
- Checks (from implement pass, diff unchanged since): `bun run format`, `bun run typecheck`, `bun test` 218 pass. No AREA.md in the diff; no doc page states the stage vocabulary.

## Findings

None.

## Verdict

ready
