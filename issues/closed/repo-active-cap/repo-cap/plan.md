# Execution plan: repo-cap

Slot B synthesis. Debate is disabled in state.yaml, so this plan derives directly from brief.md, design.md and the live checkout. No positions or rebuttals are required. The locked design controls scope. No execution dependency is required.

## Read first

- This leaf's authoritative brief.md and design.md under issues/open/repo-active-cap/repo-cap/ in the registered repository.
- docs/reference-index.md and learnings/LESSONS.md.
- src/config.ts: repoSchema (lines 27–46) and effectiveConfig (lines 108–123).
- src/next.ts: activeCount (lines 262–271), allocate (lines 273–300), sweepAll (lines 524–533).
- tests/helpers.ts: fixture, leaf, yaml, cli and the dispatchFixture pattern in tests/next.test.ts (lines 11–37).
- tests/next.test.ts: the two-repo fixture at lines 460–480 and the capacity reservation cases at lines 830–860.
- tests/config.test.ts: the single effective-config test, including the fix_rounds: 0 rejection.
- docs/guide/install.html, limits.html, next.html, in-practice.html, cheat.html and setup.html.

## Decisions and interfaces

### D1. Optional positive integer on repoSchema

Add `max_active: z.number().int().positive().optional()` to repoSchema in src/config.ts. No default: absent means no repo limit. Zero, negatives and non-integers fail parse, matching the global key's rule. `akrogon init` and init-issues are untouched per the design exclusions.

### D2. One inventory pass returns total and per-repo counts

Change `activeCount(global, invocation)` to return `{ total: number; perRepo: Map<string, number> }`. Inside the existing loop, compute each repo's contribution once and add it to both `total` and `perRepo` under that repo's name:

- `registered.unknown` or `inventory.unknown`: `global.max_active` (unchanged saturation rule).
- `inventory.unreadable > 0`: `inventory.leaves.length + inventory.unreadable`.
- Otherwise: non-merged leaves with a live pane matching tab or worktree, the existing filter.

This is the locked "same rule as the machine count" resolution: one expression per repo, no new branch. An unknown inventory therefore also saturates that repo's own cap without any special case.

### D3. Repo gate inside the existing no-tab check in allocate

Keep the `matches.length === 0` precondition. Only then compute counts and refuse when `counts.total >= global.max_active` or (`repo.config.max_active` is defined and `counts.perRepo.get(repo.name) ?? 0 >= repo.config.max_active`). A leaf whose tab already exists never reaches the check, matching the global behavior. Sweep order, park, status columns and plugin hooks are unchanged.

### D4. Print the repo key as repo_max_active

In effectiveConfig, emit the repo's `max_active` under the key `repo_max_active` and omit it when unset. A flat spread would let the repo value silently overwrite the global `max_active` line, hiding the machine ceiling; the distinct key keeps both numbers visible and satisfies "prints the key when set, omits it otherwise". No other output key changes.

### D5. Tests reuse the existing fixtures

tests/config.test.ts: extend the effective-config test or add a sibling that writes `max_active` into issues/config.yaml, asserts `repo_max_active` in parsed `akrogon config` output, asserts absence when unset, and asserts nonzero exit for 0, -1 and 1.5 via the same pattern as `fix_rounds: 0`.

tests/next.test.ts, all through dispatchFixture and the real CLI:

- Repo share: global `max_active: 3`, repo f `max_active: 1` with three eligible leaves, repo g registered second with no key and two eligible leaves (`leaf(g, slug, phase, { repo: 'other' })`, `repos: { repo: f.root, other: g.root }`). `next --all` opens exactly one tab for an f slug and two for g slugs.
- Global still ceilings: global `max_active: 1`, repo `max_active: 2`, two eligible leaves, `next --all` opens one tab.
- Existing tab bypasses the repo cap: repo `max_active: 1`, dispatch leaf one, `resetPrompts`, add eligible leaf two, `next --all`. Leaf one re-prompts on its live tab; leaf two gets no tab and no prompt.
- Unreadable charges the repo cap: global `max_active: 5`, repo `max_active: 3`, one malformed state.yaml plus two eligible leaves, `next --all` opens zero tabs, exits 1 and reports the malformed path (charge 3 meets cap 3); then repo `max_active: 4` opens two tabs, proving leaves-plus-unreadable rather than mark-full. Global headroom is required because the same charge feeds the machine total.

### D6. Guide pages state ceiling plus optional share

Edit only the named pages, text only:

- install.html: the "Why max_active" box gains the repo-share sentence.
- limits.html: the capacity card gains the optional per-repo share.
- next.html: the no-tab step gains the repo-cap condition.
- in-practice.html: the "compete for the same seats" answer names the repo key as the opt-out.
- cheat.html: the `<repo>/issues/config.yaml` comment line names max_active.
- setup.html: the repo config example gains a commented optional `max_active` line.

## Acceptance criteria

### A1. Schema and output

repoSchema accepts a positive integer `max_active` and rejects 0, negatives and non-integers. `akrogon config` prints `repo_max_active` when the current repo sets it and omits it otherwise, while the global `max_active` line still prints.

### A2. Two-level dispatch

With global 3, repo A capped at 1 and three eligible leaves, `next --all` opens one tab in A and fills remaining seats in an uncapped repo B. With global 1 and repo cap 2, one tab opens. A leaf with a live tab is never refused by the repo cap. An unreadable leaf charges its repo's cap as readable leaves plus unreadable count, and does not mark the repo full.

### A3. Documentation

All six named pages describe the cap as machine ceiling plus optional repo share, and setup.html shows the key in the repo config example.

### A4. Checks

`bun run format`, `bun run typecheck` and `bun test` pass.

## Ordered implementation checklist

1. src/config.ts: D1 and D4 together.
2. src/next.ts: D2 and D3 together; activeCount has exactly one caller.
3. tests/config.test.ts: A1 cases.
4. tests/next.test.ts: A2 cases.
5. The six guide pages: A3.
6. Run the commands below, inspect failures and the final diff, and record evidence under this authoritative leaf. Do not put issue artifacts on the implementation branch.

## Verification and evidence

Run from the implementation worktree:

```sh
bun test tests/config.test.ts
bun test tests/next.test.ts
bun run format
bun run typecheck
bun test
```

The user-visible flow is `akrogon next --all`; the dispatch fixture spawns the real src/akrogon.ts entrypoint against fake-herdr and its output is the end-to-end artifact. Capture the focused test output as evidence/cli-verification.log beneath this authoritative leaf with a shell invocation that preserves the test exit status, for example bash with pipefail and tee. Record the final check exit codes in the implementation report. Inspect git diff for unrelated formatting churn and remove iteration-created temporary helpers. No browser flow is touched; existing Playwright specs cover the guide shell.

## Known limitations

R1. in-practice.html and cheat.html tell the operator to set `max_active: 0` to pause new starts, but the global schema already requires a positive integer, so 0 fails parse today. This predates the leaf; report the stale advice without expanding scope into a global-cap semantics change.

R2. The repo key is a ceiling, not a reservation. A repo capped at 2 can still get zero seats when earlier-registered repos fill the machine cap, because sweep order is unchanged by lock. Repo caps summing past the global cap produce no warning, per operator lock 1a.
