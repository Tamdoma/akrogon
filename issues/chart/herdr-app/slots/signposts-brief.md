# Brief: signposts angles (herdr-app chart)

You are a consultant seat (B, C, D or E: the letter in your start message) for a chart-issues door run by seat A in herdr-core terminal `t15`. You run as an `hc` child of A inside herdr-app. Work alone. Do not start agents, do not edit any file except your return file, do not ask the operator questions.

## Task

Before any planning, the door asks the operator one "signposts" round: 4 to 7 session-level questions that set direction for every later decision in this chart. A signposts question sets ranked priorities, hard limits, or the order or drop of pieces of work. It changes several later picks at once and cannot be settled by reading code or docs. It is not a detailed design question (those come later, one fork at a time).

Propose the signposts questions you think this session needs. Name the angles a door would easily miss. For each question give:

- the question, in plain words;
- two or three options;
- your recommendation with one reason;
- what it steers: which later decisions change with the answer.

Skip anything the operator already settled in the intake (for example: one cutover, no compatibility layer, no fallback to old herdr, every agent gets a visible pane, consultant names `<repo prefix>-slot-<letter>`). You may list those as settled in one line each.

Keep the return under 80 lines.

## Read

- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md`: the whole intake, including the operator's 2026-11-06 note at the end (the newest operator words for this session).
- `/home/ivan/.config/herdr-app/AGENTS.md`: how herdr-app and herdr-core work now.
- `hc --skill`: the herdr-core manual (run it; read its output).
- For reference only, the previous session's signposts on this repo: `/home/ivan/Work/infra/akrogon/issues/chart/round-drawings/forks/signposts.md`. Its questions were for other charts. Do not copy them.

You may inspect `/home/ivan/Work/infra/akrogon` source (for example `src/shell.ts`, `src/next.ts`, `plugin/`, `skills/chart-issues/`) to ground an angle. Cite path:line for any claim about code.

Reading rule: read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges.

## Return

Write your answer to exactly one of these paths, by your letter:

- B: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/signposts-B.md`
- C: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/signposts-C.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/signposts-D.md`
- E: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/signposts-E.md`

Then report, as your last action:

```sh
hc send t15 "done <letter>: <your return path>"
```

If you are stuck, report that with `hc send t15 "stuck <letter>: <reason>"` instead.
