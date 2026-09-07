---
name: create-issue
description: Run an attended operator interview to create an akrogon leaf from intent or import a colleague seed, locking decisions before automated planning starts.
---

# Create Issue

Run in the operator's attended session. This is content, with no config role or reconciler dispatch. Both entry doors use the same interview and emit only `brief.md`, `design.md`, and `state.yaml` at `issues/open/<slug>/` in the akrogon checkout, whatever repo owns the work. Planning writes chunks later. Never create phase folders, a monolithic plan, consultant scaffolds, or a second issue format.

## Entry and grounding

For creation, read the operator's intent. For import, read the explicit seed path first. Invoked without intent, ask one plain question — what to build or fix, or the seed path — before any grounding or inspection. No menu, no findings, no options. A seed containing observed behavior, expected behavior, where it happened, reproduction context, and urgency is complete intake. Missing enrichment is ordinary. Its claims are unverified. Preserve its intent and re-resolve any grounding anchors against live surfaces. Only the importing operator's explicit answers become locks. An attended chart handoff stays direct and does not enter this interview. When a colleague chart seed does enter this door, every chart decision in it is a proposal, even if the chart had previously locked it. A colleague's suggested solution is not an operator decision.

Before round 1, show an issue-proportional territory map as the root of the interview tree:

- Main forks: the few behavior or architecture choices that can change the item's scope.
- Questions an experienced practitioner would ask: hidden constraints, failure modes, and boundary cases not already stated.
- Mistakes a beginner might make without noticing: assumptions that could produce a plausible but wrong implementation.

Keep the map short for a small issue. It is a map for this one issue, never a chart-sized decision inventory. Turn relevant map entries into the first frontier and surface the map to the operator before asking for decisions.

When importing a colleague chart seed, render exactly one `## Chart Decision Review` table before the first decision round. Include one row for every proposed decision, the chart proposal, one importing-agent `agree-or-better-idea` line, and one explicit operator ruling. The importing-agent entry must either agree or give a better idea with its reason. The operator must rule every row. An omitted ruling, recommendation, or table row never becomes a lock. Do not score proposals or add a review round. The table does not settle repo, priority, ownership, or consult election. Those are always separate decisions by the importing operator.

Resolve a short lowercase hyphen slug, at most three words. Inspect the akrogon checkout and active worktrees for an existing same-slug leaf before writing. On collision, stop for reconciliation without overwriting it. Read `issues/config.yaml` for the current `repos:` keys and relevant grounding paths. Inspect only the surfaces needed for this intent. Before the first round, state only findings that change a question or block the work — at most a few lines. No inventory of what was read, no repo-state narration.

## Frontier rounds

Build a design tree rooted in scope, decision triggers, acceptance criteria, non-goals, and risk and rollout posture, plus the fork's locks: design and architecture decisions, ownership, priority, repo, and consult election. Track each unresolved node's prerequisites. A round contains the entire available frontier: all questions whose prerequisites are settled. There is no four-question cap and no category restriction. Questions depending on an unanswered question wait for a later round and name that prerequisite when presented.

Author every question against the territory map. State which hidden assumption, practitioner concern, or beginner mistake the question checks, in beginner language. After the operator answers the round, visibly close every round with:

```text
Challenge check
What would an experienced practitioner challenge in this round's answers?
Assessment: <the challenge and its consequence, or “No challenge found” with the reason>
```

Run this close even when a substantive round has zero questions. If it exposes a decision, add that decision to the next frontier. It is a close, not a score or a separate review round. Do not silently omit it.

Facts belong to the interview. Dispatch a bounded read-only research child when repository or tool evidence can settle a fact. Give it the factual question and relevant paths, prohibit writes and decisions, and verify its returned evidence yourself. Child output is advice, never committed proof. Only dependent questions wait while research runs. Never ask the operator a fact the tools can establish. Decisions always belong to the operator. Recommendations do not authorize answers.

Use this Question and Option wire format for every decision, including priority, repo, ownership, election, and final confirmation:

```text
Question 1
Explain the choice and why it matters in beginner language.
Option A (recommended): State the concrete behavior this authorizes and why it is preferable.
Option B: State the alternative behavior and tradeoff.
Reply with 1-A, or give a numbered free-text answer.
```

Number continuously within each round, restarting at 1 next round. Usually give two to four lettered Options, placing the recommended answer first with a reason. The repo question instead lists exactly all configured repo keys, even if there is only one or more than four. Every question carries a recommendation. Explain uncertainty when recommending a tiebreak. End each round with its answer key, wait for the operator's reply, then expand the tree from those answers. Preserve numbered free text verbatim. For a letter answer, preserve the selected Option's exact decision wording. An omitted question stays open. Do not silently adopt a recommendation.

## Mandatory locks

Ask one repo Question with every current `repos:` key as an Option. Recommend `akrogon` for work touching this checkout. Refuse an answer outside those keys, list the valid keys, and leave the question open. Never invent a repo or infer consent from a recommendation. Write the selected key beside priority in state. There is no default repo on short-circuit: obtain a valid answer before emission, unless already operator-locked in the input. For a colleague chart import, a proposal table entry or source-chart recommendation cannot answer this question.

Ask priority as one Question: normal (`n`, recommended unless urgency evidence favors otherwise), high (`h`, goes ahead of normal), or low (`l`, follows normal). The operator decides. Record departures from normal verbatim in the locked design.

Ask which concrete steps physically require the operator, recommending `agent-owned` when none do. Name each exception and why it requires a person, such as a 2FA prompt, a dashboard action on an operator-held account, or real-payment approval. Record exceptions verbatim so the planner marks the corresponding chunks `operator-owned`, which park at dispatch before any seat spawns. Credential access alone never qualifies. Include the ownership and secrets rules from the standing template unchanged.

Close the substantive interview with a consult recommendation: elect or skip, with a one-line reason based on the settled design. Explain that consult adds independent positions and synthesis before planning. Ask the operator yes/no in Question and Option format. Keep the recommendation and reason in the conversation only, never in the emitted leaf or other reconciler inputs. Write exactly one unindented line in design.md, outside a code fence: `consult-election: yes` or `consult-election: no`. No alternative spelling, duplicate line, or recommendation text. Default is no consult. A non-elected item's implementer plans directly from the creation-locked design. Elected positions, rebuttals, and synthesis belong in leaf-internal working files downstream, not interview output.

The operator may short-circuit in natural language. Keep answered locks and use the explicit fail-closed defaults for unanswered mandatory locks: no consult, agent-owned, priority n. State these defaults in the shared-understanding summary. Never treat an ordinary omitted answer as a short-circuit. Do not invent remaining scope or architecture decisions. If unresolved intent prevents a truthful brief, show the unresolved choice before seeking confirmation.

## Confirmation and emission

Normal termination requires an empty frontier: scan all five surfaces and fork locks again, with no material question or unresolved research hidden. Zero-question substantive rounds are valid when inputs already settle the tree, and still require the visible `Challenge check`. For a colleague chart import, also verify that the single Chart Decision Review table has one importing-agent assessment and one explicit operator ruling for every proposed decision. No proposal, table row, or machinery lock may remain open. Summarize the agreed outcome, testable done-criteria, exclusions, architecture, rollout, ownership, repo, priority, and consult answer. Ask a final numbered confirmation Question with confirm recommended and revise as the alternative. Only an explicit operator confirmation of shared understanding permits writing. Revisions reopen the affected frontier. A short-circuit still requires confirmation.

After confirmation, emit the three files using the shared [Materialization
Contract](../chart-issues/assets/materialization-contract.md). It defines the
`brief.md`, `design.md`, and `state.yaml` shapes, standing lines, election
line, validation rules, and the rule that no chunk file is created until
planning. The asset is the single source for these shapes for both skills.
Copy [assets/standing-design.md](assets/standing-design.md) unchanged into
`design.md` as that contract requires. Never substitute links to chart
archives for decisions. Consultants may challenge a lock only through a named
conflict in the operator's batch queue. No plan-approval config value or
mid-flight approval hold exists.

On import, additionally write `seed_path` as the akrogon-checkout-relative path to the archived seed. After confirmation, prepend `Archived: imported into <slug> on <YYYY-MM-DD>` to the original seed and preserve every original byte after that line. Keep it at its existing tracked intake path so the recorded path resolves. An external seed must first be copied byte-identically to an unoccupied tracked intake path in akrogon, then archived there. Do not modify the colleague's external source. Commit the archived seed and the three leaf files together: # Ledger Contract's seed-import proof is the archived seed plus state.yaml with seed_path. No seed is created for the scratch door. Do not carry retired seed posture keys into state (`inspector_2`, `merge_hold`, or phase-depth flags), and never recreate their approval gates.

Validate the three filenames, required headings, verbatim locks and standing lines, exactly one valid election line, priority in h/n/l, repo in the current config keys, and the import archive's resolving seed_path before committing. For a colleague import, validate the one-row-per-proposal table, every importing-agent assessment, and every operator ruling before writing. No chunk files may exist in the interview's new output. Stop after the creation commit and report the leaf path. An attended chart handoff keeps its own direct materialization, one series confirmation, and no per-leaf create-issue interview. The worked [fixture transcript](fixtures/transcript.md) demonstrates both doors, colleague review, territory mapping, challenge closes, and the dependency-round method without becoming runtime input.
