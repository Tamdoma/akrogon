# 2026-10-08 pause-dispatch: prettier drift from bun run format

## Case

While implementing pause-dispatch, every `bun run format` (prettier --write over src, tests and scripts) rewrote the `phaseColor` literal in `src/status.ts`, a file outside two of the three units that ran it. The rewrap is pre-existing drift: base already fails prettier on that line, and the command fixes it as a side effect.

## Evidence

- `git diff` after format showed an unrelated `phaseColor` hunk in `src/status.ts` on three separate runs (U1, U2, final proof).
- Reverting with `git checkout -- src/status.ts` kept each unit diff minimal with no test change; the committed lane stays green.

## Learning

After `bun run format`, inspect `git status` and revert hunks in files the unit does not own instead of committing format drift. The durable fix is one formatting commit for the drifted lines, not piggybacking on feature leaves.
