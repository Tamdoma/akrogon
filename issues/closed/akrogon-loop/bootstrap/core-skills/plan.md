# Plan: core-skills

## User intent

Replace the five loop skill families so the first automated leaf can run from planning through merge using the new `akrogon` command. Build only the skill-owned surfaces named in `brief.md`. This is a hand-built bootstrap leaf, implemented in `/home/ivan/Work/infra/akrogon/issues/worktrees/core-skills` on branch `core-skills`.

Slot B synthesized this plan on 2026-09-10 from `brief.md`, `design.md`, `state.yaml` and the supplied `ponytail.md`. State is `plan.synthesis`, `debate: no`. No positions or rebuttals are required for this leaf. This pass writes only this plan and stops without moving phase.

## Decisions

### D1. Replace the five families within their existing ownership

Create `skills/plan-issue/SKILL.md`. Rewrite `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` and `skills/broadcast-issue/SKILL.md`. Keep references inside their owning skill folder, with explicit read-when triggers. Put shared instructions once at the top of each family, then only phase-specific work in sections.

Delete `skills/consult-issue/` and `skills/explain-issue/` completely. Remove obsolete references and machinery inside the rewritten families, including implement/check advisory rulebooks and broadcast target/receipt helpers. Retain unrelated intake skills until their own leaves. Do not change command code, installation roots, config schemas, chart artifacts, or migrate the historical lessons in this leaf.

Each skill stays below 300 lines, 4,000 tokens and 20 rule sentences, judged once by the operator without a counter program. Any must/never instruction states its exception. The skill's opening instructions cover rereading itself, the leaf brief or plan, and phase references after compaction. Copy the leaf's `ponytail.md` verbatim into implement and check. Preserve only Pocock's four practices: ground in docs first, challenge fuzzy terms, verify a concrete scenario, check the live surface.

### D2. Use the new command and artifact contracts directly

The prompt `<skill> <slug> slot=<A|B> phase=<phase>` supplies routing identity. Read effective settings through `akrogon config`, not YAML or the old lifecycle scripts. State belongs to the registered checkout. The command owns state changes, counters, concurrent completion and next-pass dispatch. Skills neither run `akrogon next` nor write state or log records themselves.

Use the fixed leaf artifacts: `positions-A.md`, `positions-B.md`, `rebuttal-A.md`, `rebuttal-B.md`, `plan.md`, `implementation/brief.md`, `review-A.md`, `review-B.md`, and `questions/<id>.md`. A repeated invocation inspects its artifacts and worktree and finishes remaining work, rerunning checks only for a change, missing evidence or a specific concern.

Every phase section closes through `akrogon phase <slug> <next> --slot <A|B>` and stops. Review also supplies `--verdict`. Print `Last operation: <what happened and the observed phase result>` and `Next: <next prompt>` or `Next: none <reason>`, without saving a handoff file. A first completion in a two-slot phase can leave that phase waiting on its peer. Report what the command actually returned, not an assumed advance.

Peer questions get one exchange through herdr, after the peer is idle. The prompt requests Question/Option reasoning in `questions/<id>.md`, waits for the peer, then reads the file. The asker decides using simplicity, clarity, elegance, cost, speed and quality. A context-recovery read of the first 50–100 words of the other pane is confirmation only. It never supplies slot, phase, readiness, completion or the peer's answer, and an absent snippet does not block.

### D3. Plan once, with optional debate

`plan-issue` has `plan.positions`, `plan.rebuttal` and `plan.synthesis` sections. Positions are blind. Rebuttal reads the peer's position and addresses a real fork, using the configured rebuttal policy. Synthesis by B combines the available positions and rebuttals into one execution plan with stable decision IDs, concrete acceptance criteria and an ordered checklist. With `debate: no`, B writes the plan directly from the brief, design and live surfaces without manufacturing missing debate artifacts.

Planning reads the configured top index and relevant areas plus `learnings/LESSONS.md` as resources. Follow relevant live contracts and write the resulting read-first list into the plan, which B carries into the worker brief. Lessons are evidence about past work, not extra rules. The command owns whether a debate stage advances or is skipped. The planning family introduces no approval, audit, additional debate or operator wait.

### D4. Keep one self-contained implementation brief and worker protocol

Place `brief-template.md` and `worker-protocol.md` beside `skills/implement-issue/SKILL.md`. Read the template when authoring a brief and the protocol when delegating or validating a return. These references depend on nothing outside the skill folder. Both leaf and standalone use the same eight-section brief, under 1,500 words and 20 rules:

1. Goal, tied to plan decision IDs. Standalone assigns IDs in its brief.
2. Numbered acceptance criteria.
3. Read-first list, including one existing pattern to copy and the local ponytail file.
4. Change list with only this worker's needed signatures, data shapes and preceding worker outputs.
5. Do-not list with reasons and exceptions, restated at its end. The worker returns a mismatch with evidence to B instead of changing scope or an interface.
6. Ordered steps naming files and criteria, with advisory size of about N files and under M turns. Clearly exceeding that estimate prompts a mismatch, not a mechanical cutoff.
7. The concrete changed-tests command only, resolved by B. No full-suite command for workers.
8. Done-when, pasted command evidence and the report, ending with four fill-in lines for changed files and reasons, tests and results, known limitations, and unverified criteria. Equivalent wording is accepted.

The launch prompt provides the brief path, worktree path and one reminder: read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning. Do not copy the rules into the launch prompt. B sends a return missing any of the four report contents back to the same worker for completion. This is a worker turn, not `check.fix`, and never changes `fix_rounds`.

### D5. Implement and repair according to the selected mode

For a leaf, read `implement`, `test_changed`, `AKROGON_BASE`, checks and the repair cap from `akrogon config`. In `subagents` mode, one verifiable unit gets one brief. Otherwise B writes numbered sub-briefs under `implementation/` and delegates them sequentially in the one worktree. Say only “delegate the sub-brief to a subagent”, with no model, tier or harness mechanism fixed in the skill. Each worker runs changed tests against the supplied base and returns evidence. A mismatch stays with B, who revises the brief and reruns the affected worker without moving phase.

In `inline` mode, B writes the same brief and implements it in order, running changed tests as it goes. There is no worker, sub-brief or mismatch-return protocol. In both leaf modes, B runs the full suite once after implementation, plus other required checks, before handoff. Repetition is justified by a failure or later relevant changes. A red suite in delegated mode becomes one more sub-brief with failing output and failing tests as criteria. Cross-brief interface failures belong to B to correct in the brief and rerun the affected worker. B may directly fix a line or two. On the last allowed repair round, B repairs itself without a worker. Inline mode repairs itself throughout.

`implement-issue` owns both `implement` and `check.fix`. Repair reads the review findings and preserves scope, criteria and failing tests. Derive meaningful tests from acceptance criteria before code, red then green, with fail-first evidence for bugs and no test for a trivial one-liner. Akrogon briefs require command scenarios on temporary repositories using real files and processes, substituting herdr and gh at one boundary. No real panes, install roots, GitHub or herdr socket in routine tests, and no wording or coverage-driven tests.

Without a leaf in the prompt, treat the prompt text as the task and the current checkout as the repository. The session acts as B, plans briefly in `implementation/brief.md`, delegates through the same protocol, validates reports, runs changed tests and repairs itself. Obtain actual test commands from the checkout, not `akrogon config`. Standalone reads no leaf/config, writes no lifecycle state or log, calls no phase command and invokes no checker. Its completion footer states standalone completion. The no-leaf opening explicitly replaces the leaf reread with the task brief.

Implementation updates affected docs and area index entries in the worktree before review. A reusable lesson found in any pass gets one active line and a history file with case, evidence and learning. Implement/check/merge do not read the active lessons list as pass input. Applying a listed improvement removes its active line and dates its history file. Historical material is not otherwise rewritten or pruned.

### D6. Review concrete defects and keep repair review narrow

`check-issue` owns `check.review`. Both slots initially judge the whole diff against `plan.md`, the same implementation brief and evidence, including affected docs, index pointers and lesson claims. A reads its own positions/rebuttal first when those artifacts exist from debate. Their absence under `debate: no` is expected.

Each slot writes its own review file and calls the phase command once with `--verdict ready`, `--verdict nits` or `--verdict fix`. A Fix cites a done criterion, a failing blocking check or a reproducible defect, including a concrete maintainability defect. A preference supported only by A's earlier position is a reasoned Nit and cannot open a repair round. Every `checks` command blocks. Advisory failures are Nits. Reject mocks of the unit under test and, in this repo, tests asserting wording except literal commands, numbers or fixed references.

After `check.fix`, only A re-checks the repair diff, confirms earlier findings and adds a blocking finding only for a defect introduced by that repair. Rerun checks only for changed code, missing evidence or a specific concern. If the phase command prints `moved failed`, A appends a paragraph to `plan.md` explaining what kept failing and why. The command owns the cap and terminal state. No extra QA pass, review brief or approval step is added.

### D7. Merge through fast-forward push, with existing repair routing

A fetches and rebases on `<remote>/<default_branch>` from effective config, defaults `origin/main`, runs every configured check and pushes the leaf HEAD fast-forward to that branch. Do not require a local main branch. A normal non-fast-forward rejection repeats fetch, rebase and checks. After a lost push reply, fetch and test whether the intended leaf head is already an ancestor of the remote target before repeating the push.

A conflict or red checks produces findings in `review-A.md`, naming conflicting files or pasted failing output and the rebase target commit, then moves to `check.fix`. Keep both true entries in a same-line index conflict and recheck pointers, while preserving the conflict's repair/review route. Do not add a queue, force push, revert procedure or separate repair counter.

After confirmed push success, call `akrogon phase <slug> merged --slot A`. Spawn the broadcast writer once only when that invocation reports `issue complete`, using all the completed issue's briefs gathered before the move can relocate them. A Nit A still holds and finds reusable becomes one lesson line plus its history file during merge, without another turn. The command, not this skill, closes GitHub issues and moves completed containers.

### D8. Replace broadcast mechanics without retaining receipts

Keep the existing `skills/broadcast-issue/scripts/discord-send.ts` location for the minimal mechanical sender, replacing its legacy routing and record dependencies. Remove `broadcast-target.ts`, `broadcast-record.ts` and the obsolete setup guide, replacing necessary usage guidance inside the skill. Accept one composed message for the completed issue and deliver it to each configured broadcast target. Read target names from `akrogon config` and secret values only from `~/.config/akrogon/env`. Missing targets or secrets fail loudly. No skill-local `.env`, process-environment secret override, implicit default target, lifecycle target parser, event identity, receipt or outcome record.

Write a concise factual summary and unlabeled bullets explaining the shipped change and its benefit to an unfamiliar reader. Fit one message by rewriting, not splitting or truncating. Do not invent measured savings or expose secrets. The writer is a subagent selected by the harness, with no hardcoded model name. Retry a failed delivery once immediately, warn, then surface the final failure without reopening the merged issue. Successful targets are not resent merely because another target failed in the same invocation. No later recovery ledger is introduced.

Broadcast runs after terminal completion, so it prints its footer and stops without another phase move. This and standalone implementation are the explicit exceptions to phase-ending commands. The specific broadcast secret-file lock overrides the generic creation text about consumer `.env` files. Later design corrections also override the older requirement to save broadcast failures and the earlier two-message sender behavior.

## Read-first list and observed gaps

- This leaf's `brief.md`, `design.md`, `plan.md` and `ponytail.md` are the binding task sources.
- The existing five skill folders establish source locations. Their legacy lifecycle prose is being replaced, not carried forward as policy. `skills/plan-issue/` is new because no such family exists here.
- `skills/broadcast-issue/scripts/discord-send.ts` currently imports `broadcast-target.ts`, `broadcast-record.ts` and an old lifecycle YAML type. Its `loadEnv`, config scanner, retry loop and receipt behavior conflict with D8. Reuse the sender location, not those contracts.
- `issues/config.yaml` currently has the legacy schema and `grounding: none`. No configured top index exists there. `learnings/LESSONS.md` is absent in this worktree. Do not invent an index path or fabricate lessons to compensate. The new command and resource setup are bootstrap integration dependencies.
- `README.md` describes the old snapshot. Do not rewrite the repository overview in this leaf. References and explanations within the owned skill folders must describe their new behavior.

## Execution checklist

- [ ] A1. Create the planning family and rewrite shared phase conventions in all five skills. Basis: D1–D3. Verify: a reader can execute every routed section from only its skill and prompt, with local read-when references, correct artifacts and no removed workflow dependencies.
- [ ] A2. Add the self-contained implementation template/protocol and both ponytail copies. Basis: D1, D4. Verify: all eight sections and four report contents are present, missing-report handling is semantic, and `cmp skills/implement-issue/ponytail.md /home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/bootstrap/core-skills/ponytail.md` plus the corresponding check-skill command pass.
- [ ] A3. Rewrite execution and repair sections. Basis: D5. Verify: walk delegated, inline, standalone, mismatch, incomplete-report, red-suite and last-round scenarios. Each has one clear owner, correct test scope and no accidental phase/counter mutation.
- [ ] A4. Rewrite review and merge. Basis: D6–D7. Verify: walk two initial verdicts, Nit-only review, repair-only re-check, cap failure, rebase conflict, rejected push, lost reply and last-leaf completion. Findings and phase calls follow the stated route without full re-review or duplicate broadcast dispatch.
- [ ] A5. Replace broadcast sender mechanics and remove obsolete local helpers. Basis: D8. Verify: small executable scenarios exercise configured targets, missing secret, one retry, final failure and no disk record using isolated files and a substituted network boundary. Never send to real channels. Record the actual non-interactive command and output in the implementation brief. Add no tests that assert skill wording.
- [ ] A6. Delete the two retired skill folders and stale references within owned folders. Basis: D1. Verify: inspect the final diff and all local reference targets, operator reads each skill once for size/rule limits and removed machinery, and `git diff --check` passes.

## Dependencies and acceptance

The sibling `command` leaf supplies the effective config shape, phase/verdict behavior and routing. Confirm those live interfaces when available without modifying its implementation or restoring July 28 compatibility. This leaf and `command` can be authored in parallel. Their combined live loop, including one hands-off merge and deliberate `check.fix`, is acceptance work for `status`, not a claimed result here.

This leaf is done when all seven done-criteria in `brief.md` are satisfied by the five families, local references, minimal sender and required deletions. The operator performs the one-time prose size and fresh-agent readability checks. Runnable sender changes require isolated behavioral evidence. Skill text requires semantic inspection, not generated wording tests. Implementation reports name changed files, executed checks, limitations and every criterion not yet verified.

## Addendum log

2026-09-10, slot B: synthesized directly because `debate: no`. Later operator corrections in the supplied design resolve worker model ownership, default debate, inline execution, blocking checks, final-round repair, issue-level broadcast, no broadcast records and configured merge targets. No design choice is reopened. State remains `plan.synthesis` under the instruction to write this file and stop.
