# Implementation brief

## 1. Goal
Implement retire-old plan D1–D6: preserve lesson archives, retire old trees, repair navigation, write current docs and initialize grounding.

## 2. Numbered acceptance criteria
1. C1: all 19 archive files move byte-identically without collisions, prior history stays unchanged, retired trees disappear and exactly eight skills remain.
2. C2: audit actionable links and paths in README, skills, learnings and authoritative open leaves. Repair navigation, preserve locked and historical records.
3. C3/C5: REFERENCE.md links seven real area folders, README covers install/init/commands/eight skills, and LESSONS.md gains its required explanation without changing active lines.
4. C4: B runs authorized init from registered root, copies generated configuration here, verifies registration and records its temporary root-index gap.
5. C6: targeted initialization tests and all configured blocking checks pass, evidence is saved, changes committed before review.

## 3. Read-first list
Read authoritative /home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/finish/retire-old/plan.md, brief.md and design.md; README.md, package.json, src/akrogon.ts, src/install.ts, skills/init-issues/SKILL.md, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Existing skills supply current descriptions. Do not read lesson history as guidance.

## 4. Change list and interfaces
Worker owns archive moves/deletions, navigation audit/repair, README.md, REFERENCE.md and the explanatory LESSONS.md addition. Save manifest, audit and report under this implementation directory. B owns initialization, issues/config.yaml, full checks and commit. Config uses grounding.index: REFERENCE.md.

## 5. Do-not, reasons and exceptions
Do not alter archived bytes or locked design because they are records. Do not change source behavior, machine installations, docs/guide.html or KICKOFF.md because they are outside scope. Do not run init or full tests as worker because B owns these. Return a mismatch with evidence rather than widening scope or interfaces; only a revised brief from B authorizes an exception. These exclusions preserve records and ownership, with exceptions only through B's revised brief.

## 6. Ordered steps
Capture archive/prior-history hashes and active-line preservation evidence, checking collisions before moving (C1). Audit inbound navigation before deletion (C2). Move archives and delete obsolete trees (C1). Write current README/index and add the lesson explanation (C3/C5). Verify hashes, destinations, all actionable links and unchanged prior lines. Save concise evidence and fill report. This is mechanical retirement, so use direct preservation assertions, not new wording tests or manufactured red tests. Expected scope is the two retired trees plus three docs and evidence, roughly 12 worker turns; report substantive scope mismatch.

## 7. Commands
At worker dispatch no configured test_changed existed. Targeted existing check: AKROGON_BASE=a40ff4dbcf1811cb44ceeb35945bdecee17bcc95 bun test tests/init.test.ts. B verifies the init skill's proposed changed-test command separately. Worker also runs direct archive/hash/link assertions, saving results.

## 8. Done-when, evidence and report
All worker-owned acceptance criteria verified with manifest and navigation audit under implementation/. B supplies real init/config invocation evidence and full-suite results. Tests use existing temp repositories and substituted herdr/gh boundaries, never real services or installation. Report limitations and unverified criteria explicitly.

Changed files and reasons: archives moved byte-identically, retired trees deleted, README/index rewritten and lesson explanation added. Evidence files and detailed reasons: worker-report.md.
Tests run: targeted init test passed; direct preservation/link assertions passed. B verified init/config, 46 full-suite tests, typecheck, format and guarded changed-test selection. See report.md and verification/.
Known limitations: canonical index available at merge; historical/out-of-scope prose retained in archives, locked design, KICKOFF.md and docs/guide.html.
Unverified criteria: none for implementation acceptance. B verified init/config, all blocking checks and recorded concurrency evidence in report.md. Canonical index availability remains deferred to merge as recorded.
