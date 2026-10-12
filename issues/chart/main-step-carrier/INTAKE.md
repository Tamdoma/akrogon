# Intake: main-step-carrier

## Scope
Destination akrogon. One chart: a chart decision that needs an edit on main (config) must not be dropped after handoff. Includes the framework instance (switch `test_changed` to the existing selector) as a door step on framework main.

## Provenance
- GitHub: Tamdoma/akrogon#87
- Operator: 2026-10-12 chart open, "I just pulled another issue. Look at the systemic problem and come up with the simplest solution without adding more complexity. Consukt with slot b which is already active in this tab."

## Source: Tamdoma/akrogon#87
# Framework test_changed still runs no changed tests 9 days after its selector merged: the chart left the config switch as an off-route operator step that nothing tracked (suspected), so backlink-run-identity failed only at merge

Source: Tamdoma/akrogon#87
URL: https://github.com/Tamdoma/akrogon/issues/87

Unverified intake.

## Observation
On 2026-10-12, framework leaf `backlink-run-identity` passed implement, both reviews and check.repair. Its merge `verify` (`framework:verify`) was then ejected at 09:41 UTC with the leaf itself as culprit:

- `test:backlink-canonical-pull-fixture`: `endpoint competitor-context contract missing data/ahrefs-anchors-pull@competitor:<slug>`
- `test:backlink-toxicity-spam-kits`: `toxicity subroutine missing output path: seo/<site-slug>/backlink-pulls/<timestamp>/raw/toxic-links.csv`

The leaf's commit `6fe2049d7` respelled `<slug>` to `[slug]` in declarations under `.claude/skills/test-audit-backlink-portfolio/`. Both failing verifiers live in that same folder and still expected the old spelling. No pre-merge check runs them. The miss cost one fix round (about 14 min), a second review, a second repair and a second merge, which took the leaf from about 25 min to about 60 min.

The configured changed-tests check does not select tests. Framework `issues/config.yaml`:

```yaml
test_changed: ": \"${AKROGON_BASE:?AKROGON_BASE is required}\" && bun run hooks:parity && bun run contracts:verify"
```

This line is unchanged since `init akrogon` (`1041e492d`, 2026-09-12). It asserts `AKROGON_BASE` and then reruns parity and contracts, which are already their own `checks` entries.

A real selector exists and was never wired in. `bun run test:changed` (`.claude/workflow/scripts/run-test-changed.ts`) has existed since `4522c6aa7` (2026-10-03). It diffs `$AKROGON_BASE` and selects `framework:verify` leaf scripts by skill-folder ownership. Both failing verifiers' commands contain `.claude/skills/test-audit-backlink-portfolio/`, and the leaf changed 28 files in that folder, so the selector would have picked both.

Review-B's F5 in this leaf now moves the two tests into `framework:verify:cheap`. That fixes this leaf only.

## Location
- akrogon chart and handoff: how a chart's "operator step on main" leaves the system after handoff (`skills/chart-issues`).
- akrogon check contract: `checks.test_changed` is the only command workers run as work lands (`skills/implement-issue/brief-template.md:37`, `skills/implement-issue/SKILL.md:57`), and `skills/init-akrogon/SKILL.md:47` asks for "a verified `checks.test_changed`".
- Consumer: Tamdoma/framework `issues/config.yaml`, `merge_covers`, `package.json` `test:changed`.

## Reproduction
History, in order:

1. **2026-09-12** `1041e492d` init akrogon writes the stub `test_changed` above.
2. **2026-10-01** akrogon's own charts find the stub and route it out:
   - `issues/chart/test-time-and-temp/slots/map-merged.md:15`, F4: "`test` and `test_changed` both run `hooks:parity && contracts:verify` … so the leaf's own tests never run as 'changed tests'". Marked "Framework-owned".
   - `issues/chart/check-reruns/CHART.md:15` puts "Framework config cleanup (duplicate parity/contracts under several `checks` names)" off route as "framework operator decisions, not akrogon code".
3. **2026-10-03** framework chart `verify-gate` takes fork area-selection Q1 1a: "`test_changed` selects area suites by folder ownership" (`issues/chart/verify-gate/forks/area-selection.md:22`). The same chart lists "Editing issues/config.yaml in a leaf (operator step on main)" under Off route (`CHART.md`). `gate-composition.md:22` and `outcome-inventory.md:21` repeat "config.yaml edits are an operator step on main."
4. **2026-10-03** leaf `verify-gate/area-selector` builds the selector. Its brief cites the defect: "#115: `test_changed` asserts `AKROGON_BASE` but selects no area suite, so workers only see their own area's breaks at merge" (`issues/closed/verify-gate/area-selector/brief.md:7`). Review-B runs the stub `test_changed` and records "exit 0" (`review-B.md:86,111`). It closes with "No tracked outstanding changes or operator actions remain" (`review-B.md:205`). The leaf merged.
5. **2026-10-10** `77ad6b990` adds `merge_covers: [parity, contracts, test, test_changed, selftest]`, so the stub is now formally "covered" by merge.
6. **2026-10-11** `c45d6693f` adds `cheap` to `checks`. `test_changed` is still the stub.
7. **2026-10-12** backlink-run-identity fails at merge on tests the selector would have chosen.

Frequency: any framework leaf whose change breaks a `framework:verify` script outside `framework:verify:cheap` and selftest finds out only at merge. That is most `test:*` scripts (156 `test:*` scripts in `package.json`). akrogon#86 (playback-probe flake surfacing only at merge) is the same route.

## Expected behavior
A chart decision that needs a config change on main should either reach main or stay visibly open. A leaf that delivers the machinery for that decision should not report "no operator actions remain" while the config still points at the stub. A configured `test_changed` that ignores `AKROGON_BASE` should not count as a verified changed-tests check.

## Urgency
Each miss costs about 20-35 min per leaf (merge verify about 7 min, plus a fix round, plus re-review and re-merge), and it can repeat on every leaf. Workers proving their work "as work lands" get only parity and contracts, so their changed-tests proof is empty.

Workaround: the operator changes framework `issues/config.yaml` to `test_changed: bun run test:changed` on main, ideally between leaves. Per-leaf F5-style moves into `framework:verify:cheap` cover one leaf at a time.

## Suspected cause
Agent's view, supported by the history above.

- **Main condition:** the config switch was decided in a chart and then marked "Off route: operator step on main". akrogon has no carrier for that step after handoff. There is no leaf, no handoff checklist line, no completion-owner action, no notice and no status entry, so it was dropped. The delivering leaf's review checked its own diff and reported no operator actions, because the brief never named the config step as one.
- **Contributing:**
  - `merge_covers` lets a stub be listed as merge-covered, which hides that it never selected anything.
  - The name `test_changed` reads as coverage.
  - Nothing verifies after init that `test_changed` depends on `AKROGON_BASE` beyond asserting it is set.
  - akrogon's own charts (step 2) saw the stub and routed it off route to the framework operator, the same drop point.
- **Pattern:** decisions that need a human config step on main fall between "leaf may not edit config" and "operator never told".

Files read:
- framework: `issues/config.yaml` (and history of `1041e492d`, `77ad6b990`, `c45d6693f`), `package.json` scripts, `.claude/workflow/scripts/run-test-changed.ts:1-60`, `issues/chart/verify-gate/{CHART.md,INTAKE.md,forks/*.md}`, `issues/closed/verify-gate/area-selector/{brief.md,review-B.md}`, `issues/open/audit-dispatch-contracts/backlink-run-identity/{review-B.md,implementation/report.md,implementation/check-verify-1791798446536-1645652.log}`, `issues/merge-attempts.jsonl`, `issues/log.jsonl`.
- akrogon: grep of `skills/` and `issues/chart/` for `test_changed`/`AKROGON_BASE`, `issues/chart/check-reruns/CHART.md`, `issues/chart/test-time-and-temp/{CHART.md,slots/map-merged.md,slots/map-A.md}`.

Not inspected / would disprove:
- Whether any akrogon handoff or chart rule already turns off-route operator steps into tracked items. I did not read `skills/chart-issues/SKILL.md` end to end.
- Whether framework issue #115 was closed with the config step pending.
- Whether `test:changed` currently passes on a real leaf base and how long it runs for leaves that touch skills with browser tests. Not run.
- A git log of `issues/config.yaml` that shows a later wiring attempt reverted would weaken the "never done" claim. None was seen in `git log -G'test_changed|test:changed'`.

Related reports:
- Tamdoma/akrogon#86: a changed test that fails under load surfaced only at merge. Same late-detection route.
- Tamdoma/akrogon#48: check evidence is prose, not a record tied to a command. The stub's "exit 0" was accepted as changed-tests proof.
- Tamdoma/akrogon#52: human/external prerequisites surfacing mid-run. Adjacent "operator step" handling.
- Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-10-10` (limit 30), "operator step off route" (limit 8), "test_changed" (limit 8).

## Source: operator 2026-10-12 chart open
I just pulled another issue. Look at the systemic problem and come up with the simplest solution without adding more complexity. Consukt with slot b which is already active in this tab.

## Agent findings
- Off route means excluded from the outcome (skills/chart-issues/assets/shapes.md:35); leaves may not touch `issues/` (shapes.md:284). A needed config edit therefore lands in Off route and nothing carries it. (A,B)
- framework origin/main issues/config.yaml:12 still holds the stub; framework #115 closed 2026-10-03T16:55:04Z. (A,B)
- `selectScripts` from framework run-test-changed.ts on the failing leaf's diff (base 2e5b2aaf3 to 6fe2049d7, 28 files) selects 22 scripts including test:backlink-canonical-pull-fixture and test:backlink-toxicity-spam-kits, 0 unowned. Selection only, not an end-to-end run. (A, 2026-10-12; B scope note)
- Maps: slots/map-A.md, slots/map-B.md, slots/map-merged.md, slots/map-rebuttal-B.md.
