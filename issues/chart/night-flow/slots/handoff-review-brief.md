# Handoff review: every draft, as its implementer

Operator, 2026-10-11, verbatim: "1s, 2a, 3a" (go-ahead, debate no, P1 done: akrogon `issues/config.yaml` now has `setup: bun install --frozen-lockfile`, pushed `c53f619`).

Drafts: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/drafts/night-flow/ (ISSUE.md, one folder per leaf, `amend/` for two in-place amendments). Chart: /home/ivan/Work/infra/akrogon/issues/chart/night-flow/ (CHART.md and the `## Taken` of each fork in `forks/`).

## Main moved since the drafts were written
`git log --oneline ec08dec..c53f619 -- src skills docs` in /home/ivan/Work/infra/akrogon: deec699, ca71075, 327d4bf, c8d0622 (format rewrites), 219e3cf, 301ee46, 5401e87, a32f1e8. `akrogon status` at 11:45: known-red-leaf is `merged`; known-red-merge is in `plan.synthesis` with A busy since 09:43Z; worktree-reconciler is in `check.repair`.

A's reading, to confirm or refute with evidence:
- H-a: known-red-leaf already delivered pre-merge-red. `skills/implement-issue/SKILL.md:38`, `skills/check-issue/SKILL.md:61,65` and `docs/guide/phases.md:94,102` keep only the incomplete-base-run `failed` stop, so every pre-merge-red done-criterion holds on main. pre-merge-red and the `amend/known-red-leaf` amendment are dropped.
- H-b: known-red-merge is no longer far off. Its live brief (`issues/open/red-base-wait/known-red-merge/brief.md:4,17`) retires the repo hold itself. A will ask the operator whether to drop hold-retire (no amendment to a leaf being planned) or keep it and apply `amend/known-red-merge` now (known-red-merge then waits for hold-retire). Give your view with evidence: what each choice costs, what breaks, and whether anything S1 promised (`forks/stop-rules.md` Taken) is lost if hold-retire goes.

## Review every remaining draft as the leaf's implementer
For each draft: can A plan and implement it, and can B review it, without guessing? Return only disagreements and missing pitfalls, each with evidence (path:line on current main). Check in particular:
- line references and quoted text against current main, since the commits above moved lines;
- any contradiction with a fork's Taken, an operator lock or current code;
- any done-criterion that cannot be proven as the design says;
- references to pre-merge-red or hold-retire that change under H-a and H-b.

Read-only: change no repo file and no draft. Slot B writes only to /home/ivan/Work/infra/akrogon/issues/chart/night-flow/slots/handoff-review-B.md. Slot C writes only to /home/ivan/Work/infra/akrogon/issues/chart/night-flow/slots/handoff-review-C.md. If you find nothing, write the single line "No disagreement".
