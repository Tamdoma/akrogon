# Implementation report: chart-usage-table

Base: 3ce20853c64d843d97a1ebe0fbef335958ac0dff · Head: 4a56324 · Landed commits: a6e4d47 (U1), 4a56324 (U2, cherry-picked from f056158).

## Changed files and reasons

- `skills/chart-issues/scripts/chart-usage.ts` (new, U1) — read-only CLI: parses `<chart>/seats.yaml` (zod, via `Bun.YAML.parse`), locates claude transcripts under `CLAUDE_CONFIG_DIR|~/.claude` and codex under `CODEX_HOME|~/.codex`, measures `[opened, until]`, writes `USAGE.md`, prints own summary + sibling `USAGE.md` first lines + `outcome done|partial`; non-zero exit only on missing chart folder or absent/unparseable `seats.yaml`.
- `tests/chart-usage.test.ts` (new, U1) — 9 boundary tests, peer-wait harness pattern.
- `tests/fixtures/chart-usage/**` (new, U1) — two real transcripts captured 2026-10-06 (claude 2.1.291, codex-cli 0.160.1) with all bodies replaced by `USAGE_LEAK_MARKER`, plus hand-written edge fixtures; provenance in `README.md`.
- `skills/chart-issues/SKILL.md` (U2) — Open: seat-record rules (open time, pane/harness/session from `herdr agent list`, append on session-id change, outside-herdr form, nothing new asked); Take: `restatements` increment + Taken restatement sentence; Handoff: run before review, show printed lines, continue on `outcome partial`, rerun on `Handed off`/`Held`/`Closed`.
- `skills/chart-issues/assets/shapes.md` (U2) — `seats.yaml`/`USAGE.md` in the chart records tree; new `### seats.yaml` section.
- `docs/guide/chart.md` (U2) — same two records + stated-limit sentences and turn/operator-wait definitions.
- `docs/guide/files.md` — read; holds no chart-files list (leaf artifacts only), so unchanged.

`src/` and `issues/` unchanged on the branch.

## Commands run

- `bun test --changed=$AKROGON_BASE --timeout=30000` — 9 pass / 0 fail after each cherry-pick.
- `bun test tests/chart-usage.test.ts` — 9 pass, 108 expects.
- `bun test --timeout=30000` — 510 pass / 0 fail (~26 s).
- `bun run typecheck` — clean.
- `bun run format` — all unchanged.
- Deliberate break (U1): codex counters summed instead of differenced → 3 tests red; reverted, all green.
- Live run (criterion 10): `bun skills/chart-issues/scripts/chart-usage.ts <tmp>/chart-cost 2026-10-06T20:16:00Z` on a temp chart outside the repo with the three design sessions — exit 0, `outcome done`, `USAGE.md` written (artifact: `$TMPDIR/live-chart/chart-cost/USAGE.md`).

## Criterion evidence

1–3, 8, 9 (prose) — SKILL.md/shapes.md/chart.md diffs carry the required rules and verbatim labels; `files.md` reported no hit.
2, 5, 6, 7 — `tests/chart-usage.test.ts` green (exact counting, window exclusion, counter-reset → unmeasured, unmeasured-file/field rows, no-leak marker, exit codes, rerun-replaces, sibling summaries).
4 — grep over the four owned files: no model/effort/price/rate literal (model/effort appear only as transcript-read values).
10 — see below.
11 — `bun test` 510/510; `src/`/`issues/` untouched.

## Live run vs reference totals

- C `14a11404…`: 116 assistant messages / out 111,968 / in 250 / cr 14,434,644 / cw 336,356 — exact.
- B `01a10f8a…`: 19 turns / in 12,716,484 / cached 12,255,616 / out 49,427 / reasoning 9,681 — exact.
- A `1ce71920…` at `until` 20:16:00Z: 152 messages / out 270,787 / in 326 / cr 19,768,778 / cw 638,581. Difference vs reference: exactly one `assistant` record group timestamped 20:15:56.224Z — the record class is an assistant message the door's own measurement pass emitted after the hand count was taken but before the stated window end. Corroborating run at `until` 20:15:50Z reproduces the reference exactly: 151 / 268,671 / 324 / 19,653,997 / 635,593.
- All three transcripts present on disk at run time. A's session is still open so no whole-session dollar row — consistent with the criteria (dollar figure only for an ended claude session).
- Observed extra: one `operator turns` row marked `incomplete` (operator message at 17:41:12Z with no reply before the next message) — the labelled-incomplete behavior working on real data.

## Known limitations

- Codex operator-span output comes from cumulative-counter boundaries, not per-message deltas (no per-message usage exists).
- Split-opening detection (`isCompactSummary`) is claude-only; codex emits no such marker, so the not-whole-map-cost note never appears for codex seats.
- `<local-command-stdout>` user records carry no `isMeta`; excluded as operator messages by content prefix (verified: this exclusion is what reproduces the reference totals).
- `cost-state` records carry no `timestamp`; the whole-session dollar row shows when the session's last timed record is in-window.
- Leak check (criterion 7) is pinned by fixtures; live-run output inspected clean (ids/times/numbers/model-effort only).

## Unverified criteria

None beyond the stated limitations; every criterion has a green proof above.
