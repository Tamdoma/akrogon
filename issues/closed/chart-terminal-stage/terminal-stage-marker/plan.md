# Plan: terminal-stage-marker

Debate off (`debate: "no"`); synthesized directly from brief and design. Brief and design agree; no conflicts to carry.

## Decisions

- **D1. Stage vocabulary is exactly five words.** `chartRow` emits `handed off`, `closed`, `held`, `charting`, `empty`. No fourth marker, no collapsed terminal word (design Q1, Q2).
- **D2. One last-match scan replaces the boolean test.** `src/status.ts:247` becomes a scan for the last line matching `^(Handed off|Closed|Held)\b` (multiline, anchored at line start, word boundary). The matched word lowercased is the stage; no match falls through to the unchanged `files.length + fog > 0 ? 'charting' : 'empty'` rule. Trailing text after the marker stays permitted.
- **D3. No return-to-charting path.** Any recognized marker beats the fork-count fallback. Reopening a terminated chart is an operator edit under `issues/`, outside this leaf; the implementer invents no marker for it (design Q2 correction).
- **D4. Writer contract states all three markers.** `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/shapes.md` name `Handed off`, `Closed`, `Held` with `<YYYY-MM-DD>` date shape, require the marker to begin its own line, and state the last marker in the file is authoritative. Marker-writing sentences only; no other skill text changes.
- **D5. Evidence artifact under `.evidence/terminal-stage-marker/`.** A real `akrogon status --charts` run against a scratch fixture repo holding one chart per stage is captured there and its path named in the implementation report (brief criterion 8, design standing-design line). `.evidence/` is already gitignored; nothing under `issues/` is touched.
- **D6. Tests sit beside the existing chart cases.** `tests/status.test.ts` after the `--charts` test at ~line 460, using `fixture()`/`cli()` with real CHART.md files on disk; no stubbed reader (design end-to-end line).

## Read-first

- `src/status.ts` — `chartRow` (line 239), `chartRows` (251), `section` (229). Only the stage expression changes.
- `tests/status.test.ts` — existing `--charts` test (460-482) is the pattern to copy: fixture repo, `mkdirSync`/`writeFileSync` charts, row regex assertions.
- `tests/helpers.ts` — `fixture()` writes `issues/config.yaml` and registers `repo`; `cli(f, ['status','--charts'])` runs the real entrypoint.
- `skills/chart-issues/SKILL.md:57` and `skills/chart-issues/assets/shapes.md:33` — the two `Handed off <date>` sentences being generalized.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md` — grounding; no doc page states the stage vocabulary (`docs/guide/cheat.html:76`, `in-practice.html:76` name the column generically), so no doc change.
- `learnings/LESSONS.md` — no line binds this leaf; the 2026-09-13 `AKROGON_HOME=<scratch>` lesson supports the evidence-run approach.

## Needed interfaces

None new. `chartRow` keeps its signature; the STAGE column keeps its position. The marker regex shape `^<Word>\b` multiline matches the existing `^Handed off\b` contract.

## Ordered checklist

- [ ] `src/status.ts:247` — replace `/^Handed off\b/m.test(markdown) ? 'handed off' : ...` with a last-match scan over `/^(Handed off|Closed|Held)\b/gm`; stage is the last match lowercased, else the existing fork/fog fallback. Criteria 1, 3.
- [ ] `tests/status.test.ts` — add cases beside the existing chart test:
  - `Handed off 2026-09-11 into ...` with trailing text reads `handed off` (criterion 2).
  - `Held 2026-09-15: ...` then a later `Handed off 2026-09-17` reads `handed off`; reversed order reads `held` (criterion 3).
  - Marker word not at line start (e.g. inside an `## Off route` bullet) does not change stage (criterion 4).
  - `Closed 2026-09-12: ...` with retained fork files reads `closed`, not `charting` (criterion 5).
  - Multi-folder layout plus one single `issues/chart/CHART.md` case resolve stage through the same path (criterion 6).
- [ ] `skills/chart-issues/SKILL.md:57` — generalize the append sentence to the three markers, `<YYYY-MM-DD>` shape, own-line requirement, last-wins rule (criterion 7).
- [ ] `skills/chart-issues/assets/shapes.md:33` — same contract in the handoff paragraph (criterion 7).
- [ ] Evidence run — scratch `AKROGON_HOME` with a fixture repo (`issues/config.yaml` present) holding one chart per stage; capture `akrogon status --charts` output to `.evidence/terminal-stage-marker/` and name the path in the report (criterion 8).
- [ ] `bun run format`, `bun run typecheck`, `bun test` pass (criterion 9).

## Verification

- `bun test tests/status.test.ts` exercises `chartRow` against real CHART.md fixtures end to end — this is the design's end-to-end requirement.
- Evidence command (criterion 8): create a scratch home, register a fixture repo with five charts (`handed off`, `closed`, `held`, `charting`, `empty`), run `AKROGON_HOME=<scratch> bun src/akrogon.ts status --charts` from the worktree, tee output to `.evidence/terminal-stage-marker/status-charts.txt`.
- Blocking checks: `bun run format`, `bun run typecheck`, `bun test`.

## Notes and limitations

- AGE stays CHART.md mtime; writing a marker resets it — accepted, not a defect.
- The two live framework CHART.md files were already normalized by the door agent on main (verified: `Closed` markers present); no leaf owns `issues/` edits.
- Open limitation preserved: a chart cannot return to `charting` via marker; that is an operator edit outside this leaf.
- No dependencies; this leaf runs alone.

## Implementation notes

2026-09-18, constraints not in the plan text:

- Evidence directory resolves to `.evidence/terminal-stage-marker/` at the worktree root, matching prior leaves (`repo-cap`, `docs-shell`); `.evidence/` is gitignored. Refines D5.
- The evidence fixture repo needs only `issues/config.yaml` (empty object parses `repoSchema`, all fields defaulted) plus `issues/chart/<name>/CHART.md` per chart; `issues/open` and `log.jsonl` may be absent (`scanRepo` guards both). Run `bun src/akrogon.ts status --charts` with `AKROGON_HOME=<scratch>` whose `config.yaml` registers the fixture repo and satisfies `globalSchema` (`slots`, `harnesses`). Refines D5.
- `test_changed` resolves to `bun test --changed="b538c238ba374fe2adf9bb1e23e5b0b77cc93d35"` (AKROGON_BASE from `akrogon config`).
- Evidence capture is a verification step run by B after workers land, not a delegated unit.
