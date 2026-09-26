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

The round gives options, a recommendation with its reason and the pitfalls of the choice. You can pick an option or answer in your own words.

Forks are taken one per round. After you answer, the next fork is researched and asked.

Fog is work whose question is not clear yet. “Exports behave strangely on large accounts” may need reproduction before anyone can propose a useful choice.

Ruled-out work goes under Off route with its reason. It is not silently treated as agreed scope. When a mirrored report is already delivered or a duplicate, the door closes it with `akrogon close <owner/repo#n> --by <text>`.

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
  forks/row-selection.md
```

Intake keeps the original report separate from agent findings. Fork files keep evidence and your recorded answers. The chart points to what remains open. CHART.md lists open forks in the order they will be taken.

## Independent views when you name a peer seat

Charting can run in one slot. If you name a B pane, A and B first map and research independently. C is named only with B and holds the same role, blind to both A's and B's work. A then merges their findings with attribution. Each named peer gets one disagreement-only rebuttal before the operator round.

This gives you independent views before the interview settles the scope. Naming a charting peer does not automatically enable implementation debate.

```text
                    same intake
                         |
             +-----------+-----------+
             v           v           v
        A researches  B researches  optional C researches
        independently independently independently
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

When peer panes are part of charting, each named peer also reads the draft contracts as an implementer before they are written to the open tree.

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

Previous: [Create](create.md) · Next: [Next](next.md) · [Home](../../README.md)
