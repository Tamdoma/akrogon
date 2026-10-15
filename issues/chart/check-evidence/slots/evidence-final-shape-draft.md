# Final shape: evidence-location (operator `1a | 2a`, 2026-10-15)

Operator correction, verbatim: "What does zip like mean? The problem is that these logs need to be read often when I refer to them. If we zip them they won't be able to be read." Then `1a` for: pack at close plus `akrogon log <path>` that prints any log as plain text.

1. While an owner is open, run-check writes plain logs exactly as today (src/run-check.ts:207-209).
2. Plain `*.log` under `issues/open/` is gitignored, so `akrogon sync` (src/sync.ts:154-165) never commits it. Only the packed file enters git.
3. At the final `complete` gate in completeOwner (src/phase.ts:221-224), before the rename: pack every `*.log` on disk under the owner into one `<owner>/evidence.tar.zst`, member names relative to the owner folder. Build from files on disk, never from timings or receipts. Write to a temp name, read every member back byte-equal, rename into place, delete the plain logs, then rename the owner. A retry finding a verified archive in place never rebuilds it from a subset.
4. run-check refuses a target whose owner folder is not under `issues/open/` (a late writer after close).
5. `akrogon log <path>` takes any recorded path (absolute, any checkout root, open or closed), resolves it by its tail after `issues/`, and prints the plain file or the archive member to stdout. A path that resolves to neither exits non-zero naming the path. An unreadable archive exits non-zero.
6. `akrogon flaky` uses the same resolver. It keeps `(log gone)` only when neither a plain file nor an archive exists; a broken archive or a missing member inside an existing archive is an error.
7. Skills that cite or read logs tell seats to read them with `akrogon log <path>`.
8. A failed leaf that never closes keeps its plain logs on this host, uncommitted.
