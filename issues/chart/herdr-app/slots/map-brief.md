# Brief: opening territory map (herdr-app chart)

You are a consultant seat (B, C, D or E: the letter in the message that pointed you here) for the chart-issues door run by seat A in herdr-core terminal `t15`. Work alone and blind: do not read other seats' files in `slots/` (anything named `map-*` other than this brief, or `signposts-*`). Do not start agents, do not edit any file except your return file, do not ask the operator questions. Read-only commands only: `hc ls`, `hc get`, `hc read`, `herdr-app ls`, `herdr-app commands`, `herdr-app status`, `hc --skill`, `herdr-app --skill`, git and file reads are fine. Do not run `hc run`, `hc send` (except your final report), `hc kill`, or any `herdr-app do` command, and do not touch other terminals.

## Task

Map the territory for one complete port of akrogon from old herdr to herdr-core (`hc`) and herdr-app, before any detailed question is asked. The operator wants it charted in detail and will answer every fork.

Give, proportional to the work:

1. The material forks: decisions that change the outcome, each as a plain question with its main options, which option you lean to and why, and what each option could break or invite later (not only now).
2. Practitioner questions: what an experienced engineer doing this port would ask that the intake does not answer.
3. Pitfalls over the work's lifetime, each with what removes it (a design choice, a probe before handoff, a done-criterion, or an operator step).
4. A proposed split: which destinations (akrogon repo, herdr-setup repo, the operator's machine outside any repo) and which pieces (leaves) inside each, which pieces depend on which output, and which can run side by side. Only a real dependency orders work, never file overlap.
5. External operations the work will rely on (hc commands, herdr-app commands, harness launch flags) that need one real observation before handoff, each with the smallest safe call that would prove it.

Ground every claim in an inspected surface: cite `path:line` for code, the command and its output for live behavior, or the doc section for hc/herdr-app. Mark low-confidence items. Keep the return under 220 lines.

## Binding locks

The operator's signposts answers are binding: read `## Taken` in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md` (the verbatim answer and the "Read as" lines). In short: code only for the agent start step; remove everything old, no fallbacks, but only after the new path is proven end to end; hc/herdr-app gaps are patched in the herdr-setup repo in a way that survives upstream updates; crash recovery stays an automatic fix by the watch-issues agent, with the workflow unchanged; global CLAUDE.md/AGENTS.md untouched, but a global `herdr` skill fed from herdr-app's AGENTS.md is linked into pi, Claude Code and Codex; engine ported first; live proof per operation per agent kind at charting within an approved budget.

Also settled in the intake: one cutover; every agent akrogon starts gets a visible pane in the same step; consultant names `<repo prefix>-slot-<letter>`; chart work in the chart folder from open; consultant reset is kill and restart; a seat's own `hc send` report is the finish signal, no polling.

## Read

- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md` (the whole intake; its touchpoint lists are a starting inventory, not proof).
- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md` section `## Taken`.
- `/home/ivan/.config/herdr-app/AGENTS.md`, `hc --skill`, `herdr-app --skill`, `hc <command> --help` as needed.
- Live surfaces: `/home/ivan/Work/infra/akrogon` (`src/`, `plugin/`, `skills/`, `tests/`, `docs/`, `herdr-app/`), `/home/ivan/Work/infra/herdr-setup` (how it installs and patches herdr-core/herdr-app today), `~/.claude/skills/herdr`, the skill folders of pi (`~/.pi/agent/skills` or as configured) and codex (`~/.codex/skills` or as configured).

Reading rule: read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges.

## Return

Write your map to exactly one of these paths, by your letter:

- B: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/map-B.md`
- C: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/map-C.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/map-D.md`
- E: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/map-E.md`

Then, as your last action:

```sh
hc send t15 "done <letter>: <your return path>"
```

If stuck: `hc send t15 "stuck <letter>: <reason>"`.
