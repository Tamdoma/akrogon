# Plan: folder-pack

Debate off (`debate: "no"`): this plan derives directly from brief.md and design.md.

## Decisions

- D1 — Command surface. New module `src/pack-command.ts` exports `packCommand(args: string[], cwd: string): Promise<number>`; a `case 'pack'` in `src/akrogon.ts` resolves `requireRepo(readGlobal(), process.cwd())` and sets `process.exitCode` to the result. Each argument is `realpathSync`-resolved and must equal `resolve(repo.root, 'issues/closed/<one segment>')` or `resolve(repo.root, 'issues/chart/<one segment>')` (chart packs `<chart>/direct`). Every other argument — open or parked owners, `issues/` itself, paths outside `repo.root`, a worktree's `issues/` copy, non-existent paths — is refused by name with a message naming both accepted forms. A worktree checkout's `issues/` copy resolves under the worktree root, never `repo.root`, so it is refused.
- D2 — `.closing` for the command. Written on the argument folder (`<chart>` or `issues/closed/<owner>`) before `packFolder`, removed on success. An existing `.closing` at entry is a retry and proceeds. A failure leaves it; the command exits non-zero naming the folder and its `.closing`. `packFolder` itself is unchanged (close-pack's surface: `src/pack.ts` `packFolder(repo, folder, cwd)`).
- D3 — Closed-owner tracked check, run before writing `.closing` so a refusal leaves no marker. At `cwd = repo.root`, all via the `run` helper in `src/shell.ts` (run never carries log bytes — it decodes and trims stdout; paths are NUL-split):
  - tracked set: `git ls-files -z -- issues/closed/<owner>` filtered to `*.log`;
  - modified: `git ls-files -z --modified -- issues/closed/<owner>` minus `git ls-files -z --deleted -- issues/closed/<owner>` → refuse the owner naming the path;
  - missing (`--deleted`): accepted only when the archive `issues/closed/<owner>/evidence.tar.zst` holds that member (name = path relative to the owner dir) and a locally computed git blob oid (`<algo>` from `git rev-parse --show-object-format`, `new Bun.CryptoHasher(algo).update('blob <len>\0' + bytes)` over the raw member bytes, never decoded as text) equals the indexed oid from `git ls-files -s -z -- issues/closed/<owner>`; else refuse naming the path;
  - untracked = disk `*.log` set (same recursive glob as `packFolder`, files only) minus tracked — packed alongside, counted apart, never from `git ls-files --others --exclude-standard` (it hides ignored chart logs);
  - a tracked path that is a symlink on disk counts as modified-ish and is refused by `packFolder`'s own symlink error; the pre-check counts it under modified-or-missing naturally.
- D4 — Per-folder output. After packing a closed owner, print `packed issues/closed/<owner>: <n> packed (<t> tracked, <u> untracked), <d> deleted`; a chart prints `packed issues/chart/<chart>: <n> packed, <d> deleted`. With several folders each is attempted on its own; after all folders, exit non-zero naming every refused folder when any failed.
- D5 — Status listing. In `statusCommand` (src/status.ts), after the `Missing:` loop and before the per-repo table, print one line per entry with the new `Unpacked:` prefix (readers of plain status — watch-issues paused detection and the shapes.md human validation — do not parse `Failed:`/`Missing:` prefixes, so a new prefix touches nothing):
  - each `issues/closed/<owner>` holding any `*.log` entry (same recursive glob as the pack, `dot:true`, non-directory entries) → `Unpacked: issues/closed/<owner>: run akrogon pack issues/closed/<owner>`;
  - each chart whose last marker is `Handed off`/`Closed`/`Held` and whose `direct/` holds such a log → `Unpacked: issues/chart/<chart>: run akrogon pack issues/chart/<chart>`;
  - each `issues/closed/<owner>` or chart folder holding `.closing` → same line;
  - each `issues/open/<owner>` holding `.closing` → `Unpacked: issues/open/<owner>: run akrogon next <slug>` with `<slug>` = a `merged` leaf under the owner (first by `leavesUnder` order; first leaf when none is merged, completing the record so a retry can run).
- D6 — Marker helper. Extract the last-terminal-marker match out of `chartRow` into an exported `lastChartStage(markdown)`-level helper `endedChart(folder)` (or return the marker) in `src/status.ts`, used by both `chartRow` and the status scan. Answers the design's open question: yes, extract — the scan needs the same "ended" test and duplicating the regex invites drift.
- D7 — Other readers of plain status: none. watch-issues checks the repo pause mark; skills read `Missing:` only on `akrogon status <slug>`. No doc or script parses prefix lines. (Design's second open question, answered.)
- D8 — Skill step. In `skills/chart-issues/SKILL.md` the marker paragraph (today :85) gains the pack step — run `akrogon pack <chart>` before appending `Handed off`, `Closed` or `Held` when `<chart>/direct` holds a log — and the same clause lands at the `Closed <date>` landing step (:114) and the `Held <date>` abandon step (:121).
- D9 — Docs. `src/AREA.md` gains a `src/pack-command.ts` key-file line; `docs/guide/files.md` line ~53 gains one clause naming `akrogon pack` for closed owners and chart `direct/` folders. `tests/AREA.md` gains a `tests/folder-pack.test.ts` line.
- D10 — Test placement. Criterion tests live in a new `tests/folder-pack.test.ts` (command tests, reusing `fixture`/`cli`/`leaf`/`writeLog`-style helpers locally) plus added cases in `tests/status.test.ts` (status lines) and `tests/docs-links.test.ts` (SKILL.md pack-step ordering, alongside the existing "docs and skills name" content test pattern). The `contracts` map in `tests/command-reference.test.ts` gains `pack: '<folder>...'` — it is the argument contract the row test enforces, not a criterion test.
- D11 — Brief/design disagreement, none. Design item 6 says `akrogon pack <folder>` for every `.closing`; the brief narrows open owners to `akrogon next <slug>` for a merged leaf — the design's own leaf-architecture paragraph confirms the `next` naming, so both read the same way: closed owners and charts name `pack`, open owners name `next`.
- D12 — Excluded. Migration run (design item 7: sync, init ignores, `akrogon pack` over listed folders, flaky diff, slots-scrap deletion, final sync) is the chart door's step on main after this leaf lands, not implemented here; recorded as its chart Pending step. The 13 unresolving receipt paths stay unedited (design item 8).

## Read-first

- `src/pack.ts` — shared `packFolder` (glob set, union merge, resolver verification, symlink refusal); do not modify.
- `src/evidence.ts` — `locate`/`readMember`/`readLog`: member resolution the pack verifies through and `akrogon log` reads through.
- `src/status.ts` — `statusCommand` Failed/Missing loops, `chartRow`/`chartRows` marker match (`/^(Handed off|Closed|Held)\b/gm` last = stage), `issueFolders`, `leavesUnder`.
- `src/akrogon.ts` — verb options map, switch, usage string.
- `src/config.ts` — `requireRepo`, `within`, `expandPath`; `src/shell.ts` — `run`.
- `src/state.ts` `leavesUnder` — merged-leaf slug lookup for open `.closing`.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `fakeAkrogon`, `yaml`; `tests/close-pack.test.ts` — archive-members/`logPaths`/`writeLog` helpers to mirror.
- `tests/status.test.ts` — `register` helper, prefix-line assertions; `tests/docs-links.test.ts` — skill content test pattern; `tests/command-reference.test.ts` — `contracts`.
- `skills/chart-issues/SKILL.md` :85, :114, :121 — end-marker append sites.
- `README.md` command table; `docs/guide/files.md` :53; `src/AREA.md`; `tests/AREA.md`.
- Design proofs recorded in `readiness.yaml`: `git ls-files -z` listing shapes; blob-oid equality (`existing-backlog`); `Bun.Archive` + zstd level 19 round trip (`evidence-location`).

## Interfaces

- `packCommand(args: string[], cwd: string): Promise<number>` in `src/pack-command.ts` — prints per-folder pack lines and refusals; returns 0 or non-zero.
- `endedChart(folder)` or equivalent marker accessor in `src/status.ts`, exported for the status scan (chartRow consumes it too).
- Tracked-log helpers inside `src/pack-command.ts`: `trackedLogs(root, ownerRel)`, `modifiedAndDeleted(root, ownerRel)`, `indexedOids(root, ownerRel)`, `blobOid(algo, bytes)` — module-private, typed.

## Checklist by wave

### Wave 1 — pack command (unit U1)

Owns: `src/pack-command.ts`, `src/akrogon.ts`, `README.md`, `tests/command-reference.test.ts`, `src/AREA.md`, `docs/guide/files.md`, `tests/folder-pack.test.ts` (pre-written by A).

- [ ] `pack` case + usage verb + `packCommand` dispatch in `src/akrogon.ts`; README table row `akrogon pack <folder>...`; `contracts.pack` entry.
- [ ] Entry check per D1; `.closing` per D2; tracked check per D3; output per D4.
- [ ] Chart argument packs only `<chart>/direct` (created members relative to `direct/`); merge with an existing archive comes free from `packFolder`.
- [ ] AREA.md + files.md lines per D9.
- [ ] No shared test resource; no dependency on U2/U3.

### Wave 2 — status listing + skill step + doc rows (unit U2)

Owns: `src/status.ts`, `tests/status.test.ts` (A pre-adds cases), `skills/chart-issues/SKILL.md`, `tests/docs-links.test.ts` (A pre-adds case), `tests/AREA.md`.

- [ ] `Unpacked:` lines per D5; `endedChart` extraction per D6.
- [ ] SKILL.md pack step at :85, :114, :121 per D8.
- [ ] tests/AREA.md `folder-pack.test.ts` line.
- [ ] Disjoint from U1's paths; parallel-safe.

(A's test-writing commits precede the wave and touch `tests/folder-pack.test.ts` (new), `tests/status.test.ts`, `tests/docs-links.test.ts` and `tests/command-reference.test.ts`.)

## Criterion proofs

Each criterion's proof is a bun test run through `akrogon run-check`. Commands run in the worktree (`/home/ivan/.akrogon/worktrees/akrogon/folder-pack`); `AKROGON_BASE` = worktree, all runners exist. Sizes assume the observed ~5–25 s per CLI test.

- C1 — `akrogon pack <chart>` packs `<chart>/direct` logs into `evidence.tar.zst` (members relative to `direct/`, merged with an existing archive); `.closing` removed on success; a failure leaves `.closing` with non-zero exit naming it; a rerun finishes and removes it.
  Test: `tests/folder-pack.test.ts` — fixture repo, `issues/chart/camp/direct` with nested + dotfile logs including non-UTF-8 bytes; run `akrogon pack issues/chart/camp`; assert archive members (read back through `Bun.Archive` after `Bun.zstdDecompressSync`) byte-equal and relative to `direct/`; assert plain logs deleted and `.closing` absent. Failure arm: a symlinked `*.log` makes the first run non-zero naming the path with `.closing` present; replace it, rerun, assert `.closing` gone and members complete.
  Command: `akrogon run-check --leaf <leaf> --name criterion-1 -- bun test tests/folder-pack.test.ts -t 'chart'`
  Boundary: real CLI over a real git repo + real tar.zst; catches member-name roots, merge, marker lifecycle. Size: seconds. Rerun trigger: any edit to pack-command entry, marker handling or packFolder call site.
  Red (intended, missing `pack` verb): `check criterion-1: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-1-1792102594584-1936314.log` — CLI exits `Usage: akrogon <...>` listing no `pack`. Compared at implement.
- C2 — `akrogon pack issues/closed/<owner>` prints per-folder packed/tracked/untracked/deleted counts.
  Test: same file — closed owner with committed logs, an added untracked log; `akrogon pack issues/closed/<owner>`; assert stdout carries the counts (packed ≥ tracked+untracked, deleted = packed) and archive/deletion state matches them.
  Command: `akrogon run-check --leaf <leaf> --name criterion-2 -- bun test tests/folder-pack.test.ts -t 'closed owner'`
  Size: seconds. Rerun: output formatting or count computation changes.
  Red: `check criterion-2: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-2-1792102599402-1939391.log` — same missing-verb usage error.
- C3 — tracked-log entry checks: modified committed log refuses the owner naming the path; missing committed log accepted only when the archive member's blob oid equals the indexed oid, else refused naming the path — for newline-ending and non-UTF-8 logs.
  Test: same file — commit logs, then modify one → refuse naming path (and no `.closing` left); restore, `git rm` a log whose member exists in a pre-seeded archive → accepted; delete one whose member is absent/wrong → refused naming path; non-UTF-8 bytes and trailing-newline variants both exercised.
  Command: `akrogon run-check --leaf <leaf> --name criterion-3 -- bun test tests/folder-pack.test.ts -t 'a tracked log'`
  Boundary: real `git ls-files`/index plus real archive bytes; catches text-decoding corruption, member-name mismatch, wrong acceptance of absent members. Size: seconds. Rerun: D3 implementation changes.
  Red: `check criterion-3: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-3-1792102603537-1941957.log` — same missing-verb usage error.
- C4 — refused forms: open owner, parked owner, path outside `repo.root`, worktree `issues/` copy, `issues/` itself; several folders in one call → independent outcomes, non-zero naming every refused folder.
  Test: same file — fixture with open leaf folder, `issues/parked/<owner>`, a sibling temp dir outside the repo, a git worktree holding an `issues/closed/x` copy; single call mixing one good chart and refused folders; assert stderr names each refused path and the accepted forms, exit non-zero, good folder still packed.
  Command: `akrogon run-check --leaf <leaf> --name criterion-4 -- bun test tests/folder-pack.test.ts -t 'unaccepted'`
  Size: seconds. Rerun: D1 resolution logic changes.
  Red: `check criterion-4: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-4-1792102603684-1942140.log` — same missing-verb usage error.
- C5 — plain `akrogon status` lists closed owners and ended charts holding plain logs or `.closing` naming `akrogon pack <folder>`, open owner `.closing` naming `akrogon next <slug>` for a merged leaf; after packing, lists none.
  Test: `tests/status.test.ts` added cases — seed closed owner + ended chart (CHART.md ending `Closed <date>`) with `.log`s, `.closing` on a chart and on a closed owner, open owner with `.closing` + a `merged` leaf; assert `Unpacked:` lines name each folder and command; run `bun src/akrogon.ts pack` through the fixture env on the pack-able folders, `phase`-retries not needed for the open case since `next` naming is asserted; rerun `status`, assert no `Unpacked:` lines for packed folders.
  Command: `akrogon run-check --leaf <leaf> --name criterion-5 -- bun test tests/status.test.ts -t 'unpacked'`
  Boundary: real command output, the only consumer-visible surface for this criterion. Size: seconds. Rerun: status scan or prefix changes.
  Red: `check criterion-5: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-5-1792102605253-1943061.log` — status prints 0 `Unpacked:` lines, expected 4.
- C6 — skills/chart-issues/SKILL.md orders `akrogon pack` before the end-marker appends.
  Test: `tests/docs-links.test.ts` added case — read `skills/chart-issues/SKILL.md`; assert the `akrogon pack <chart>` instruction appears before the first `Closed`/`Held`/`Handed off` append instruction and that each append site carries the pack step (checked by presence in the same paragraph/step lines).
  Command: `akrogon run-check --leaf <leaf> --name criterion-6 -- bun test tests/docs-links.test.ts -t 'akrogon pack'`
  Boundary: the doc itself, the criterion's only product. Catches silent omission and reordering regressions. Size: seconds. Rerun: SKILL.md edits.
  Red: `check criterion-6: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-6-1792102605339-1943270.log` — marker paragraph at :85 holds no `akrogon pack` mention.

All tests are new (none prove existing behavior already covered); each is committed on `folder-pack` before product code, shown red against the missing command/line/step. New file `tests/folder-pack.test.ts` needs no `Test-Change` trailer; added cases in `tests/status.test.ts`, `tests/docs-links.test.ts`, `tests/command-reference.test.ts` ride in one test commit carrying `Test-Change:` per changed existing file.

Supporting red: `contracts.pack` in `tests/command-reference.test.ts` makes 'escaped alternatives and reordered rows preserve argument semantics' fail (README row without a `pack` case) — the intended contract gate for U1's dispatcher work.

## Implementation notes

2026-10-16 (check.fix): D1's single-chart acceptance (`issues/chart` itself holding CHART.md) contradicted the locked design — `src/evidence.ts` `locate` resolves `issues/chart/<chart>/direct/<member>` only, so `packFolder`'s member verification can never pass for `issues/chart/direct/*` (B-F1, `check review-B-single-chart: 1` log). The resolver is an excluded surface (design: "`akrogon log` and the resolver (log-reader)" belong to log-reader). Corrected: `classify` accepts only `issues/chart/<chart>`; the `unpackedLines` chart scan enumerates `issues/chart/<chart>` subdirs only, so status never advertises a command the resolver cannot satisfy. The single-chart layout's `direct/` logs are unpackable by design until log-reader's resolver handles that layout — same limitation `akrogon log` already has there.

2026-10-16 (check.fix): B-F2 — C3 gains the missing tracked log whose archive member exists with wrong bytes (newline and non-UTF-8), under A's one-case exception; B-F3 — the C6 test dropped the prose-wording/paragraph gate per the Function-over-form rule and keeps the literal `akrogon pack` presence contract plus append-site counting.

## Known limitations / open items

- The migration run and the 9 slots-scrap deletions (design existing-backlog items 7–8) are door steps on main, out of this leaf.
- Parked owners are never `.closing`-listed: `completeOwner` never runs on parked owners and no command writes `.closing` there; a hand-placed one stays silent (deliberate — refused by `pack` either way).
- A `.closing` on `issues/open/<owner>` with no merged leaf lists `akrogon next <slug>` for the first leaf — it completes the recorded move, which is the only recovery the marker allows.
