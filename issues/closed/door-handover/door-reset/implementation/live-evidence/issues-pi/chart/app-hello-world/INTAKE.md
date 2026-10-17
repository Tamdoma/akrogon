# Intake: app-hello-world

## Scope
Change `app.py` so its observable output is `hello world` instead of `hello`.

## Provenance
- Operator: 2026-10-17 door request

## Source: operator 2026-10-17 door request
run autopilot with no consultants on these two items in /var/tmp/akr-1000/5d20/80cf0603/door-reset-live/repo-pi — item 1: "app.py prints hello but should print hello world"; item 2: "README.md title has a typo, it says scratch instead of scratch-pad". That repo is registered in akrogon as door-reset-live-pi; work in that directory. Follow the skill's autopilot rules exactly, including the self-handover when you switch to the next chart.

## Agent findings
`app.py` contains only `print("hello")`. Running it would therefore emit `hello`, matching the reported defect. The repository has no configured checks and no Git remote named `origin`.
