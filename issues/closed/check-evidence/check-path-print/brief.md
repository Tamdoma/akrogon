# Brief: check-path-print

## What
`akrogon run-check` prints `check <name>: <exit> <kept path>` to stderr on its own line after the command's output. The implement, check, merge, plan and chart skills tell seats to keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed path, with the decided exemptions.

## Why
run-check prints no kept path today, so seats copy output into hand-saved logs (2,854 such files in framework, many byte-identical to a check log). One writer and one naming rule leaves every kept log findable and packable.

## Done-criteria
1. After the command's own stdout and stderr, `akrogon run-check --name <n> -- <cmd>` writes one line `check <n>: <exit> <kept path>` to stderr, starting on a new line even when the command's stderr did not end with a newline, where `<kept path>` is the absolute path of the saved log and `<exit>` is the command's exit code; the exit code of run-check is unchanged.
2. The skill lines that tell seats where to keep command output (implement-issue SKILL.md, worker-protocol.md, brief-template.md; check-issue SKILL.md; merge-issue SKILL.md; plan-issue SKILL.md) state the run-check rule, name `akrogon log <path>` as how a cited path is read (C), and state its exemptions: printed check commands and `akrogon verify`; `akrogon phase ... merged`; coordination commands (fetch, push), whose errors are quoted as text. On the direct route the holder is the absolute `<chart>/direct` path and check-issue allows those logs. Standalone implement-issue stays outside the rule.
