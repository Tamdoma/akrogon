---
name: mine-issues
description: Mine the work done since the last extraction (or any window the operator names) for post materials (hard data, how each thing was solved and why), written for a separate writing agent with the client's identity removed. Operator-invoked only; it never writes posts.
---

Re-read this file only after compaction. A file already read in this thread and not edited since is not read again.

# Mine issues

Operator-invoked, on every harness, with no `akrogon install`, registration or leaf needed. It reads what was actually done in a window of time and writes two files: materials for a writing agent, and a source list that stays with the operator. It writes no post, headline, hook line or call to action, edits no repository, runs no project command, makes no paid call and loads no web page. A lifecycle seat never runs it.

The value is the hard data and how each thing was solved, so the materials give everything important and lean toward too much: the writer cuts and edits. Only the client's identity is removed. Each story still leads with what a business loses or gains, shows what broke and how it was locked down, and ends in one rule a reader can apply without this system.

## Window

- `/mine-issues`: from the end of the last full extraction for this repository to now. The end is read from the newest materials file name that has no `part` mark. With no earlier file the window starts at local midnight.
- `/mine-issues <anything the operator writes>`: the operator's words set the window or the scope and override the default. A time range, a date, "this session", "yesterday afternoon", one chart or one leaf are all valid. A run limited to a topic, chart or leaf is a part run.

Print the window and scope as understood, in local time with the UTC offset, before reading anything. When the operator's words can be read two ways, take the wider reading and say so.

## Sources

Read in this order. Written records come first because they are already checked and cited; transcripts come last because they are large and hold what nobody wrote down.

1. `git log` of the consumer repository over the window, all branches: what landed, with its SHA.
2. When the repository has an `issues/` folder: the leaf moves, merge outcomes and check runs of the window from its dated records, to list the leaves and charts that were active.
3. Each active chart: its intake, forks (decisions, operator rounds, held disagreements), slot files (maps, rebuttals, final checks: rejected options and their evidence live here), approvals and usage record.
4. Each active leaf: `brief.md` criteria, `readiness.yaml` grants with their bounds and hands-on proofs, the implementation report (attempts, what failed, count lines, costs) and the review verdicts.
5. Run and cost records that 3 and 4 cite by path, such as a recorded run's cost file. Only cited ones; never search the repository for more.
6. Transcripts of the window: the invoking conversation, each session path a chart's seat record names, and the harness session folders for this repository (`~/.claude/projects/<cwd with slashes as dashes>/`, `~/.codex/sessions/<YYYY>/<MM>/<DD>/`, `~/.pi/agent/sessions/`), chosen by modification time inside the window.

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

Two tests then apply. Only here: at least one detail could come from no other team's work. Checkable: its facts have sources. An item failing either is dropped, along with routine progress, anything true of AI work in general, and any story an earlier materials file already delivered unless the window adds a new number or a new turn. Read the earlier files' story labels for that check.

There is no cap on stories. Order them by business stake, and when unsure whether an item is material, keep it. A window with no turn returns no stories and says so; never pad. Dropped items are listed in one line each with the reason, so the operator can overrule.

## Story record

Each story is a block of plain fragments, not prose. Give every number, phrase and step the story rests on, whole lists included, never a sample. Every fact that is a number, a count, a price, a duration, a search phrase or a quote carries an id (`S2.4`) that the source list resolves.

```markdown
## S<n> <working label, plain, not a headline>
- Stake: <who loses or gains what, in business words>
- Setting: <the work, with the client's identity removed; trade, town and size stay>
- Hook fact: <the single most surprising checkable fact> [S<n>.1]
- Obvious route: <what most teams or tools would do, and its cost if known>
- Before: <what happened, with every number and real phrase> [ids]
- Caught by: <a person reading, a named kind of check, a reviewer; and what had passed>
- How: <what was done, step by step, in order: each step, what does it, what checks it> [ids]
- Why: <the reason for this way, in the words of the decision>
- Lock: <what now makes the mistake impossible or visible>
- After: <the result, with every number; before and after pairs given whole> [ids]
- Cost: <money, calls, runs and time, with caps and what was used> [ids]
- Rejected: <option>: <reason>; <who proposed, who rejected>   (one line per option)
- Rule: <one check a reader can run tomorrow with no tool of ours>
- Next snag: <the problem that showed up right behind this one, and its story id>
- Plain words: <mechanism term> = <the same thing as a business owner would say it>
- Phrases: <verbatim search phrases, tool outputs and odd strings worth quoting> [ids]
- Operator said: "<verbatim>" [id]
- Closed engine: <the part of How the operator would sell, not give away; the writer decides how much to show>
- Status: <true now | decided, not built | in progress | unverified>, per claim where they differ
```

A field with nothing true to put in it is written `none`, never filled. `Stake`, `How` and `Rule` are required: a story without them is not a story. Vendors, tools and model makers are named, with their real prices.

The file opens with a header: the window and scope, one plain line on what was at stake across it, the story ids in snag-after-snag order, the dropped items, and an `Operator checks` list of every fact whose status is not `true now`.

## Truth

- Every id has one row in the source list: the fact, what it counts and its unit, the path and line or the transcript path and timestamp, and its status. Two counts of different things never share a label.
- A number the pass computed (a ratio, a sum, a difference) shows its inputs in its row.
- Status is `measured` when a run or record shows it, `decided` when a written decision exists and the work is not built, `planned`, or `unverified` when it appears only in a summary or a message and no primary record was found.
- When two sources disagree, both values are given with both rows. The pass does not pick one.
- Operator words are quoted only when the operator typed them, copied character for character from the operator's own transcript. A quote an agent relayed is found there first or left out. No paraphrase sits inside quotation marks.
- A stake states only what the facts support. An expected benefit is not a measured saving, and no revenue, ranking or savings figure appears that no source measured.
- Last step before writing: reopen the cited line of every row. A fact its line does not show is corrected, marked `unverified` or removed.

## Client identity

Before writing, build the keep-out list from the window's sources: the client's name, its company and brand names, its domains and URLs, its staff names, its street addresses and phone numbers, and folder names that hold its name. Nothing else is on the list. Towns, the trade, vendors, search phrases, numbers and mechanisms stay.

In the materials each keep-out entry is replaced by one consistent generic label ("the client", "the office manager"). A search phrase stays verbatim unless it holds a keep-out entry, and then only that part becomes `<brand>`.

Paths, file names and slugs go in the source list, not the materials: they hold the client's name often and teach a reader nothing. What a script or step does is described in full.

After writing, search the materials file for every keep-out entry, ignoring case. A hit is rewritten and the search repeated until none is left. Secrets, keys and account ids never appear in either file.

## Files

Files go under `<state home>/materials/<repository name>/`, where the state home is `AKROGON_HOME` when set and `~/.akrogon` otherwise. Nothing is written inside a repository.

The name is the window in local time, then up to three topic words taken from the strongest story labels:

```text
<YYYY-MM-DD>_<HHMM>_to_<YYYY-MM-DD>_<HHMM>_<topic>_<topic>_<topic>.md
2026-11-16_0912_to_2026-11-17_0041_hiring-keywords_retyped-results_town-pages.md
```

A part run puts `part` before its topics (`..._to_2026-11-17_0041_part_hiring-keywords.md`), and the default window ignores it. A run with no stories uses the topic `none`.

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
