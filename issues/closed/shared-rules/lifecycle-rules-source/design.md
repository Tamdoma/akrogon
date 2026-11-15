# Design: lifecycle-rules-source

## Binding decisions, verbatim

Chart `issues/chart/shared-rules`, fork `forks/shape.md`, Taken. Operator, door t126, 2026-11-11, verbatim: to question 1 "1b, then. Continue."; to questions 2 and 3 "2a | 3a |".

- Question 1: 1b. "One file beside the four lifecycle skill folders … holds once: the grant reuse and count lines, the `.env` rule with the producer key save, kept command output, and the rule for a red check with no cause in the leaf's diff (one retry, the known-red judgment, filing a base red)." Reason on record: of the 18 commits since 2026-10-01 that edited three or four of the files together, 8 were about the red-check rule and 4 about the four named families. Binding: "each skill keeps a link and one short line for what is its own (record file, slot, merge's `.env.example` exception, check.review launching no covered operation, the command form); the re-read sentence stays at the top of each lifecycle SKILL.md, and implement's wording is fixed so it no longer contradicts the conditional reads of brief-template.md and worker-protocol.md, the delegation-point read kept, delegated repairs included (W5, factory-wins contracts question 3); no seat gains or loses a rule (signpost 3a, Findings); the door's fourth copy of the red-check rule in chart-issues Direct route stays as it is." Foreclosed: 1a (the four named families only).
- Correction to question 1's reach, approved by the operator at the handoff review, 2026-11-11, verbatim "1a |  2a" (1a: "Put a small pointer file inside each step's own folder … Use this for the new shared rules file and also for the lesson file that fails today. A test then stops anyone adding an \"up one folder\" path again."). The shared file is reached through a link file inside each skill folder, as ponytail.md is, never through `../`. Reason: observations O1 and O2 in the fork's Findings. Foreclosed: "reached like `../lesson-rule.md`".
- Question 2: 2a. "The four lifecycle skills stay one file each." Foreclosed: 2b (splitting implement-issue and check-issue by phase). This leaf moves no phase section into its own file.
- Question 3: 3a. "The implementation report carries a table, old place to new place for every rule; the reviewing seat follows it along each phase's reading path; a check shows every link opens from an installed copy. No paid run." Foreclosed: 3b.
- No seat gains or loses a rule (fork Findings, signpost 3a "A win with no measurable cost today is listed, not charted"): "a sentence only some seats hold today (fixture cleanup in check and merge, setup flock in check's grant paragraph and implement's Effective settings) keeps exactly those seats." Giving those rules, or the temp rule, to seats that lack them is Off route in the chart.
- Slot B's check, adopted (slots/shape-final-check-B.md, FC2): "at most a short excerpt" is a duty plan-issue lacks today, so that clause keeps implement, check and merge only; plan takes the shared capture, citation and exemption text without it.
- W5 (factory-wins forks/contracts.md, Taken, question 3): "What transfers: the contradiction between the opening blanket re-read of references and the conditional reference reads, with the delegation-point read kept, repairs that delegate included; not a broad exemption from fresh phase reads."
- Commit 6490a86c (2026-10-14) put the re-read sentence at the top of the lifecycle skills, reason "Seats kept acting on rules edited after their first read." It stays in each file, because it is what makes a seat read anything else.
- Signposts (forks/signposts.md, Taken, operator 2026-11-10 "1a | 2c | 3a | 4a | 5b | 6a | 7a |"): 2c "No win may remove the second-seat review, clean-checkout checks before a merge, the operator's approvals, the decision record or any current chart-door step"; 6a "Changes land in akrogon only".
- A leaf branch carries code and skill text only: no path under `issues/`.

Excluded here, with owners: the link check and the lesson-rule link files (`skill-links-in-folder`, which this leaf is blocked by); the chart door, its step files and its own copy of the red-check rule in Direct route (`door-step-files` moves that copy unchanged in meaning); a split of any lifecycle skill by phase (foreclosed, 2b); the repeated rules outside the four families, which stay where they are: the temp files paragraph, the four grounding lines, the pass-artifact location, the operator-blocker stop, stop by run id and abandoned-capture recovery, `merge_checks` only at merge, the Test-Change trailer and the test-writing bar; the worker-facing copies of the command-output rule in `skills/implement-issue/brief-template.md` section 8 and `worker-protocol.md`, which stay because a worker sees only its brief; agy (Off route).

Standing design, installed path `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf:

- A test exists only as the proof of a done-criterion: criteria 5 and 6 are proven by the repo's existing link and command-literal tests reading the files that now carry the text. Criteria 1 to 4 and 8 are judged by the reviewing seat from the table and the diff. No wording snapshot of skill text is added; the chart rejects one (fork Findings, question 3).
- Cheapest sufficient proof for moved text is the clause table read by a thinking reviewer: a paid seat run would show one seat on one day, the table covers every clause.
- A test never keeps a hand-copied list of another file's entries: the command-literal test names the commands, which are literals a seat runs as written.
- No secret is read. The `.env` rule's own text forbids opening `.env`; this leaf moves that text and opens no env file.
- No machinery, no auth, no outside call, no live run. Agent-owned, no human-only prerequisite.

## Leaf architecture

Owned surfaces: new file `skills/lifecycle-rules.md`; new git links `skills/plan-issue/lifecycle-rules.md`, `skills/implement-issue/lifecycle-rules.md`, `skills/check-issue/lifecycle-rules.md`, `skills/merge-issue/lifecycle-rules.md`; `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`; the test "seat skills name the known-red command" in `tests/docs-links.test.ts`; `skills/AREA.md`; pages under `docs/` that name a moved rule's place.

Literal interfaces: the shared file is `skills/lifecycle-rules.md`; each link file is named `lifecycle-rules.md`, git mode 120000, target `../lifecycle-rules.md`; a skill links it as `lifecycle-rules.md`. The shared file holds no relative markdown link, because it is read from four folders; it names another skill or section in words, as today ("seed-issue's `## Lifecycle filing` section"). The commands `akrogon verify --known-red`, `akrogon verify --attempt <id> --known-red` and `akrogon run-check` are literals and keep their exact form. A rule that only some seats hold is either kept as that skill's local line or stated in the shared file with its seats named; which form is the plan's, the seats are not.

Where the copies are today, by section and opening words:

- Grant: the Shared context paragraph of each of the four skills that says the pass reuses `grants[]` for the operations they cover. check's paragraph also holds the setup flock and fixture cleanup; merge's also holds fixture cleanup. Those sentences are not grant definitions and keep their seats.
- `.env`: the Shared context sentence "never opens, prints, appends to, or writes `.env`" in each of the four; merge's adds the `.env.example` exception. Producer save: the `produces[].save` paragraph in plan and implement only.
- Command output: Shared context of implement, check and merge; in plan the shorter copy inside `plan.synthesis`, the paragraph beginning "With `plan.md` written".
- Red check: implement Shared context; `check.review`; merge `### Shared endings`; plan points to implement's copy.
- Re-read sentence: the first line under the front matter of each of the four files.

Consumers of what changes:

- The test "seat skills name the known-red command" reads implement-issue, check-issue and merge-issue `SKILL.md` for the command literals. Decision: it follows the text to the file that now carries each literal (criterion 6).
- The link check delivered by `skill-links-in-folder` reads the new shared file and the four link files. Relied on, not changed here.
- `check.repair` borrows the retry paragraph from `check.review` by its opening words, and `plan.synthesis` points to implement's red-check copy. Decision: both name the shared file's part instead.
- `check.fix` borrows implement's test exceptions, rerun rule and trailer rule; merge's "attempt top" borrows the solo form's trailer and conflict rules. Not moved; they must still resolve after the edit.
- The standalone and direct forms of implement-issue and check-issue read the same `SKILL.md` and keep their local exceptions (no config, no phase, no registered capture); the table's reading paths cover them.
- `src/akrogon.ts` prints a message that sends the reader to "the red-run endings in skills/merge-issue/SKILL.md". Open for the plan: whether merge's `### Shared endings` still answers that message after its red-check text becomes a link and a local line, or the message names the shared file.
- chart-issues Direct route step 5.iii holds its own copy of the red-check rule for `akrogon verify --holder <chart>/direct`. Not a consumer; unchanged by this leaf.
- `skills/implement-issue/brief-template.md` and `worker-protocol.md`: Open for the plan: whether any sentence there points at a place in implement's `SKILL.md` that this leaf moves.
- Pages under `docs/`: the map named `docs/reference/checks.md`, `files.md`, `commands.md` and `docs/use/when-work-fails.md` as naming these rules. Open for the plan: which of them state a place that moves.

The substance of every rule is fixed; the wording of the shared file and of each local line is the leaf's.
