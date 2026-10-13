# Guarantee fork — slot B, blind

Read 2026-10-13. No other slot notes or permit-bypass fork files read. No live workload changed.

## 1. Pick, reason, cost

**Pick revised 1b: enforce admission at the declared heavy test entry points, retaining the existing slice and permit lifetime.** This closes the observed raw `bun run test:changed` path without asking an agent to remember an outer wrapper. Instruction repair and a usable long-run path still belong in the work, but cannot be the whole prevention mechanism.

The guarantee must be precise: **one admitted top-level check execution at a time through the covered entry points and run-check/base-run, while the permit owner lives.** Descendant parallelism within that execution remains allowed. Killed-owner leftovers remain the explicitly accepted permit-release residual. No option offered proves literally one arbitrary heavy workload across the entire host.

Revise 1b before showing it as implementable:
- Do not use mere presence/absence of AKROGON_RUN as authority. An empty, stale or unrelated value must not enable heavy work. Existing `src/permit.ts:94–97` verifies token equality against a live holder. Put validation in akrogon, not a second independent token protocol in framework.
- Define the covered scripts and direct file entry points before handoff. Framework `test:changed` is the demonstrated bypass, but `framework:verify:core`, constituent browser runners and direct `bun test` are other paths. “Each registered repo's heavy scripts” is an unbounded migration without an inventory. Either approve that inventory and its destinations, or explicitly limit the guarantee to named entry points.
- Prefer a small gate that validates admission and refuses an unadmitted invocation with the complete permitted command, over complicated transparent self-reentry. If automatic reentry is wanted, prove one reentry, live-token reuse and unchanged arguments/cwd/base/result. A private unguarded body or bypass flag must not become the next normal entry point.

Cost: framework depends on an installed akrogon validation interface for these host-managed runs. Local/CI use and fixture repos need an explicit contract. More than an instruction edit, but it moves this known failure from agent compliance to executable behavior. Automatic reentry costs more than refusal and can silently alter environment/base through run-check. Neither protects against deliberately modifying guarded source or copying another live token under the same user.

## 2. Rejected options

- **1a as the complete fix:** documents the actual implementation but leaves the exact reproduced bypass available. Existing implement skill already requires the resolved changed-tests command. Its failure was not absence of those words. It also must not quietly write a new accepted bypass residual over the rejected limit-boundary 1b. If the operator chooses guidance-only explicitly, state that this is acceptance of repeat overlap, with aggregate containment retained. That is a legitimate cost decision, not a mechanical guarantee.
- **1b exactly as drafted:** “when AKROGON_RUN is absent” trusts an unchecked environment value and never calls `withPermit` in the present-but-invalid case. It also does not identify how a script avoids recursively reentering itself or how main checkout/unregistered CI obtains a run-check target. The direction is sound, the proposed shortcut is not.
- **1c:** a small CPUQuota makes an unauthorized test slow, not queued. It can still consume RAM, launch browsers, time out and overlap the admitted test. Per-pane quotas accumulate across panes and also throttle legitimate agent work, git and builds. Moving children into separate full-quota scopes adds lifecycle/stop ownership work and reopens the explicit per-run-unit prohibition. If nested under a throttled pane hierarchy, ancestor limits still constrain them. More mechanisms without the claimed serialization outcome.
- **Universal arbitrary-command interception:** not offered as a small fourth patch. Shell aliases/hooks and executable-name matching miss direct files, absolute paths, other interpreters and newly written scripts. A real mandatory execution boundary is a different scope and trust model. Do not imply the entry-point gate supplies it.

## 3. Evidence, tier, date

All sources read 2026-10-13.

- **Operator:** `issues/chart/permit-bypass/INTAKE.md` asks to patch everything needed after the raw framework run overlapped the holder. `host-test-load/forks/limit-boundary.md:54–62` binds permit plus containment, not a ceiling-only or wrapper-only replacement. `permit-release.md` Taken accepts killed-owner leftovers, prohibits per-run units, and requires validated nested reuse. `heavy-runs.md` Taken admits every run-check/base-run without a light exemption. Queue and ceiling policies stay locked here.
- **Practitioner:** Jason Jacob, Buildkite support engineer working with enterprise CI customers, [Concurrency Gates](https://buildkite.com/resources/blog/concurrency-gates/) (2020, updated 2024). His end-to-end testing case puts parallel test work inside a common admitted region. This supports admitting the whole run while retaining internal parallelism, not throttling unauthorized tests. It assumes participating jobs are controlled by the scheduler. It does not prove enforcement over arbitrary shell commands. Our existing outer permit already supplies the admitted region, so do not copy Buildkite's separate start/end machinery.
- **Primary docs:** [Buildkite controlling concurrency](https://buildkite.com/docs/pipelines/configure/workflows/controlling-concurrency). Shared concurrency groups apply to participating jobs across pipelines. Inference for this fork: all covered resource entry paths must participate in the same authority. The docs do not justify claiming whole-host exclusivity for nonparticipating commands.
- **Primary code:** `src/permit.ts:65–68,93–97` checks holder PID/start time/boot and matching token before nested admission. Mere environment presence discards that guarantee. `run-check.ts:149–161,173–181` requires a registered repo/target, constructs environment, recomputes base and runs inside admission. `run-check.ts:134–135` refuses an unmatched checkout without --leaf/--holder. Automatic reentry therefore changes more than just lock acquisition.
- **Primary code:** framework `/home/ivan/Work/infra/tamdoma/framework/package.json:11,23–31` exposes test:changed plus direct browser/test entries. `.claude/workflow/scripts/run-test-changed.ts:430–443` invokes either framework:verify:core or selected scripts. Gating that file alone covers its calls, not independent invocations of those other entries. `:447–449` is its CLI entry.
- **Primary code:** `tests/run-check.test.ts:331–352` exercises outer/inner run-check completion, but does not establish safe self-reentry or framework standalone compatibility. `src/config.ts:312–326` wraps effective commands already. `skills/implement-issue/SKILL.md:57` already mandates the resolved changed-tests command.
- **Measured incident:** my opening-map session inspection found raw invocation before timeout, at flaky-test-fixes session `2026-10-13T12-13-24-718Z_01a1352e-896d-70ad-b280-9b129f679cbd.jsonl:47`, then another raw invocation under nohup at :51. The first selected a 300-second tool timeout. This is evidence against explaining the bypass solely as a timeout workaround.
- **Primary systemd docs:** [resource-control source](https://raw.githubusercontent.com/systemd/systemd/main/man/systemd.resource-control.xml), CPUQuota and hierarchy sections. CPU time caps do not implement a queue of test runs. This is why 1c cannot fulfill the stated guarantee.

Practitioner searches run: `site.buildkite.com concurrency groups tests shared resource engineering`, `site.bazel.build exclusive tests other bazel invocations`. No model-only premise is needed for the recommendation.

## 4. Pitfalls and what removes them

- P1 — Invalid token bypass: central live admission validation. Acceptance cases: absent, empty, stale, unrelated, valid nested token. Do not duplicate sidecar parsing in every repo.
- P2 — Recursion/deadlock or double counting: guard before heavy side effects, one shared authority, explicit CLI/body structure, nested execution test under a held outer permit. Admission count refers to outer executions, not every test child.
- P3 — Changed run semantics: prove arguments, cwd, requested base, constructed environment, exit status and signal behavior for raw entry versus configured wrapper. A refusal gate avoids silently changing the run and leaves the resolved command responsible for setup.
- P4 — New compatibility failure: name supported worktree, worker, base-run, main checkout and non-akrogon CI behavior before implementation. Never silently run ungated when akrogon is missing. Do not ship a global dependency under a promise that standalone use is unchanged.
- P5 — Incomplete coverage: record the concrete entry-point inventory and limits. A direct-script probe alongside a package-script probe prevents a package.json-only fix from claiming script-level enforcement. Do not expand unrelated repos without approved scope.
- P6 — Overclaim after holder death: retain the permit-release residual verbatim in the contract. If operator demands no leftover overlap, reopen permit-release separately. Entry-point checks cannot revoke already running descendants.
- P7 — Finite harness timeout kills a queued run: settle the long-run fork before acceptance. Do not solve this by weakening admission or adding a queue timeout. Preserve ceiling, existing queue order and no light-check exemptions.

## 5. Questions the fork leaves open

- Q2 — Is the intended coverage the demonstrated framework path, a named framework heavy-entry inventory, or all registered repos? This changes both destination count and the truth of “on this host.”
- Q3 — Should an unadmitted entry refuse with the full correct command (simplest) or transparently queue/reenter (more convenient, larger compatibility surface)? My preference is refusal plus the long-run execution path.
- Q4 — Does the operator mean normal source entry points under a cooperative same-user agent, or enforcement against arbitrary scripts and modified guards? None of 1a–1c delivers the latter.
- Q5 — What must happen on developer machines/CI without akrogon? A host-only guard cannot detect applicability through another optional environment flag without reintroducing a bypass. Choose an explicit deployment/usage contract.

No guarantee choice authorizes changing live resource settings, stopping leaves, or introducing per-run units. No operation probes or heavy tests run for these notes.
