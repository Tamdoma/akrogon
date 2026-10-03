# Design: phase-stale-tab

## Binding decisions, verbatim

### Stale tab (issues/chart/door-turn-and-stale-tab/forks/stale-tab.md)
Operator 2026-10-03, verbatim: "1a"

Settled: at both rename sites in src/phase.ts (announceFailed entering `failed`, commitMove leaving `failed`), `phase` tries the rename. When herdr answers with the structured error code `tab_not_found`, it prints one structured warning (slug, command, code, message) and the command finishes with exit 0 if everything else succeeded. Every other herdr error, a notification failure and a log append failure still fail as today. In announceFailed, a missing tab never hides an earlier notification error. `phase` does not recreate tabs or clear `state.tab`; `akrogon next` owns re-allocation.

Reason: the move is already saved, a closed tab needs no label, and `phase && next` must work (#55). Handling only the named code adds no race.
Foreclosed: 1b list tabs first (extra call, list-then-rename race); 1c drop renaming (loses the failed label); 1d keep exit 1 with a note (`phase && next` still breaks).

Excluded: [Peer turn](../../door-peer-turn/peer-turn-wait/design.md) does not apply here.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

No auth, backend, secret, browser flow or chain stage is touched. The behavior is a CLI exit status and saved state, so the cheapest sufficient check is the existing `tests/phase.test.ts` CLI fixtures against the fake herdr. The outside call's `tab_not_found` shape was run for real at charting (readiness.yaml proofs), and the fake already emits that shape. Tests assert exit status, state, log and the warning's code, not its prose.

## Leaf architecture
Owned: `src/phase.ts` (`announceFailed`, `commitMove` tab renames), `tests/phase.test.ts`.
Literal interfaces:
- herdr 0.9.3: `herdr tab rename <tab> <label>` on an unknown tab prints stderr `{"error":{"code":"tab_not_found","message":"tab <tab> not found"},"id":"cli:tab:rename"}`, exit 1.
- `herdrError(result).code` in `src/shell.ts` reads that code from a `CommandError`. `tab_not_found` is not in `retryableCodes`, so `herdrCall` throws it on the first call.
- Warning: one `console.warn(JSON.stringify({...}))` line in the style of `herdrCall`'s retry warning, with `warning`, `slug`, `command`, `code` and `message` from `herdrError(error.result)`, and `stderr`.
Excluded: tab creation and `state.tab` changes (owned by `src/next.ts`); `retryableCodes`; any file under `issues/`.
Dependencies: none.
