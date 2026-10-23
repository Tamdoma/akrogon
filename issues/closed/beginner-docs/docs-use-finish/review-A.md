# Review A: docs-use-finish

Base: `40902d8399dc88612da71a678f43038db90e1286`. Reviewed head: `2c3e99c1255e9a41e16cc897ed5378f444e85849`.

## Evidence

- `akrogon verify` is green on 2c3e99c1 (format, test 1114 pass, typecheck), per implementation/report.md. There has been no code change since, so it was not rerun.
- Criterion 2: `check docs-links: 0 .../check-docs-links-1792767882155-2012148.log`. The three concept pages embed their picture with alt text, and every page ends with one `Next:` line.
- Criterion 3: `check rollback-page: 0 .../check-rollback-page-1792767882790-2012213.log`. The deliberate break is red at `check rollback-page-break: 1 .../check-rollback-page-break-1792767887773-2015245.log`.
- Criterion 4: `check docs-bans: 0 .../check-docs-bans-1792767883463-2012629.log`. The date grep finds nothing.

## Page claims traced to source

- **merge-and-announce:**
  - The land loop, the `wake=red|gate|push` handoffs and push refused twice match `src/land.ts:83-109`.
  - The `attempt=<id> solo` case matches `mergeContext` in `src/next.ts:1076`.
  - `<kind> complete <name>` matches `src/phase.ts:277`.
  - `broadcast pending` matches `src/status.ts:156`.
  - The unit name `akrogon-land-<id>` matches `src/land.ts:13`.
  - Webhook values from `~/.config/akrogon/env`, the message shape, and a failure not undoing the merge match `skills/broadcast-issue/SKILL.md:21,39,41`.
  - The B broadcast split matches `skills/merge-issue/SKILL.md:83`.
- **when-work-fails:**
  - The tab rename `<slug> failed` matches `src/phase.ts:108`.
  - The seat refusal on failed matches `src/phase.ts:313`.
  - `fix_rounds` kept and B-only re-review match `src/routing.ts:53`.
  - The `next` refusals match `src/next.ts`.
  - The empty-branch refusal matches `src/phase.ts:561`.
  - The uncommitted-work refusal matches `src/phase.ts:406`.
  - The receipt refusal matches `src/verify.ts:261`.
  - The `.env` holder repo matches `src/readiness.ts:97-119`.
- **roll-back-a-release:**
  - The steps and messages match `src/rollback.ts`.
  - `deploy held` matches `src/self-update.ts`.
  - `writeDeploySuccess` writes `previous`, `at` and `replaced`, which matches `src/release.ts:105`.
  - The prune keep set {current, previous} matches `src/release.ts:152-158`.
- **learn-from-work:**
  - The retired-lesson push refusal matches `src/phase.ts:590`.
  - The outcomes and operator-only start match `skills/learn-issues/SKILL.md`.
  - The lesson rule matches `skills/lesson-rule.md`.
- **save-records:**
  - The messages, eligibility and autostash match `src/sync.ts:10-13,39,51,63,78,157,202-211`.
  - `requireNoIssueFiles` matches `src/phase.ts`.

No AREA.md changed. No documented behavior changed: the diff adds pages only, and README, docs/reference-index.md and docs/guide are untouched. No test file changed after planning. The only test commit is b593f70a (planning) on `tests/rollback.test.ts`.

## Findings

No Fixes.

- **N1 (Nit):** plan D5 says the broadcast runs "only with configured Discord targets". The page follows the code instead (`src/phase.ts` records the handoff with no config gate), and the report records this. It is deferred because the page is correct and the plan wording is not a delivered output. It would become a Fix only if the code gained a config gate the page does not mention.

## Verdict

ready
