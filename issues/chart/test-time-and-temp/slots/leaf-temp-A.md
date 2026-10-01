# Leaf-temp round A (written before reading B and C rounds)

Q1: `mkdtemp('/var/tmp/akrogon-XXXXXX')` at allocate, recorded in state.yaml as `tmp` next to `worktree`. Bounded (23 chars). Cost: one more command-owned state field.
Q2: delete after `closeMergedTab`, before the open-folder return in `cleanupMerged` (accepts B R2). Failed leaves keep it; it expires under OS aging; evidence goes in the leaf report.
Q3: TMPDIR only via `placement`.
Probes 2026-10-01: system Chromium 1243 (`/usr/bin/chromium --headless=new`) aborts `FATAL process_singleton_posix.cc:313 Socket path too long` with a 73-char TMPDIR and starts with 23 chars; Playwright chrome-headless-shell 1243 starts with 73 chars. Suffix is `/org.chromium.Chromium.XXXXXX/SingletonSocket` (45 bytes), so TMPDIR must be at most 62 bytes. codex-cli 0.159.2 (`codex exec -s danger-full-access`) and pi 0.99.1 (`pi -p`) with TMPDIR=/var/tmp/akrogon-envprobe: shell `os.tmpdir()` and `mktemp -d` both used it; codex also put its bwrap mount targets there and pi its jiti cache. Probe dirs removed. Claude Code clean probe (env without parent session) was refused by the permission classifier; Claude is not a configured slot harness.
