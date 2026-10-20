# Slot B map addendum: #107

Recommend one additional chart, C6, for paid proof authorization and reuse. Keep the five earlier destinations separate. Remove unnecessary fresh model execution before adding budget machinery. The reported loop is confirmed in leaf artifacts, but its exact token totals, dollar shares and overnight attribution remain unverified.

Paths are relative to `/home/ivan/Work/infra/akrogon`. `framework/` means `/home/ivan/Work/infra/tamdoma/framework`. Codes continue the first map. No repository files were edited and no model sessions or live proofs were launched.

## F7 — Confirmed loop and missing grants, partly confirmed explanation

`framework/issues/open/satellite-plan-fit/hub-child-links/hub-child-links/readiness.yaml` records real Claude launches under `proofs`, including a probe with a reported dollar cost, but has `grants: []`. Its brief's C4 requires a full live replay. `framework/issues/open/forms-wiring/shown-prop-coverage/shown-prop-coverage/readiness.yaml` has the same empty grants alongside a paid launch proof, and its brief's C3 requires a fresh real composition. These are two directly inspected instances of the missing authorization record.

The live-run repetition is documented more strongly now than in the seed. Hub-child-links' `implementation/report.md:29-50` records 16 attempts, deterministic defects, model-output failures and an operator stop. Replay-cases' `implementation/report.md:35-48` names runs through live-run-19 and states that the operator accepted existing evidence without a completed final replay. These are practitioner reports, not independent reruns or proof that the original criterion passed. They establish repeated full attempts and later intervention.

The proposed cause needs correction. `skills/chart-issues/SKILL.md`, Take, already includes billing effects and repeat/recovery bounds in grants. Both implement and check reuse grants only within their scope. They do not expressly authorize unlimited paid retries. However, their checks are phrased around “before mutating” and operation/target/identity, which leaves quota-consuming local launches easy to misclassify as having no external effect. The inspected readiness files demonstrate that misclassification. Clarify the existing effect boundary instead of inventing a second model-specific permission system.

`src/readiness.ts:grantSchema` requires only nonempty prose for `bounds` and `stop_line`. `readinessSchema` accepts empty grants, `proofSchema` has no link to a grant, and `gaps` checks only env/file availability. A search for `grants`, `bounds` and `expires` across `src/*.ts` found their schema declarations in readiness, not runtime accounting. This is an agent-judged contract, not an enforced spending limit.

## F8 — The deeper cause is fresh execution being used for proof and diagnosis together

There are already rules against this waste. `skills/chart-issues/assets/standing-design.md`, Standing design lines, requires the cheapest sufficient proof, recorded model/outside output for chain replay, a real call when the model-facing behavior changes, and rerunning changed stages and consumers. It requires a clean full run only when reuse cannot be shown or whole-run behavior is itself under test. It also says merge never requires a live model run. `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md:93` retain unaffected green proof rather than automatically rerunning everything.

The concrete runner constrains that policy. `framework/.claude/workflow/scripts/run-satellite-live-replay.ts:runReplay` creates a consumer and runs the prefix again. `main` exposes full replay or print-plan, and its trial path offers case selection and recorded snapshots. It has no full-replay stage-resume option. The report incorrectly presents `--case`, `--case-file` and `--limit-minutes` as the whole runner's common flag set: they belong to trial mode. A full replay therefore makes a late deterministic defect expensive to investigate again.

This limitation is not universal across proof tools. `framework/.claude/workflow/scripts/record-composition-spine.ts:main` already accepts `--resume stage1|stage2`, restores prior state, and skips earlier stages. Do not chart “build resume for all proof runners” from this seed.

The launch boundary also explains why a run count is not a spending bound. `framework/.claude/workflow/scripts/lib/session-trace.ts:buildArgv` supplies model, effort, prompt and tool/permission flags, with no budget argument. `runSession` has a 1,800,000 ms timeout per launched process, not a cumulative leaf allowance. `launchSkillSessionAsync` retains raw result JSON. `lib/phase-capture.ts:captureStage` extracts `total_cost_usd` and `modelUsage` after a launch. Existing receipts can support an evidence trail without a new telemetry system, but they do not prevent another launch or account for every other runner automatically.

**Smallest systemic simplification:** remove unnecessary whole-live-pipeline requirements from product criteria. Exercise deterministic code against preserved real output, use existing stage resume where valid, and make a fresh model run only for the model behavior or interaction the change actually invalidates. Remove duplicate live execution by implementation/review when retained evidence still proves the final behavior. Keep paid launch authority inside the existing grant contract, explicitly including quota use even when no resource is created.

This route can begin with contract/skill corrections and existing artifacts. If an essential proof genuinely cannot reuse stages with the current satellite runner, that missing capability is framework-owned proof machinery and needs its own prerequisite before a dependent live-proof contract. Do not make each product leaf extend the runner, contrary to the existing standing-design rule. A general budget broker, provider cost calculator and host scheduler are not prerequisites to removing repeated live work.

## D7 — What stops additional paid launches?

The material options are an explicit lifetime-scoped grant judged by the seat, or an enforced launch allowance. The existing grant is the smallest first mechanism. It must cover charting probes, implementation, repair and review as appropriate, and its remaining authority must survive replacement sessions, new commits, evidence-directory deletion and a provider quota reset. “One run per pass” can reset indefinitely and is not a useful leaf-wide bound. A full run can also launch several parents and children.

There is an existing lock to reopen before selecting enforcement: `issues/chart/proof-cost/forks/proof-run.md`, Taken, records the operator's 2026-10-10 decision that cost estimates are informational and forecloses “any enforced budget, timer or numeric gate”. The new report supplies evidence to challenge that decision. The seed's requested bound is not itself a new operator answer. Neither silently add a numeric gate nor pretend that a prose grant mechanically enforces one.

If the operator requires a hard allowance, the code belongs at the actual launch boundary and must reserve usage before concurrent launches, persist consumption outside disposable proof folders, and count restarted attempts against the same authority. A check only in `akrogon run-check` would miss direct `claude -p` and runner descendants. That is additional implementation scope, not a one-line schema change.

**Q6.** Is the desired limit on authorized full attempts, billable child sessions, estimated money, or account quota consumption? What unit can the actual login/provider expose reliably? The hub-child-links proof records identify a local Claude Code login, not a dedicated API billing account. Do not equate raw tokens, local estimated dollars and subscription usage.

**R6.** A session-local cap resets on the next session and cannot alone stop repeated launch loops. Claude's primary CLI documentation exposes a print-mode `--max-budget-usd` option, but using it would require verifying the installed version, credential mode and nested-session coverage. No such paid probe was run here. [Claude CLI reference](https://code.claude.com/docs/en/cli-reference).

## D8 — What evidence must actually be fresh?

Choose behavioral proof with valid recorded-output replay by default. Preserve fresh end-to-end execution only where the requested outcome needs it. Do not turn “live once as final evidence” into a universal rule: changing a prompt, model, settings or model-output contract can invalidate the recording, and a failed live run is not passing evidence. That distinction is already in Standing design lines.

**Q7.** For each named product leaf, what specific failure can only a new full live run catch? For hub-child-links, separate deterministic child-list generation and link checking from whether the model follows the new brief. The full replay also exercises unrelated later stages. The smallest adequate live segment should be justified by that property, not by the existence of the full runner. Evidence: its brief C1–C4 and `runReplay`.

**R7.** Reuse can hide regressions if the captured inputs, model-facing instructions or consumers changed. Preserve provenance and raw failed artifacts before cleanup, prove which stages remain valid, and rerun changed stages and their consumers. Never accept edited “recordings” as real capture. Conversely, forcing a fresh run after every harmless rebase or review discards useful evidence. The existing implementation/check proof-reuse rules are the starting point, not a new parallel policy.

## D9 — When the allowance or provider limit is reached

Recommend that exhaustion ends paid execution under the existing blocker path, while any authorized offline diagnosis continues. A delayed restart or account switch is not new authorization. This is an intended rule for the chart, not a claim that the current code enforces it. Preserve the named failure, attempted command, evidence and requested operator action. Do not add a quota-reset scheduler.

**Q8.** Does the current grant really count all attempts? The comparison case is weaker than the seed implies: media-range-live's `readiness.yaml` permits at most one pass rerun, while its `implementation/report.md:23-26` records pass 1, pass 2 and a third diagnostic pass. It later says further passes were forbidden. Without inspecting any intervening approval, this proves an eventual stop, not that a two-attempt bound was obeyed. A “diagnostic” label must not silently exclude paid attempts from a bound.

**R8.** A proof request from the next reviewer must consume the same authority rather than restart its allowance. B's repair rule explicitly runs planned live proofs (`skills/check-issue/SKILL.md:81`), so repairing only A's instructions leaves a repeat path. Charting's real-operation probe requirement also consumes authority before leaf handoff (`skills/chart-issues/SKILL.md`, Take). Include those paths in the contract while avoiding redundant model-pin probes whose existing evidence remains applicable.

## F9 — Relation to #102–#106 and chart split

#107 shares #105's confusion between a behavioral requirement and its proof recipe. They should exchange the rule that incidental proof mechanics belong in a correctable plan, but their destinations differ: #105 prevents false operator blockers from invalid locked commands; #107 prevents unauthorized/redundant paid execution and preserves evidence. Combining them would force a runner-contract fix to wait on billing-policy choices.

#104 shares repeated verification cost, but it concerns stack-selection history and unchanged member heads. Paid launch authority and recording reuse neither require nor fix its queue mechanism. No actual dependency on #102, #103 or #106 was found.

**C6 — Paid proof execution:** paid proof work uses retained real evidence for diagnosis and launches fresh sessions only for a justified property within explicit authorization that survives retries and seat changes.

The recommended split is now **six charts**, preserving C1–C5 from map-B.md. Do not automatically add a seventh “resume engine” chart. If C6's settled proof design requires a missing framework capability, chart that concrete capability with its own outcome and make only the proof that consumes it dependent. Cost disclosure from proof-cost and read-call reductions from token-spend are existing work to preserve, not substitutes for C6.

## F10 — Source tiers and remaining uncertainty

- **S5 — operator tier:** the supplied #107 seed is operator-provided intake with agent attribution. Its 1.33B tokens, shares, exact overnight launch counts, scheduled sleeps and account-switch history were not independently recounted here. The explicit proof-cost Taken decision is inspected operator evidence. The later operator waivers are reported by leaf artifacts, not directly verified transcripts.
- **S6 — practitioner tier:** the named framework implementation reports and readiness files establish concrete repeated attempts, missing grants and evidence limitations. I did not run their proofs, accept their waivers myself, or inspect unrelated private session history.
- **S7 — better-than-training tier:** inspected akrogon schemas/skills, framework launch/replay/recording code and primary Claude documentation. Searches: `site.code.claude.com/docs/en costs cache usage total_cost_usd subscription` and `site.code.claude.com/docs/en/cli-reference max-budget-usd print`, followed by the official cost and CLI pages. Claude documents local session cost as an estimate and distinguishes subscription usage from API billing. Therefore token share alone does not establish dollar-spend share. [Claude cost documentation](https://code.claude.com/docs/en/costs).
- **S8 — model judgment:** the recommended boundaries and lifetime risks follow from these inspected mechanisms. The largest proof-34b spend category still needs exact process/session attribution before promising that the proposed change removes its measured share. Paths or skill-name occurrences in seat transcripts are not by themselves counts of launched paid sessions.
