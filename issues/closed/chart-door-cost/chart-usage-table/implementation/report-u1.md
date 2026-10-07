# Worker report U1 — chart-usage.ts script, tests and fixtures

## Changed files and reasons

- `skills/chart-issues/scripts/chart-usage.ts` — new read-only CLI (D2–D8): parses `<chart>/seats.yaml` with zod, locates claude/codex transcripts under `CLAUDE_CONFIG_DIR`/`CODEX_HOME` homes, measures per-seat usage in `[opened, until]`, writes `USAGE.md`, prints own summary + sibling first lines + `outcome done|partial`.
- `tests/chart-usage.test.ts` — boundary test, peer-wait style (`mkdtempSync`, `Bun.spawn`, env homes).
- `tests/fixtures/chart-usage/claude/claude-A.jsonl`, `codex/rollout-B.jsonl` — real transcripts captured 2026-10-06, all message/tool bodies replaced by `USAGE_LEAK_MARKER`, trimmed to the record types the script reads.
- `tests/fixtures/chart-usage/{claude/claude-A2.jsonl, claude/claude-ops.jsonl, claude/claude-broken.jsonl, codex/codex-diff.jsonl, codex/codex-reset.jsonl, README.md}` — hand-written edge fixtures + provenance README.

## Tests run

- `bun test tests/chart-usage.test.ts` — 9 pass, 0 fail, 108 expects.
- `bun test --changed=$AKROGON_BASE --timeout=30000` (AKROGON_BASE=3ce2085…) — 9 pass, 0 fail.
- `bun test --timeout=30000` full suite — 510 pass, 0 fail.
- `bun run format` (script formatted), `bun run typecheck` — clean.

## Deliberate break

Changed the codex token rule from last-minus-baseline difference to summing each in-window `token_count`. Three tests went red: 'writes USAGE.md, counts transcripts exactly', 'records outside the window are excluded on both sides', 'a codex counter reset marks the seat usage unmeasured and partial' (summing also masks a decrease). Reverted; all 9 green again.

## Interpretation choices inside the brief

- `local-command-stdout` claude user records carry no `isMeta`; I exclude them as operator messages by the `<local-command-stdout>` content prefix (they are local command output, not operator input — excluding them reproduces the reference numbers exactly).
- `cost-state` records carry no `timestamp`; the dollar row is shown only when the session's last timed record falls inside the window.
- Operator-turn output per seat uses only seat letters and numbers; a codex seat's role:"user" records are counted as operator rows only when that codex seat is the chart's first seat (per the literal spec).
- Unknown harness is accepted by the seats schema (string) and reported as a per-seat `usage unmeasured` row, matching D3.

## Known limitations

- Codex transcripts have no per-message usage; a codex seat's operator-span output is computed from cumulative-counter boundaries (per plan notes), not per-message deltas.
- The plan's reference `until` for the live chart sits between 20:15:39 and 20:15:56 (not the stated 20:16:00): at 20:16:00 the fixture counts 152 assistant messages / out 270787, one group more than the reference's 151 / 268671. The script honours any given `until`; U3's live run should use the `until` that matches.
- Split-opening detection is claude `isCompactSummary` inside the first operator span; for codex there is no equivalent marker, so the note is never emitted for codex seats (plan allows noting this limitation).

## Unverified criteria

- Criterion 8 leak-check is pinned by fixtures, not by the live transcripts themselves (fixture bodies are all markers).
- No other criterion left unverified; live-transcript verification against the real sessions is U3's job.
