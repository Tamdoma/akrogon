# Design: command-reference

## Binding decisions, verbatim

# Does pull keep reading issues from origin?

## Question
Should intake follow the configured `remote` or a root `akrogon.yaml`?

### Carries
`tests/pull.test.ts:167` locks origin intake. seed-issue reads root `akrogon.yaml` `issues_repo` for outbound reports.

## Findings
(both) origin-only is deliberate; docs gap. Operator raised the Ripple framework: consumer projects file reports to the framework repo. That path already exists: seed-issue posts to `issues_repo`, and the framework repo pulls from its own origin, which is that same GitHub repo.

## Resolution
Operator 2026-09-11: `13a` after explanation. Keep origin intake. README states that intake reads the repo's GitHub origin, `remote` is where code integrates, and a consumer project routes reports with a root `akrogon.yaml` `issues_repo`. Foreclosed: switching intake to `remote`.

# Does sync refuse a non-default branch and commit only issue records?

## Question
What may `akrogon sync` stage, from which branch, under which lock?

### Carries
Standing design. Q14 finding: a stray deletion of `issues/parked/status-empty-open` was committed by sync in 13f92e0.

## Findings
(both) `src/sync.ts:175-180` stages everything and pushes `HEAD:main` from any branch, no lock. (B) reproduced: side branch plus unrelated file reached remote main; pre-staged unrelated changes also land, so scoping `git add` alone is insufficient; park holds only the global lock while phase holds global then repo. (both) `src/init.ts:38` ignores `issues/worktrees/` regardless of `worktree_root`.

## Resolution
Operator 2026-09-11: `2a` after explanation. Sync refuses when HEAD is not the checked-out `default_branch` or is detached, commits only paths under `issues/` excluding seeds, `.lock` files and the configured worktree root, leaves unrelated index and tree untouched, and holds the global then repo lock. Init ignores the configured `worktree_root`. Foreclosed: syncing from any branch through a separate index.

# How are the ten reports grouped?

## Question
One epic with six issues, or six standalone issues?

### Carries
shapes.md: a GitHub report has exactly one completion owner; #10 and #14 span four destinations.

## Findings
(both) #10 and #14 need a container owner. (B) an epic delays closure of narrow sources until the epic moves under current code; see source-owner-closure.

## Resolution
Operator 2026-09-11: `1a`. Epic `loop-hardening` owns #10 and #14. Issues `record-sync` (#7), `dispatch-progress` (#6, #9, #11), `recoverable-completion` (#5, #13), `lifecycle-records` (#8), `command-outcomes` (none), `review-protocol` (#12). Foreclosed: standalone issues with #10/#14 attached to whichever finishes last.

Excluded decisions (owned elsewhere or not applicable here): repo-field paragraph (repo-identity); all code decisions

### Standing creation-locked design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any chunk touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first chunk needing it. Non-browser flows use a real request or invocation. The gate judges the exit code and the completion half records the artifact path as evidence.
- Chunk ownership defaults to agent-owned. Only a step physically requiring the operator makes its chunk operator-owned, which parks at dispatch before any seat spawns. Credential access alone never qualifies.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

### Current interpretation

Chunk terminology above refers to this leaf's owned work. User-visible flows retain an end-to-end command and artifact; verification uses the checker's verdict and blocking `checks` commands (`bun run format`, `bun test`, `bun run typecheck`). Known human-only prerequisites are named and completed before opening a leaf; none exists for this leaf. An unforeseen physical blocker ends the attempt and informs the operator. Credential access alone does not create a human-only prerequisite, and `hand_built` remains a separate explicit operator choice.

## Leaf architecture

Owned surfaces: `README.md` command table and one configuration paragraph, one test asserting verb coverage. Depends on `scoped-branch-sync` for the sync sentence. No code change.

Exclusions: the repo-identity paragraph belongs to `repo-identity`; shapes.md edits belong to `tree-preflight` and `dead-fields`.
