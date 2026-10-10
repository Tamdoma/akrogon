# Brief W2: fresh-agent six-case proof + run record

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/seed-owner-routing (read only; the artifact goes to the leaf folder path given below)

## 1. Goal

Prove plan.md criterion 5 and the decision rules of criteria 1–4: a fresh agent that did not write `skills/seed-issue/SKILL.md`, given only that shipped text and the files it references, decides six cases without posting. Record verdicts in `/home/ivan/Work/infra/akrogon/issues/open/lesson-guards/seed-owner-routing/implementation/fresh-agent-cases.md`.

## 2. Numbered acceptance criteria

1. Spawn exactly one subagent (the fresh agent) that did not write the change. Its only inputs: the shipped `/home/ivan/Work/infra/akrogon/issues/worktrees/seed-owner-routing/skills/seed-issue/SKILL.md`, the files that text references, live filesystem commands needed to run its steps, and one case input at a time. It must not read the leaf's plan.md, brief.md, design.md, or this brief.
2. The fresh agent decides six cases (expected verdicts in section 6). For each, it states the destination repo (or the visible stop, or "no post, existing report") and its reason traced to skill text.
3. Absolute ban for everyone in this task (you and the subagent): never run `gh issue create`, `gh issue delete`, `gh issue edit`, `gh issue comment`, `gh issue close`, or any command that mutates GitHub or local files outside the artifact below. Read-only `gh issue list` / `gh issue view` are allowed and expected for case 6. No git commits in the worktree.
4. The run record names the subagent used (harness/model if visible), each case's input, the verdict, the reason, and the observed commands (especially case 5's PATH manipulation and case 6's lookups).

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/seed-owner-routing/skills/seed-issue/SKILL.md` (shipped text — what the fresh agent reads; you read it once to sanity-check the case setup)
- `/home/ivan/Work/infra/tamdoma/framework/akrogon.yaml` (consumer repo `issues_repo`)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

Key facts already verified (do not re-derive, use for case setup): framework `akrogon.yaml` = `issues_repo: Tamdoma/tamdoma-framework`; `akrogon` resolves at `/home/ivan/.local/bin/akrogon` → `/home/ivan/Work/infra/akrogon/src/akrogon.ts`, git root `/home/ivan/Work/infra/akrogon`, no root `akrogon.yaml`, origin `Tamdoma/akrogon`; framework has NO `skills/check-issue/SKILL.md` but has `package.json` and tests such as `.claude/hooks/tests/blueprint-call-refs.test.ts`; akrogon has `src/next.ts`; `~/.claude/skills/check-issue` is a symlink resolving to `/home/ivan/Work/infra/akrogon/skills/check-issue`.

## 4. Change list and needed interfaces

You write only `/home/ivan/Work/infra/akrogon/issues/open/lesson-guards/seed-owner-routing/implementation/fresh-agent-cases.md` (create dirs). You commit nothing anywhere. The subagent writes nothing; it returns verdicts you transcribe.

## 5. Do-not, reasons and exceptions

- Do not let the fresh agent read leaf artifacts (plan/brief/design/state) — the criterion requires it decide from shipped text alone; a tainted read voids the proof. Exception: none.
- Do not post anything to GitHub or mutate repos — criterion 5 forbids posting; readiness grants cover only the already-run filing probe. Exception: none.
- Do not run the cases yourself and have the subagent merely reword your verdicts — the proof is the fresh agent's independent decision. You may pre-verify facts for the case setup (section 3 lists them) but the six verdicts must come from the subagent.
- Do not fix, edit, or comment on the skill text — this unit produces evidence, not changes.
- Return a mismatch with evidence if a case cannot be exercised as specified (e.g. #73 no longer exists); the exception is a revised brief from A.
- Restated: the exclusions guard an untainted read, the no-posting rule, and proof independence; the only exception is a revised brief.

## 6. Ordered steps

1. Spawn one subagent in a neutral cwd (e.g. `/home/ivan/Work/infra/tamdoma/framework`) with a task roughly: "Act as an agent running the seed-issue skill. Read /home/ivan/Work/infra/akrogon/issues/worktrees/seed-owner-routing/skills/seed-issue/SKILL.md and follow it to the Destination decision for each case I give, without posting anything to GitHub (read-only gh commands allowed; never gh issue create/edit/delete/comment/close). For each case return: destination repo or stop, and the reason citing the skill text." Then give it the six cases, one message each or all listed, instructing it to actually run the filesystem/lookup steps the skill requires (existence checks, `readlink -f`, `command -v`, `git rev-parse`, read-only `gh`).
   Cases:
   a. cwd = `/home/ivan/Work/infra/tamdoma/framework`; report names `skills/check-issue/SKILL.md` → expect Tamdoma/akrogon.
   b. cwd = framework; report names framework test `.claude/hooks/tests/blueprint-call-refs.test.ts` → expect Tamdoma/tamdoma-framework.
   c. cwd = framework; report names `package.json` → expect Tamdoma/tamdoma-framework.
   d. cwd = `/home/ivan/Work/infra/akrogon`; report names `src/next.ts` → expect Tamdoma/akrogon (current repo IS akrogon; both rules agree).
   e. case a again but with `akrogon` absent — the subagent simulates by re-resolving `command -v akrogon` under a PATH lacking it (e.g. `PATH=/usr/bin:/bin command -v akrogon`); expect a visible stop naming the path and reason, no post.
   f. a report whose failure is the one in Tamdoma/akrogon issue #73 (lesson seeds misrouted to consumer repos): subagent runs the skill's read-only duplicate lookups against the routed repo, judges #73's body by mechanism → expect "no post, prints #73's URL".
   For case e also confirm the companion truth: a consumer-code report (names only consumer-resident paths) never reaches the owner test, so missing akrogon does not block it.
2. Collect the six verdicts and reasons; verify each against expected. If the fresh agent decides differently, that is a finding to report verbatim — do NOT coach it.
3. Write `implementation/fresh-agent-cases.md` under the leaf folder: subagent identity, the task text given, per-case input/verdict/reason, observed command evidence, and your own verdict whether each matches expectations.

Advisory size: 1 artifact, under ~15 turns including the subagent.

## 7. Commands

No changed-test command applies (no code changed by this unit). Evidence = the artifact plus the subagent's recorded commands.

## 8. Done-when, evidence and report

The artifact exists with all six cases recorded; you report match/mismatch per case; nothing was posted or committed by anyone.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
