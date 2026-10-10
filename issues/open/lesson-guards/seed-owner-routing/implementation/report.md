# Implementation report: seed-owner-routing

Base: `3d223c8` (AKROGON_BASE) · Lane head: `e5b68d6` · Mode: subagents, two waves.

## Changed files and reasons

Commit `e5b68d6` (worker W1, cherry-picked `85cb4bf`):

- `skills/seed-issue/SKILL.md` — owner test appended to Destination (named path absent under consumer root → akrogon-owned when it exists or `readlink -f` resolves under the akrogon root; absent under both → no reroute; akrogon root unresolvable after the test is reached → visible stop with path and reason, no consumer fallback); Report file inspection now explicitly runs before destination resolution; body template gains `Origin repo:` and conditional `Lesson history:`; lookup paragraph gains the covering-report rule (mechanism judged by body, posts nothing, prints found URL; related-different still posts); Submit and finish prints created/found/failure in `Last operation`; frontmatter names the akrogon route.
- `docs/guide/learn.md` — "A report about an Akrogon skill belongs in Akrogon" extended with the owner rule, absent-akrogon stop, existing-report outcome.
- `docs/guide/create.md` — routing paragraph states consumer + akrogon-owner routing and the stop; outcome wording covers the found-report URL.
- `docs/guide/cheat.md` — seed-issue row: "new or already covering it" (no always-create promise).
- `README.md` — intake paragraph names the akrogon-owned route and the found-report outcome.
- `tests/docs-links.test.ts` — sweep now includes `skills/*/SKILL.md` (11 pages); commit carries the `Test-Change:` trailer.

Not landed: worker commit `324b4c0` — a prettier reflow of `src/status.ts` the leaf did not author (known drift, lessons/history/2026-10-08-pause-dispatch.md). The lane's own `bun run format` redrew the same drift after landing; reverted before handoff. Worktree clean.

## Commands run (with results)

| Command | Result | Wall time |
|---|---|---|
| `bun test tests/docs-links.test.ts` (worker) | 3 pass, 0 fail | seconds |
| `bun test --changed="$AKROGON_BASE" --timeout=30000` (worker + lane after pick) | 3 pass across 1 changed file | seconds |
| `bun run format` (worker + lane) | clean; lane run rewrote pre-existing `src/status.ts` drift — reverted | seconds |
| `bun run typecheck` (lane) | `tsc --noEmit` clean | seconds |
| `bun test --timeout=30000` (worker + lane, full suite) | 642 pass, 0 fail, 33 files | ~55s worker, ~50s lane |

## Criterion proof

- C5 (and the decision rules of C1–C4): `implementation/fresh-agent-cases.md`. One fresh pi subagent (gpt-5.6-sol, high; not the W1 writer), cwd framework, given only the shipped SKILL.md and files it references, decided six cases with zero mutating calls: A framework `skills/check-issue/SKILL.md` → Tamdoma/akrogon; B framework test → Tamdoma/tamdoma-framework; C framework `package.json` → Tamdoma/tamdoma-framework; D akrogon `src/next.ts` → Tamdoma/akrogon; E akrogon absent under restricted PATH → visible stop naming path and reason, consumer-resident reports unaffected; F report matching #73 → no post, prints https://github.com/Tamdoma/akrogon/issues/73 after both read-only lookups and `gh issue view`. Six of six match.
- C6: docs-links test green over README + guide + all skill pages; W1's meaning sweep (`seed`, `issues_repo`, `report`, `intake`, `filed`, `origin`, `posts`, `unverified` over `docs/` + README.md) found no remaining line promising current-repo-only routing or always-create.

## Worker returns (folded)

- W1 (worktree `seed-owner-routing-u1`, removed): commits `85cb4bf` (landed) + `324b4c0` (rejected, unrelated format reflow). Report: sections above; no limitations, no unverified criteria in scope.
- W2 (no worktree; artifact-only): `fresh-agent-cases.md` written; backing session log at `/tmp/pi-seedproof/run/` (not repo data); one extra read-only `gh` lookup variant beyond minimum; no unverified criteria.

## Known limitations

- The owner rule keys on paths the report names as the failure's location; a report naming no path routes as today (locked interface).
- Case F's mechanism judgment is the fresh agent's; if #73's body changes meaning, rerun the case.
- Backing run logs under `/tmp/pi-seedproof/run/` are ephemeral evidence; the recorded artifact stands alone.

## Unverified criteria

None.
