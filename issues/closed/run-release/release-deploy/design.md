# Design: release-deploy

## Binding decisions, verbatim

### Run location
From [run-location.md](../../../chart/run-release/forks/run-location.md). Operator 2026-10-16: "ok, then whatever you recommend, let's go", given after A recommended O1b: one immutable release folder per merged main commit behind a `current` pointer. Reason: no editable checkout serves execution, the switch is atomic, rollback is one pointer flip. Foreclosed: running from the workspace; a second git checkout; warning or refusal on a dirty root; read-only files; stash or reset during update; compiled single binary (skills, plugin and systemd need files on disk, and `process.execPath` is used as the bun interpreter).

### Release shape, Q2 and Q3 (this leaf)
From [release-shape.md](../../../chart/run-release/forks/release-shape.md). Operator 2026-10-16: `1a | 2a | 3a | 4a`.
Q2: keep current and previous; delete any other release 24 h after it was replaced. Reason: no new tracking; longest recorded verify 4.9 min. Cost accepted: a command running over 24 h from a replaced release could break. Foreclosed: claim-tracked deletion.
Q3: on a failed build `current` stays, dispatch continues, `akrogon status` shows the failure with attempted and active commit, retry at the next trigger. A release is built under a temporary name and renamed only when complete; `current` flips by rename of a temporary link. Foreclosed: stop dispatch on a failed build.
Q1 carried: state lives in the state home (state-home leaf); a release holds no state.
Q4 part owned here: the deploy stage honors a hold record naming one commit, so every release built by this leaf already respects a rollback hold (B,C). The `rollback` verb, the hold writer and link restore on rollback stay with release-rollback.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: criteria are proven at the CLI boundary (`akrogon next`, `akrogon status`) over a temporary HOME, a temporary akrogon repo with a bare remote, and fake herdr/systemctl already used by tests; never the real `~/.akrogon` or `~/.local/bin`. Criterion 2 is the reported bug: its test fails on today's code and passes after. Criteria 3 to 5 each show one deliberate break turning their test red. `bun install --frozen-lockfile` may run against the temporary repo's lockfile; no network beyond what checks already allow. No machinery.

## Leaf architecture

Owned surfaces: `src/self-update.ts` (deploy split from the records stage), `src/install.ts` (links through `current`), a release module (new: build, flip, prune, last-deploy result), `src/status.ts` (failed-deploy line), skills/chart-issues/SKILL.md presence check line, skills/merge-issue/SKILL.md lesson helper line, skills/seed-issue/SKILL.md akrogon root line, README.md and docs/guide/install.md install steps.

Rules:
- Records stage unchanged: record commits push and the workspace checkout moves as today, and its `checkout pending` keeps its meaning for records only.
- Deploy stage: runs for the akrogon repo after the records stage whatever its outcome, builds from the fetched `<remote>/<default_branch>` commit with `git archive` (or equal) from the repo's object store, never from the working tree.
- Last deploy result (commit attempted, step, error, time) is stored in the state home and read by `akrogon status`.
- Hold record: one file in the state home naming the held commit; this leaf reads it and clears it when a different commit deploys; release-rollback writes it. (B,C)
- Replaced time per release is recorded in the state home at each flip; pruning runs at deploy.

State changed and its consumers:
- "Own repo" today is `realpathSync(repo.root) === toolRoot` (src/self-update.ts `selfUpdate`), gating install and the install lock. Open for the plan: identify the akrogon repo by its registered identity instead, and keep the install lock.
- `toolRoot` now resolves to a release folder. Consumers: `planSkillLinks` and the herdr plugin link (src/install.ts), the systemd slice source. `planSkillLinks` treats links pointing elsewhere as conflicts: the first switch must repoint links that point into the workspace without a hand step (criterion 6). Open for the plan: the conflict rule for links pointing into an older release or the workspace.
- `process.execPath` as the bun interpreter (src/self-update.ts install, skills/chart-issues/scripts/peer-ask.ts) still names bun.
- seed-issue reads the akrogon root's `akrogon.yaml` `issues_repo` through `git rev-parse` on the command path; a release has no `.git`. Open for the plan: the replacement lookup (for example the registry entry for the akrogon repo).
- Tests that pin `realpathSync(destination) === toolRoot/...` (tests/install.test.ts) and the own-repo install tests (tests/install.test.ts) change with the stated reason.
- First switch on the live host happens through this leaf's own code at the second pass after merge (the merging pass still runs old code). Open for the plan: confirm the first new-code pass deploys even when the workspace is already at the merged commit.

Exclusions: rollback and the redeploy hold (release-rollback); state home (state-home); removing tracked tool-root state from git (door step).
