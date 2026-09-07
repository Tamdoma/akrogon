# Fixture interview transcript

Authored example, not a recording of a live operator session. Research-child messages below model the required read-only exchange. The parent checks use real committed inputs. Both doors run the shared rounds below and differ only in seed provenance.

## Entry doors

Create operator: "Create sample-change. Show an actionable message when someone selects a repo that is not configured. Keep the change limited to the command-line error."

Import operator: "Import seed.md as sample-change."
Import seed: [seed.md](seed.md). It carries the same intent in the five core sections. Its recommendation is not an operator lock. No anchors or chart locks are supplied. The importer checks for a same-slug leaf before continuing.

Research child assignment (read-only): "Read issues/config.yaml's repos table and the two closed leaf state.yaml exemplars. Return the repo keys and carried fields with paths. Do not edit files or decide the target repo."
Research child result: "issues/config.yaml has akrogon and framework. issues/closed/judge-dispatch/state.yaml and issues/closed/merge-calls/state.yaml each carry slug, phase, created."
Parent verification: read those exact files, confirming both keys and all three fields. No fact question went to the operator.

Inventory: the config already names two repos. This intent changes a command-line error only. Which caller behavior to promise, rollout risk, ownership, priority, and target repo remain operator choices. No output leaf has been written.

## Territory map (before round 1)

This is a small command-line issue, so the map stays short and applies to this issue only.

Main forks: change only invalid-repo handling or also valid-repo and browser behavior; reject or silently substitute an invalid name; change only the existing error path or add storage and rollout machinery.

Questions an experienced practitioner would ask: What exact exit status and configured-key list do scripts and people need? Does rejection leave every file unchanged? Which existing valid-name paths must remain byte-for-byte equivalent?

Mistakes a beginner might make without noticing: accepting the first configured repo as a fallback, listing only the recommended repo, or treating a helpful message as success. The first frontier grows from these forks and checks.

Colleague chart seed: [chart-proposal.md](import/chart-proposal.md). Its chart decision is a proposal at the import door, not a lock.

## Chart Decision Review

Every chart decision in the imported seed is a proposal. The importing agent writes one agree-or-better-idea line, and the operator rules every row.

| Decision           | Chart proposal                                                            | Importing agent agree-or-better-idea                                                                                                                     | Operator ruling                                                   |
| ------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| # Fixture decision | Use the direct handoff shape because the chart already settled the route. | Agree for attended chart handoff; if this seed is imported here, use the normal single-issue interview because this door cannot accept the chart's lock. | Import as a normal single issue and re-rule every decision below. |

## Round 1

Question 1
Which behavior should this item cover? Keeping one error path limits the change.
Option A (recommended): "Only the command-line invalid-repo error changes. Leave browser UI and valid-repo behavior unchanged." This covers the reported gap without adding a UI task.
Option B: Add a browser error page too, expanding this item to a second interface.

Question 2
Which repo owns this item? The available names were read from config. This request touches akrogon's command.
Option A (recommended): "akrogon". Change this checkout's command.
Option B: "framework". Change the consumer repo instead.

Question 3
Where should this item sit in the queue?
Option A (recommended): "Normal priority (n)." There is no reported outage.
Option B: High priority (h), ahead of normal work.
Option C: Low priority (l), after normal work.

Question 4
Does a step require you physically, such as approving a payment or answering a 2FA prompt?
Option A (recommended): "All steps are agent-owned. No physical operator action is required." This is a local error-message change.
Option B: Name a physical step in numbered free text so its chunk is operator-owned.

Question 5
How should this change roll out?
Option A (recommended): "Use the normal release. Add no migration, rollout flag, or approval hold." The message has no stored-data change.
Option B: Restrict rollout to a named user group, adding selection behavior.

Reply with 1-A, 2-A, 3-A, 4-A, 5-A, or give numbered free-text answers.
Operator: 1-A, 2: other-repo, 3-A, 4-A, 5-A.
Interviewer: Repo "other-repo" is refused. Valid keys: akrogon, framework. Round 1 Question 2 remains open.
Operator: 2-A.

Challenge check
What would an experienced practitioner challenge in this round's answers?
Assessment: The fallback and unchanged-valid-path risks are not yet settled, so the next frontier must ask for the invalid-name failure contract.

## Round 2

Question 1
Prerequisite: Round 1 Question 1 answer, "Only the command-line invalid-repo error changes. Leave browser UI and valid-repo behavior unchanged."
What should the caller observe for a name outside the configured keys?
Option A (recommended): "Reject an unconfigured repo name with a nonzero exit and list every configured repo key. Change no files on rejection." Scripts can detect failure and people can correct the name.
Option B: Print a warning and continue using akrogon, which may act on the wrong repo.

Reply with 1-A, or give a numbered free-text answer.
Operator: 1-A.

Challenge check
What would an experienced practitioner challenge in this round's answers?
Assessment: No challenge found after the operator specified nonzero failure, every configured key, and no file changes.

## Round 3: consult close

Recommendation: skip consult because the settled change covers one error path with an explicit failure contract.

Question 1
Should independent consultants debate this design before planning?
Option A (recommended): "Skip consult." The implementer can plan directly from these settled decisions.
Option B: Elect consult to obtain independent positions and synthesis first.

Reply with 1-A, or give a numbered free-text answer.
Operator: 1-A.

Challenge check
What would an experienced practitioner challenge in this round's answers?
Assessment: No challenge found; the consult choice does not reopen the settled error contract.

## Round 4: shared understanding

Frontier empty: this is a zero-question substantive round. Scope and non-goals are Round 1 Question 1, risk and rollout are Round 1 Question 5, trigger and acceptance are Round 2 Question 1. Repo, priority, ownership, and election are settled. No research remains. The acceptance checks are invalid-name nonzero exit, every configured key in the error, no file changes on rejection, and unchanged valid-name behavior. Architecture stays in the command's existing error path. Standing security, testing, flow-proof, and secrets lines apply unchanged.

Challenge check
What would an experienced practitioner challenge in this round's answers?
Assessment: No challenge found; the frontier is empty and the final confirmation is the only remaining gate.

Question 1
Does this summary match what you want written into the leaf?
Option A (recommended): Confirm shared understanding and write these decisions, because all choices are settled.
Option B: Revise a numbered decision before writing.

Reply with 1-A, or give a numbered free-text answer.
Operator confirmation: "Yes. This is our shared understanding. Write the leaf."

Emission after confirmation: create/sample-change/ contains brief.md, design.md, state.yaml. The import run emits import/sample-change/ with the same filenames, headings, and base state fields, adding seed_path. Import archives seed.md at import/seed.md by prepending the archive marker, with the original body byte-identical. These relative fixture locations stand for issues/open/sample-change/ and issues/open/sample-change.md in akrogon. The recommendation is absent from both output leaves. No chunk is written.
