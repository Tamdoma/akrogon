# Review B: seed-owner-routing

Date: 2026-10-10
Phase: check.review (initial, blind)
Base: 3d223c853b51ffcc9a826ce0a4a9f3a20d60da9a
Reviewed head: e5b68d61c7cc420c5595e3f4ae8f0d902c0b38bc
Verdict: ready

## Scope and evidence

Read plan.md including IN1/IN2, design.md, brief.md, implementation/report.md, implementation/fresh-agent-cases.md, the complete six-file diff, affected guide pages, README intake documentation, docs/reference-index.md and src/test-files.ts. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No AREA.md changed. No code or documentation was edited, no commits made, no GitHub mutation performed.

- Criteria 1–2: skill Destination preserves consumer routing and validation first; only failure-location paths absent under the consumer root enter the installed-root test. Consumer-resident paths retain precedence. Installed links resolving under the akrogon root are included explicitly. Unavailable command/root stops before posting. Live inspection confirmed package.json exists in both framework and akrogon, framework origin is Tamdoma/tamdoma-framework, the installed command resolves to akrogon's src/akrogon.ts, and the installed check-issue skill resolves under that checkout. The independent case record covers both destinations and missing-command behavior, including the consumer-resident companion case.
- Criteria 3–4: both gh issue list commands use the already-routed repo; candidate bodies determine covering versus related failures. Covering reports bypass creation and produce the existing URL, while different reports retain the creation branch. Origin repo is always present and Lesson history is conditional, without changing the six body sections. The fresh-agent record documents both searches and reporter-supplied #73 view, with the existing-report outcome.
- Criterion 5: the artifact identifies a fresh pi process using openai-codex/gpt-5.6-sol with high thinking, isolated from planning/context files and forbidden to post. All six recorded inputs, decisions and reasons match the planned outcomes. Its case F records both read-only lookups against Tamdoma/akrogon and no post. No shipped skill change followed that evidence.
- Criterion 6: reviewed the routing and creation claims by meaning across docs/ and README.md with rg. Guide/create and guide/learn explicitly state consumer precedence and owner routing; README summarizes reports whose failure lives under the installed checkout. Read in context, these agree with the skill rather than changing shared consumer-path precedence. Existing-report outcomes are stated in create, learn, cheat and README. The create section's issue-body description is qualified by its explicit covering-report exception. No contradicting routing or always-create rule found.

## Verification

Implementation report records bun run format, bun run typecheck, bun test --timeout=30000 (642 pass, 0 fail, 33 files), and bun test --changed="$AKROGON_BASE" --timeout=30000 (3 pass). It identifies the pre-existing src/status.ts formatting rewrite and its reversal, with no unrelated file in the reviewed diff. No missing evidence or concern justified repeating the complete configured checks.

B reran bun test tests/docs-links.test.ts: exit 0, 3 pass, 0 fail. To verify the new skill-page sweep, copied README, config.yaml, docs, skills, plugin and the link test into a temporary directory under exported TMPDIR. The copied baseline passed (exit 0, 3 pass). Adding only a missing relative link to the copied skills/seed-issue/SKILL.md made that test fail (exit 1, 2 pass, 1 fail), naming exactly the skill's missing target. This establishes a deliberate break for the new scope without altering the reviewed worktree. An earlier incomplete temporary copy also lacked config.yaml and plugin; it was discarded and replaced by the baseline-controlled proof above. All temporary proof copies were removed. The expected injected failure is proof, not a failing leaf check.

Working tree remained clean and HEAD unchanged at the reviewed SHA after verification.

## Test-Change trailers

Commit e5b68d61c7cc420c5595e3f4ae8f0d902c0b38bc:

`Test-Change: tests/docs-links.test.ts <added skills sweep; source: leaf brief criterion 7>`

The path matches src/test-files.ts. The cited criterion number is inaccurate (brief has six criteria), but the substantive source is explicitly present in plan D8/checklist W1 and criterion 6's link proof. This adds skill pages to an existing sweep without changing or deleting any old assertion, fixture or recorded output. Existing coverage remains, and the deliberate broken-skill-link proof confirms the added behavior. No unsupported weakening of tests.

## Findings

No Fixes or Nits. No operator actions. No reusable lesson identified.

## Merge verification — 2026-10-10

Attempt: dcd26b22-6539-4435-9e2b-fe1b1bd1bc86
Applied stack top: 1d7d536100aebc183bd22f63b7c3ba31d5d07ea5
Refreshed base / built_on: 0f13951aa8d1bce42f97a321a461cbcbf7455424
Carried members: none. Both review verdicts ready. No fetch, rebase or commit by B.

- bun run format: exit 0. It only reformatted the known pre-existing src/status.ts phaseColor literal. The starting worktree was clean; restored that generated change before subsequent checks, preserving the exact recorded stack top.
- bun run typecheck: exit 0.
- bun test --timeout=30000: exit 0, 646 pass, 0 fail across 33 files, 62.22s. Full output retained at implementation/merge-tests.log.
- Refreshed AKROGON_BASE and ran the configured test_changed command: exit 0, 3 pass, 0 fail, 6 changed files selecting tests/docs-links.test.ts. The inherited environment initially still contained the old review base; that extra run also completed green (524 pass across 19 files), but the refreshed-base run above is the merge proof.

No merge_checks, merge_covers or advisory commands configured. HEAD remains the recorded top and the code worktree is clean. No Applied lesson-history entries were introduced in the six-file stack diff.

Completion ownership: this leaf is one of three under lesson-guards; lesson-write-rule and guard-retires-lesson remain at plan.synthesis. This batch cannot complete that epic and has no standalone completion owner. No completion broadcast is expected unless the command reports a completion owner.

Merge result: `akrogon phase seed-owner-routing merged --slot B --check --attempt dcd26b22-6539-4435-9e2b-fe1b1bd1bc86` returned `ok`; the subsequent merged call returned `moved merged` with exit 0. No issue complete or epic complete line was printed, so no broadcast was required. The lesson-guards epic remains open for its two dependent leaves.
