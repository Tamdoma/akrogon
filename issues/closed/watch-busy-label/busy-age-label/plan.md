# Plan: busy-age-label

Direct synthesis by slot B. State is `plan.synthesis`, `debate: no`. No positions or rebuttals exist or are required. Sources: `brief.md`, `design.md`, live `observe.ts`, `observe.test.ts`, `SKILL.md`, `src/next.ts`, `docs/reference-index.md`, `skills/AREA.md`, `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md`. Brief and design agree; no conflict note needed.

## Decisions

### D1. Label the existing age as busy time in `ageSuffix` only
Change `ageSuffix` in `skills/watch-issues/scripts/observe.ts:207-215` to return ` busy=<h>h<mm>m` (leading space) instead of `+<h>h<mm>m`. Keep `formatLeaf` concatenation unchanged: `A=${pane}/${status}${age}` then renders `A=pane/status busy=1h40m`. No change to `busy_since`, `busy_notified`, or `src/next.ts`.

### D2. Keep edge behavior identical
`undefined` returns `''` (no suffix). Unparsable date returns `''`. Future date clamps to zero and returns ` busy=0h00m`. This matches today's `+0h00m`/empty behavior with only the label changed.

### D3. Update the documented line format in one place
Change `skills/watch-issues/SKILL.md:28` tokens from `A=<pane|->/<status|->[+HhMMm] B=<pane|->/<status|->[+HhMMm]` to `A=<pane|->/<status|->[ busy=HhMMm] B=<pane|->/<status|->[ busy=HhMMm]`. Live grep confirms no other file copies this format string.

### D4. Prove with the observer test file plus one saved end-to-end run
Update the two `+0h00m` expectations in `observe.test.ts:128-129` to ` busy=0h00m`, and add explicit unparsable and future `busy_since` line assertions. Run `observe.test.ts` by explicit path because `bunfig.toml` sets `root = "tests"` so plain `bun test` skips it. Run the observer script once against a fixture repo with one busy seat, save stdout to a file under the OS temp dir, and record that path in the implementation report.

## Read-first list

- `skills/watch-issues/scripts/observe.ts` (ageSuffix, formatLeaf, CLI contract)
- `skills/watch-issues/scripts/observe.test.ts` (stub pattern to copy for new cases)
- `skills/watch-issues/SKILL.md` (line 28 format, Observe section)
- `src/next.ts` observeBusy (why busy_since spans working and blocked; read-only)
- `docs/reference-index.md`, `skills/AREA.md`, `src/AREA.md`, `tests/AREA.md`
- `learnings/LESSONS.md` (2026-09-11-stale-rule-in-docs: grep docs for changed rule; 2026-09-10-review-by-reading: run the script, do not only read)

## Needed interfaces

- `ageSuffix(value: string | undefined, now: number): string` in `observe.ts` — only signature changed in behavior, not in type.
- `formatLeaf(leaf, statuses, now): string` — unchanged, relies on leading space in D1.
- CLI: `bun skills/watch-issues/scripts/observe.ts <root>` with `OBSERVE_AKROGON` and `OBSERVE_HERDR` stub overrides for tests only.
- Credentials: none. Brief and design name no variable, so no `.env` presence check applies.

## Acceptance criteria

1. Seat with `busy_since` set prints ` busy=<h>h<mm>m` after the status (for example `A=pane-a/blocked busy=1h40m` when `busy_since` is 1h40m ago); seat without it appends nothing.
2. Unparsable `busy_since` prints no suffix; future `busy_since` prints ` busy=0h00m`.
3. `skills/watch-issues/SKILL.md:28` shows the `[ busy=HhMMm]` tokens.
4. One observer run against a fixture repo with one busy seat prints the new line; stdout is saved under the OS temp dir and the report records that path.
5. Configured checks pass: `bun run format`, `bun test`, `bun run typecheck`.

## Execution checklist

- [ ] 1. Edit `skills/watch-issues/scripts/observe.ts` ageSuffix return to `` ` busy=${h}h${String(m).padStart(2, '0')}m` ``. Covers criteria 1, 2.
- [ ] 2. Update `skills/watch-issues/scripts/observe.test.ts:128-129` to ` busy=0h00m`; add one test with `busy_since: "not-a-date"` expecting no suffix and one with a future ISO date expecting ` busy=0h00m`. Covers criteria 1, 2.
- [ ] 3. Edit `skills/watch-issues/SKILL.md:28` format line per D3. Covers criterion 3.
- [ ] 4. Agent doc affected: `skills/watch-issues/SKILL.md:28` format line updated to the busy label.
- [ ] 5. Human docs affected: none; `docs/guide/*` mentions watch-issues but copies no format string (verified by grep).
- [ ] 6. End-to-end run: build temp fixture repo with one busy seat, run observer script, save output to `$TMPDIR/observe-busy-*.txt`. Covers criterion 4.
- [ ] 7. Run `bun test skills/watch-issues/scripts/observe.test.ts`, then `bun test`, `bun run typecheck`, `bun run format`. Covers criterion 5 plus the skills test the default suite skips.

## Concrete verification

```bash
bun test skills/watch-issues/scripts/observe.test.ts
bun test
bun run typecheck
bun run format
git diff --check
grep -rn "HhMMm" skills docs src tests
```

End-to-end uses the existing test stub pattern: temp root with `issues/open/owner/e2e-leaf/state.yaml` holding `busy_since` 1h40m in the past and a working pane, stub `akrogon` printing `repo: testrepo`, stub `herdr` printing the agent list, then `bun skills/watch-issues/scripts/observe.ts <root> | tee "$TMPDIR/observe-busy-$(date +%s).txt"`. Expected line contains `A=<pane>/working busy=1h40m`.

## Open limitation

`busy=` is still total time since `busy_since`, which spans working and blocked. The label stops the misread but does not add per-status timing; that is the foreclosed option B in the design.

## Dependencies

None. `blocked-by` is empty and all edits are in one skill folder.
