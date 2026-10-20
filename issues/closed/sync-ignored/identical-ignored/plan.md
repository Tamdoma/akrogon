# Plan: identical-ignored

Slot A synthesis, `debate: no`, from brief.md and design.md. Design wins over brief on any conflict; none found.

## Decisions

- D1: Equality is raw bytes (`git hash-object --no-filters`) plus same type and executable bit, compared only against an exact incoming-tree blob entry. Locked equality-rule 1a.
- D2: Only an exact incoming `blob` entry qualifies. Replayed paths (`incoming..HEAD`), replayed or incoming ancestors, directory-of-overlaps, gitlinks, non-blob types and any non-equal case keep today's refusal. Locked merged notes.
- D3: `moveCheckout` in `src/self-update.ts` stays unchanged; the exemption lives only in `integrate`'s ignored block. Locked equality-rule 2a.
- D4: No adopted-paths output on success. Locked equality-rule 3a.
- D5: A stat, hash or tree lookup failure propagates as its own error (path plus command context from `CommandError`/`lstatSync`), never folded into the collision refusal. Locked merged notes.
- D6: Incoming mode and blob id come from one `git ls-tree -r -z` over `incoming` (NUL-delimited, no `--name-only`, so mode/type/id/path parse and odd names stay literal). Replayed names keep the existing `git log --format= --name-only --no-renames -z incoming..HEAD`.
- D7: Open-for-plan answers from the merged fork notes: raw bytes (Q1), `moveCheckout` untouched (Q2), no adopted list (Q3), non-ignored untracked files stay out of scope (Q4). The design file contains no remaining `Open for the plan:` lines.

## Read-first

- `docs/reference-index.md` → `src/AREA.md` (command area), `tests/AREA.md` (fixture notes).
- `src/sync.ts` `integrate` ignored block (the owned surface, ~lines 96–123) and `eligibleRecord`.
- `src/self-update.ts` `gitStage` (calls `integrate`, then `moveCheckout`) — consumers, unchanged.
- `tests/sync.test.ts` — `remoteFixture`, `put`, `advance`, `snapshot`, `locksFree`, the ignored-collision matrix for `incoming`/`replay` sources and the odd path `collision [1]* \n`.
- `tests/self-update.test.ts` — `selfUpdateFixture`, `pushSeed`, `captured`, `remoteHead`, `worktreeCount`; the existing differing-ignored behind-only test.
- `tests/helpers.ts` — `fixture`, `cli`.
- `learnings/LESSONS.md` — `2026-10-11-records-sync-working-tree-proof` (verify representative incoming worktree contents alongside HEAD; folded into C1 assertions).
- `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md` (installed path per design).

## Interface

`integrate`'s collision filter keeps its shape and gains one exemption predicate:

- `incomingEntries: Map<abs, {mode, id}>` parsed from `ls-tree -r -z`; `replayed: Set<abs>`; `incomingDirs`/`replayedDirs` = dirname closures of each set.
- A candidate collides when: some `replayedDirs`/`incomingDirs` contains it (it is a directory of an overlap) OR some ancestor of it is in `incomingEntries`/`replayed` OR it is in `replayed` (exact replayed) OR (exact incoming entry AND not identical).
- Identical: `lstatSync` local type/mode — `mode==='120000'` iff `isSymbolicLink()` and `hash-object --stdin` of `readlinkSync(path)` equals the blob id; `mode==='100644'`/`'100755'` iff `isFile()` and owner-exec matches `(mode & 0o100) !== 0` and `git hash-object --no-filters -- <path>` equals the id; every other incoming mode is never identical. All comparisons run before the move; the synchronous `filter` becomes a sequential async loop.
- Only ids travel through the string helpers, never file bytes. Local paths are repo-relative in command args with `--`.

## Files and criteria

Serial-solo: wave 1 holds the test unit (this leaf's proof, committed before product code), wave 2 the product change; one unit per wave, so implement-issue's serial-solo rule applies.

### Wave 1 — tests (owned: `tests/sync.test.ts`, `tests/self-update.test.ts`)

- `sync adopts identical ignored entries from the incoming tree` — regular, exec, symlink, `collision-diff` second equal file, odd `collision [1]* \n`; asserts index mode/id equals incoming `ls-tree`, bytes/link unchanged, `git status` clean. Criterion 1 (sync route).
- `a behind-only move adopts identical ignored entries from the incoming tree` — `collide/file|tool|link` equal via pushSeed, dirty `.gitignore` `collide/`; asserts `deployed` fragment, HEAD==incoming, `ls-files -s` modes/ids, bytes/link/bit unchanged. Criterion 1 (self-update route).
- `sync refuses an ignored entry differing only in <variant>` ×5 — line endings (CRLF local under incoming `.gitattributes: collision text`), exec bit local, exec bit incoming, local-file/incoming-symlink, local-symlink/incoming-file. Criterion 2.
- `sync refuses an identical ignored <X> replayed <Y>` ×3 — equal `collision` replayed `collision`; equal `collision` replayed `collision/file`; equal `collision/file` replayed `collision`. Criterion 3.
- `sync refusing a mixed ignored batch names only the differing path` — equal `collision` plus differing `collision-diff`; refusal lists only `collision-diff`; snapshot unchanged. Criterion 4.
- No shared test resource; prerequisite for wave 2 (red-first ordering).

### Wave 2 — product (owned: `src/sync.ts`, `docs/guide/install.md`)

- `src/sync.ts` `integrate`: switch incoming listing to `ls-tree -r -z`, split `integrated` into `incomingEntries`/`replayed`, add per-dir sets and the identical predicate; refusal message unchanged.
- `docs/guide/install.md` line 45: qualify that *differing* ignored operator paths refuse (identical ones no longer do).

### Docs checklist

- `docs/guide/install.md`: update line 45 refusal wording.
- `src/AREA.md`: no change (no ignored-guard prose).
- `tests/AREA.md`: no change (does not list per-file coverage).
- No other doc names the ignored-path rule.

## Criterion proofs

| Criterion | Observation (boundary, before→after, failure caught) | Proof command | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | CLI `akrogon sync` and in-process `selfUpdate` on real temp repos; ignored path untracked → tracked at incoming blob+mode; catches over-broad refusal and wrong adoption | `akrogon run-check --name c1-sync-adopts -- bun test --timeout=30000 -t 'adopts identical' tests/sync.test.ts`; `akrogon run-check --name c1-self-update-adopts -- bun test --timeout=30000 -t 'adopts identical' tests/self-update.test.ts` | seconds | code/test change to `integrate` or `moveCheckout` |
| 2 | CLI sync refuses before the move; local bytes/mode/type and `snapshot` (HEAD, remote, index) identical; catches false exemption on near-equal | `akrogon run-check --name c2-differs -- bun test --timeout=30000 -t 'differing only' tests/sync.test.ts` | seconds | predicate change |
| 3 | CLI sync refuses on replayed overlaps of an equal path; `snapshot` identical; catches replay-path exemption bug | `akrogon run-check --name c3-replayed -- bun test --timeout=30000 -t 'refuses an identical ignored' tests/sync.test.ts` | seconds | predicate change |
| 4 | CLI sync refuses a mixed batch naming only `collision-diff`; `snapshot` identical; catches all-or-nothing exemption | `akrogon run-check --name c4-mixed -- bun test --timeout=30000 -t 'mixed ignored batch' tests/sync.test.ts` | seconds | predicate change |

## Red evidence recorded at plan.synthesis

- `check c1-sync-adopts: 1` — `Cannot sync over ignored operator paths: collision / collision [1]* \n / collision-diff / collision-link / collision-tool` (`check-c1-sync-adopts-1792430469919-1779281.log`).
- `check c1-self-update-adopts: 1` — `self-update failed: Cannot sync over ignored operator paths: collide/file collide/link collide/tool` (`check-c1-self-update-adopts-1792430481348-1797644.log`).
- `check c4-mixed: 1` — stderr listed `collision` beside `collision-diff` (`check-c4-mixed-1792430493061-1837024.log`).
- `check c2-differs: 0` and `check c3-replayed: 0` — refusal behavior already green at HEAD (assertion fix `isFile()` rerun included; `check-c2-differs-1792430490565-1832478.log`, `check-c3-replayed-1792430492813-1836233.log`).

## Limitations (kept, design-locked)

- An exempted file can change between the hash and the move; the move then overwrites it. No mechanism added.
- Raw equality proves equality with the committed blob; a checkout conversion (`eol`/`text`, `core.autocrlf`, smudge) can write differing bytes afterward. No filter handling added.

## Blockers

None. `env_names: []`, `Missing:` lines absent in `akrogon status identical-ignored`.
