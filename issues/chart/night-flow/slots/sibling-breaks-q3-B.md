# Slot B: Q3 blind notes

Read 2026-10-11. Independent position on cheap checks before review. `akrogon config` was used once to read the registry. All ten registered issues/config.yaml files were inspected. No config or code was changed, no check was executed, and no lifecycle mutation was run.

## 1. Pick, reason, cost

**D4: Use the existing checks/merge_checks split. Every cheap blocking check belongs in checks, including cheap children hidden inside a larger merge command.** Enforce that placement through setup and review of the real command definitions, not shell-string matching or a new “slow” flag.

The concrete framework correction is an operator step on main:

```yaml
# First entry under checks:
cheap: bun run framework:verify:cheap
# Add cheap to the existing merge_covers list.
```

That shared cheap command contains the actual typechecks and lint used at merge. Its future cheap additions automatically run before review too. Adding `cheap` to merge_covers avoids a separate duplicate invocation at merge, where framework:verify already includes it on the integrated candidate. Keep the real merge spine and its root-state guard.

For all repos, init-akrogon and setup guidance must inspect the child scripts of aggregate merge commands and put their cheap components in checks. An implementation or review that changes the verification spine must apply the same placement rule. A name such as “slow” on an aggregate cannot exempt the cheap children it calls.

A runs the cheap group before longer final proof, after its owned main refresh and before review. Run relevant changed checks while implementing, then the complete configured cheap group at final handoff. Reuse unchanged evidence under the existing rule. B verifies the actual commands and results. Merge reruns any cheap checks needed to validate the new integration, even when the leaf's earlier result was green.

Reason: this removes the observed missing gate using a shared command already maintained by framework. No new schema, receipt store, timing threshold, shell parser, phase or background process is needed.

Cost: framework pays one additional cheap group before review. Its parity/contracts components overlap existing entries, so some current duplication remains. Removing those aliases or retuning the runner is framework work and is not required for this correction. The whole cheap group's standalone duration was not measured in this read-only pass. Record it in the implementation evidence before claiming the added cost is seconds. Slow core checks remain at merge unless an existing criterion requires them earlier.

## 2. Rejected options

- **O8: Framework-only fix with no shared placement rule.** Repairs tonight's gap but permits the same aggregate-command mistake in another repo or a future script change.
- **O9: Run every merge_checks command before review.** Pulls the full core suite into every final pass. Framework's non-held night attempts took 6.9–12.2 minutes including setup, rebase and checks. That is not evidence for a cheap leaf gate.
- **O10: Require exact command/name equality between checks and merge_checks.** `bun run framework:verify` legitimately contains `bun run framework:verify:cheap`, yet their strings differ. A spelling check cannot prove functional coverage.
- **O11: Add a declared-slow list and accept every listed aggregate.** Declaring verify slow would still hide the same cheap checks. Classification belongs to the child operations, so the flag alone does not solve the defect.
- **O12: Discover cheapness through runtime limits or automatic shell expansion.** A time limit depends on machine/load and can reject valid checks. Arbitrary scripts can invoke other scripts dynamically. A generic parser adds machinery without proving complete coverage. Inspect the real definitions and measured cost instead.

## 3. Evidence

All sources below were read 2026-10-11.

- **E10, operator:** [INTAKE:329](</home/ivan/Work/infra/akrogon/issues/chart/night-flow/INTAKE.md:329>) through line 332 records the missing cheap gates, F16/F17's independence from a moving main, and the request to test before review. This makes check placement a separate problem from rebasing.
- **E11, better-than-training:** [framework config:8](</home/ivan/Work/infra/tamdoma/framework/issues/config.yaml:8>) runs parity, contracts and selftest in the leaf. [package.json:163](</home/ivan/Work/infra/tamdoma/framework/package.json:163>) defines eleven cheap child commands, including four typecheck commands and lint. Lines 167–168 include that group in the fast stage of the full merge spine. This supplies the existing command to reuse.
- **E12, better-than-training:** [config.ts:49](</home/ivan/Work/infra/akrogon/src/config.ts:49>) supplies arbitrary command maps and merge_covers names. [Line 84](</home/ivan/Work/infra/akrogon/src/config.ts:84>) validates that covered names exist and requires nonempty merge_checks, but does not prove semantic child-command coverage. [setup.md:53](</home/ivan/Work/infra/akrogon/docs/guide/setup.md:53>) already assigns slow work to merge_checks. [init-akrogon:16](</home/ivan/Work/infra/akrogon/skills/init-akrogon/SKILL.md:16>) already inspects manifests/commands and [line 20](</home/ivan/Work/infra/akrogon/skills/init-akrogon/SKILL.md:20>) proposes the split. Clarify those existing obligations rather than add metadata.
- **E13, better-than-training:** [implement-issue:63](</home/ivan/Work/infra/akrogon/skills/implement-issue/SKILL.md:63>) already requires every checks command before handoff and permits reuse of unchanged evidence. D4 changes which real commands belong there and their order before costly final proof. [chart shapes:284](</home/ivan/Work/infra/akrogon/skills/chart-issues/assets/shapes.md:284>) makes issues/config.yaml changes operator work on main, not a leaf diff.
- **E14, better-than-training:** [framework merge-attempts:10](</home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl:10>) through line 19 yields 6.9–12.2 minutes for the seven non-held night attempts. This measures complete attempts, not the cheap group. [run-verify-stages.ts:95](</home/ivan/Work/infra/tamdoma/framework/.claude/hooks/scripts/run-verify-stages.ts:95>) records whole stage duration, and [line 112](</home/ivan/Work/infra/tamdoma/framework/.claude/hooks/scripts/run-verify-stages.ts:112>) skips later stages after failure. A fast-stage duration also includes selftest, so it cannot be called cheap-group duration.

Registry audit, from the read-only `akrogon config` result and each linked config:

| Config | Registered repo | checks | merge_checks / merge_covers |
| --- | --- | --- | --- |
| RC1 | [akrogon](</home/ivan/Work/infra/akrogon/issues/config.yaml:6>) | format, test, typecheck, test_changed | absent / absent |
| RC2 | [framework](</home/ivan/Work/infra/tamdoma/framework/issues/config.yaml:8>) | parity, contracts, test, test_changed, selftest | verify / five existing checks covered |
| RC3 | [pi-extensions](</home/ivan/.pi/agent/extensions/issues/config.yaml:7>) | test, test_changed | absent / absent |
| RC4 | [mdcny-ghl-data-pulls](</home/ivan/Work/personal/MDConsultingNY/mdcny-ghl-data-pulls/issues/config.yaml:7>) | empty | absent / absent |
| RC5 | [boulevard-automation](</home/ivan/Work/personal/MDConsultingNY/boulevard-automation/issues/config.yaml:7>) | typecheck, test, test_changed | absent / absent |
| RC6 | [clinique-la-roya](</home/ivan/Work/personal/MDConsultingNY/clinique-la-roya/issues/config.yaml:7>) | parity, contracts, test, test_changed, selftest | absent / absent |
| RC7 | [lens](</home/ivan/Work/infra/tamdoma/lens/issues/config.yaml:7>) | typecheck, lint, test, test_changed | absent / absent |
| RC8 | [Himne](</home/ivan/Work/personal/Himne/issues/config.yaml:7>) | typecheck, test, test_changed | absent / absent |
| RC9 | [lingua-relay](</home/ivan/Work/personal/lingua-relay/issues/config.yaml:7>) | empty | absent / absent |
| RC10 | [blepsis](</home/ivan/Work/infra/blepsis/issues/config.yaml:7>) | test, typecheck | empty / absent |

Absent maps/lists default to empty in repoSchema. Framework is the only registered repo with a nonempty merge_checks map. In the other nine, no configured merge-only command can hide an extra cheap check. Empty configurations do not establish repository health or adequate tests. This audit covers configured lifecycle gates, not unrelated CI workflows.

## 4. Lifetime pitfalls and their removal

- **R9: New cheap gates are added only to an aggregate merge script.** Put the maintained cheap subgroup in checks. Review changes to the verification spine against that placement rule. A genuine cheap addition then reaches leaf validation without duplicating its definition.
- **R10: Early green evidence is reused after code, configuration or integration changes.** Use the existing evidence-reuse rules and the final refreshed head. Retain merge's integrated verification. A later cheap failure caused by integration is still a legitimate merge failure.
- **R11: A supposedly cheap group becomes slow or duplicates expensive work.** Record its standalone wall time separately from selftest/core. Keep its components bounded to cheap validation, and assign expensive suite work to the existing merge path through an explicit operator config decision. No automatic deadline or new configurable threshold.
- **R12: “Enforcement” is promised that the command cannot supply.** State that classification and completeness are reviewed by agents using definitions and results. The current phase command does not prove arbitrary shell-command equivalence or that every cheap operation was run. Preserve blocking checks and require real failure evidence for the new placement rule. Do not advertise this as a new mechanical gate.

The correction's verification should show a deliberate type/lint defect failing the leaf gate before review, a valid leaf reaching review without running the slow core suite, and the merge still checking the actual combined candidate. Record the added cheap-group time with those results. These runs belong to implementation, not this read-only brief.

## 5. Missing question

**Q6: Does “enforce” mean a reviewed placement rule or a command refusing the phase move based on persisted check results?** Recommend the former with the current config shape. The latter would require new result identities, invalidation and persistence, and still cannot infer cheap children from arbitrary shell code. That is a distinct mechanism and cost to choose explicitly, not an implication of adding a slow flag.
