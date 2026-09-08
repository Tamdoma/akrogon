---
name: chart-issues
description: Chart the route for work whose destination is nameable but whose path is not, as a chart of open decisions under `issues/chart/`, settling one per session until nothing is left to decide, then handing the settled decisions to direct materialization in an attended akrogon checkout or to a proposal seed elsewhere. Use when the work spans more sessions than one agent can hold, or when starting an application from raw notes; single-session ambiguity belongs to `create-issue`'s frontier rounds instead. Operator-invoked only, never a gate.
disable-model-invocation: true
---

Chart skill version: 3

# Chart Issues

Chart the route before opening issues. This skill plans and may hand off the
issue contract, but it never builds production code. The chart store has no
`state.yaml`, lifecycle phase, run status, or lifecycle verb. Only an attended
handoff in the akrogon checkout may write the normal issue files under
`issues/open/`; every other run ends as a proposal seed.

The failure it prevents: issues opened before the route is known, then reworked. A decision settled once here is never re-litigated inside an issue debate, and it reaches every downstream pass as an operator-locked answer.

## Portability and versioning

The canonical home is this repository. Install or update its complete,
self-contained folder with the smallest supported command:

```text
bash skills/chart-issues/scripts/install.sh
```

The installer copies the folder to `$HOME/.claude/skills/chart-issues`,
`$HOME/.codex/skills/chart-issues`, and `$HOME/.pi/agent/skills/chart-issues`.
It uses no package manager, service, mode flag, or release registry. The
single stamp immediately after this skill's front matter is copied unchanged
to every chart, decision, proposal seed, leaf, series index, and archived
chart output. Put it immediately after a Markdown title. In `state.yaml`, put
the stamp in a YAML comment so the lifecycle schema does not gain a chart
version key.

When a copied skill starts chart work, compare its stamp with the canonical
stamp in `<configured-akrogon-checkout>/skills/chart-issues/SKILL.md`, but only
when that canonical evidence is available.
If the installed value is older, warn that the copy is older and continue
only with that warning visible. If the values match, report them as current.
If canonical evidence or either stamp cannot be read, report that canonical
comparison is unavailable. Do not claim freshness or staleness and do not
block proposal-seed work for that reason.

## Routing

| Signal                                                                            | Skill                                         |
| --------------------------------------------------------------------------------- | --------------------------------------------- |
| Destination nameable, route not; work spans more sessions than one agent can hold | this skill                                    |
| Raw app notes, no route, no stack, no scope                                       | this skill, `## App-Scale Lane`               |
| One issue's brief is fuzzy                                                        | `create-issue`, creation door                 |
| One concrete observation to file                                                  | `seed-issue`, then `create-issue` import door |
| Route already clear                                                               | `seed-issue`, then `create-issue` import door |

Operator-invoked only. No lifecycle pass, driver step, or sibling skill enters this skill, and nothing here blocks an issue.

## Artifacts

Two tracked file shapes under `issues/chart/`, created on first use. Nothing
else belongs to the chart store: no tracker, no `state.yaml`, no run status, no
protocol version, no `issues/run/` store. Handoff output follows the shared
[`# Materialization Contract`](assets/materialization-contract.md) and is a
separate issue artifact.

`issues/chart/CHART.md` is an index, not a store. Every decision lives in its own file; the chart holds one line per settled decision and the shape of what is still unknown.

```markdown
# Chart: <destination name>

<copy the canonical chart skill stamp here>

## Destination

## Notes

## Decisions So Far

## Not Yet Specified

## Out Of Scope
```

| Section                | Content                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `## Destination`       | where this is going and how you know you arrived, in one or two lines. For an app, `## App-Scale Lane`'s Goals → Signals → Deliverables              |
| `## Notes`             | the domain, the skills every session on this chart must consult, and standing preferences for this effort. `## Work Lane` step 3 loads what it names |
| `## Decisions So Far`  | one line per settled decision: the answer, then a link. Never the rationale — that is the decision file's                                            |
| `## Not Yet Specified` | in-scope work known to be undecided but not yet sharp enough for its own file. Prose, not files                                                      |
| `## Out Of Scope`      | what this route deliberately does not reach, and why. One line each, linking any decision ruled out mid-flight                                       |

`issues/chart/decisions/<slug>.md` is one open decision. Slug: names the decision, max three hyphen-separated words.

```markdown
# <Decision Name>

<copy the canonical chart skill stamp here>

Status: open
Type: grilling

## Question

## Findings

## Resolution
```

| Field    | Values                                                                       |
| -------- | ---------------------------------------------------------------------------- |
| `Status` | `open`, `blocked-by: <Decision Name>`, `claimed`, `resolved`, `out-of-scope` |
| `Type`   | `grilling`, `research`, `prototype`, `debate`, `setup`                       |

| Section         | Rule                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `## Question`   | the decision, sharp enough for one agent session (~100K tokens) to settle end to end, at most 50 lines |
| `## Findings`   | appended by research, prototype, debate, and setup work; absent on a decision that gathered none       |
| `## Resolution` | written once, at `resolved`: the answer, one paragraph of why, and what it forecloses                  |

Refer to a decision by its `# <Decision Name>` heading everywhere — in `CHART.md`, in `blocked-by`, in prose, and in the handoff. Never by bare slug, number, or path alone.

Artifacts made while settling a decision — a research dump, for example — are
linked from the decision file, never pasted into it. A prototype is the
exception to the old artifact wording: its sandbox, code, and scratch output
are discarded in every outcome. Only its measured finding is written to the
decision file. A prototype never becomes a production artifact or an issue
starting point.

The 50-line question and debate-recommendation caps are the chart's authoring
budget. The byte and line budget definitions needed by question authors are
inline in [`assets/question-authoring.md`](assets/question-authoring.md).
Chart files are not lifecycle artifacts, so `budget-check` never measures them.

## Decision Types

| Type        | Mode   | Behavior                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grilling`  | HITL   | operator conversation. Research comes before the questions: gather the practitioner evidence and the agent's own knowledge first, then write the batch so each Question already carries what practitioners do and what a beginner would miss. Use [`assets/question-authoring.md`](assets/question-authoring.md) for the one Question and Option protocol. Deliver one batch, end the turn, resume from the operator's inline reply, and close the round with its visible challenge check |
| `research`  | AFK    | read docs, APIs, and the codebase; append what was found to `## Findings` with its source. No operator turn, and no decision taken: the findings back the questions and recommendations of the grilling decisions that named it, and the operator settles those. Several research decisions may run in parallel                                                                                                |
| `prototype` | HITL   | propose a normal prototype Question with a minutes estimate (10 minutes by default) and one-letter `Veto`. If chosen, run the smallest sandboxed, time-boxed measurement, keep only the measured finding, and discard all code. Never merged, never a later issue's starting point                                                                                                                          |
| `debate`    | HITL   | both slots write one independent recommendation of at most 50 lines into `## Findings`, headed `Slot A` and `Slot B`, neither reading the other first; the operator picks                                                                                                                                                                                                                                   |
| `setup`     | either | manual work that must happen before a decision can be made: provision access, sign up so an API can be judged, move data so its shape is visible. The one type that acts rather than decides, and it earns that only by unblocking a decision. Agent-driven where it can be; otherwise hand the operator a precise checklist. `## Resolution` records what was done plus any fact later decisions depend on |

`grilling` is the default; choose another type only when the decision needs evidence or access the operator does not already hold. Every operator-facing question follows the local authoring asset, including its beginner teaching, consequence-bearing options, continuous batch numbering, explicit reply key, and visible `Challenge check` close.

Research returns must name their source tier and credibility:

1. `practitioner`: a named practitioner with a stated track record, using a
   case study, talk, long-form or first-hand source. Listicles, affiliate
   content, and AI summaries do not qualify.
2. `better-than-training`: the best available documentation, specification,
   measured result, or other source that is stronger or newer than the model's
   training.
3. `model-knowledge`: the interviewer model's own knowledge when no stronger
   source is available.

Use the highest available tier. A return that used a lower tier while a higher
tier was reasonably available is rejected and the research decision is redone.
Lower-tier returns are redone when a higher tier was reasonably available.
Every return records the tier, source or reason the tier was unavailable, the
finding, and what decision it changes. A model-knowledge return must say that
no better source was available.

Practitioners first. A research return names the people who have done this
work at scale, says in one line why each is worth listening to, then compares
them: where they agree, where they disagree, and which conditions flip their
advice. The finding is a synthesis of that evidence with the agent's own
reasoning, one paragraph, not a source list. Material the operator has placed
in `issues/chart/sources/` (course notes, transcripts, PDFs, books) is the
strongest source available and is read before any web search.

Research never settles anything. It decides which questions get asked, which
pitfalls the questions name, and which option is recommended. The operator
settles every decision.

Prototype settle-mode follows the normal question in
[`assets/question-authoring.md`](assets/question-authoring.md). The operator's
one-letter veto or timeout is a valid negative result, not permission to run a
different experiment. Code and scratch artifacts are discarded in all cases.

A HITL decision resolves only through live operator exchange. The agent never supplies the operator's side of it: a grilling pass that answers its own questions, or a debate whose winner the agent picks, has broken the type, and the decision is not settled no matter what got written.

A `debate` is dispatched by hand in v1 — the operator opens the configured cross-vendor pair (`issues/config.yaml` → `orchestrator.slots`), gives each slot that one decision, and collects both recommendations. The pair driver does not dispatch chart work; driver integration waits until usage proves it out.

## Opening

The first chart action is a territory-mapping pass. Before asking any
destination or decision question, present a proportional first-principles map
to the operator with three visible parts: the main forks, the questions an
experienced practitioner would ask, and the mistakes a beginner could make
without noticing. Include what the repository and notes show, then add the
domain questions they cannot show. The operator sees this map before any
grilling. It is the root from which the decision tree grows, so newly surfaced
decisions enter the chart rather than remaining assumptions.

Use the map shape and the complete-beginner Question and Option rules in
[`assets/question-authoring.md`](assets/question-authoring.md). Do not replace
the map with an inventory of files or with a list of decisions already noticed.

## Chart Lane

One session. Produces the chart and the first decisions, then stops.

1. Run `## Opening` and show the territory map. This happens before all
   grilling, including destination grilling.
2. Name the destination with a `grilling` conversation using the map. Bound it
   to one effort statable in a sentence: a chart past roughly twenty decisions
   is a destination set too far out, and its late decisions will be invalidated
   by its early answers. For an app, read `## App-Scale Lane` first — its
   intake and Destination shape govern.
3. Map what is unknown, breadth-first: fan out across the whole space rather
   than deep on one thread. **If this surfaces nothing unspecified, write no
   chart.** The route is already visible and the work fits one session; say so
   and stop. A chart for work that never needed one costs a session per decision
   and prevents nothing.
4. Write `CHART.md`, `## Decisions So Far` empty.
5. Create decision files only for questions specifiable now, then wire
   `blocked-by` in a second pass so every name it references exists.
6. Fire the `research` decisions — they are AFK and may run while the session
   ends. Every later operator round closes with the challenge check, including
   a zero-question round.
7. Stop. The chart lane settles nothing.

## Work Lane

Repeatable. One decision per session, `research` excepted.

1. Read `CHART.md` and nothing else. It is low resolution on purpose. Open a decision file only when you are about to work it, or when the one you are working names it. Reading every decision file to gather context is the one habit that makes a chart cost more than the rework it prevents.
2. Pick one ready decision — `Status: open`, unblocked, unclaimed. Prefer the one that unblocks the most others.
3. Claim it by writing `Status: claimed` before any work; the operator may run two unblocked decisions in parallel sessions, and the claim is the only guard. Then load the skills `## Notes` names and settle it by its type. Use the local Question Authoring rules for every operator round and visibly run its expert-challenge check before preparing the next frontier.
4. Write `## Resolution`, set `Status: resolved`, and append one line to `## Decisions So Far`: the answer and a link. A prototype resolution contains only its measured finding, never its code or scratch artifact.
5. Unblock: any decision whose `blocked-by` named this one returns to `Status: open`.
6. Graduate: the answer usually makes part of `## Not Yet Specified` specifiable. Move that part into fresh decision files and delete it from that section. If the answer instead invalidates a decision, update or delete it; if it puts one past the destination, rule it out per `## Scope And Specifiability`.
7. Stop.

Settling several decisions in one session defeats the point: each answer reshapes what is still unknown, and a second decision taken before that reshape is taken against a stale chart. Several `research` decisions in one session are fine — they gather, they do not decide.

## Scope And Specifiability

The four chart sections are disjoint. Anything settled is in `## Decisions So Far`; anything sharp is its own file; anything in scope but not yet sharp is in `## Not Yet Specified`; anything past the destination is in `## Out Of Scope`.

**File or not-yet-specified?** The test is whether you can state the question precisely now, not whether you can answer it. A sharp question gets its own file even when it is blocked and unworkable. Do not pre-slice: one unspecified area may graduate into several decisions, or into none.

**Ruling something out of scope** is a scoping act, not a step on the route. A decision file that turns out to sit past the destination is not resolved — set `Status: out-of-scope`, add one line to `## Out Of Scope` naming it and why, and write nothing in `## Decisions So Far`, which records only the route actually walked. Out-of-scope work never graduates: it returns only if the destination is redrawn, and then as a fresh chart.

## Termination

The chart is done when the way is clear: no decision at `open`, `blocked-by`, or `claimed`, and nothing material left in `## Not Yet Specified`. Material means a reasonable implementer would have to guess.

Do not terminate on file exhaustion alone. A chart with zero open decisions and three paragraphs of unspecified work is mid-flight, not finished.

## Handoff

### Mode check

Only one mode may materialize. An operator-attended session is the only
materializing mode. Before writing any handoff output, establish both facts
from the live session, never from a mode flag:

- **Ground:** the current Git checkout is the configured `akrogon` repository
  ground. Resolve `git rev-parse --show-toplevel`, read that checkout's
  `issues/config.yaml`, require an `akrogon` key under `repos:`, and verify the
  current worktree's Git common directory and remote identity belong to the
  configured repository rather than merely containing a copied skill folder.
- **Attendance:** the operator is present to answer the handoff batch and the
  single confirmation in this session. A dispatched machine seat, an
  unattended process, or a session that cannot receive that operator reply is
  not attended. A TTY or environment variable is not proof of attendance.

When either fact is false, stop at a proposal seed using
[`assets/seed-shapes.md`](assets/seed-shapes.md). Do not create a leaf folder,
`state.yaml`, series index, lifecycle state, or production artifact. The seed
contains proposals, not locks, and the later importing operator must rule
each decision and all four machinery locks. A machine seat in an akrogon
checkout therefore still emits a proposal seed.

### Pre-handoff audit

For the materializing mode, run this audit once over the proposed leaf
contracts — each leaf's `brief.md`, `design.md`, and `state.yaml` text and the
series order — before any output is written. Chunk files do not exist yet and
are never an audit input: planning supplies them after handoff.

1. Attribution check: every cross-artifact claim "leaf N built/owns X" is confirmed in leaf N's own brief/design text. A claim with no home is a defect to fix first.
2. Dry-run check: one subagent per leaf simulates a fresh implementer receiving only that leaf plus the tree state prior leaves left, and verifies from the proposed brief, design, and state alone — the leaf's done-criteria are executable inside its stated ownership boundary; every done-criterion is checkable at that point in the series (tools, files, grep targets exist); no done-criterion depends on a later leaf; nothing in the leaf is ambiguous enough that two reasonable implementers build incompatible things.
3. Decision coverage: every binding clause in each inlined Resolution is traceable to a leaf brief or design clause, or to an explicit not-this-leaf/deferral line.

The handoff is not done until all three return clean. Budget: ~200K tokens, run once. Retain the audit with the archived chart.

### Locks batch

In materializing mode, collect the four machinery locks in one
defaults-and-exceptions table. Do not split them into separate interviews:

| Lock      | Default                                                                | Exception                                                                          | Operator answer             |
| --------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------- |
| repo      | `akrogon`, recommended from the checkout and the current `repos:` keys | another key from `issues/config.yaml`                                              | one valid configured key    |
| priority  | `n` normal                                                             | `h` when the work must go ahead of normal work, or `l` when it follows normal work | `h`, `n`, or `l`            |
| ownership | `agent-owned` when no step physically needs the operator               | named operator-owned steps with the reason they require a person                   | default or named exceptions |
| consult   | `no`                                                                   | `yes` when independent positions and synthesis add value to this settled design    | `yes` or `no`               |

The table states the defaults and marks every departure as an exception. The
repo answer must be one of the current `repos:` keys. Credential access alone
never changes ownership. Chart decisions remain operator-locked answers in the
leaf designs; the four machinery answers are also copied into the emitted
leaf contract without adding chart state.

### Confirmation

After the audit and locks table are complete, ask exactly one series-level
confirmation. Use the local Question and Option format:

```text
Question N
The chart is settled. This confirmation authorizes the validated leaf
contracts and, when there is more than one leaf, their ordered series index to
be written under issues/open/. It does not authorize production code.
Option A (recommended): Confirm the locks table, pre-handoff audit, leaf
contracts, and dependency barriers exactly as shown, because all chart
decisions are already settled and no per-leaf interview can add information.
Option B: Revise the named lock, decision, leaf, or dependency barrier and
return to the affected chart round before any output is written.
Reply with N-A to materialize, or give a numbered free-text revision.
```

There is no per-leaf confirmation. An absent, partial, or revision answer
writes no materialized output.

### Emission

Before the confirmation and before the first write, run the shared contract's
destination preflight: every planned leaf directory, the series index path, the
proposal seed path this run would newly write, and the archive destination
must be unoccupied. Any occupied destination stops the handoff and returns the
collision to the operator; never merge into or overwrite an existing leaf,
index, newly written seed, or archive. The preflight covers only the paths this
run creates, never the tracked intake seed a `create-issue` import archives in
place.

After the one confirmation, emit the direct shapes in the shared
[`# Materialization Contract`](assets/materialization-contract.md): one
`brief.md`, `design.md`, and `state.yaml` per leaf under `issues/open/`, plus
`SERIES-<name>.md` when the handoff has multiple leaves. Copy every resolved
decision that binds a leaf into that leaf's `design.md`, preserving its
heading, answer, reason, and foreclosed alternatives. Validate each artifact
before writing or advancing to the next one. The index carries only global
order and genuine earlier `serial` or `barrier` dependencies. It carries no
status, phase, priority, ownership, consult, or other lifecycle field.

Do not create chunk files: planning supplies them later. If any validation
fails, stop without advancing and repair the output before continuing. After
all artifacts pass, retain the pre-handoff audit, prepend
`Archived: handed off on <YYYY-MM-DD>` to `CHART.md`, and move it with its
decision files to `issues/chart/archive/<destination-slug>/`; never delete the
chart.

In proposal mode, emit the corresponding `seed-shapes.md` report only after
the settled decisions and surface coverage have been written into its five
core sections and optional enrichment. The report is portable intake, not a
materialized issue, and it is never imported automatically.

The archived chart is the durable record of why this route was chosen, and the
next chart starts from an empty `issues/chart/`.

## App-Scale Lane

Starting an application from raw notes. Replaces the retired `tamdoma-app-seed` skill.

`issues/chart/INTAKE.md` is user-owned raw notes: goals, preferences, references, rough thinking. Never rewrite it, never reformat it, never fold settled decisions back into it. It is the input to destination grilling and nothing else.

`## Destination` for an app anchors on:

| Anchor       | Content                                          |
| ------------ | ------------------------------------------------ |
| Goals        | what the application is for, in outcomes         |
| Signals      | how you will know a goal was met                 |
| Deliverables | what must exist for the signals to be observable |

Product and architecture choices — domain model, stack, security posture, automation shape, operational surface — are decisions settled once with rationale in their `## Resolution`. They are never pre-authored documents: a speculative document nobody has decided against drifts, and a second document set becomes a second truth to sync.

Product truth has one channel. Living docs accrete in `docs/` as features merge, are registered in `issues/config.yaml` → `grounding.docs`, and are maintained by the existing post-merge documentation review and the index-drift gate. There is no `Spec/` folder and no parallel product-truth silo.

## Migration From A Spec/ Folder

For a repository that still carries `tamdoma-app-seed`'s output:

1. Fold `Spec/INTAKE.md` into `issues/chart/INTAKE.md` unchanged — it is user-owned in both places.
2. Translate `Spec/DELIVERY_PLAN.md` remnants into series breakdowns under `## Handoff`. Slices become waves; stated slice ordering becomes explicit `dependency_barrier` values.
3. Move mature product documents into `docs/` and register them in `grounding.docs`. A document that was never decided against is not mature: it becomes a decision instead.
4. Delete `Spec/`. Anything left in it that fits none of the three routes above was speculation.

## Boundaries

- Chart decisions are not lifecycle issues. The chart store has no `state.yaml`, phase folder, run status, worktree, branch, or lifecycle CLI verb. A `state.yaml` emitted inside a leaf belongs to the ordinary issue contract, not to a chart decision.
- Substantial work discovered here graduates through the shared materialization
  contract in an attended akrogon checkout, or through the proposal seed shape
  everywhere else. If a decision is turning into implementation, it is an
  issue: stop, write the appropriate handoff output, and settle the decision by
  naming it.
- The pull to just build it is usually the signal the chart is finished, not that this rule is wrong.
- A prototype sandbox is scratch. Its code is discarded, never merged, and
  never becomes an issue's starting point.
- The chart never edits an issue, plan, or seed it already handed off. A decision that changes after handoff is a new issue, not a chart edit.
