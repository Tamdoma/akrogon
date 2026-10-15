# Check Evidence — Final Shape Review (Slot D)

## 1. Packing and Reading `tar.zst` in Bun 1.4.3 with Zero New npm Dependencies

Verified on this host (`bun 1.4.3`, `GNU tar 1.35`, `zstd 1.5.7`): Bun 1.4.3 provides built-in `Bun.Archive` (uncompressed POSIX tar, or gzip) and `Bun.zstdCompressSync` / `Bun.zstdDecompressSync`. Combining them packs and reads standard `.tar.zst` in-process with zero new npm dependencies and zero child processes, while remaining 100% interoperable with `tar --zstd`:

```ts
// Pack & verify in-process (write to .tmp first, then renameSync):
const tarBytes = await new Bun.Archive(entries).bytes(); // entries: Record<string, Uint8Array | Blob | string>
const zstBytes = Bun.zstdCompressSync(tarBytes, { level: 9 });
writeFileSync(tmpArchivePath, zstBytes);

// Verify round-trip before unlinking any plain .log:
const verified = await new Bun.Archive(
  Bun.zstdDecompressSync(readFileSync(tmpArchivePath)),
).files();
for (const [relPath, expectedBytes] of Object.entries(entries)) {
  const actual = await verified.get(relPath)?.bytes();
  if (!actual || Buffer.compare(actual, expectedBytes) !== 0) {
    throw new Error(`Archive verification failed for ${relPath}`);
  }
}
renameSync(tmpArchivePath, archivePath);
```

- **Reader lookup (`akrogon log` / `akrogon flaky`)**:
  ```ts
  const files = await new Bun.Archive(
    Bun.zstdDecompressSync(readFileSync(archivePath)),
  ).files();
  const entry = files.get(memberRelPath);
  const text = entry ? await entry.text() : undefined;
  ```
- **API pitfall in `Bun.Archive.prototype.files(globPattern?)`**: Passing an argument to `archive.files(arg)` treats `arg` as a **glob pattern**, not a literal member path. Always call `await archive.files()` with **no arguments** and look up `.get(memberRelPath)` on the returned `Map<string, File>`.

---

## 2. Steps in `evidence-final-shape-draft.md` That Can Lose a Log or Break a Writer/Reader

### Defect A — Rule 4 ("`run-check` refuses a target whose owner folder is not under `issues/open/`") breaks `--holder issues/chart/...` and checks at start instead of write time
- **Breaks `issues/chart/` (`src/run-check.ts:126-127`, `src/verify.ts:95, 110`)**:
  - When `--holder issues/chart/<name>/direct` is passed to `akrogon verify --holder ...` (`src/verify.ts:95, 110`) or `akrogon run-check --holder ...` (`src/run-check.ts:126-127`), `leafTarget` returns `resolve(repo.root, holder)` = `<repo.root>/issues/chart/<name>/direct`.
  - That path is under `issues/chart/`, **not** `issues/open/` (`53` `.log` files in `akrogon/issues/chart/*/direct`, `2` in `framework/issues/chart/*/direct`). Refusing any target not under `issues/open/` breaks the `chart-issues` direct route.
- **Late-writer race between start and completion (`src/run-check.ts:105-128` vs `src/run-check.ts:207-209`)**:
  - `leafTarget` resolves `target` at `src/run-check.ts:128` **before** the child command starts (`src/run-check.ts:142`).
  - When the command finishes seconds or minutes later, `src/run-check.ts:207-209` runs:
    ```ts
    mkdirSync(target, { recursive: true });
    copyFileSync(log, kept);
    ```
  - If `completeOwner` (`src/phase.ts:224`) packed `evidence.tar.zst` and moved `issues/open/<owner>` to `issues/closed/<owner>` while a background check was still running, `mkdirSync(target, { recursive: true })` at `src/run-check.ts:207` **recreates `issues/open/<owner>/<leaf>/implementation/` on disk** and strands a plain `.log` under `issues/open/<owner>` after close.
- **Required fix in Rule 4**:
  1. Permit targets under `issues/open/<owner>/...` and `--holder` targets under `issues/chart/...` (refusing any target under `issues/closed/` or any target whose `<owner>` already exists at `issues/closed/<owner>`).
  2. Re-verify right before `mkdirSync(target, { recursive: true })` + `copyFileSync(log, kept)` at `src/run-check.ts:207-209` that for an `issues/open/<owner>/...` target, `issues/open/<owner>` still exists and `issues/closed/<owner>` does not exist; if `<owner>` closed while the command ran, abort keeping the log (do not call `mkdirSync(target, { recursive: true })`) and fail with a clear error.

### Defect B — Rule 3 ("A retry finding a verified archive in place never rebuilds it from a subset") can lose logs if a previous `completeOwner` failed mid-unlink or if plain `.log` files coexist with `evidence.tar.zst`
- **Where (`src/phase.ts:221-224`)**:
  - In `completeOwner`, if a run writes `evidence.tar.zst`, unlinks some plain `.log` files, and fails before unlinking the rest or before `renameSync(owner, destination)` (`src/phase.ts:224`) — or if another check wrote a new plain `.log` before the retry of `akrogon phase complete` — then both `evidence.tar.zst` and plain `.log` files exist on disk when the retry runs.
  - If the retry sees `evidence.tar.zst` and blindly deletes remaining plain `.log` files without merging them into `evidence.tar.zst`, any plain `.log` created after the first archive build is permanently lost; conversely, if it leaves plain `.log` files on disk, `renameSync(owner, destination)` moves unarchived plain `.log` files into `issues/closed/<owner>/`.
- **Required fix in Rule 3**:
  - If `evidence.tar.zst` already exists in `<owner>` when `completeOwner` runs, load its existing entries (`await archive.files()`), merge any remaining plain `*.log` files on disk into that entry map (preserving all previously archived entries plus any new/remaining disk `.log` files), atomically write and verify the updated `evidence.tar.zst.tmp` -> `evidence.tar.zst` if any disk `.log` was missing or differed, and only unlink a plain `.log` after confirming its exact bytes are present in the verified `evidence.tar.zst`.
  - Also specify the zero-log case: if `<owner>` has `0` plain `*.log` files and no `evidence.tar.zst`, `completeOwner` succeeds without creating an archive (or writes a valid empty archive), and `akrogon flaky` treats a missing `evidence.tar.zst` as `(log gone)` rather than throwing.

### Defect C — Rule 5 ("`akrogon log <path>` ... resolves it by its tail after `issues/`") under-specifies `<owner>` vs `<member>` resolution across 2-level issues, 3-level epics, and `issues/chart/`
- **Where (`src/phase.ts:195-196`, `src/flaky.ts:20-31`)**:
  - In `src/phase.ts:195-196`, `owner` is the first directory under `issues/open/`:
    - 2-level standalone issue: `issues/open/<issue>/<leaf>/implementation/check-....log` -> `<owner>` is `<issue>`, archive member path is `<leaf>/implementation/check-....log`.
    - 3-level epic issue: `issues/open/<epic>/<issue>/<leaf>/implementation/check-....log` -> `<owner>` is `<epic>`, archive member path is `<issue>/<leaf>/implementation/check-....log`.
    - Chart direct holder: `issues/chart/<chart>/direct/check-....log` -> plain file under `issues/chart/` (or if archived, `<chart>`).
- **Required fix in Rule 5**:
  - Define the exact lookup order for `akrogon log <path>` after extracting the tail after `issues/`:
    1. If tail starts with `(open|closed|parked)/<owner>/<member>`:
       - Check plain file `<repo.root>/issues/open/<owner>/<member>`, then `<repo.root>/issues/closed/<owner>/<member>`, then `<repo.root>/issues/parked/<owner>/<member>`.
       - If not found as a plain file, check member `<member>` inside `<repo.root>/issues/closed/<owner>/evidence.tar.zst` (and `<repo.root>/issues/open/<owner>/evidence.tar.zst`).
    2. If tail starts with `chart/<rest>`, check `<repo.root>/issues/chart/<rest>`.

### Defect D — Rule 2 ("Plain `*.log` under `issues/open/` is gitignored, so `akrogon sync` (`src/sync.ts:154-165`) never commits it") misses `issues/parked/` and `issues/chart/`
- **Where (`src/park.ts:9-12, 68`, `src/sync.ts:155`)**:
  - `akrogon park` (`src/park.ts:68`) renames `issues/open/<name>` to `issues/parked/<name>`, carrying its plain `*.log` files into `issues/parked/`.
  - `akrogon verify --holder issues/chart/<name>/direct` writes plain `*.log` files into `issues/chart/<name>/direct/`.
  - `akrogon sync` runs `git add -- issues` (`src/sync.ts:155`). If `.gitignore` only ignores `issues/open/**/*.log`, `akrogon sync` will still stage and commit plain `*.log` files under `issues/parked/` and `issues/chart/`.
- **Required fix in Rule 2**:
  - Gitignore `*.log` across `issues/open/`, `issues/parked/`, and `issues/chart/` (or `issues/**/*.log` once closed issues use `evidence.tar.zst`).
