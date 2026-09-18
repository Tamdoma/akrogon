# Implementation report: terminal-stage-marker

Base: `b538c238ba374fe2adf9bb1e23e5b0b77cc93d35`
Head: `2edea9c` on branch `terminal-stage-marker` — "status --charts: three terminal markers, last line wins"

## Changed files and reasons

- `src/status.ts` — `chartRow` stage expression (line 247) replaced the one-marker `/^Handed off\b/m` test with a last-match scan over `/^(Handed off|Closed|Held)\b/gm`; the last matched word lowercased is the stage, falling through to the unchanged `files.length + fog > 0 ? 'charting' : 'empty'` rule. Criteria 1, 3; decisions D1, D2.
- `tests/status.test.ts` — new test `--charts derives stage from last terminal marker line` beside the existing `--charts` case: five multi-folder fixture charts (`trailing`, `forward`, `backward`, `buried`, `shuttered`) plus a single `issues/chart/CHART.md` case. Criteria 2-6; decision D6.
- `skills/chart-issues/SKILL.md` — handoff append sentence now names all three markers with `<YYYY-MM-DD>` shape, own-line requirement and last-wins. Criterion 7; decision D4.
- `skills/chart-issues/assets/shapes.md` — same contract added to the handoff paragraph. Criterion 7; decision D4.

## Commands run

- `bun test --changed="$AKROGON_BASE"` (AKROGON_BASE=`b538c238ba374fe2adf9bb1e23e5b0b77cc93d35`), worker 1, red before the `src/status.ts` edit:
  - `(fail) --charts derives stage from last terminal marker line` — `backward` chart read `handed off` instead of `held` (criterion 3 fail-first); a real CLI run showed `shuttered 0/1 0 charting` for `Closed` with a retained fork (criterion 5 fail-first).
- `bun test --changed="$AKROGON_BASE"`, worker 1, green after: `16 pass, 0 fail, 238 expect() calls` in `tests/status.test.ts`.
- `bun test --changed="$AKROGON_BASE"`, worker 2: selected `tests/status.test.ts` (reader change), `16 pass, 0 fail`.
- Evidence run (criterion 8): scratch `AKROGON_HOME` + fixture repo (`issues/config.yaml`, five charts) → `AKROGON_HOME=<scratch> bun src/akrogon.ts status --charts`, exit 0:

  ```
  fixture
    CHART   TAKEN  FOG  STAGE       AGE
    active  0/0    1    charting    0m
    blank   0/0    0    empty       0m
    handed  0/0    0    handed off  0m
    paused  0/0    0    held        0m
    shut    0/0    0    closed      0m
  ```

  Artifact: `.evidence/terminal-stage-marker/status-charts.txt` (gitignored evidence directory).
- `bun run format` — reformatted `src/status.ts` and `tests/status.test.ts` (line wrapping only).
- `bun run typecheck` — `tsc --noEmit`, clean.
- `bun test` (full suite, after all units): `218 pass, 0 fail, 2874 expect() calls` across 12 files.

## Known limitations

- A chart cannot return to `charting` via marker; reopening is an operator edit under `issues/`, outside this leaf (locked design Q2).
- AGE stays CHART.md mtime; writing a marker resets it — accepted per design.
- The two live framework CHART.md files were already normalized by the door agent on main; verified `Closed` markers present at `framework/issues/chart/hooks-test-isolation/CHART.md:18` and `legacy-lifecycle-residue/CHART.md:21`.

## Unverified criteria

None. All nine done-criteria verified: 1-6 by the new test and evidence run, 7 by both skill files stating the four contract facts, 8 by the captured artifact above, 9 by green format/typecheck/full suite.

## Worker returns

- Worker 1 (brief-1, `src/status.ts` + tests): report complete, red/green evidence pasted above, no limitations, no unverified criteria.
- Worker 2 (brief-2, skill files): report complete, changed-test run pasted, no limitations, no unverified criteria.
