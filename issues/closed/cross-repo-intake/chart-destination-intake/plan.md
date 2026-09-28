# Plan: chart-destination-intake

Direct synthesis. `debate: no` in state.yaml, no positions/rebuttals. Source: brief.md + design.md + live surfaces in worktree. No brief/design conflict; design exclusions and Q1-A/Q2-A/Q3-A Taken govern.

## Decisions

- D1: SKILL.md owns which repos, when, and how the destination check runs. shapes.md owns match outcomes and the preflight refusal. docs/guide/chart.md owns the plain-words operator explanation. Keeps door procedure, contract shape, and operator view in their existing homes.
- D2: Checked set is source repo plus each selected registered destination, roots deduplicated within a checkpoint. Checkpoints are at destination selection and right before the handoff review. One check satisfies coincident checkpoints. The opening pull counts only when it coincides with a checkpoint. Source is never exempt, including when it is also the only destination. Mechanism is plain `akrogon pull` with cwd at each checked repo's registered root from `akrogon config` `repos`. No `--all`, no new command, flag, config key, or state field. `--all` scope belongs to leaf pull-all-repos.
- D3: Match handling is door proposal plus operator confirmation, no automatic matcher. Compare each checked destination's `issues/seeds/*.md` against the chart's scoped work and show candidates to the operator. Confirmed full unowned match goes verbatim into INTAKE.md under its own Source heading with a GitHub provenance line, and its identity goes into `sources` of every leaf under the delivering completion owner so existing completion closes it. Partial match stays open and is shown with its uncovered part. Identity already in any open/closed leaf `sources` or another chart intake is shown as a conflict for the operator, never reassigned silently. Failed or non-GitHub destination pull holds handoff to that destination only and is reported. Checking never imports unrelated seeds.
- D4: Exempt confirmed fully covered, unowned reports of undelivered work from immediate duplicate closure. Edit the delivered-or-duplicate closure sentence at SKILL.md:33 and docs/guide/chart.md:128 with that exemption: those reports stay open as `sources` until their completion owner delivers. No change to completion closure, `akrogon close` behavior, seed-issue routing, or `next --all`.
- D5: Preflight refusal for the destination check lives in the shapes.md preflight paragraph alongside existing refusals. It refuses a handoff to a destination whose check right before the handoff review did not succeed, naming the destination. Distinct from the stale-mirror rule and the operation-proof rule.
- D6: No automated test asserts prose wording. Verification is the #38 replay, six scenario reviews, one real destination `akrogon pull` artifact, and the configured `checks`. Owned files only: SKILL.md, shapes.md, docs/guide/chart.md. Excluded: src/, tests/, plugin/, README.md, any path under `issues/`, completion closure. Single-owner rule at shapes.md:162 unchanged.

## Read-first

- `skills/chart-issues/SKILL.md` (Open `akrogon pull` at :27, close rule at :33, Handoff section)
- `skills/chart-issues/assets/shapes.md` (intake provenance :62, single-owner rule :162, preflight paragraph :166)
- `skills/chart-issues/assets/standing-design.md` (installed-path interpretation; prose leaf, negative/edge cases via scenario reviews)
- `docs/guide/chart.md` (closure sentence :128, handoff section "Turn the answers into a buildable contract")
- `docs/reference-index.md`, `skills/AREA.md`, `learnings/LESSONS.md` (2026-09-11 lock-vs-criterion, stale-rule-in-docs, ambiguous-prose-after-rename; 2026-09-28 plugin-cwd-pull for cwd-sensitive pull)
- `issues/chart/cross-repo-intake/forks/destination-intake.md` + `issues/chart/cross-repo-intake/CHART.md` (binding Taken + Off route, read-only verify)
- `src/pull.ts:123`, `src/phase.ts:149-167` (read-only context that completion closes `sources`; not owned)

## Needed interfaces

- `akrogon config` `repos`: registered root per repo key, cwd for each destination pull.
- `akrogon pull` run at each checked root (source + each selected destination, deduplicated).
- `issues/seeds/*.md` mirror with `Source: owner/repo#n` line; exact-identity compare against leaf `sources` and chart intakes.
- Leaf `sources` field with single-owner rule (every leaf under the delivering completion owner carries the identity).
- `akrogon close <owner/repo#n> --by <text>` and `gh auth status` (operator login `ivanjuras`); no `.env` keys.
- `akrogon preflight`, `akrogon status` at the registered root (existing handoff validation context).

## Acceptance criteria

- AC1 (criterion 1): SKILL.md states which repos (source plus each registered destination, deduplicated), when (at selection and right before handoff review, one check when coincident), how (`akrogon pull` with cwd at the destination's registered root), and that checking is distinct from importing unrelated seeds.
- AC2 (criterion 2): SKILL.md or shapes.md states each outcome: confirmed full unowned match verbatim into INTAKE.md with GitHub provenance line plus into `sources` of every leaf under the delivering completion owner; partial stays open and shown; identity owned elsewhere shown as conflict; failed/non-GitHub pull holds only that destination and is reported.
- AC3 (criterion 3): shapes.md preflight refuses handoff to a destination whose check right before the review did not succeed, naming the destination.
- AC4 (criterion 4): guide chart.md handoff section explains the check in plain words; closure sentences at guide :128 and SKILL.md :33 exempt confirmed fully covered unowned reports of undelivered work; docs/ + README.md swept for contradictory intake/closure instructions, owned hits corrected, others reported.
- AC5 (criterion 5): implementation report replays #38 (akrogon chart sourced from Tamdoma/akrogon#32 and #35, destination pi-extensions, seed for Tamdoma/pi-extensions#5 open and unowned pre-handoff) quoting lines that find #5, ask the operator, and put `Tamdoma/pi-extensions#5` in both leaves' `sources`; plus scenario reviews for same-repo late report, partial match, owned-elsewhere identity, unrelated destination report, failed refresh beside a healthy destination, each naming applicable instructions and resulting refresh/import/source/handoff outcome; plus one real `akrogon pull` with cwd `/home/ivan/.pi/agent/extensions`, output saved outside tracked `issues/` paths with path in report; no historical `issues/` changes; no exact-prose automated test; configured `checks` pass.

## Ordered checklist

1. `skills/chart-issues/SKILL.md` (covers AC1, AC2-part, AC4-part): add destination-check block stating D2 set/timing/mechanism and D3 compare/show/confirm flow with no-import-of-unrelated rule; add D4 exemption to the :33 close sentence. Criterion: AC1 sentences present; close exemption present; no src/test/plugin/issues changes.
2. `skills/chart-issues/assets/shapes.md` (covers AC2, AC3): add outcome dispositions under intake/leaf-shapes area (verbatim INTAKE.md + provenance + `sources` fan-out per D3, partial/conflict/failed-pull handling); add D5 refusal sentence to the preflight paragraph naming the destination. Criterion: every outcome in AC2 stated in SKILL.md or here; preflight names the destination; shapes.md:162 single-owner rule text unchanged.
3. `docs/guide/chart.md` (covers AC4): add plain-words destination-check paragraph to "Turn the answers into a buildable contract"; add D4 exemption to the :128 closure sentence. Criterion: operator can state which/when/how and what happens to a covered report without reading the skill.
4. Contradiction sweep for AC4: grep `docs/` and `README.md` for intake/closure/sources/duplicate/delivered instructions (e.g. `grep -rn "duplicate\|delivered\|akrogon close\|intake\|sources" docs/ README.md`); correct owned hits in the three owned files, report other hits in the implementation report without editing excluded files. Criterion: sweep command and hits recorded; README.md untouched.
5. Verification bundle for AC5: write #38 replay + six scenario reviews naming applicable new lines and resulting behavior; run `gh auth status` and one real `akrogon pull` with cwd `/home/ivan/.pi/agent/extensions`, saving output outside tracked `issues/` paths (e.g. `/tmp/chart-destination-intake-pull.log`) and recording the path; run `bun run format`, `bun test`, `bun run typecheck`. Criterion: report quotes finding/asking/sourcing lines for #5; each scenario names instructions and outcome; pull log path recorded; checks pass; `git status --porcelain` clean except owned prose files.

## Docs affected

- Agent doc `skills/chart-issues/SKILL.md`: destination-check procedure + closure exemption.
- Agent doc `skills/chart-issues/assets/shapes.md`: match outcomes + destination preflight refusal.
- Human doc `docs/guide/chart.md`: plain-words handoff check + closure exemption.
- Sweep-only `docs/**` and `README.md`: searched for contradictions, owned hits corrected in the three files above, other hits reported only.

## Credentials

- No `.env` variable names in brief or design, so no `bun --env-file=.env` presence check applies. Implement seat verifies `gh auth status` (operator `ivanjuras` login) before the real destination pull; a missing login is an operator action, not a leaf code change.

## Dependencies

None. No ordering required; excluded `pull --all` work belongs to leaf pull-all-repos and this leaf uses plain `akrogon pull` per destination.

## Open limitation

Matching is a door proposal confirmed by the operator, not an automatic matcher, so a misdescribed or missed candidate still depends on operator judgment at the two checkpoints. Only the source repo and selected registered destinations are checked; an unselected repo holding the same report is out of scope by Q1-A.

## Brief/design note

No conflict found. Brief checkpoints, dedup, coincidence, source-no-exempt, verbatim intake, `sources` fan-out, conflict display, per-destination hold, and closure exemption match design Q1-A/Q2-A/Q3-A and Off-route exclusions.
