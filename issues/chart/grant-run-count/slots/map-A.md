# Map A: grant-run-count (#126), written before reading B and C

## What happened (inspected)

- Framework `issues/closed/about-titles/fixture-weave-recorder/readiness.yaml` `grants`: four grants. The one A ran under says "at most 1 known-good recorder run and 1 rerun after the amendment". The later one B ran under says "at most 2 recorder invocations in total, counting every invocation that reaches a paid session whatever its outcome". B counted right and stopped; A ran at least 3 paid sessions and reported "1 run + 1 rerun".
- So the bound A broke was ambiguous: "known-good run" and "rerun" do not say whether a failed or crashed invocation counts. A plausibly counted only runs it judged as attempts of the known-good case. The bound B kept named its counting unit. The wording of the bound is part of the bug.
- `src/readiness.ts` `grantSchema`: `bounds: text`. `src/run-check.ts`: each `run-check --name <n>` writes run-unique capture logs into the holder (`implementation/check-<name>-<ms>-<pid>.log`), so the count of paid invocations is on disk; A did not read it.
- `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md`, "reuses `grants[]`" paragraphs: compare operation, target, identity and bounds before each covered operation; no rule on how to count, from what record, or what to do at the bound. "treats anything outside it as an operator blocker" means stop, which signpost 2b now overrides (allowed with a warning).
- `skills/chart-issues/SKILL.md` "Take" grant paragraph: grants carry "repeat and recovery bounds"; no rule that a bound names its counting unit.

## Forks

F1. How the seat counts (signpost 1c: the agent keeps its own count).
- a (recommended) From the record, not memory: before each covered paid invocation the seat counts the invocations already made under that grant from the leaf's own run-check capture logs for the grant's operation (every invocation that reached a paid session, whatever its outcome), and writes the count and the log paths in its pass artifact. Free: the logs exist today.
- b From memory with a running tally in the report. What failed in #126.
- Breaks later: a counts only invocations that went through `run-check --name`; a covered operation launched another way is invisible. Mitigation: the rule says covered paid operations run through `run-check` so they are counted (already the practice).

F2. What a bound says (fix at charting, the family under 4a).
- a (recommended) The chart door writes every repeat bound with its counting unit: what counts as one (every invocation that reaches a paid session, whatever its outcome) and whether it is per pass, per leaf or per chart. Copies B's grant wording as the model.
- b Leave bound wording free.
- Signpost 5a: new grants only.

F3. At the bound (signpost 2b: allowed with a warning).
- a (recommended) A run past the bound is allowed; before it the seat writes a warning line in its pass artifact naming the grant, the bound, the count and the reason it needs another run, and the report's grant section shows the overrun; the reviewer (check-issue) reads it as a finding to report, not a Fix. Who reads it: check review and the operator's watcher.
- b Warn by herdr notification. Rejected by 6a: the notification path is herdr-only today and is replaced by the port.
- c Stop as today ("operator blocker"). Contradicts 2b.
- Conflict: implement-issue and check-issue say "treats anything outside it as an operator blocker under the stop rule". 2b changes that for repeat bounds only; operation, target and identity outside the grant stay blockers (2b is about run count, not scope).

F4. Where the rule lives.
- a (recommended) One statement, in implement-issue's grant paragraph (or a shared line both seats point to), with check-issue and merge-issue pointing to it. DRY.
- b Copy into each skill.

## Practitioner questions

- Does a crashed run that never reached the paid session count? No: count invocations that reached a paid session (the log shows a session line). When unknown, count it (B's grant rule; err toward the money).
- Is a nested paid call (copy-cycle sessions per run) a second bound? Yes, the grant already writes both; the count rule applies per bound.

## Pitfalls

- Counting from logs a seat deletes or a cleanup removes: logs stay in `implementation/` (the holder), not temp.
- The #107 fix (e522c186) put coverage in the skills already; adding a parallel rule drifts. Extend the same paragraph.
- Release-link: the fix reaches seats at the next release.

## Split

One akrogon leaf: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` if it runs covered operations, `skills/chart-issues/SKILL.md` "Take" grant paragraph (bound wording), docs hits. No code.
