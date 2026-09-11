# Research before questions corrects the intake

## What was not good
The first three open questions were written from the intake alone. The intake stated that herdr refuses a prompt to a busy pane, "the never-stack rule for free", and cited herdr 0.8.2. Neither was checked.

## What the updated way does
Version 3 of the skill runs research before the batch. Both slots researched blind. Findings: herdr accepts a prompt while an agent is working and refuses only a pane at an approval or question UI (herdr CLI reference, tier 2). Claude Code and Codex state comes from screen detection, pi and five others report state through hooks and are authoritative (herdr integrations, tier 2). Installed herdr is 0.9.0, not 0.8.2. This session itself is a first-hand run of prompt, wait, and tail read across two panes, so two of the three handoff behaviors are already observed.

## Why
A question built on a false premise gets a confident wrong answer. The research step is cheap next to a driver designed around a refusal that does not exist.

## How it gets improved
Every intake claim that a question rests on gets a source or a run before the question is asked. When research overturns an intake line, say so in the question, never edit the intake.
