# Consult: implement the overnight recommendations (blind round)

Operator, 2026-10-15 07:00: "Do all of these recommendations now. Use consultant B as your reviewer according to akrogon rules. Consult with all slots before implementation to see what the best most elegant systemic solutions are." Then, about merge batching: "Whay would you keep merging parked?"

Standing operator rules: simplest systemic fix, remove code rather than stack it, no caps, no locks, no slowdowns, no new seats, quality stays.

Background: issues/chart/system-speed/CHART.md (F1-F6, D1-D8, Q1-Q5) and its slots/ files. Answer blind: do not read other seats' answer files in this folder.

## Items

I1 (Q1, failed stops for missing proof). check-issue SKILL.md:79 makes B stop the leaf `failed` when "evidence machinery is missing". implement-issue SKILL.md:59 forbids A and workers from writing tests except one wrong expectation and one bug repro. Locked decision: issues/closed/pre-written-tests/test-proof-rules/brief.md:7 (machinery = runner, dispatcher, session or port pool, fixture factory; case (f) lets a plan add new test files on existing runner/helpers). 5 stops of this class in 12 h (CHART.md:34). In 4 of them the runner, capture driver and replay helpers existed. Only a missing case or capture was absent, and A recovered by hand into check.fix with a note. D's bound: A in check.fix may add one missing criterion test on existing test tools, shown red against a deliberate product break, with a Test-Change trailer citing the brief line. Question: what is the smallest rule change, in which file(s), that routes "missing case on existing machinery" to check.fix "Handed to A" and keeps `failed` only for truly absent machinery? Does the writer-grades-own-test concern stay met (B re-reviews; break shown red)?

I2 (Q3). The framework watcher wA:pF9 is under an operator stop order. A will lift it (operator approved). F6: watch-issues SKILL.md:41 reruns `failure.phase` unchanged, so a criterion or plan defect fails twice and ends in a notice. If I1 lands, does watch-issues need any change, or is lifting the order enough?

I3 (Q5, pi shell cap). ~/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts: DEFAULT 120 s, MAX 600 s, and its prompt sentence tells the model to background and poll anything longer. Measured cost ~7 min per leaf (CHART.md:22). implement-issue SKILL.md:45 ("Wait on exit") is the background-run-and-poll paragraph. Seats are pi (A, devin swe-2-max), codex (B), claude, agy. Questions: remove the cap or raise it, to what? Can :45 be deleted, or do codex/claude harness tool timeouts (Claude Code Bash max 10 min; merge verify takes 5-19 min) still need it? Is there one rule that works across all harnesses without a poll paragraph?

I4 (Q4, merge batching, operator now asks why parked). New numbers, framework since the single-leaf change (6640ab5, 10-14 17:46): 25 merge attempts, 20 merged, 5 red (p = 0.80). Lone verify median 7.3 min (5.2-18.6). 38 merge-phase visits since 10-14 12:00 total 9.0 h, median 13.7 min, so about 4.5 h (~9 min per leaf) was waiting for the merge turn. Queue depth will grow if more leaves are ready (Q2). Merge turn code: src/next.ts:809-812 (`mergeQueue(...)[0]`), src/batch.ts (123 lines). 6640ab5 removed batch members, split, --culprit and batch_limit (-2.9k lines). Earlier O1 design: the queue head (holder) verifies a stack of every waiting compatible leaf at once; green pushes all; red falls back to the holder alone; a follower whose own head was in a red batch is skipped until its head changes. Earlier conflict (no caps, CPU ~ today): batch beats parallel trains on CPU; at p = 0.80 batch gain is ~1.3x, at p = 0.95 ~2.8x. Question: the smallest cap-free design, roughly how many lines, what it removes or reuses, and what it could break. Or argue it should stay parked, with numbers.

I5 (Q2, ready work for the night). Framework has 59 seeds in issues/seeds, akrogon 2; no open leaves now. Is there a systemic change (not a new process step) that keeps ready leaves flowing, or is this purely operator charting practice?

## Output

Write to the return file named in your prompt. Per item: your pick, the exact file:line change (or "no change"), what it removes, what it could break, one outside source per item where one exists (practitioner or primary docs, 2025-2026 preferred; say if none found). Max 70 lines. Read-only: edit nothing else.
