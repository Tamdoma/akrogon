# Chart

Charting turns a rough request into work an agent can execute. Use it when important choices are still open.

```text
+-- chart: the route to a defined outcome ------------+
| intake: "I need CSV exports"                        |
|   |                                                 |
|   v                                                 |
| territory map: code, choices, risks, dependencies   |
|   |                                                 |
|   v                                                 |
| fork: all rows or filtered rows?                    |
|   +-- taken: filtered rows ------> destination      |
|   |                               useful CSV export |
|   +-- alternative not chosen                        |
|                                                     |
| fog: large-account behavior not yet surveyed        |
| off route: PDF export, deliberately excluded        |
+-----------------------------------------------------+
```

For export-csv, the destination is the result you want, and the chart records how to reach it. The territory map surveys the ground before you choose a route.

For CSV export, you might need to decide:

- Which columns belong in the file?
- Does export use all rows or the current filter?
- Is this a command-line feature, a download button, or both?

Start charting from the repository:

```text
/chart-issues Add CSV export to widgets
```

The skill inspects the code, gathers evidence and presents the decisions that matter. You answer those questions. The settled answers become leaf requirements.

Chart material lives separately from executable work:

```text
~/Work/widgets/issues/chart/
~/Work/widgets/issues/open/
```

A chart can hold notes, forks and recorded answers. It is not an execution phase, and execution seats do not chart.

Keep the work proportional. A small export change may need one leaf. A larger change may need separate leaves with explicit ownership and dependencies.

Read the resulting brief before starting it. Check that an implementer can tell when the job is done. “Support CSV” is vague. “Quote fields containing commas, quotes or newlines” gives the agent something to implement and test.

Handoff creates the leaf contracts. It does not start execution:

```sh
cd ~/Work/widgets
akrogon next export-csv
```

## Map the territory before choosing a fix

The opening map asks what could change the result. It inspects the live code, identifies the affected areas and separates real dependencies from work that can run independently.

For CSV export, the map might find an existing serializer, a download route and a size limit. That can change whether you need one leaf or several.

The map also names questions an experienced practitioner would ask and likely pitfalls. Examples include spreadsheet formula handling, embedded newlines and memory use on large exports. These are questions to investigate, not automatic additions to scope.

```text
                 territory map
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
  live surfaces      forks          pitfalls
  JSON exporter      row choice     quoted newlines
  download route     column order   large datasets
       |               |               |
       +---------------+---------------+
                       |
                       v
            scope and possible leaves
```

For export-csv, inspecting the existing exporter may remove work you thought you needed. The map also exposes risks while you can still change the scope.

## Research before recommendations

Every material question includes a research line: source, finding and how it affected the options.

The skill looks for evidence in this order:

1. Material you supplied or named.
2. A named practitioner or team with relevant firsthand experience.
3. Primary documentation, source code or a measured result.
4. Model knowledge, only after recording searches that found nothing stronger.

This keeps a confident suggestion from passing as evidence. For a question about widgets, the agent inspects the actual exporter. For a CSV format question, it checks relevant outside sources.

Research informs the recommendation. You still choose the answer.

```text
Research tiers: seek the highest available
+---------------------------------------------------+
| 1 operator          Material you supplied         |
| 2 practitioner      Firsthand experience          |
| 3 better-than-training  Docs, code, measurements  |
| 4 model-knowledge   No stronger source found      |
+---------------------------------------------------+
                        |
                        v
             evidence -> recommendation
                              |
                              v
                     your answer -> taken
```

For export-csv, your requirements and inspected code anchor the options, with outside research where needed. Research supports the route choice; it does not choose for you.

## Forks are decisions; fog needs investigation

A fork is a question precise enough to answer. For example: should CSV include all rows or only the current filter?

The round gives options, a recommendation with its reason and how each option avoids its known pitfalls. A trap that needs a real test or an action from you is named as that step, with its owner, not as a warning. You can pick an option or answer in your own words.

Forks are taken one per round. After you answer, the next fork is researched and asked.

Fog is work whose question is not clear yet. “Exports behave strangely on large accounts” may need reproduction before anyone can propose a useful choice.

Ruled-out work goes under Off route with its reason. It is not silently treated as agreed scope. A step on main that a taken decision needs is never Off-route work; when its precondition exists the door makes it during the pass and verifies the result. When a mirrored report is already delivered or a duplicate, the door closes it with `akrogon close <owner/repo#n> --by <text>`. The exception is a report confirmed fully covered but still undelivered and unowned: it stays open in `sources` until its completion owner delivers. A needed main step that can only follow a leaf's merge is the other exception: it is withheld from the `sources` of every leaf whose completion could close it, and the door closes it with `akrogon close <owner/repo#n> --by <text>` after making and verifying the edit. A chart without `sources` lists each waiting edit in CHART.md as a pending operator step with the exact edit, owner, prerequisite leaf and the check that proves it done.

```text
Unclear in-scope ground
         |
         v
       FOG ---- investigate ----> sharp question
                                      |
                                      v
                                    FORK
                                      |
                               operator chooses
                                      |
                                      v
                                    TAKEN

Deliberately excluded ----> OFF ROUTE + reason
```

For export-csv, unexplained slow exports stay in fog until investigation makes the question clear. PDF export can be off route, while the row-selection fork becomes taken only after you answer.

The records look like this:

```text
issues/chart/export-csv/
  CHART.md
  INTAKE.md
  seats.yaml
  USAGE.md
  forks/row-selection.md
```

Intake keeps the original report separate from agent findings. Fork files keep evidence and your recorded answers. The chart points to what remains open. CHART.md lists open forks in the order they will be taken.

`seats.yaml` records when the door began charting and each seat's session id; a restarted seat's new entry is appended once its restart line reports a session. It also records `spans`: the windows in which the door worked the chart, each `from` up to but not including its `to`, with only the last allowed to leave `to` out. The door opens a span when it begins work on a chart and closes it on handoff, close or hold, when the chart waits on your approval, need or prerequisite, or before it switches to another chart; it keeps the span open while it waits on this chart's consultants and opens a new one when it comes back. A record without `spans` shows a `legacy window` running from its open time to the measurement time. `USAGE.md` is the usage table the door generates from those transcripts before handoff and after the chart closes, covering the tokens and minutes each seat used in those spans. Its `first turn in window` rows and `operator turns` section break the time down further. `calls` counts the model responses that reported usage, and `average context per call` is the input context each call carried, cache included. pi seats are measured. A transcript that cannot be measured is marked `usage unmeasured`.

Read the table with care. The tokens and minutes show that usage and elapsed time changed in the window, not that dollar cost fell; a whole-session dollar total can include other charts and is not this chart's cost, and subagent usage is not counted. A turn is one seat's work between two of your messages or a `task_started`→`task_complete` pair, and your waiting time is the sum of the minutes from each of your messages until that seat's reply ended.

## Independent views when you name a peer seat

Charting can run in one slot or with peers. You may name any number of peer panes; the first is B, then C, D and so on in the order you name them. A and each named peer first map and research independently, every peer blind to A's work and to every other peer's work. The peers return blind notes on the questions, A merges their notes with attribution and writes the operator round alone. Each named peer gets one disagreement-only rebuttal before the round reaches you.

This gives you independent views before the interview settles the scope. Naming a charting peer does not automatically enable implementation debate.

Consultants restart with an empty context using `peer-restart.ts` under the [chart-issues Open rule](../../skills/chart-issues/SKILL.md#open). The door runs it before a chart's first consultant exchange and on re-entry after the consultants worked on another chart. One run before a shared opening map covers the map. A's own work or compaction alone never triggers it, and dropped consultants are never restarted. The caller must collect every prompted exchange first. An idle pane does not prove that collection is complete.

It restarts each consultant in its own pane, so pane ids and the layout stay as they are. A restarted seat keeps its letter in `seats.yaml`; append its new entry only when its `restarted` line reports a session (pi at start, codex not until its first exchange), never with a null session. A failed restart ends an attended turn and reports the printed states. Under autopilot, every seat not `restarted` is dropped like a herdr prompt refusal, with its printed state recorded under `consultant:`.

```text
                    same intake
                         |
             +-----------+-----------+
             v           v           v
        A researches  B researches  each further peer
        independently independently researches independently
             |           |           |
             +-----------+-----------+
                         v
             A merges with attribution
                         |
                         v
          each named peer rebuts disagreements
                         |
                         v
                 operator answers
```

For export-csv, the independent views can expose different risks before you choose the behavior. They share the request first, not each other's conclusions.

## Turn the answers into a buildable contract

Handoff waits until no material fork or fog leaves the implementer guessing. Each leaf gets a bounded outcome, concrete completion criteria and a design containing its binding decisions.

For CSV export, the contract can specify:

- Which rows and columns are included.
- How empty input and special characters behave.
- Which existing behavior must remain.
- Which files the leaf owns.
- Which checks demonstrate completion.

Cross-leaf promises need matching owners. Human-only prerequisites need an owner and completion before handoff. Required credentials are named, not pasted into the contract.

When peer panes are part of charting, each named peer also reads the draft contracts as an implementer before they reach the open tree; A corrects the drafts and moves the reviewed files in, rather than writing them a second time.

Before handoff the door also checks the source repo and each selected destination by running `akrogon pull` in each checked repo's registered root. It does this when a destination is selected and again right before the handoff review. A report already in a destination repo that describes the handed-off work becomes visible this way, so it can enter the leaf's `sources` and close when the delivering issue completes. If a destination refresh fails, only that destination's handoff waits. When the work names model-sensitive work, such as a leaf calling for a different model or harness, the door can also ask about setting different execution seats for the issue or epic. The review also shows a live-run line for each leaf whose proof needs live sessions, an informational estimate of the expected elapsed time and the timeout worst case, so the run cost is visible before dispatch.

You get work that can be dispatched without reopening product decisions in the middle of a coding pass.

```text
+----------------------+
| CHART                |
| Destination clear    |
| Forks taken          |
| No material fog      |
| Prerequisites met    |
+----------------------+
            |
            v
     HANDOFF: reviewed contracts
            |
            v
+----------------------+
| LEAF                 |
| brief.md             |
| design.md            |
| state.yaml           |
+----------------------+
            |
            v
      manual dispatch
```

For export-csv, handoff is the moment the map becomes a contract: chosen rows, owned files and checks become the leaf's instructions. Handoff writes that contract; you still decide when to dispatch.

## Direct route

For a small, fully charted, code-only single item with a B pane named, the door can offer to skip the leaf. No repo setting is needed. You choose at the handoff review.

If you choose it, A implements in a branch worktree and B reviews. The door then lands the tested commit on the default branch, closes the delivered sources, broadcasts when configured, removes the branch and worktree, and closes the chart. The chart-issues skill ([chart-issues](../../skills/chart-issues/SKILL.md#direct-route)) owns the eligibility and landing rules.

If the work grows or repairs run out, the door stops and saves the work in a `Direct attempt` record. You then hand it to the lifecycle or abandon it.

## Autopilot

For incoming, non-original work you can hand a chart door a fixed list and let it answer its own rounds. In the door's own pane, say so in plain words — name autopilot, the work you are handing it, and the consultants or none:

```text
/chart-issues run autopilot on these two bug reports, consultants B
```

The door echoes the mode, the handed work and the consultants, and after reading the work it shows a best-guess list of things to supply, such as logins, API keys or files, each with purpose and destination. It still runs every step, but where it would ask you it answers itself by your standing values — simplicity, function over form, removing over adding, systems thinking, speed and price — and records each pick as its own, never as your words. Every handed chart takes the lifecycle route to builders and your watcher; the direct route is not offered.

Some things still wait for you, while the door moves on within the handed list: every approval (live-account grants, fixture retention, secret saves), a mutating proof call, a missing need such as a key, and anything only a person can do. The mode ends on its own when every handed chart is handed off or closed, and resumes when you next write in that door. Only your words in the door pane turn it off early; handing over a key or changing the handed list keeps it on.

The record lives in each chart's `## Autopilot` section in CHART.md: boundary breaches first, then the switch-on reference, consultants and losses, the route, handed-off leaves, waits and picks against the recommendation. The door also prints one line per chart at the end of each pass. The [chart-issues](../../skills/chart-issues/SKILL.md#autopilot) skill holds the full mode rules.

After the first handed chart, the door can hand itself to a fresh conversation in the same pane, a self-handover, so its context stays small over a long run. This works for claude, codex and pi; any other agent keeps today's behavior and stays in the same conversation.

The cost: a wrong pick can merge to main — and for akrogon, deploy — before you read the record, so check it before trusting a run overnight. Do not hand the same work to two doors; the door holds work another door's open chart already covers, but two doors started on the same work at the same moment are a stated limit. The first run happens once with you around, answering nothing and able to say stop; overnight use after that is your call.

Previous: [Create](create.md) · Next: [Next](next.md) · [Home](../../README.md)
