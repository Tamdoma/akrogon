# Brief: check-env

## What
Every check, merge check and advisory command that `akrogon config` prints runs, including lock and setup and also with no setup configured, inside a constructed environment holding only: HOME, the declared PATH, TMPDIR, AKROGON_BASE, XDG_CACHE_HOME, NODE_DISABLE_COMPILE_CACHE, and the names declared in the repo config `env:` list. TMPDIR is a fresh run root created inside the leaf's scratch for that one command and removed when it ends. The leaf scratch root moves from `/tmp/akrogon-<uid>` (tmpfs) to `~/.akrogon/scratch/<repo>/<slug>-<hash>` on the home disk. The command refuses to start when NODE_PATH, BUN_OPTIONS, BUN_INSTALL_CACHE_DIR, FFMPEG_BIN, CHROME_PATH or CDP_BROWSER_BINARY is set in the caller's env, or a global bunfig exists, naming it. Declared tools are resolved at dispatch and each merge attempt record carries each tool's path and version. check-env owns `withSetup`, the `akrogon run-check` verb and the `env:` schema that worktree-store, leaf-env-file and base-run build on (B,C). run-check writes the command's output log into the leaf folder before the run root is removed, also when the command fails (B).

## Why
Checks today inherit whatever the seat's shell holds, so an env variable or global config outside the worktree can change a leaf's result. Check scratch on tmpfs costs RAM, and check outputs written into the worktree outlive killed runs.

## Done-criteria
1. A printed check command run with an extra variable exported in the caller (not declared) does not see it; a variable declared under `env:` is seen; TMPDIR inside the command is a directory under the leaf's scratch on the home disk that no longer exists after the command exits, also when the check fails.
2. With any of NODE_PATH, BUN_OPTIONS, BUN_INSTALL_CACHE_DIR, FFMPEG_BIN, CHROME_PATH, CDP_BROWSER_BINARY set, or a global bunfig present, the printed command exits non-zero naming the variable or file, before setup runs.
3. Two printed check commands run at the same time in one leaf get different run roots.
4. Seat tabs get TMPDIR pointing at the leaf scratch under `~/.akrogon/scratch/...`; nothing akrogon creates for a leaf lands under `/tmp` unless AKROGON_LEAF_TEMP_ROOT points there.
5. Each new merge attempt record holds, per declared tool, the resolved path and the version string.
6. A repo config with no `setup` still gets the constructed env and the refusals.
7. After a printed check command exits, pass or fail, its output log exists in the leaf's folder and the run root does not; a run from the registered checkout writes its log to the holder the caller names. (B)
