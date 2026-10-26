# Chart: akrogon

## Destination

One full `test` check and akrogon's own commands start fewer repeated subprocesses, with user plus sys CPU measured before and after on the same host, and no workflow change.

Route: lifecycle

## Forks taken

- Census: done by A (slots/census-A.md), repeat rate in forks/reuse.md Findings.
- [Reuse](forks/reuse.md): A's pick 1b 2a 3a 4a. herdr repeats removed at the caller, no cache; registered-root git identity read once per run, tips fresh, fetch unchanged; fake-proc uses Bun.CryptoHasher and fake busctl is bundled; no committed harness.
- [Proof](forks/proof.md): A's pick 1a 2a 3a. 10 head and 10 base two-at-once pairs alternating, all head copies green and the re-entering test's slowest time below base; three at once recorded only; solo CPU median below base with spread and spawn counts.

## Open forks

none

## Fog

none

## Off route

- Central herdr read cache (Reuse 1a), fetch once per run (Reuse 2c), committed census harness or call-count ceiling (Reuse 4b): rejected by A's autopilot picks.
- Three suites at once green: recorded only (Proof 2a).
- Bundling or compiling akrogon's own source: a bytecode bundle fails on top-level await and a compiled binary is about 10% faster at 91 MB (C D7).

## Pending steps

none

## Mode record

- mode 2026-10-26T07:07:39Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: on, handed: issues/chart/git-calls; consultants B w8:pV5, C w8:pWJ (operator words in INTAKE.md, Autopilot switch-on)
- mode 2026-10-26T07:44:35Z w8:pNP c8a48fc5-8a0e-4cc6-bd95-474f9490fb19: off, every handed chart Handed off

## Autopilot

- switch-on: INTAKE.md, Autopilot switch-on
- consultant: B w8:pV5 (codex) and C w8:pWJ (pi), both kept through maps, rebuttals and leaf review; none dropped
- route: lifecycle
- handed off: issues/open/repeat-calls/fewer-repeat-calls (plan.synthesis)
- pick against recommendation: none; A took its own recommendation in Reuse (1b 2a 3a 4a), Proof (1a 2a 3a), the split (one leaf) and the handoff review (approve)
- recorded only: seed 119 (verify receipts without an end) is unrelated to this chart
- usage: chart git-calls - operator wait 36.8 min, operator turns 1; A=80264, C=30600, B=14447 output (outcome done)

Handed off 2026-10-26
