# Brief 1: pack module and completeOwner wiring (unit U1)

## 1. Goal

Create `src/pack.ts` exporting `packFolder` and wire it into `completeOwner` in `src/phase.ts` (plan decisions D1, D2). Add the module line to `src/AREA.md`.

## 2. Numbered acceptance criteria

1. `bun test tests/close-pack.test.ts -t 'completion packs every log'` passes: after `akrogon phase <slug> merged`, the owner under `issues/closed/` holds `evidence.tar.zst` whose members are every `*.log` that was under the owner (nested dirs and dotfiles included, names relative to the owner folder), no plain `*.log` remains, and an owner with no logs gets no archive.
2. `bun test tests/close-pack.test.ts -t 'retried completion merges'` passes: a pre-existing `evidence.tar.zst` plus new plain logs produces the union archive on retry through `akrogon next`.
3. `bun test tests/close-pack.test.ts -t 'symlinked log'` passes: a symlinked `*.log` stops the move non-zero naming the link; owner stays under `issues/open/` with logs unchanged.
4. `bun test tests/close-pack.test.ts -t 'closing marker'` passes: `<owner>/.closing` exists after a failed pack, and `issues/closed/<owner>` holds no `.closing` after the successful move.
5. `bun test tests/close-pack.test.ts -t 'member byte conflict'` passes: differing bytes for a member present in both archive and plain file stops non-zero naming the member; archive and plain files unchanged, no `evidence.tar.zst.tmp`.
6. `bun test tests/phase.test.ts` stays green (existing completion tests).

## 3. Read-first list

- `src/evidence.ts` — `locate(recorded, cwd, repo)` returns `{ ownerDirs, member }` or null (three dirs `open/closed/parked` for owner areas, one for chart direct); `readMember(ownerDir, member)` reads one member from `evidence.tar.zst`.
- `src/phase.ts` `completeOwner` (~line 221–224: `complete` gate, destination-exists check, `mkdirSync(closed)`, `renameSync`).
- `tests/close-pack.test.ts` — the planned tests (already committed, red); read them for exact member names and expected errors.
- `tests/log-reader.test.ts` `packEvidence` — archive build pattern.
- `src/AREA.md` — module list format.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/pack.ts` (new), `src/phase.ts`, `src/AREA.md`. No prerequisites; nothing shares these paths this wave.

`packFolder(repo: Repo, folder: string, cwd?: string): Promise<void>`:

1. List members with `new Bun.Glob('**/*.log').scanSync({ cwd: folder, dot: true })`. Verified on Bun 1.4.3: `onlyFiles` drops symlinks, so do NOT pass it; `lstat` each returned path — symlink → `throw new Error` naming the repo-relative link path, directory → skip, file → member set.
2. If `evidence.tar.zst` exists in `folder`, read it with `new Bun.Archive(Bun.zstdDecompressSync(readFileSync(archive))).files()`; for each member name present in both archive and a plain file with different bytes, throw an error naming the member BEFORE any write.
3. Union: existing archive members plus plain files (plain file fills only names the archive lacks). No plain logs and no existing archive → return without writing.
4. `new Bun.Archive(Record<member, Uint8Array>)` → `await archive.bytes()` → `Bun.zstdCompressSync(bytes, { level: 19 })` → `writeFileSync(<folder>/evidence.tar.zst.tmp)` → decompress+re-read the tmp and verify every member byte-equal against the union → `renameSync(tmp, archive)`.
5. Resolver verification before any delete: for each member, `const target = await locate(resolve(folder, member), cwd ?? repo.root, repo)`; require `target !== null && target.member === member`; `ownerDir` = first `target.ownerDirs` entry that `existsSync`; `readMember(ownerDir, member)` must equal the expected bytes (plain file bytes for plain-sourced, original archive bytes for archive-sourced). Any failure throws BEFORE deleting. Then `unlinkSync` each verified plain log.
6. `evidence.tar.zst` itself is never a member (`.zst` suffix).

`completeOwner` (src/phase.ts), inside `if (complete ...)` region after the destination-exists check:

```ts
writeFileSync(resolve(owner, '.closing'), '');
await packFolder(repo, owner, leaf.path);
mkdirSync(resolve(repo.root, 'issues/closed'), { recursive: true });
renameSync(owner, destination);
rmSync(resolve(destination, '.closing'));
```

A pack failure propagates (existing `MoveCommittedError` wrap in `commitMove` makes it retryable). Keep the existing `mkdirSync`/`renameSync` lines; only `.closing` write, the await, and the post-rename `rmSync` are new, plus the import.

`src/AREA.md`: add one line for `src/pack.ts` matching the existing bullet style.

## 5. Do-not, reasons and exceptions

- No tests written or edited — `tests/close-pack.test.ts` is committed; a wrong or red planned test is a mismatch returned to A.
- No `.env` reads/writes; no new dependencies (Bun builtins only); no child processes.
- Do not touch `src/evidence.ts`, `src/run-check.ts`, `src/reconcile.ts`, `src/sync.ts`, `src/init.ts` — owned by sibling units or another leaf; a needed change there is a mismatch returned to A.
- `packFolder` writes no `.closing` itself: `akrogon pack` (folder-pack leaf) owns that for chart packing.
- `mkdirSync(resolve(repo.root, 'issues/closed'), ...)` stays where it is.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change. These exclusions exist because sibling units own sibling files and the plan locks the interfaces; the only exception is a revised brief from A.

## 6. Ordered steps

1. Write `src/pack.ts` per section 4 (criteria 1, 2, 3, 5).
2. Edit `src/phase.ts` `completeOwner` (criterion 4).
3. Run the targeted tests (section 7); repair only within owned paths.
4. Add the `src/AREA.md` line.

Advisory size: about 2 files and under 12 turns.

## 7. Commands

From the worker worktree root:

- `bun install --frozen-lockfile` first (deps needed for the run).
- `bun test tests/close-pack.test.ts -t 'completion packs'`
- `bun test tests/close-pack.test.ts -t 'retried completion'`
- `bun test tests/close-pack.test.ts -t 'symlinked log'`
- `bun test tests/close-pack.test.ts -t 'closing marker'`
- `bun test tests/close-pack.test.ts -t 'member byte conflict'`
- `bun test tests/phase.test.ts`

## 8. Done-when, evidence and report

All criteria in section 2 green; commits on the worktree HEAD; report cites `akrogon run-check` lines (`akrogon run-check --name <label> -- <cmd>` keeps output; `akrogon log <path>` reads a cited log) for every test command run. Changing an existing file matched by `src/test-files.ts` requires a `Test-Change:` trailer; your owned paths include none — write and edit no test.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
