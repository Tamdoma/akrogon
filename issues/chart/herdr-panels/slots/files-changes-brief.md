# Fork brief: Files and Changes (A1, A2, A3)

You are a consultant seat (letter in the one-line prompt). Work alone; you will not see the other seats' notes. Edit no file except your return files. Do not contact the operator. Read-only commands are fine; do not send text to any terminal.

## Part 1: focused check on the Tasks final shape

Read /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-final.md against INTAKE.md "Round 3" and "Round 3b". Return only defects: a line that contradicts an operator answer, a [CHANGED] line that breaks something, or a dropped requirement, each with evidence (path:line). If none, write "No defect." Write to /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-final-check-<YOUR LETTER>.md

## Part 2: blind notes on Files and Changes

### Context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md. Read "Agent findings" (F1-F5, A1-A3), "Round 1", "Default layout", "Round 2" (Q5 placement and the operator's "I don't want to be complicating the existing interfaces. I like what they are today."), "Round 3".
- Shipped mods (read-only, clone before editing): /home/ivan/.config/herdr-app/mods/files/, /home/ivan/.config/herdr-app/mods/changes/, /home/ivan/.config/herdr-app/mods/worktree/. Manual and types: /home/ivan/.config/herdr-app/AGENTS.md, herdr.d.ts, gpui-kit.d.ts (search, do not read whole). Operator setup repo: /home/ivan/Work/infra/herdr-setup (layouts/flat.json is the default layout).
- Earlier seat positions: slots/map-merged.md (settled lines on branch scope, markdown, worktree selection; "Where seats differ" 6) and your own map-<LETTER>.md.

### Questions for your notes

1. Files and Changes are existing interfaces the operator likes. Which of A1-A3 change them, and should each be a change to Files/Changes (cloned mods) or a separate new panel/button? Name what visibly changes for the operator in each case.
2. Changes: the Commit button (`git add -A`, F3): remove, keep, or commit selected files only? Which scopes (working tree, branch vs default branch, recent commits), how they are switched, and what the default is.
3. Files: markdown rendering (formatted with a raw toggle?), filter/search (loaded entries vs repo-wide), and "changed recently" (git history, mtime, window vs count). Which are worth it?
4. Worktree picker and "open as pane" (A3): where the picker sits, what it lists, how it relates to the Tasks click (Tasks 2a points Files and Changes at a leaf worktree), and whether open-as-pane is needed.

### Notes format

For each question, your own position: (1) pick with reason and cost; (2) rejected options with reasons; (3) evidence with tier, source path:line, date; (4) pitfalls and what removes each; (5) any question you would ask that this fork does not. Name any probe that must run before building. Write to /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/files-changes-<YOUR LETTER>.md

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. Name sections, never line ranges, when you cite process text; cite code by path:line.

## Return

After writing both files, as your last action run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: tasks-panel-final-check-<YOUR LETTER>.md files-changes-<YOUR LETTER>.md"
