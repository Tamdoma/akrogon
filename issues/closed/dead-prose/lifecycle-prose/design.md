# Design: lifecycle-prose

## Binding decisions, verbatim

### Peer-question paragraph
Operator answer (2026-09-14): `18a` delete all five peer-question paragraphs (broadcast-issue:25, check-issue:45, implement-issue:25, merge-issue:21, plan-issue:27). Forecloses keeping plan-issue's copy.

### Footer
Operator answer (2026-09-14): `19` keep both `Last operation:` and `Next:` in all eight skills, for manual mode when the operator or someone else runs a phase by hand. Forecloses 19a and 19b.
Operator answer (2026-09-14): `31a` delete the scrambled-context paragraph in the five skills that carry it, keep the two footer lines. Forecloses keeping the paragraph.

### Failed diagnosis
Operator answer (2026-09-14): `20a` delete both diagnosis clauses (merge-issue:37, check-issue:47). Review files are the failure record. Forecloses keeping check-issue's clause. (merge-issue:37 is line 39 at 735cd63.)

### Ponytail
Operator answer (2026-09-14): `21a` check-issue/ponytail.md becomes a relative symlink to ../implement-issue/ponytail.md, resolved through the installer's folder links. Forecloses deleting the copy and repointing check-issue:14.

### Lesson shape
Operator answer (2026-09-14): `22` keep the apply-removes-and-dates clause at implement-issue:29. `30a` keep implement-issue:29 verbatim; the born-applied stderr-json-parse line is prune material, not a rule change. Forecloses deleting the clause, the four-restatement collapse and a history-only clause.

### Lesson commit
Operator answer (2026-09-14): `23a` lessons are written in the registered checkout and the operator commits them with the issue files; check-issue:41 loses the leaf-branch commit clause. Forecloses A committing lessons at merge.

### Leaf split
Operator answer (2026-09-14): `29a` two leaves, L4 lifecycle skills and guide, L5 chart skill. merge-conflict-route merged as edda614 before this handoff, so no blocked-by.

### Standing design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any leaf touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first leaf needing it. Non-browser flows use a real request or invocation. The blocking `checks` commands judge the exit code and the implementation report records the artifact path as evidence.
- Leaf work is agent-owned. A step physically requiring the operator is a human-only prerequisite completed before the leaf opens. Credential access alone never qualifies. An unforeseen physical blocker ends the attempt and informs the operator.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

Current interpretation: no auth, browser, secret or user-visible flow; no code or test changes, so the negative-test and artifact rules do not apply. The existing suite is the regression check. Skills go live at merge through the symlinked skill folders, and the symlink in item 4 resolves inside every installed copy because the installer links whole folders (src/install.ts:11-21).

## Leaf architecture

Owned surfaces: `skills/broadcast-issue/SKILL.md` lines 25 and 54; `skills/check-issue/SKILL.md` lines 41, 45, 47 and 60; `skills/check-issue/ponytail.md`; `skills/implement-issue/SKILL.md` lines 25 and 68; `skills/merge-issue/SKILL.md` lines 21, 27, 39 and 60; `skills/plan-issue/SKILL.md` lines 27 and 68; `docs/guide/files.html` line 106; `docs/guide/limits.html` line 66; `docs/guide/phases.html` line 66; `docs/guide/problems.html` line 61.

Literal interfaces. File names and grep targets literal; skill and guide wording by content.
- Deleted whole lines: broadcast-issue:25, :54; check-issue:45, :60; implement-issue:25; merge-issue:21, :39, :60; plan-issue:27, :68; files.html:106; limits.html:66. Deleting a paragraph takes one adjacent blank line with it, leaving no double blank line.
- implement-issue:68 after: "The lines are printed only, with actual command results rather than assumed progress."
- check-issue:47 after: "Finish with `akrogon phase <slug> <next> --slot <A|B> --verdict <ready|nits|fix>`, requesting `check.fix` for fix or `merge` for ready/nits, then print the footer and stop."
- check-issue:41 after: "Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with B and recording any reusable lesson found here as one active mechanism/date/history line plus a history file with case, evidence and learning, written under the registered checkout's `learnings/` and left for the operator to commit."
- merge-issue:27 after: "Turn a Nit A still holds and finds reusable into one line naming mechanism/date/history in the registered checkout's `learnings/LESSONS.md` and a history file with case, evidence and learning, left for the operator to commit, without reading the active list as pass input or adding another turn."
- phases.html:66 after: `<li class="phase"><span class="pn">failed</span><span class="who">you</span><p>Waits. Read the reviews, then send it back with <code>akrogon phase &lt;slug&gt; implement</code>.</p></li>`
- problems.html:61 third cell after: `Read the reviews. Fix the brief if needed. <code>akrogon phase &lt;slug&gt; &lt;phase&gt;</code>.`
- `skills/check-issue/ponytail.md`: `ln -sfn ../implement-issue/ponytail.md skills/check-issue/ponytail.md`, committed as a symlink (git mode 120000).

Tests: none added. The suite runs unchanged; nothing in src/ or tests/ reads the edited prose.

Exclusions: implement-issue:29 and plan-issue:31 (byte-identical); every `Last operation:` and `Next:` line and the intro sentences before them; check-issue:14 (reads its own path, which now resolves through the link); learn.html:57-58 and phases.html:64 (A still writes lessons at merge); files.html:58-60 and :95 (issues on the leaf branch rule, unrelated); the chart skill (chart-prose owns it); `src/`, `tests/`, `issues/log.jsonl`, closed leaves.

Dependencies: none. chart-prose edits only `skills/chart-issues/`; no shared file. Credentials: none.
