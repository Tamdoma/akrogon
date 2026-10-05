# Root report: slot C round (blind)

This round settles what the agent does when the report it just filed seems to share a cause with earlier reports. In the real case the reporter had to ask "what's the systemic issue?" before #128 got filed (`INTAKE.md:23`). It comes now because the last fork, chart-grouping, needs to know whether a separate root report will exist. Paths are relative to `/home/ivan/Work/infra/akrogon`.

Budget: about 5 rule sentences were left for the chart, and earlier forks have used most of them. This round's recommendations cost one rule sentence, one clause added to an existing sentence, and one changed footer line.

### 1 · Does the agent suggest a root report, file one itself, or do nothing?

The skill files one report and stops (`skills/seed-issue/SKILL.md:59,63`). Its footer always ends `Next: none` (`:67`). The suggestion can ride on that line. Example of what the agent would print after filing #127:

```text
Last operation: https://github.com/Tamdoma/tamdoma-framework/issues/127
Next: /seed-issue Root cause: mockup gates keep judging all 3 variants after the operator chose one. Seen in Tamdoma/tamdoma-framework#124, Tamdoma/tamdoma-framework#125 and Tamdoma/tamdoma-framework#127.
```

The operator copies the line and runs it, or ignores it. Running it is a normal filing. The skill searches, links the named reports, and writes the same six sections. There is no special root mode.

Research: operator · `INTAKE.md:36,39`, read 2026-10-05 · the cause should come out "without the reporter having to ask", and today's workaround is a separate root issue filed by hand · a root report is wanted, the open point is who starts it. better-than-training · ITIL problem management, secondary summaries, searched 2026-10-05 · the shared cause gets its own record, apart from the incidents it explains · it supports a separate root report over five symptom reports that each repeat the cause. better-than-training · `skills/learn-issues/SKILL.md:29`, read 2026-10-05 · it already prints "one runnable `/seed-issue` line ... never the fix; the operator decides whether to run it. File nothing." · the same pattern is reused here, so the operator learns one habit. No practitioner source was searched for on who should open the cause record.

- **1a (recommended)** Print a ready line on the footer's `Next:` line. File nothing extra. It wins because the cause comes out without the reporter asking, the skill still creates one report per run, and the operator stays in control of what enters the backlog. Cost: the root report exists only if the operator runs the line.
- **1b** File the root report automatically as a second issue. No operator step. Cost: breaks "Create one report" (`:59`), and a wrong guess becomes a real issue that cross-references every linked report.
- **1c** Print nothing. Each report's Suspected cause section and links carry the cause, and the chart door groups them. Cost: a consumer that never charts gets no single place to fix the cause, and the lock says a report "never assumes a chart pass follows".

Pitfalls avoided: A wrong root entering the backlog unasked is removed by printing only, with a done-criterion that a run with a shared cause creates exactly one issue. A fix sneaking into the line is removed by the line naming the condition and the reports only, since "recommended fixes" stays banned (`:26`). A printed line after a failed creation is removed by printing it only when the report was created, with a done-criterion for the failed-creation case.

### 2 · When does the agent print the line?

Example from the case. After #125 the agent could tie one earlier report (#124) to the same condition. After #127 it could tie two (#124 and #125). #128 later judged that #125 was a separate problem and #126 was unrelated to the variant choice. The trigger decides how early, and how often, the line appears.

Research: operator · locks in `forks/cause-section.md` and `forks/related-search.md` Taken · a cause is "supported" or it is a stated gap, links carry a reason, and a closed report is "evidence, not open work" · the trigger can reuse these and needs no new test. better-than-training · #124 to #128 bodies and times, read 2026-10-05 · #127 was the first report whose own text tied the full-variant-set gate to two earlier reports ("related #124, #125") · a shared cause was visible by the third report, before anyone asked. No practitioner source gives a number of reports that should trigger a cause record. The threshold is a product choice.

- **2a (recommended)** Print when all three hold: this report's Suspected cause is a supported hypothesis, the agent linked at least one other open report for that same condition, and no linked report already states that cause. A report that was itself filed as a cause statement never prints one. It wins because two reports with one supported cause are already a problem class, and the "no linked report already states it" check stops repeats once the root exists. Cost: the line can appear as early as the second report, sometimes for a cause that later turns out narrower.
- **2b** Same, but at least two other open reports. In the case the line would first appear after #127. Fewer early guesses. Cost: with only two related reports the reporter still has to ask.
- **2c** Print whenever any report was linked, supported cause or not. Cost: a line after nearly every filing in a busy session, which trains the operator to ignore it.

Pitfalls avoided: The same root being suggested after every later report is removed by the "no linked report already states that cause" check, with a done-criterion that a filing after #128 exists links #128 and prints `Next: none`. A root report suggesting another root is removed by the cause-statement exclusion. A closed report inflating the count is removed by counting open reports only.

### 3 · Does the skill need a title rule for symptom reports and root reports?

The skill asks for "one descriptive title" (`:26`). The cause-section fork passed this question here: should a symptom report's title describe what was seen, while a root report's title states the cause, as #128's does ("Root cause: blueprint has no state for choosing one mockup variant early")? In the case three of four symptom titles describe what was seen. #126's title also carries a diagnosis ("parses JSON scripts as JS").

Research: operator · `forks/cause-section.md` Taken · "Observation holds only what was seen", and the title rule was moved to this fork · the title should follow the same split. practitioner · Simon Tatham, "How to Report Bugs Effectively", https://www.chiark.greenend.org.uk/~sgtatham/bugs.html, read 2026-10-05 · state symptoms, mark speculation · a title is the most-read line, so a guess there anchors hardest. better-than-training · the five titles, read 2026-10-05 · titles mostly behaved without a rule, with one leak · a light rule is enough.

- **3a (recommended)** No new sentence. Add one clause to the existing title wording in `:26`: the title describes what was seen, and names a cause only when the reporter's statement is itself a cause. A root report made from the printed line then gets a "Root cause: ..." title naturally, because the line is the statement. It wins because it covers both report kinds with one clause and no second mode. Cost: "the statement is itself a cause" is a judgment the agent makes each time.
- **3b** No title rule at all. Zero cost. Cost: leaks like #126's title continue, and the door reads a guess in the title as fact.
- **3c** Two explicit rule sentences, one per report kind. Clearest. Cost: two sentences from a budget that is nearly spent, and it describes two modes for one skill.

Pitfalls avoided: A guessed cause in a symptom title is removed by the clause, with a done-criterion that a replay of #126's input yields a title without the parser diagnosis. A root report with a vague title is removed by the printed line starting with "Root cause:", which becomes the statement the title is written from.

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check
- `/seed-issue` is one harness's way to call a skill. The skill must run on every harness (`skills/seed-issue/SKILL.md:10`). learn-issues and `docs/guide/create.md:93` already print this form, so I kept it. A practitioner could ask for a harness-neutral line. That would be a small change to the printed prefix.
- 2a against 2b is a judgment. In the one measured case, 2a would have printed first after #125, for a cause #128 later called a separate problem. That early line would not have been wrong to offer, but it would not have been the final root either. An operator who dislikes early suggestions should pick 2b.
- Under the cause-section lock, a root report's Observation holds only what was seen. So a root report's Observation becomes "these reports showed these symptoms", and the cause sits in Suspected cause, labeled unverified. #128 did not do this. It put the cause in Observation. I think the lock's shape is right, but it means a "root cause" report still calls its cause a hypothesis.
- The changed footer line and the added clause count against C1 "by function" under the cause-section lock. I count one rule sentence for the trigger. The door should recount the whole skill before handoff.
- Running the printed line adds cross-reference events to every report it names. The related-search lock accepts that cost. Printing alone adds none.
- I did not test how an agent on another harness treats a `Next:` line that is not `none`. A hook or loop that reads `Next:` could act on it. A grep of `src/` (non-test `.ts`) for `Next:` and `Last operation` found no match on 2026-10-05, so akrogon's own code does not parse the footer. I did not check harness plugins or hooks outside `src/`.
