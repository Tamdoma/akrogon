# Akrogon

Akrogon is a lightweight software factory for people who already use coding agents. You chart work into written contracts. Two agent seats in Herdr plan, build and review it. Then the command lands it on your default branch.

It is for developers who already run an agent CLI and want a repeatable path from request to merged code. You decide what to build and when to start it. Akrogon tracks where each piece of work is and prompts the next seat. It does not decide what your product needs, and it does not deploy your product.

> **What you need**
>
> - A Linux desktop with a running systemd user manager.
> - Bun.
> - Git.
> - flock.
> - Herdr.
> - One agent CLI, such as Claude Code, Codex or pi.
> - An authenticated GitHub CLI (`gh`), only for GitHub work.

![How work moves through Akrogon: a request goes to the chart door, where you and agent A settle it, then becomes a contract in issues/open, then is built, gets an independent review, is repaired if needed, is landed by the command and ends merged. A dashed side path shows the direct route, where one small settled chart keeps the charted decisions and B's review but skips the leaf handoff, and the door lands it itself.](docs/pictures/factory-overview.svg)

## Start here

Read the [docs home](docs/README.md). It lists the start pages in reading order and every other page.

## Daily jobs

- [A working day](docs/use/a-working-day.md): the order of the steps from request to merged.
- [Plan work](docs/use/plan-work.md): chart a request into leaf contracts.
- [Run work](docs/use/run-work.md): start leaves with `akrogon next`.
- [Quick fix](docs/use/quick-fix.md): land a small settled change through the direct route.
- [When work fails](docs/use/when-work-fails.md): read why a leaf stopped and send it back to work.
