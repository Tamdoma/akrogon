# Implementation report: chart-destination-intake

## Changed files and reasons

- `skills/chart-issues/SKILL.md` (worker U1, commit `64e817a`): new destination-check paragraph in Handoff (line 63) covering checked set, checkpoints, coincidence, source-no-exempt, plain `akrogon pull` per registered root, per-destination hold, compare/show/confirm flow, and no-import-of-unrelated-seeds; closure exemption appended to the line-33 close sentence. Covers plan AC1, AC2-part, AC4-part.
- `skills/chart-issues/assets/shapes.md` (worker U2, commit `128875d`): outcome-disposition paragraph after the single-owner rule (line 164) covering full/partial/owned-elsewhere/failed-pull outcomes; preflight refusal sentence added to the preflight paragraph (line 168) naming the destination. The :162 single-owner sentence is byte-identical. Covers plan AC2, AC3.
- `docs/guide/chart.md` (worker U3, commit `5414dc3`): plain-words destination-check paragraph in "Turn the answers into a buildable contract" (line 203); covered-report exemption appended to the line-128 closure sentence. Covers plan AC4.

No file under `src/`, `tests/`, `plugin/`, `README.md`, or `issues/` was touched. No new command, flag, config key, or state field.

## Base and head

- Base (`AKROGON_BASE`): `a2f3e7a378d025930e12ac05ce8710f57f0752a2`
- Committed head on lane `chart-destination-intake`: `5414dc3dd6dd41f80d2c4d9bbdecf09aca4650b2`
- Wave commits (cherry-picked serially, no conflicts): `64e817a` (U1 SKILL.md), `128875d` (U2 shapes.md), `5414dc3` (U3 guide).
- `git status --porcelain` clean after picks; all three worker worktrees removed before the full suite.

## Commands run with results

Worker changed-tests (one per unit, from each worker worktree):

```sh
AKROGON_BASE=a2f3e7a378d025930e12ac05ce8710f57f0752a2 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

Result per worker (U1/U2/U3 identical shape): `bun test v1.4.2 --changed: 1 changed file, but no test files are affected. 0 pass, 0 fail.` Expected: prose-only diffs, plan D6 forbids wording tests.

Lane changed-tests after each cherry-pick: same command, `0 pass / 0 fail` after each pick (1, 2, then 3 changed files, no test files affected).

Full suite as B (leaf worktree, after all worker worktrees removed):

- `bun run format` — exit 0, all files unchanged.
- `bun test` — 324 pass, 0 fail, 3843 expect() calls, 15 files, 152s.
- `bun run typecheck` (`tsc --noEmit`) — exit 0, no output.

Contradiction sweep (AC4):

```sh
grep -rn "duplicate\|delivered\|akrogon close\|intake\|sources" docs/ README.md
```

Hits: owned `docs/guide/chart.md:128` (exemption present) and `:203` (new paragraph) corrected/added by this leaf; all other hits are non-contradictory (`cheat.md:128` generic skill list, `create.md`/`state.md` `sources: []` schema examples, `install.md:13` generic auth note, `learn.md:46` new-intake concept, `next.md:92` delivered-prompt grace period, `setup.md:99` AREA "duplicate the code" style rule, `chart.md:7,96,167` generic intake mentions, `reference-index.md:5` skills link, `README.md:59,118,139,166` generic intake/close/schema docs with `:139` consistent with this leaf since it documents closing one *unowned* issue). No contradictory instruction found. `README.md` untouched.

Credential check: `gh auth status` — logged in to github.com as `ivanjuras` (keyring, active account, https). No `.env` keys exist for this leaf.

Real destination pull (AC5):

```sh
cd /home/ivan/.pi/agent/extensions && akrogon pull > /tmp/chart-destination-intake-pull.log 2>&1
```

Exit 0. Log content: `pi-extensions: 0 open issues pulled`. Artifact path: `/tmp/chart-destination-intake-pull.log` (outside tracked `issues/` paths).

## Replay: Tamdoma/akrogon#38 against the new text

Setup treated as the pre-handoff state: a chart in akrogon sourced from `Tamdoma/akrogon#32` and `#35`, destination pi-extensions (registered root `/home/ivan/.pi/agent/extensions`), a seed for `Tamdoma/pi-extensions#5` present, #5 open and unowned. No historical `issues/` record was changed or asserted.

Finding #5. SKILL.md:63 requires the check at both checkpoints with the source plus every selected destination in scope: "checked repos are the source repo plus each selected registered destination, deduplicated within a checkpoint, and the source is never exempt" and "At each checkpoint run plain `akrogon pull` with cwd at each checked repo's registered root from `akrogon config` `repos`". The destination-selection checkpoint therefore pulls pi-extensions at its registered root, refreshing the #5 seed. The same line then requires "compare each checked destination's `issues/seeds/*.md` against the chart's scoped work, show candidate matches to the operator". The #5 seed describes the same stuck-seat bug as the chart's scoped work, so the door shows it as a candidate instead of never looking.

Asking the operator. SKILL.md:63 ends the flow with "act only on operator confirmation", and shapes.md:164 resolves every compared identity to one operator-visible outcome. The door proposes #5 as a full match; the operator confirms it is fully covered by the chart. The SKILL.md:33 exemption ("A confirmed full match with no other owner whose work is undelivered is exempt and stays open as `sources` until its completion owner delivers") and the matching guide :128 exemption keep the door from duplicate-closing #5 during charting.

Sourcing both leaves. shapes.md:164 states the full-match disposition verbatim: "A confirmed full match with no existing owner copies verbatim into INTAKE.md under its own `Source` heading with a GitHub provenance line, and its identity goes into `sources` of every leaf under the delivering completion owner so existing completion closes it." The #5 report text is copied verbatim under `## Source: Tamdoma/pi-extensions#5` with a `- GitHub: Tamdoma/pi-extensions#5` provenance line, and `Tamdoma/pi-extensions#5` enters `sources` of both leaves under the delivering completion owner. Existing completion then closes #5 on delivery; the #38 gap (leaves carrying only #32 and #35) cannot recur when the operator confirms the match.

## Scenario reviews

1. Same-repo chart receiving a report after opening. Applicable instructions: SKILL.md:63 (source never exempt, checkpoints at selection and right before the handoff review). Result: the late report arrives via the pre-review `akrogon pull` in the source root, is compared, and a confirmed full unowned match follows the shapes.md:164 full-match disposition (verbatim INTAKE.md + provenance + `sources` fan-out). Import: only the matched report. Sources: identity added to every leaf under the delivering completion owner. Handoff: proceeds.
2. Partial match. Applicable instructions: SKILL.md:63 (show candidate, act only on confirmation) + shapes.md:164 ("A partial match stays open and is shown with its uncovered part"). Result: refresh runs, nothing is copied into INTAKE.md as a covered source, no `sources` entry is added, the report stays open and the uncovered part is shown to the operator. Handoff: proceeds with the partial match visible.
3. Identity already owned by another leaf or chart. Applicable instructions: shapes.md:164 ("An identity already in any open or closed leaf `sources` or another chart intake is shown to the operator as a conflict and is never silently reassigned") + unchanged single-owner rule at :162. Result: refresh runs, no import, no `sources` change; the door shows the conflict and the operator decides. Handoff: proceeds without reassigning the identity.
4. Unrelated destination report. Applicable instructions: SKILL.md:63 ("checking never imports a destination's unrelated seeds") + shapes.md:164 (same rule). Result: refresh runs, the unrelated seed is compared and dismissed as a non-candidate, nothing is imported, no `sources` change. Handoff: proceeds.
5. Failed destination refresh with another independent destination available. Applicable instructions: SKILL.md:63 ("any other failed refresh likewise holds only that destination and other destinations continue") + shapes.md:164 (failed pull holds only that destination, reported) + shapes.md:168 preflight ("Refuse a handoff to a destination whose check right before the handoff review did not succeed, and name that destination"). Result: refresh attempted at both roots; the healthy destination's matches are compared and imported per outcomes above; the failed destination's handoff is held and reported by name. Handoff: refused for the failed destination only, proceeds for the healthy one. A non-GitHub or unregistered destination behaves the same way (reported, held for that destination only).

No scenario changed a historical `issues/` record, and no automated test asserts exact prose.

## Worker returns folded in

- U1 (SKILL.md): changed-test `0 pass / 0 fail` (1 file, no tests affected); limitation noted that outcome dispositions and preflight refusal live in shapes.md per brief scope; no unverified criteria.
- U2 (shapes.md): changed-test `0 pass / 0 fail`; :162 no-diff verified identical; limitation that AC1-AC5 verification is grep plus read per D6; no unverified criteria.
- U3 (guide): changed-test `0 pass / 0 fail` after `bun install`; limitation that failed-refresh sentence states a plan fact beyond the numbered AC; no unverified criteria.

## Known limitations

- Matching is a door proposal confirmed by the operator, not an automatic matcher; a misdescribed or missed candidate still depends on operator judgment at the two checkpoints (plan open limitation, carried forward).
- Only the source repo and selected registered destinations are checked; an unselected repo holding the same report is out of scope by Q1-A (plan open limitation, carried forward).
- The real pull observed zero open pi-extensions issues, so it proves the mechanism (cwd at registered root, exit 0) rather than a live seed comparison; seed comparison is covered by the replay and scenario reviews above.

## Unverified criteria

None. AC1-AC5 all verified: AC1-AC4 by grep plus human read of the landed diff (no wording tests per D6), AC5 by the replay, five scenario reviews, the real pull artifact at `/tmp/chart-destination-intake-pull.log`, and the passing `format` / `test` / `typecheck` suite.
