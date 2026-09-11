# Plan: chart-issues

Rewrite the chart door and its owned references so an attended operator can turn notes or imported reports into current, dispatchable leaf contracts. Absorb the three obsolete intake skills by deleting their folders. This plan incorporates both positions and the one rebuttal round. The authoritative brief and design remain unchanged.

## Read first

Paths below are relative to the worktree unless marked authoritative.

- Authoritative `issues/open/akrogon-loop/doors/chart-issues/brief.md` and `design.md` under `/home/ivan/Work/infra/akrogon`: scope, binding decisions and acceptance criteria.
- `skills/chart-issues/SKILL.md` and `assets/question-authoring.md`, `materialization-contract.md`, `seed-shapes.md`, `standing-design.md`: the current owned workflow and contradictions to remove.
- `skills/plan-issue/SKILL.md`: the rewritten family shape, compaction instruction and printed footer.
- `src/config.ts` (`currentRepo`, `effectiveConfig`), `src/state.ts` (`stateSchema`, `allLeaves`, `dependenciesReady`), `src/routing.ts`: authoritative-root resolution, state contract and dispatch phases.
- `src/pull.ts` (`pullRepo`): mirrored report format and source identity. Read `src/status.ts` only when checking the scope of its schema validation.
- `tests/helpers.ts`, `tests/fake-herdr.ts`, the dispatch fixture and first scenario in `tests/next.test.ts`: isolated command verification with real files and processes.

Grounding gap: `akrogon config` reports `grounding: none`. There is no configured reference index. Planning read `learnings/LESSONS.md` as a resource, particularly its concrete-review and dangling-reference cases. Implementation starts from this list and does not reread lessons. Repository index and lessons maintenance belong to retire-old.

## Decisions

### D1. One short skill and three focused references

Keep `skills/chart-issues/SKILL.md` with shared context, Open, Drain, Decide, Handoff and printed footer. Its first instructions cover compaction recovery. Name the installed `akrogon` command as the dependency and retain the four Pocock lines: ground in docs first, challenge fuzzy terms, verify with a concrete scenario, check the live surface.

Use `assets/questions.md` for operator question/map authoring, `assets/shapes.md` for chart/intake/decision/container/leaf shapes, and `assets/standing-design.md` for the binding standing block and its interpretation. These three topics match the leaf architecture and avoid rereading standing output text for every question. Add explicit read-when links: questions before an operator batch, shapes before chart creation or handoff, standing design when preparing leaf designs. Intake identity needs a short paragraph, not a fourth asset.

Keep SKILL.md below 300 lines, 4,000 tokens and 20 substantive rules. A reader judges rules semantically, including instructions phrased as steps. Do not evade the budget by changing modal verbs or moving a long duplicate workflow into references. Remove the copy installer, stamp-comparison workflow, old modes and migration lanes. A single informational chart stamp may remain, with one current value, without freshness checks or state-schema keys.

### D2. Open from the live repo and preserve source evidence

The first reply names the operator-supplied B pane or says single slot. No second-slot election or config field. Read effective config and resolve recognized worktrees to the authoritative registered root. Chart/handoff writes for that repo use that root, not the worktree's inert issues copy. An unregistered repository can still be charted locally, but leaf handoff requires a registered destination.

Run `akrogon pull` at open. Report an unregistered or non-GitHub repo and continue charting as explicitly locked. Other pull errors remain failed refreshes and block a drain that depends on that refresh. Do not silently use a stale mirror as a fallback. Independent operator notes do not depend on successful GitHub intake. Do not change the command or initialize/register a repo as part of this leaf.

Read the configured top index and LESSONS.md as resources, report missing resources as gaps, and offer the operator a lesson prune at open. Preserve the reusable-lesson convention without turning historical lessons into rules.

Consume mirrored `issues/seeds/*.md`, legacy proposal files `issues/open/<slug>.md`, and operator notes. GitHub identity is the mirror's `Source: owner/repo#n` line. Skip identities already present in sources of open/closed states or chart intakes, including charts already handed off. Use exact identities rather than substring matches against arbitrary report text. Record legacy repo-relative source paths in intake provenance and skip paths already imported. Preserve original reports, including legacy seed files, and copy imported text verbatim beneath source headings with scope and agent findings separate. A local path never becomes a GitHub `sources` entry.

### D3. Distinguish a drain from the direct settled-item path

Show a proportional territory map before grilling: material forks, practitioner questions and pitfalls, grounded in inspected surfaces. With B, maps are independent before A merges them with attribution.

Consolidate reports by destination and speed of resolution. Seeds sharing a destination and independently checkable outcomes can be parallel leaves of one issue. Independent issues run side by side. Only an actual dependency imposes order, not file overlap or tidy presentation. Show the proposed split and its consequences before writing.

A seed drain writes one chart per destination at `issues/chart/<chart-slug>/` with CHART.md, INTAKE.md and decisions/, then stops for the operator to select a chart. This applies even when several reports consolidate to one unresolved destination. A direct single issue whose map finds nothing unspecified writes the same chart structure and goes straight to handoff. The exception depends on settled scope, not merely on counting destination folders. Resuming a selected chart starts from CHART.md and loads the decision being worked and its linked context.

Charts stay in their original folders. INTAKE.md holds verbatim source text plus scope and provenance. CHART.md is the short destination/decisions/unspecified/out-of-scope index. Decision files hold Question, carries, Findings and Resolution with reasons and foreclosed alternatives. Keep sharp questions separate from material work not yet specifiable and reshape remaining questions after answers. No chart state.yaml, lifecycle phase or archive move.

### D4. File-based blind B passes with one rebuttal

A owns the interview and recording. B receives intake, the current Question and carries, related decision paths, locks and verbatim operator corrections, excluding A's draft and current Findings. Run B independently while A develops its view. Only after both finish does A merge the full batch with `(A)`, `(B)` and `(both)` tags. B rebuts the merged file once with disagreements only. A presents one complete operator batch with the challenge check and B's disagreements.

Use exact file paths for peer returns, never pane text as answers. Before chart destinations exist, use a temporary directory for blind map outputs. Once the chart exists, use `slots/<pass>.md` under that chart. Preserve useful map findings in the chart and remove temporary files. Tell B its exact output path in every prompt, wait for idle before prompting, then use the supported herdr wait and read the returned file. Do not invent readiness from file existence, pane output, or a chart status field. No new herdr integration or dispatcher is built here.

B checks the final shape once when an operator reply adds a mechanism or changes a contract before A records it. Restatements need no check. B answers the operator's direct requests in its own pane, while A retains the interview. Questions use plain context, consequence-bearing options, inspected evidence, a recommendation and a challenge check. Outstanding material decisions require an operator answer. Optional prototypes remain small, explicitly chosen measurements whose scratch code is discarded.

### D5. One debate election and completed human prerequisites

Use the latest locked correction: implementation `debate` defaults to `no`, with a recommendation from the settled design and one operator question at the door. Very small issues skip the question and use no. There is no consult field, separate election or per-leaf repetition. The named B pane does not determine implementation debate.

Warn as soon as a genuinely human-only prerequisite is found, name who completes it and record its completion before opening the leaf. Credential access alone does not make work human-only. Known human steps outstanding prevent handoff. `hand_built` is a distinct operator choice and is emitted only when true, never as a substitute for finishing those prerequisites.

### D6. Direct, collision-safe handoff into the current tree

Prepare the full proposed contracts and show one handoff batch with the tree, scope, repo, priority, debate and any relevant operator choices. Obtain the attended operator's decision for that concrete handoff, recognizing authorization already supplied in the session. No per-leaf confirmation or extra post-door approval is introduced.

Use `issues/open/<issue>/<leaf>/` for one issue and `issues/open/<epic>/<issue>/<leaf>/` when grouping two or more issues. ISSUE.md lists immediate leaves and EPIC.md lists immediate issues, one line each with purpose. Slugs are plain lowercase hyphenated words and leaf slugs are unique across all proposed leaves and existing open/closed leaves.

Before writing, read proposed briefs as an implementer: each criterion is executable within its ownership, each cross-leaf claim has an owner, and all binding decisions have a home or explicit exclusion. Check all new destinations for collisions, including partial leaf folders without state and index files. Never overwrite a collision as a side effect of handoff. Validate dependencies against existing or proposed leaf folders and reject missing targets. Emit prerequisite leaves before dependents so written state never names a not-yet-created prerequisite. No staged publishing, transaction framework or validator script.

Leaf interfaces:

| File | Content |
| --- | --- |
| brief.md | What, Why, concrete Done-criteria |
| design.md | Binding decisions verbatim, standing constraints with their interpretation, Leaf architecture and exclusions |
| state.yaml | slug, phase, created, priority, repo, debate, blocked-by, sources, and hand_built only when true |

`repo` is a registered key, priority is h/n/l and created is the creation date. Quote `debate: 'yes'` or `'no'`. Initial phase is `plan.positions` for yes and `plan.synthesis` for no. `blocked-by` contains leaf slugs and defaults to an empty list. Always emit `sources`, empty when unsourced. Command-owned attempts, done, fix_rounds, verdict, pane, tab, prompted and worktree fields are not authored by the door.

Assign each GitHub report one completion owner, an issue or epic. Write its identity into every leaf under that owner. Do not split one source between unrelated completion owners. Validate output with the command's schema, using `akrogon status` as a read-only check and inspecting its actual result. It supplements, not replaces, collision, ownership and dependency checks.

After valid handoff append `Handed off <date>` to CHART.md. Do not delete legacy seed inputs, move charts, invoke `akrogon next`, or invent a chart phase transition. Every door pass ends with printed Last operation and `Next: none <reason>` lines. The command remains the lifecycle dispatch authority.

### D7. Preserve locked standing text and expose the remaining conflict

The design explicitly says its standing creation-locked lines stay verbatim. Retain that block in standing-design.md and carry its current reading interpretation beside it, so references to old gate/chunk behavior do not become active instructions. In particular, current behavior completes known human prerequisites before handoff and uses the checker verdict plus blocking checks for verification. Do not modify this leaf's locked design or silently rewrite security constraints.

Limitation L1: brief criterion 5 forbids any reference to retired human dispatch behavior in assets, while the explicit verbatim standing block still contains “parks at dispatch.” Both cannot literally hold at once. Prioritize the explicit verbatim lock and make the active workflow unambiguous. Implementation and review must report this residual historical quotation as an acceptance limitation rather than claim criterion 5 completely passes or evade it through a spelling-only grep. No additional approval mechanism or runtime state is introduced to work around this documentation conflict.

### D8. Keep the change within owned files

Delete `skills/create-issue/`, `skills/braindump-issues/`, `skills/consolidate-issues/`, and `skills/chart-issues/{fixtures,scripts,tests}/`. Replace the old chart assets with the three D1 references. Remove owned references to deleted skills, old series/proposal-output phases, archive destinations and per-leaf confirmation machinery.

Do not change command code, shared test infrastructure, install roots, README, repository index, lessons or unrelated skills. Report any remaining consumers outside ownership with paths. No execution dependency on another leaf is necessary: the inspected checkout already has pull, current state/routing, status and isolated command test boundaries.

## Acceptance criteria before implementation

- A1. The main skill meets all three size limits, names akrogon, has compaction recovery, four grounding lines, triggered local references and the printed footer. Only SKILL.md and assets remain in its folder.
- A2. A fresh reader can follow open, drain, decision and handoff without guessing B election/blindness, source deduplication, split-before-write, lesson prune, stopping behavior, late checks, human prerequisites or debate election. Include B answering direct operator requests.
- A3. A handoff performed from the new references in a temporary registered repo emits current brief/design/state and both index levels, retains the chart and source text, and produces the expected planning prompt using real next with fake herdr.
- A4. Missing dependencies and occupied partial-leaf destinations are refused before invalid writes. Leaf identities are unique, sources reach all leaves under their completion owner, and no worktree-copy state is treated as authoritative.
- A5. The three absorbed skill folders and chart fixtures/scripts/tests are absent. Owned local links resolve and obsolete machinery is absent, except the explicitly reported L1 historical-text conflict. No source seed is deleted by the new workflow.
- A6. Configured format, test and typecheck commands pass. Review receives saved evidence and a committed implementation ahead of AKROGON_BASE, without unrelated changes.

## Ordered execution checklist

1. E1 — Draft `skills/chart-issues/SKILL.md` and `assets/questions.md` around D1–D5. Write the whole flow once, including the drain/direct-item distinction and temporary opening-map return path. Check A1 and the workflow portions of A2 before adding detail.
2. E2 — Write `assets/shapes.md` and update `assets/standing-design.md` for D6–D7. Include chart/intake/decision shapes, container indexes and current leaf fields. Ensure the standing reading interpretation cannot authorize unfinished human prerequisites. Check A3–A4 and record L1 explicitly.
3. E3 — Delete obsolete chart assets, the three skill folders and the chart fixtures/scripts/tests. Search owned references and then repository-wide consumers. Fix only owned links and report external hits. Check A5.
4. E4 — Perform the fresh-reader and real isolated handoff exercises below, repair concrete gaps in owned text, then run configured repository checks. Save concise evidence under this leaf's `implementation/` and remove all temporary scripts/sandboxes. Check A1–A6.
5. E5 — Inspect the final diff for scope and saved files, commit only this implementation with no co-author trailer, and record commit/check evidence for review. Follow implement-issue's normal phase transition after its work is complete.

The implementation skill's configured subagent execution can assign these bounded steps sequentially. No concurrent writers to the same skill, no new code abstraction and no persistent prose test suite are needed.

## Concrete verification

V1 — Give a fresh agent only the rewritten skill and triggered references, not the positions or this plan. Request expected actions and artifact paths for a tiny direct request without B, an unresolved multi-report drain that produces one destination, a multi-destination drain with duplicate GitHub identities and a previously imported legacy path, and a named-B decision with a late changed contract. Check decisions, not exact phrasing. The reader should also identify the unregistered-repo limitation and L1 rather than invent a successful handoff.

V2 — Create a temporary Git repo beneath an isolated AKROGON_HOME and register it using the existing fixture pattern. Follow the new handoff text to emit an epic containing two issues, valid leaves, EPIC.md, ISSUE.md, chart records and preserved source text. Use at least one debate-no leaf and a separate debate-yes leaf. Parse emitted state through the live schema and exercise `akrogon status`. Verify sources for all leaves of an owner and inspect the retained handoff chart. Do not use a hand-written fixture alone as proof that the skill's instructions were followed.

V3 — Before writing an invalid handoff, propose `blocked-by: [missing]` and demonstrate the refusal with no invalid leaf emitted. Repeat with an occupied partial leaf containing a sentinel brief and verify the sentinel is unchanged. Separately exercise the command's existing missing-dependency rejection for malformed external state. The command failure alone does not prove handoff preflight.

V4 — Put the existing fake-herdr executable on the sandbox PATH with its isolated database, run the real CLI `next <slug>` there, and inspect and print the recorded prompt. Expect `plan-issue <slug> slot=B phase=plan.synthesis` for debate no and positions prompts for the yes leaf. Real files and Git processes are used, with herdr and any gh call substituted at the executable boundary. Never use real panes, install roots, GitHub or the herdr socket. The checker independently verifies this scenario. This testing exception does not authorize the chart skill to auto-start leaves.

V5 — Measure lines and tokens for SKILL.md with an available tokenizer, identifying the tokenizer used. A character-count proxy is not proof of the token limit. A thinking reader assesses the rule count. Inspect local reference resolution, folder deletions and obsolete terms across owned assets, reporting L1 instead of hiding it. Then run `bun run format`, `bun test`, and `bun run typecheck`. Broaden or repeat only for a concrete failure or subsequent edit. Preserve results and remaining out-of-scope reference paths in the implementation evidence, remove temporary helpers, and verify the final commit and worktree status before review.
