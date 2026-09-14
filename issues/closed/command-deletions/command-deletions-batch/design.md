# Design: command-deletions-batch

## Binding decisions, verbatim

### What does dispatch do with a pane herdr cannot classify?
Operator answer (2026-09-14): `1a`, after asking for the reasoning in round 1. `busy()` includes `unknown`: the seat waits, the busy clock starts, the 60-minute notice covers a pane that stays unknown. `seatFor`, `peerOf`, the `!idle` branch and the merge-seat early return are deleted. Reason: `unknown` is not a failure signal, waiting sends nothing, and re-prompting cannot rescue an unreadable pane but can corrupt a mid-turn session. Foreclosed: counting `unknown` as an attempt.

### Where can a failed leaf go?
Operator answer (2026-09-14): `2a`. `failed.next` lists every phase except `check.fix`, `merged` and `failed`; `fix_rounds` resets to 0 on any exit from `failed`. Reason: hand edits of state.yaml are replaced by a command that resets the counters. Foreclosed: the `implement`-only exit.

### How is the charted debate decision honored?
Operator answer (2026-09-14): `3a`, following the round 1 requirement "we need to make sure the debate decision during charting is honored, this is very important." The `debate` key stays. Dispatch refuses a `debate: yes` leaf at `plan.synthesis` that lacks `positions-A.md` or `positions-B.md`, reports the fix (set `phase: plan.positions`) and exits 1 before any seat starts. Reason: the key is the record of the operator's decision and the command checks the phase against it. Foreclosed: dropping the key with the state migration; the template and guide lines about the key stay. L5 fixes the chart template so the phase line is derived from the answer.

### Does the per-repo lock go?
Operator answer (2026-09-14): `4a`, under the round 1 condition that nothing functional changes unless the function is too minor to matter. `withRepoLock` and `issues/.lock` are deleted and `pull` runs unlocked. The one function lost is serializing two overlapping pulls, whose worst case is a file-not-found error on one of them with correct seeds on disk. Foreclosed: keeping the lock.

### Who deletes the guide sentences describing removed machinery?
Operator answer (2026-09-14): `5a`. The leaf deletes the guide and skill lines that describe deleted machinery, including chart-skill template lines, which is the operator's permission for those edits. Foreclosed: leaving them for later docs work. The `debate` lines (state.html:62 and :80, create.html:81, check-issue:31, shapes.md:155 and :160) stay because the debate-key fork keeps the key.

### Operator goals for this work, verbatim from the intake
keeping simplicity, not increasing complexity unless it REALLY benefits the process, but even then only minimal. Then cost, then speed. Round 1 on the repo lock: "I don't want the functionality change. Everything has to be as it is right now."

### Standing design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any leaf touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first leaf needing it. Non-browser flows use a real request or invocation. The blocking `checks` commands judge the exit code and the implementation report records the artifact path as evidence.
- Leaf work is agent-owned. A step physically requiring the operator is a human-only prerequisite completed before the leaf opens. Credential access alone never qualifies. An unforeseen physical blocker ends the attempt and informs the operator.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

Current interpretation: no auth, browser or secret surface exists here. The user-visible flow is the `akrogon` CLI; the test fixtures in `tests/helpers.ts` invoke the real command in temporary git repos with fake `gh` and fake `herdr`, which exercises the flow end to end. Fixtures delete themselves, so the artifact comes from done-criterion 11, which tees the full test output to `/tmp/akrogon-command-deletions-batch-test.log`; the implementation report records that path. No env values are needed.

## Leaf architecture

Owned surfaces: `src/next.ts`, `src/phase.ts`, `src/routing.ts`, `src/state.ts`, `src/config.ts`, `src/pull.ts`, `src/sync.ts`, `tests/next.test.ts`, `tests/phase.test.ts`, `tests/state.test.ts`, `tests/config.test.ts`, `tests/sync.test.ts`, `tests/fetch-deadline-harness.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts` as needed for the unknown status, `docs/guide/phases.html`, `docs/guide/problems.html`, `docs/guide/next.html`, `docs/guide/setup.html`, `docs/guide/cheat.html`.

Literal interfaces:
- `busy(pane)` in `src/next.ts`: `pane.agent_status === 'working' || pane.agent_status === 'blocked' || pane.agent_status === 'unknown'`. `idle(pane)` unchanged. With this, `dispatchSlot` has two agent-present outcomes, busy returns and idle proceeds; the attempts-to-2 branch, `seatFor`, `peerOf` and the merge-seat early return in `dispatchLeaf` are deleted, and `currentPane` reads `recorded.pane[slot]`.
- `routing.failed` in `src/routing.ts`: `{ skill: null, slots: [], next: ['plan.positions', 'plan.rebuttal', 'plan.synthesis', 'implement', 'check.review', 'merge'] }`.
- `commitMove` in `src/phase.ts`: `fix_rounds: to === 'check.fix' ? recorded.fix_rounds + 1 : recorded.phase === 'failed' ? 0 : recorded.fix_rounds`. `transition` keeps the slot waiver for `failed` and the `check.fix` cap unchanged.
- `requireCodeOnly(repo, worktree)` in `src/phase.ts`: after the `issues` check, `git diff --name-only <target>...HEAD` with no paths; an empty result throws `Empty leaf branch: no changes against <target>`.
- `dispatchLeaf` in `src/next.ts`, after the `failed` notification block and before the dependency check: `if (current.state.debate === 'yes' && current.state.phase === 'plan.synthesis' && !['positions-A.md', 'positions-B.md'].every((name) => existsSync(resolve(current.path, name)))) throw new Error(\`Debate leaf skipped its debate: ${slug}; set phase: plan.positions\`)`. The surrounding try/catch reports it and returns `'skipped'`, which already sets exit code 1.
- `activeCount(global, invocation)` in `src/next.ts` returns `Promise<number>`; `allocate` compares it with `global.max_active` only. `ActiveCounts` and `perRepo` are deleted. `repoSchema` in `src/config.ts` loses `max_active`; `effectiveConfig` spreads `repo.config` directly.
- `withRepoLock` is deleted from `src/state.ts`. `phaseCommand` and `syncCommand` keep `withLock(resolve(globalHome(), '.lock'), ...)` around their bodies; `dispatchLeaf` and `pullRepo` run their bodies directly. `lockPaths` in `src/sync.ts` holds only the global lock path when it lies inside the synced repo; the `basename(path) === '.lock'` staging exclusion and the `**/.lock` pathspec stay.
- `nextCommand` in `src/next.ts`: `const hooked: boolean = event !== undefined;`. The branch `if (input === undefined && hookPane !== undefined)` and `paneOwners` stay.

Tests:
- `tests/next.test.ts`: the loop at `:369-374` over idle, done and unknown keeps `agent: 'fake'` for unknown and asserts no prompt and unchanged attempts; the cases at `:408`, `:421`, `:449` that expect the attempts jump or the peer pane are rewritten to expect waiting with `busy_since` set; the per-repo `max_active` cases at `:543-640` are deleted; the gh probe locks at `:673`, `:906`, `:1509` and `REMOVE_BEFORE_LOCK` at `:1298` point at `resolve(f.home, '.lock')`; the typed-`next` cases with `HERDR_PANE_ID` and no event (`:126`, `:214`, `:226`, `:247`, `:472`, `:524`) expect a repo sweep with cleanup.
- `tests/phase.test.ts`: probes at `:267`, `:541`, `:546`, `:634` point at `resolve(f.home, '.lock')`; new cases for done-criteria 3 and 4.
- `tests/sync.test.ts`: `:25` no longer expects `?? issues/.lock`; the repo-lock hold cases at `:77`, `:246`, `:273-283` and the location loop at `:303-346` cover the global lock only.
- `tests/config.test.ts`: `:19-32` and `:56` drop `repo_max_active`; new case for done-criterion 7.
- `tests/fetch-deadline-harness.ts:87`: reacquires the global lock only.
- New cases for done-criteria 5, 6 and 9 in `tests/next.test.ts`.

Exclusions: everything under Off route in the chart. No change to the `debate` key, its template or guide lines. No change to `busy` notice timing, `PROMPT_GRACE_MS`, `STALL_MS`, `park`, `sync` behavior beyond the lock, `hand_built`, the log schema, `src/init.ts`, `tests/fake-gh.ts`, or the check.fix routing of merge conflicts (L2). No cache, snapshot, threaded map or speed-only parameter.

Dependencies: none. Credentials: none.
