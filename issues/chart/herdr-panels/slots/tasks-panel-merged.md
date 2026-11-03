# Tasks panel: merged notes (A, B, C, D)

## Agreed

- Group by repo, keep the epic/issue folder hierarchy inside each repo; no phase grouping across repos (A,B,C,D).
- Global lines (deploy failed, and per-repo alerts such as Missing, unreadable, slow merge, Unpacked) sit above or on the repo groups, not mixed into leaf rows (A,B,C,D).
- A leaf row: slug, phase, time, plus small tags for stopped, failed, prompt errors, broadcast pending, land, blocked-by, merge-queue place (holder / 2 / no merge record) (A,B,C,D). Two lines per leaf (B,C,D).
- Paused is a mark on the repo header; parked slugs dim at the repo's end (A,B,C,D).
- Repos with no open leaves fold into one line (A,D; B "compact").
- The panel never computes "too long"; akrogon does in `--json` and the panel only paints (A,B,C,D). Slow merge stays the existing verify signal, unchanged (A,B,C,D).
- Today's TIME column is time since the first delivered prompt, not time in the current phase; `--json` needs the phase-entry time to show phase age (A,B,D).
- Old-herdr `tab`/`pane` ids in state.yaml cannot be focused from herdr-app (B,C).
- A window sees only its own session's terminals, so cross-session rows get no jump (A,B,C,D).
- Adding Tasks / Needs-you buttons needs a clone of the shipped `tabs` mod (buttons hardcoded at tabs/main.js:97-98) (A,B,C,D). Each session's `shared.json` `workspace.panels` must gain the new ids or the buttons never render (tabs/main.js:80) (B,C,D).
- A remembered per-space panel choice (Files, Changes, closed) is never overridden (A,B,C,D).
- All registered repos are shown (A,B,C,D). Current space's repo first (A,B,D; C "if cheap").
- `akrogon status` inside a registered repo shows only that repo (status.ts `current` filter); the panel needs an all-repos call (A,B,D).
- Status exits 1 on an unreadable repo; the panel still renders healthy repos and shows the error, never a blank board (B,C,D).
- `--json` is a serialization of the existing scan, with a schema version (B,C) and a generated time (A,B,C,D).

## Measured facts

- `(cd / && akrogon status)`: all 11 repos in 348 ms (D, 2026-11-03).
- akrogon already has a live "too long" judgment: `observeBusy` sends a herdr notification when a seat has been busy past 60 min (`src/next.ts:220,247`, `STALL_MS`) (D; A verified).
- `F_LIMIT_MS` 45 min (`src/timing-report.ts:17`) is a cohort measure over merged leaves for the timing report, not a live per-leaf limit (A, read 2026-11-03; D used it as a live limit).

## Where seats differ

1. When a row turns red.
   - Only what akrogon already judges: failed, stopped, prompt errors, slow merge (A). Add the 60-min seat stall (D's measured fact) under the same rule.
   - New per-repo, per-phase median rule shaped like decideSlow (20 last visits, at least 5, over 1.5x and over +2 min), computed now (C).
   - Same rule, but on recorded active time (waits removed), only after a timing audit proves the sample is sound, and only with operator approval of the policy; until then age only (B).
   - Three rules: seat stall 60 min, leaf total 45 min, phase median (D).
   Shown time: phase age and total separately (B,D asks) vs total only as today (A, unless phase age is wanted).
2. Click, today.
   - Expand inline detail (`status <slug>` contents) plus a "Show changes" button for the leaf's worktree (A).
   - Expand detail with "runs in old herdr" reason; no jump, no folder guessing (B).
   - Jump to a pane in this session whose folder is inside the leaf worktree; prefer an agent pane (C).
   - Jump by folder or tab name if found, and always expand detail with Changes / Files / plan.md buttons (D).
   After the port: akrogon labels each seat terminal (repo/slug, seat) and the click focuses it (A,C,D); with two live seats, show A/B choices (B; D asks).
3. Is Tasks open by default.
   - No; the panel stays closed until clicked, as Files and Changes are today (A,D). D also sets `panel-body` active to `tasks` so the first open shows Tasks.
   - Yes for spaces with no remembered choice; remembered choices kept (B,C).
4. How the panel asks for all repos.
   - Explicit `--all` flag shared by text and JSON (B).
   - `--json` without a slug always scans all repos and reports `current_repo` (D).
   - Panel needs an all-repos mode, form open (A); always all (C).
5. Leaf detail.
   - Separate `akrogon status <slug> --json` on click (A,B).
   - Embedded in the fleet JSON (history, seats, kept) (D).
   - Out of scope now (C).
6. Extra content.
   - Last merges: bounded recent merges (B), last 5 (D); in the original A4 finding (intake "Agent findings"), not in today's status output.
   - Open charts (`--charts`): asked by B and D, optional for C.
   - By-repo / attention toggle (D only).
   - One-click Pack button for Unpacked lines (D asks).

## Probes named

- P1 status parity: fixtures covering every status line kind; JSON keeps every fact text status shows; partial failure keeps healthy repos (B; A done-criterion; C one week of real use).
- P2 timing audit before any phase redness (B).
- P3 navigation after the port: two seats, same slug in two repos, recovered shell, other-session target (B).
- P4 tabs clone memory: localStorage identity after cloning, existing choices kept, every session's `workspace.panels` updated (B,C,D).
- P5 mod `exec("akrogon", ...)` resolves on PATH and fits the exec bridge limits (30 s, 8 MiB, herdr.d.ts:10) (B,C).
