# Implementation brief: seed-issue

## 1. Goal

Implement plan D1–D4 by replacing the legacy seed writer with one standalone GitHub intake skill.

## 2. Numbered acceptance criteria

1. C1: Only `skills/seed-issue/SKILL.md` changes in the worktree, under 300 lines, 4k tokens and 20 rule sentences, with gh as its only added dependency and explicit independence from akrogon install.
2. C2: Root akrogon.yaml issues_repo wins on all harnesses; origin is used only when the file is absent. Invalid file, missing/non-GitHub origin and invalid paths stop visibly without posting or asking a target.
3. C3: One title and observation, location, reproduction, expected behavior and urgency sections constitute unverified intake without diagnosis. Missing details are honestly stated. Removed modes and names disappear.
4. C4: Explicit gh issue create -R, safely quoted title and literal stdin body create one report. Errors are visible, success uses the actual URL, footer ends Next: none, and no lifecycle command runs.
5. C5: Exercise plan V1–V8 through real temporary repo files and a substituted gh executable, preserving argv/stdin/results under the leaf verification directory. No real issue is posted.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/github/seed-issue/{brief.md,design.md,plan.md}`.
- Worktree `skills/seed-issue/SKILL.md`, the only implementation target.
- Worktree `skills/plan-issue/SKILL.md` for the short compaction/footer pattern, adjusted to this standalone skill.
- Worktree `package.json` and `README.md` (overview is stale, no configured grounding index).
- `/home/ivan/.codex/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Rewrite skills/seed-issue/SKILL.md including frontmatter. Inputs are reporter context and repository-root routing file or origin. Output is `gh issue create -R "$repo" --title "$title" --body-file -` with literal Markdown stdin, then the actual result and standalone footer. No runtime parser or helper is part of the deliverable.

## 5. Do-not, reasons and exceptions

Keep edits within the owned skill because framework routing-file shipping, command changes, other skills and documentation cleanup are separately owned. Temporary verification helpers and leaf evidence are permitted, but delete temporary helpers after capturing evidence. Do not post to GitHub, touch install roots or contact herdr because verification substitutes those boundaries. Return a mismatch with concrete evidence if scope or an interface conflicts, unless B revises this brief. These exclusions preserve the single-file scope and isolate side effects; only the stated evidence work and revised brief are exceptions.

## 6. Ordered steps

1. Before editing, read acceptance and exercise a baseline route against the old skill to record its failure to satisfy C2/C4. Semantic evidence is appropriate for agent instructions, not exact-word tests.
2. Rewrite the skill for C1–C4 using the plan's decisions.
3. Follow the rewritten skill yourself on plan V1–V8 fixtures, with gh replaced at the process boundary. Record actual commands and captured argv/stdin, not a separate routing implementation masquerading as the skill. Preserve evidence for C5 and remove temporary fixtures/helpers.
4. Fill section 8 with outcomes and return changed-test output.

One file and one sequential worker are expected. Return a mismatch if the work needs a larger implementation surface.

## 7. Commands

`AKROGON_BASE=f281241901d0f1c8a2bfd5943be838fb14f5eb9c git diff --check` is the available targeted diff check. No changed-test runner executes skill prose. The actual changed-flow check is the worker's V1–V8 execution against temporary repositories and substituted gh, recorded with commands in `verification/seed-issue.md`. B owns the full suite and other configured checks.

## 8. Done-when, evidence and report

All C1–C5 pass with truthful baseline and post-change evidence. Keep a runnable minimal boundary invocation in the evidence, not a new committed test suite. Include limits of semantic and substituted verification.

Changed files and reasons: Replaced only worktree `skills/seed-issue/SKILL.md` with the standalone GitHub intake contract for D1–D4. Authoritative leaf `verification/` contains fresh baseline, real fixture observations, submitted commands, exact argv/stdin, results and a safe runnable boundary replay. This section records the current completion evidence.
Tests run: All V1–V8 passed across 23 concrete scenarios (7 successful submissions, 15 visible routing stops, 1 controlled command failure). Exact title/body and argv checks passed, including shell-sensitive literals without execution. Removed-name/scope/cap inspection passed. `AKROGON_BASE=f281241901d0f1c8a2bfd5943be838fb14f5eb9c git diff --check` passed with no output. Evidence: `verification/seed-issue.md`. Full checks remain B-owned.
Known limitations: Agent-applied semantic routing verification is not an automated parser test. The substituted boundary excludes live GitHub authentication and service behavior, and this pass does not independently execute every harness. Unreadable-file and missing-root handling were reviewed, not separately exercised. Temporary fixtures/helpers were removed after capture.
Unverified criteria: None of C1–C5 remain pending within the agreed semantic/substituted verification scope. The limitations above remain explicit.
