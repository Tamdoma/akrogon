# Report: direct-route implement

Base `d17029e2b0a8c369ee366a91bf12346141fc508a`, committed head `3bb3fdf785057d3032d79d2b7305f05c33f2f1f1`.
Mode: subagents, one wave of three units (briefs brief-1.md to brief-3.md), cherry-picked serially, worker worktrees removed.

## Commits

- `6c44494` U1: guard script and test (worker `3c7a4bb`)
- `0d4f642` U2: chart-issues SKILL.md and shapes.md (worker `a00904f`)
- `c8fb7a3` U3: implement-issue, check-issue, broadcast-issue, docs/guide/chart.md (worker `d8a77bf`)
- `3bb3fdf` A: guide link now points at `SKILL.md#direct-route`, which exists after U2

## Changed files and reasons

- `skills/chart-issues/scripts/direct-guards.ts` (new): D1, D2. Runs `requireClean`, `requireNoIssueFiles`,
  `requireTestChangeCitations`, `requireNonEmpty` from `src/phase.ts` unchanged, in phase order, no try/catch.
- `tests/direct-guards.test.ts` (new): 4 refusal cases and 1 passing case at the CLI boundary in `fixture()` repos.
- `skills/chart-issues/SKILL.md`: lines 47, 59, 69, 85 admit the route. The new `## Direct route` section holds
  availability, the eligibility refusals, the route question, the protocol, the landing order, the repair bound, the growth
  stop and the one-live-branch rule.
- `skills/chart-issues/assets/shapes.md`: the tree adds `direct/` and direct review returns in `slots/`. CHART.md gets a
  `Route:` line and a `## Direct attempt` section. The state.yaml note says direct writes no leaf files.
- `skills/implement-issue/SKILL.md`: description, line 10, line 23, the Standalone exception clause and a new
  `### Direct form` (D12).
- `skills/check-issue/SKILL.md`: description, line 10 and a new `## Standalone review` (D13).
- `skills/broadcast-issue/SKILL.md`: description, line 10, line 14 and the sender clause name the direct landing (D14).
- `docs/guide/chart.md`: new `## Direct route` section (D15).

## Criteria and evidence

| Criterion | Evidence |
|---|---|
| 1 | chart-issues `SKILL.md` line 69 edit, plus `## Direct route` paragraphs 1 and 3: unavailable line, combined question, session authorization, `Route:` line, later setting change doesn't apply; shapes.md `Route:` line |
| 2 | `## Direct route` bullet list of five refusals matching eligibility 1a |
| 3 | `## Direct route` protocol step 5, sub-steps 1–9: literal push form, 2 attempts, never force, close `--by`, `git worktree list`, `git branch --list` |
| 4 | `## Direct route` repair bound and growth stop paragraphs, one-live-branch line; shapes.md `## Direct attempt` fields |
| 5 | `bun test tests/direct-guards.test.ts`: 5 pass. Each guard call removed once turned exactly its case red (4 pass / 1 fail), then restore went back to 5 pass (worker U1 record) |
| 6 | implement-issue `### Direct form`, check-issue `## Standalone review`, broadcast-issue clauses, chart.md `## Direct route`; `tests/docs-links.test.ts` green within the full run |

## Commands (final lane, head 3bb3fdf)

- `bun run format`: exit 0. It also rewrote `src/status.ts`, which this leaf does not touch: pre-existing format
  drift on base. I reverted it and left it uncommitted.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 539 pass, 0 fail, 26 files, 27.2 s.
- `bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 5 pass.
- Wall time for all four checks: 30 s.

## Known limitations

- `docs/guide/merge.md:64,97` say broadcast runs only when a standalone issue or epic completes. A direct landing now also
  broadcasts. The file is not owned by this leaf. Reported only.
- `src/status.ts` is unformatted on base (see Commands).
- Skill prose is proven by review against the design, not by tests (design rule).
- U1 wrote the script and test together, so the "red before the script existed" step was not observed. The per-guard
  break runs give the red evidence.

## Unverified criteria

None.
