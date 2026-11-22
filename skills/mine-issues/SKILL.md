---
name: mine-issues
description: Mine the work done since the last extraction (or any window the operator names) for post materials (hard data, how each thing was solved and why), written for a separate writing agent with the client's identity removed. Operator-invoked only; it never writes posts.
---

Re-read this file only after compaction. A file already read in this thread and not edited since is not read again.

# Mine issues

Operator-invoked, on every harness, with no `akrogon install`, registration or leaf needed. It reads what was actually done in a window of time and writes two files: materials for a writing agent, and a source list that stays with the operator. It writes no post, headline, hook line or call to action, edits no repository, runs no project command other than the read-only akrogon commands named under Sources, makes no paid call and loads no web page. A lifecycle seat never runs it.

The value is the hard data and how each thing was solved, so the materials give everything important and lean toward too much: the writer cuts and edits. Only the client's identity is removed. The work can be of any kind: website builds, automations, operations, marketing, data and reporting, agent workflows, or the tooling that runs them. No kind of work is favoured; the window's own records decide what the stories are about. Each story still leads with what a business loses or gains, shows what broke and how it was locked down, and ends in one rule a reader can apply without this system.

## Window

- `/mine-issues`: from the end of the last full extraction for this repository to now. The end is read from the newest materials file name that has no `part` mark. With no earlier file the window starts at local midnight.
- `/mine-issues <anything the operator writes>`: the operator's words set the window or the scope and override the default. A time range, a date, "this session", "yesterday afternoon", one chart or one leaf are all valid. A run limited to a topic, chart or leaf is a part run.

Print the window and scope as understood, in local time with the UTC offset, before reading anything. When the operator's words can be read two ways, take the wider reading and say so.

## Sources

Facts come only from records on disk read during this pass. What the agent remembers from its own conversation is not a source: the invoking conversation is read from its transcript file like any other, and a fact found only in memory is left out. Issues keep moving while the pass runs, so every leaf and chart is found through akrogon's own records, never from a path remembered or written in a summary.

Read in this order. Written records come first because they are already checked and cited; transcripts come last because they are large and hold what nobody wrote down.

1. `git log` of the consumer repository over the window, all branches: what landed, with its SHA.
2. When the repository has an `issues/` folder, akrogon's records name the work of the window: `akrogon status --json` and `akrogon status --charts` for the board, recent merges and charts, `akrogon timing --flow --since <window start date>` for issue flow, then the rows of `issues/log.jsonl`, `issues/merge-attempts.jsonl`, `issues/verify-runs.jsonl` and `issues/timings.jsonl` whose timestamps fall in the window. Each `log.jsonl` row gives a leaf's slug, its phase move, verdict, head and the seat's `session` transcript path.
3. Each chart under `issues/chart/` that a record names or whose files changed in the window: its intake, forks (decisions, operator rounds, held disagreements), slot files (maps, rebuttals, final checks: rejected options and their evidence live here), approvals, usage record and `seats.yaml` (each seat's `session` transcript path).
4. Each leaf the records name, found by its slug wherever it lives now (`issues/open/`, `issues/parked/` or `issues/closed/`; `akrogon status <slug>` shows its state and history): `brief.md` criteria, `readiness.yaml` grants with their bounds and hands-on proofs, the implementation report (attempts, what failed, session reservations and their reasons, costs) and the review verdicts. A check log the report cites is read with `akrogon log <path>`, which also reads logs packed into a closed issue's archive.
5. Run and cost records that 3 and 4 cite by path, such as a recorded run's cost file. Only cited ones; never search the repository for more.
6. Transcripts of the window, read from their files: the `session` paths named in steps 2 and 3, the invoking conversation, and the operator's own sessions in the harness folders for this repository (`~/.claude/projects/<cwd with slashes as dashes>/`, `~/.codex/sessions/<YYYY>/<MM>/<DD>/`, `~/.pi/agent/sessions/`), chosen by modification time inside the window.

A transcript is never loaded whole. Search it for messages the operator typed inside the window, read those with their line numbers, and follow one to the nearby agent text only when a candidate story needs it. Tool results, system notes and messages relayed from another agent are not operator messages. A repository with no `issues/` folder is mined from 1 and 6 alone.

`.env` and `.env.*` files are never opened. A source that cannot be read is named in the source list with its reason and the pass continues.

## Stories

A story needs a turn: something that went differently from what a competent person would expect, or a problem that was solved in a way a reader could learn from. Keep every item that has at least one of these and can be told with numbers or verbatim phrases from the window.

- A surprise: the measured result contradicts the obvious choice.
- A failure caught: something wrong that looked finished, most of all when every automated check passed.
- A number that changed a decision: a cost, a count, a rate, a cap.
- An obvious approach rejected in writing, with the reason and who rejected it.
- A correction from the operator: the person said no, and the work changed.
- A method: how a hard thing was done cheaply or reliably, with what it cost.
- A default refused: the tool, model or usual practice had an out-of-the-box answer, and the work chose differently for a stated reason.
- A fact about the outside world: how a platform, vendor, data source or market actually behaves, found by measuring, most of all when it contradicts its documentation or what the industry assumes.
- The idea behind the approach: the model of the problem the work is built on, stated plainly, such as deriving the ideal from what the successful examples share.

Three tests then apply. Insight: the item changes how a reader should think about this kind of work, beyond the one fix. Only here: at least one detail could come from no other team's work. Checkable: its facts have sources. An item failing any of them is dropped, along with routine progress, anything true of AI work in general, and any story an earlier materials file already delivered unless the window adds a new number or a new turn. Read the earlier files' story labels for that check.

Background counts. When the window's work runs on a decision, measurement or finding made before the window, follow the citation from the window's records to where it was made and mine it as a story marked `background`, unless an earlier materials file already delivered it. A method used all day is often the most valuable story and was decided on another day.

There is no cap on stories. Order them by business stake, and when unsure whether an item is material, keep it. A window with no turn returns no stories and says so; never pad. Dropped items are listed in one line each with the reason, so the operator can overrule.

## Story record

Each story is a block of plain fragments, not prose. Give every number, phrase and step the story rests on, whole lists included, never a sample. Every fact that is a number, a count, a price, a duration, a verbatim string or a quote carries an id (`S2.4`) that the source list resolves.

```markdown
## S<n> <working label, plain, not a headline>
- Stake: <who loses or gains what (money, time, customers, risk, workload), in business words>
- Setting: <the work, with the client's identity removed; industry, place and size stay>
- Hook fact: <the single most surprising checkable fact> [S<n>.1]
- Default: <what the tool, model, agency or usual practice does out of the box, what it costs, and the fact that shows it fails here> [ids]
- Before: <what happened, with every number and real phrase> [ids]
- Caught by: <a person reading, a named kind of check, a reviewer; and what had passed>
- How: <what was done, step by step, in order: each step, what does it, what checks it> [ids]
- Why: <why this way instead of the default, in the words of the decision>
- Insight: <the mental model this changes: what a competent person assumes, what the facts showed instead, and the principle that still holds outside this industry and this system> [ids]
- Lock: <what now makes the mistake impossible or visible>
- After: <the result, with every number; before and after pairs given whole> [ids]
- Cost: <money, calls, runs and time, with caps and what was used> [ids]
- Rejected: <option>: <reason>; <who proposed, who rejected>   (one line per option)
- Rule: <one check a reader can run tomorrow with no tool of ours>
- Next snag: <the problem that showed up right behind this one, and its story id>
- Plain words: <mechanism term> = <the same thing as a business owner would say it>
- Verbatim: <exact inputs, outputs, error text and odd strings worth quoting> [ids]
- Operator said: "<verbatim>" [id]
- Closed engine: <the part of How the operator would sell, not give away; the writer decides how much to show>
- Status: <true now | decided, not built | in progress | unverified>, per claim where they differ
```

A field with nothing true to put in it is written `none`, never filled. `Stake`, `Default`, `How`, `Why`, `Insight` and `Rule` are required: a story without them is not a story. `Insight` is the part a reader keeps after forgetting the numbers. Each part of it rests on a fact id, and a principle the facts do not show is not written. Vendors, tools and model makers are named, with their real prices.

The file opens with a header: the window and scope, one plain line on what was at stake across it, the story ids in snag-after-snag order, the insights that run across several stories with their story ids, the nuggets (one line each: the fact or idea a reader would repeat to a colleague, with its story id), the dropped items, and an `Operator checks` list of every fact whose status is not `true now`.

## Truth

- Every id has one row in the source list: the fact, what it counts and its unit, the path and line or the transcript path and timestamp, and its status. Two counts of different things never share a label.
- A number the pass computed (a ratio, a sum, a difference) shows its inputs in its row.
- Status is `measured` when a run or record shows it, `decided` when a written decision exists and the work is not built, `planned`, or `unverified` when it appears only in a summary or a message and no primary record was found.
- When two sources disagree, both values are given with both rows. The pass does not pick one.
- Operator words are quoted only when the operator typed them, copied character for character from the operator's own transcript. A quote an agent relayed is found there first or left out. No paraphrase sits inside quotation marks.
- A stake states only what the facts support. An expected benefit is not a measured saving, and no revenue, savings, speed or other result figure appears that no source measured.
- Last step before writing: reopen the cited line of every row. A fact its line does not show is corrected, marked `unverified` or removed.

## Client identity

Before writing, build the keep-out list from the window's sources: the client's name, its company and brand names, its domains and URLs, its staff names, its street addresses and phone numbers, and folder names that hold its name. Nothing else is on the list. Places, the industry, vendors, verbatim strings, numbers and mechanisms stay.

In the materials each keep-out entry is replaced by one consistent generic label ("the client", "the client's staff member"). A verbatim string stays as it is unless it holds a keep-out entry, and then only that part becomes `<brand>`.

Paths, file names and slugs go in the source list, not the materials: they hold the client's name often and teach a reader nothing. What a script or step does is described in full.

After writing, search the materials file for every keep-out entry, ignoring case. A hit is rewritten and the search repeated until none is left. Secrets, keys and account ids never appear in either file.

## Files

Files go under `<state home>/materials/<repository name>/`, where the state home is `AKROGON_HOME` when set and `~/.akrogon` otherwise. Nothing is written inside a repository.

The name is the window in local time, then up to three topic words taken from the strongest story labels:

```text
<YYYY-MM-DD>_<HHMM>_to_<YYYY-MM-DD>_<HHMM>_<topic>_<topic>_<topic>.md
2026-03-02_0900_to_2026-03-03_1830_invoice-matching_approval-limits_vendor-pricing.md
```

A part run puts `part` before its topics (`..._to_2026-03-03_1830_part_invoice-matching.md`), and the default window ignores it. A run with no stories uses the topic `none`.

- `materials/<repository name>/<name>.md`: the materials. Only this folder's files are handed to the writer.
- `materials/<repository name>/sources/<name>.md`: the window, the sources read and skipped, one row per id, and the keep-out list. It stays with the operator.

The reply to the operator is the footer and nothing else; the stories are not repeated in chat.

## Printed footer

```text
Window: <start> to <end> (<full | part: scope>)
Stories: <n> (<ids and working labels>), dropped <n>
Operator checks: <n facts not true now or unverified>
Client identity: <n> keep-out entries searched, 0 left
Materials: <full path>
Sources: <full path>
Last operation: <materials written, or the concrete failure>
Next: none
```
