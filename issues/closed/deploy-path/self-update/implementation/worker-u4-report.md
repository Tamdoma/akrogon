# Worker report: sub-brief 4, self-update-module (plan U4, wave 2)

Commit: 0353d7d6bc98d75dd0822e630671616446166e31

## Changed files and reasons

- src/self-update.ts (new) — exports `selfUpdate(repo, ownRoot = toolRoot, home = homedir())` per D1-D3. Whole body in try/catch: identity gate on realpath(repo.root) === realpath(ownRoot) returns silently; install lock at `git rev-parse --git-path akrogon-install.lock` wraps the sequence; `git fetch <remote> <branch>` via run; symbolic-ref branch gate (detached/wrong branch → skip line with lag); rev-list --left-right --count on HEAD...<remote>/<branch> gives ahead/behind; strictly-behind runs `git merge --ff-only` under the global lock (install lock then global lock, global only around the ff); ahead or diverged → skip naming `akrogon sync`; every post-fetch run still executes `bun install --frozen-lockfile` (process.execPath) and planSkillLinks/applySkillLinks minus conflicts. Exactly one console.log: `deployed <old12>..<new12>`, `current <sha12>`, `self-update skipped: <reason>; <N> behind <remote>/<branch>[; remedy]`, `<step> failed: <error>; <N|unknown> behind <remote>/<branch>; retried at the next trigger`, or catch-all `self-update failed: <error>`.
- tests/install.test.ts — appended a `self-update` describe with 10 test.serial cases and file-local helpers (selfUpdateFixture builds bare remote.git + seed + clone with real bun.lock from a file: dep; pushSeed advances the remote; withHome/captured set AKROGON_HOME and collect console.log). Cases: ff keeping a dirty file (deployed line, lock files asserted), overlapping dirty edit (fast-forward refused line + untouched HEAD), other branch, detached, ahead, diverged, corrupt bun.lock then restore (install failed → current), identity no-op (zero output, remote deleted so a fetch would fail loudly), remote skill add/remove (new link created, stale owned links pruned), conflicting directory named in line while other links land. Imports gained describe, mkdtempSync, rmSync, tmpdir, repoSchema, Repo, command, selfUpdate; no existing test changed.

## Tests run

- `bun test tests/install.test.ts --timeout=30000` → 25 pass, 0 fail, 420 expect() calls.
- `AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000` → 50 pass, 0 fail across 2 files (install.test.ts + harness-template.test.ts).
- `bun run typecheck` → clean.
- Deliberate break: replaced the withLock/run(['git','merge','--ff-only']) call with a synthetic code-0 Result. Test (a) went red: expected `deployed a09a68ee5e17..0cf5cc735152`, received `deployed a09a68ee5e17..a09a68ee5e17` (old == new proves no ff ran). Restored; suite green again.

## Known limitations

- The serial tests patch process.env.AKROGON_HOME and console.log; they rely on bun's serial phase running before the concurrent phase (bunfig sets concurrentTestGlob for all *.test.ts, and describe.serial is flattened by it — only test.serial isolates; verified by probe). Any future in-process console.log capture or AKROGON_HOME mutation in this file must also be test.serial.
- Fetch-failure and symbolic-ref/rev-list failure lines are exercised by construction, not by a dedicated test (no criterion required one; the no-op test covers the identity path).

## Unverified criteria

- None within this brief's scope. Criteria 7/8 (merge/next wiring) belong to U5.
