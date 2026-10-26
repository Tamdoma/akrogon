# Chart: akrogon-test-line

## Destination

In the akrogon repo, two runs of the whole-suite `test` check never run at the same time: a later one waits for the earlier one, and `akrogon status` shows the running run and its waiters while one waits. Other repos and other checks start at once.

Route: lifecycle (autopilot)

## Forks taken

- [line-scope](forks/line-scope.md): A's pick 1a 2a: repo config list `full: [test]` set only in akrogon after deploy; `stop-run` cancels a waiting run

## Open forks

none

## Fog

none

## Off route

- framework, lingua-relay and every other repo: replay shows hours of waiting per week there (INTAKE.md Agent findings); operator "for akrogon only".

## Pending steps

- After leaf one-test-run lands and the deploy record (`~/.akrogon/deploy.yaml`) shows a release containing it: add `full: [test]` to akrogon's issues/config.yaml on main. Owner: a chart door (A) or the operator. Check: `akrogon config` in the akrogon root prints `full` with `test` and exits 0. Runs started before the edit may overlap once (stated residual). Status: done 2026-10-26 by the door (release 249d01cf deployed ok; `akrogon config` prints `full: [test]`, exit 0; working copy, uncommitted).

## Mode record

- mode 2026-10-26T11:16:40Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: on handed [akrogon-test-line]; route lifecycle; consultants B w8:pV5 (codex)
- mode 2026-10-26T11:29:12Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: off, every handed chart handed off

## Autopilot

- switch-on: INTAKE.md "Source: operator 2026-10-26"
- consultant: B w8:pV5 codex (C w8:pWJ not used, operator named slot B only)
- route: lifecycle
- handed off: issues/open/test-line/one-test-run (plan.synthesis)
- pending step: after one-test-run lands and deploys, open a chart door to add `full: [test]` to akrogon's issues/config.yaml (CHART.md Pending steps)
- recorded only: seed 119-akrogon-verify-leaves-25-receipts.md, no match with handed work
- usage: chart akrogon-test-line - operator wait 12.4 min, operator turns 1; A=32523, B=9864 output

Handed off 2026-10-26
