# Stale tab

## Question
Q1. When `akrogon phase` has saved a move and the leaf's recorded herdr tab no longer exists, how does the command treat the tab rename, at both rename sites (entering and leaving `failed`)?

### Carries
- `akrogon next` owns tab re-allocation (src/next.ts:327-333, :388-394). phase does not recreate tabs (A,B).
- Related: [peer-turn](peer-turn.md) (independent).

## Findings
- Evidence and probe: see INTAKE.md Agent findings (#55).
- Disagreement: A proposes listing live tabs and renaming only a live recorded tab. B proposes renaming and treating only a structured `tab_not_found` as an absent tab with a structured warning, other herdr, notification and log failures still failing; B notes list-first has a close-between-list-and-rename race.

## Taken
Operator 2026-10-03, verbatim: "1a"

Settled: at both rename sites in src/phase.ts (announceFailed entering `failed`, commitMove leaving `failed`), `phase` tries the rename. When herdr answers with the structured error code `tab_not_found`, it prints one structured warning (slug, command, code, message) and the command finishes with exit 0 if everything else succeeded. Every other herdr error, a notification failure and a log append failure still fail as today. In announceFailed, a missing tab never hides an earlier notification error. `phase` does not recreate tabs or clear `state.tab`; `akrogon next` owns re-allocation.

Reason: the move is already saved, a closed tab needs no label, and `phase && next` must work (#55). Handling only the named code adds no race.
Foreclosed: 1b list tabs first (extra call, list-then-rename race); 1c drop renaming (loses the failed label); 1d keep exit 1 with a note (`phase && next` still breaks).
