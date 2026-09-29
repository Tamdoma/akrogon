This round settles how lessons merge, whether the lifecycle log belongs under the same rule, and how existing repositories receive the change. The reported workaround is reproducible, but two contracts matter before rollout: lessons can be corrected or pruned, and log readers currently treat file position as event order. Research below was read or run on 2026-09-29. This is B's independent round, without access to A's findings or other slot outputs.

### 1 · How should `learnings/LESSONS.md` stop conflicting on rebase?

Use Git's built-in union driver for this exact path. Framework commit `5376311de` added the tracked rule, and its checkout also has the local rule described in the intake. A scratch rebase reproduced the first-install problem: putting the tracked rule in the commit being replayed still conflicted, while adding the local rule before rebasing kept both additions.

Research: **operator** · `issues/seeds/40-gacp-rebase-conflicts-on-learnings.md`, read 2026-09-29 · the report describes a failed tracked-only rollout followed by success with local attributes · this makes bootstrap behavior part of the decision. **Practitioner** · [Fillip Kosorukov's first-hand changelog incident](https://fillipkosorukov.net/2026/07/04/a-git-merge-rule-for-append-only-ai-changelogs/), published 2026-07-04, read 2026-09-29 · independent one-line additions justified a path-specific union rule · this supports a narrow rule, conditional on entry semantics. **Better-than-training** · [Git attributes documentation](https://git-scm.com/docs/gitattributes), framework history and Git 2.55.0 scratch rebase, inspected 2026-09-29 · union retains conflicting lines without imposing chronological order, and local attributes override tracked attributes · this rules out treating tracked-only installation as sufficient for the first rebase.

- **1a (recommended)** Have `akrogon init` ensure `learnings/LESSONS.md merge=union` in root `.gitattributes` and the local attributes file located with `git rev-parse --git-path info/attributes`. Preserve unrelated entries and make repeated initialization leave the same result. This covers both shared policy and the demonstrated bootstrap failure without adding a custom driver. Select a maintenance policy in question 4 before enabling it.
- **1b** Keep only the tracked rule permanently. Install the local rule during rollout, then remove that owned line after the target branch carries the tracked rule and verify behavior without it. This avoids a lasting local override but adds migration steps and leaves rebases onto older targets needing the workaround again.
- **1c** Keep normal text merging and resolve lesson conflicts manually. This retains visible conflicts for competing corrections, at the cost of continuing the observed interruptions.

Pitfalls: Union is line merging, not entry validation or deduplication. The local rule is untracked and can mask a later tracked policy change, so changing this policy must account for both locations. Never apply it to all Markdown or all files.

### 2 · Should `issues/log.jsonl` get the same merge rule?

`src/log.ts:16` appends one JSON object per physical line, which initially looks suitable. But `src/status.ts:123` uses `findLast` to choose an event for phase age, and `src/status.ts:293` takes the last ten matching lines for history. A merged file can remain valid JSONL while those selections become misleading when the same leaf has events on both sides.

Research: **operator** · the seed report, read 2026-09-29 · log conflicts are suspected, not observed · this prevents presenting a second confirmed incident. **Practitioner** · [Kosorukov's account](https://fillipkosorukov.net/2026/07/04/a-git-merge-rule-for-append-only-ai-changelogs/) and [Martin Fowler, Semantic Conflict](https://martinfowler.com/bliki/SemanticConflict.html), published 2011-08-04, read 2026-09-29 · line-level success does not establish correct application behavior · this requires checking consumers before extending the rule. **Better-than-training** · `src/log.ts`, `src/status.ts:27-50,123-130,293-298`, inspected 2026-09-29 · records are parsed separately but selected by physical order · this changes the recommendation from blanket inclusion to deferral.

- **2a (recommended)** Leave the log on normal merging in this rollout. Its readers have an order dependency, and changing that contract is separate work from fixing lesson conflicts.
- **2b** Include log union only with an explicitly expanded implementation scope that defines event ordering and duplicate handling, updates both consumers, and proves behavior for interleaved events of the same leaf. This addresses potential log conflicts but needs more than an attributes line. Timestamp sorting alone cannot establish causal order between competing transitions.
- **2c** Enable log union now and explicitly accept that phase age and recent history may be misleading after a merge. This is the smallest diff but accepts degraded behavior.

Pitfalls: JSON parsing checks syntax, not event order or lifecycle consistency. A merge rule also does not solve simultaneous filesystem writes, and log merging does not reconcile competing state transitions.

### 3 · How should registered repositories receive the chosen rule?

The live `akrogon config` lists nine repositories, not the eight implied by the seed. Framework already has both lesson rules. The other eight have effective lesson merge attributes of `unspecified`, including newly listed lingua-relay. Every repository reports `unspecified` for the log.

Research: **operator** · the supplied registry and `skills/init-akrogon/SKILL.md:76`, read 2026-09-29 · initialization owns scaffolding, and a leaf stays within one repository · this separates the durable code change from fleet rollout. **Better-than-training** · live `akrogon config`, `src/init.ts:24-72`, `src/phase.ts:257-263`, `tests/init.test.ts`, and each repository's Git history/attributes, inspected 2026-09-29 · init currently writes configs and registration but no attributes, while leaf changes under `issues/` are rejected · this rules out a cross-repository leaf and a blind loop rerunning init.

| Repository | Registered root | Inspected HEAD | Lesson rule |
| --- | --- | --- | --- |
| akrogon | `/home/ivan/Work/infra/akrogon` | `57f7e82` | Missing |
| framework | `/home/ivan/Work/infra/tamdoma/framework` | `3a6ad12d2` | Tracked and local |
| pi-extensions | `/home/ivan/.pi/agent/extensions` | `bb9cd92` | Missing |
| mdcny-ghl-data-pulls | `/home/ivan/Work/personal/MDConsultingNY/mdcny-ghl-data-pulls` | `da575f7` | Missing |
| boulevard-automation | `/home/ivan/Work/personal/MDConsultingNY/boulevard-automation` | `8da6939` | Missing |
| clinique-la-roya | `/home/ivan/Work/personal/MDConsultingNY/clinique-la-roya` | `35d207d8` | Missing |
| lens | `/home/ivan/Work/infra/tamdoma/lens` | `ca9256f` | Missing |
| Himne | `/home/ivan/Work/personal/Himne` | `de561f6` | Missing |
| lingua-relay | `/home/ivan/Work/personal/lingua-relay` | `7c710e0` | Missing |

- **3a (recommended)** Deliver the init implementation and focused behavioral tests in one akrogon code leaf. Separately authorize an operator maintenance pass at the registered roots to backfill only the selected attribute entries, install local protection before the first rebase, and commit/publish each tracked change through that repository's normal main-checkout workflow. Verify framework instead of duplicating its entries. This repairs existing installations without pretending one leaf can own nine repositories.
- **3b** Make the init change, then use a separate scoped leaf in each consumer for its tracked attributes and an operator step for local attributes. This provides individual reviews but creates several leaves for a one-line tracked change.
- **3c** Update init only and leave existing repositories to opt in later. This minimizes immediate operations but leaves eight known installations exposed.

Pitfalls: Running init is not an attributes-only migration. It rewrites configuration and registers `basename(root)`, so running it in the registered `pi-extensions` root would add the name `extensions`. Also, `gacp` runs `git add .`, so using it blindly in a dirty checkout could publish unrelated work. Preserve existing line-ending rules, inspect effective attributes rather than merely finding text, and report inaccessible or unpublished repositories as incomplete.

For acceptance, prove repeated init preserves existing rules and lessons, a divergent lesson-addition rebase keeps both additions, a linked worktree resolves the correct local attributes file, and unrelated source conflicts still stop. Verify the tracked rule separately from the local override, including from a fresh checkout of the published target. This round has not changed or published any repository policy.

### 4 · How should lesson corrections and pruning work once union is enabled?

This is a material missing fork because the file is not append-only today. Akrogon's lesson header permits removals, `skills/chart-issues/SKILL.md:29` offers pruning, and clinique-la-roya commit `0581a294` rewrites an existing lesson. In the scratch probe, union returned success for conflicting edits and kept both versions. A delete-versus-edit probe retained the edited line, defeating the deletion's intent.

Research: **better-than-training** · `learnings/LESSONS.md:5`, `skills/chart-issues/SKILL.md:29`, clinique-la-roya commit `0581a294`, and Git 2.55.0 `merge-file --union` probes, inspected/run 2026-09-29 · existing maintenance changes violate the simple independent-addition assumption · this adds an explicit maintenance decision rather than declaring union universally safe. **Practitioner** · [Fowler's account](https://martinfowler.com/bliki/SemanticConflict.html), read 2026-09-29 · a textual merge can hide incompatible intent · this supports requiring review of maintenance merges.

- **4a (recommended)** Keep corrections and pruning, but coordinate them on an up-to-date main checkout while other lesson writers pause. If maintenance must cross divergent lesson history, temporarily set the exact local path to `merge=text`, resolve the merge explicitly, review the result, then restore the chosen rule. This preserves current maintenance behavior while restricting unattended union to independent additions.
- **4b** Change the lesson contract to immutable one-line observations, with corrections added as new entries and no pruning. This fits union more closely but changes the current chart workflow and allows the index to grow indefinitely.
- **4c** Keep uncoordinated editing and pruning with union. This avoids workflow changes but accepts silently retained contradictions or undone pruning.

Pitfalls: Union does not inspect whether a change is an addition or a correction. Option 4a is an operational agreement, not automatic enforcement. If that agreement is unrealistic, select 1c rather than claiming the risk has disappeared.

Reply `1a 2a 3a 4a`, or a numbered free-text answer. These are recommendations, not recorded operator decisions.

Challenge check

Kosorukov describes operating the same kind of multi-checkout changelog and is useful for the narrow first-hand incident, but his article does not establish fleet-scale rollout experience. Fowler brings long-running Thoughtworks integration experience and explains why clean textual merges can still be wrong. Their advice agrees on preserving independent additions and diverges in emphasis: the former's file contract permits union, while the latter's warning becomes decisive when order, correction, or deletion carries meaning. Applied here, that supports conditional lesson union, deferring log union, and explicitly handling maintenance. No inspected practitioner source establishes that union is safe for akrogon's current log readers.

The strongest challenge to 1a is that the permanent local override outlives the bootstrap need. Option 1b is defensible if the operator accepts cleanup and older-target exceptions. The strongest challenge to 2a is that most branches append events for different slugs, which reduces practical ordering trouble, but the code does not guarantee that separation. The strongest challenge to 3a is operational ownership: the code leaf can finish before rollout, so completion must name every repository still missing its published tracked rule or local protection.

Measured evidence: Git 2.55.0, isolated scratch repository under `/tmp`, default rebase backend, global/system Git configuration excluded. Tracked rule introduced only in the replayed commit: rebase exit 1. Same history with local rule: exit 0, both additions retained. Linked worktree: effective union via the common local attributes file. Two conflicting edits: both retained, exit 0. Delete versus edit: edited line retained, exit 0. Identical additions: one copy retained, so union is not an event-count-preserving mechanism. Scratch files were deleted. No full `gacp` push or installed-init implementation test was performed because this task is research only.

A's position and any other peer's disagreements are unknown by design. This file records B's independent recommendation and does not claim peer agreement.
