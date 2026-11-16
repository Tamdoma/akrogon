# Brief: claude-seat-no-questions

## What

`harnessArgv` (src/seat.ts) appends `--disallowedTools=AskUserQuestion` (equals form) to the argv of every claude-kind harness. It already appends `--session-id` for pi. Every leaf seat and door-created consultant that akrogon launches on claude then starts without the question tool. Other harnesses get no change.

## Why

Report Tamdoma/akrogon#135, seat half. Claude seats called AskUserQuestion in framework worktrees on 2026-11-15 and waited in a dialog until the operator returned. The pi template already removes its question tool. The claude template had no equivalent.

## Done-criteria

1. For a claude-kind harness, akrogon appends `--disallowedTools=AskUserQuestion` once, as one element, to the argv it builds for a seat or consultant, placed before the appended task. The task stays the last element and arrives unchanged.
2. For codex, pi and agy harnesses the built argv is unchanged.

Criteria 1 and 2 are proven by the leaf's own tests of the argv akrogon builds (the existing `harnessArgv` or start tests). Criterion 1's test turns red under one deliberate break (the space form `--disallowedTools AskUserQuestion`).
