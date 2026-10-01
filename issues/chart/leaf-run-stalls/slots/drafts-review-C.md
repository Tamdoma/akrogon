# Draft review C (disagreements only)

Read 2026-10-01. `AK` = /home/ivan/Work/infra/akrogon. Draft paths are relative to the drafts folder.

## Blocks handoff

D1. seat-exit-rules cites a probe file that does not exist. `seat-exit-rules/design.md:25` says the spawn and failed result were "run for real at charting: slots/probe-pi-retry.md, cases V2 and V3". `issues/chart/leaf-run-stalls/slots/` has no such file, and `~/.pi/agent/settings.json` still has no `retry` key. provider-death Taken requires "Probes before handoff: V1, V2 (rerun on dirty, committed and external-write cases), V3" (`forks/provider-death.md:53`). `AK/skills/chart-issues/SKILL.md:53` requires the real call recorded in the fork. Criterion 2's "both transcript paths" and "error text in the failed result" rest on V3.

D2. Two drafts break the rule that chart-audit-rules adds. Rule 1 refuses a criterion citing a command that is neither in `checks` nor a leaf-added test (`chart-audit-rules/brief.md:5`). `chart-audit-rules/brief.md:16` cites `git diff`. `seat-exit-rules/brief.md:15` cites `grep -rn`. A review seat applying the new rule refuses both. Drop both: criterion 4 repeats criterion 2 ("no count, size or duration trigger"), and D3 covers the grep.

D3. `seat-exit-rules/brief.md:15` already passes and proves nothing. `grep -rn "modulo\|pre-existing" skills/` prints no line on current main. The new rule text itself says "pre-existing" (`brief.md:5`), so after the change the grep prints the rule and the criterion becomes a judgment call.

D4. Rule 1 as drafted also refuses criteria the standing design asks for. `AK/skills/chart-issues/assets/standing-design.md:9-10` allows end to end evidence, a real outside call and a live run as a criterion's proof. None of those is a `checks` command or a leaf-added test. The fork's reason is that a sibling merge can turn a repo-wide command red (`forks/red-criterion.md:35`). The shapes.md wording should limit the refusal to repo-wide verification commands, or state that leaf-run evidence counts. Otherwise the audit refuses every live-run leaf.

## Criteria a review seat would dispute

D5. `chart-audit-rules/brief.md:13` asks `shapes.md:132` to state all of rule 1, "including the prerequisite route ... and the audit refusal". Line 132 is a one-line placeholder inside the brief template (`1. <concrete check executable inside this leaf's ownership>`). The route and refusal belong in the audit paragraph (`shapes.md:170`) only. The placeholder can name the two allowed proof kinds. As written the criterion forces the same rule into two places.

D6. `chart-audit-rules/brief.md:6,14` says "the dependent's brief names the output it consumes", but no owned surface gives a brief or design a place for it. The template's only dependency slot is `shapes.md:145` ("necessary dependencies", in design.md), and `design.md:29` owns only lines 132 and 170. Either own line 145 too, or word rule 2 as an audit question the door answers, with no new brief text.

D7. seat-exit rule 1 conflicts with two existing lines it does not own. `AK/skills/implement-issue/worker-protocol.md:23` says "A red full suite becomes one more sub-brief". `standing-design.md:12` lets a slow-run leaf fix another leaf's bug in-branch. Both allow repair outside the leaf's owned surfaces. "Cannot pass within the leaf's owned surfaces" (`brief.md:5`) would send those cases to `failed`. The fork wording is binding, so the brief should say the rule applies after those permitted repairs, or own line 23.

D8. `failed-stop-guard/brief.md:10` over-specifies the test. Every P in `routing.failed.next` (7) times slot (2) times cause (2) is 28 CLI fixture runs for a guard that branches on none of them (`design.md:8`: phase is `failed` and `explicitSlot` is set). `AK/skills/implement-issue/SKILL.md:42` asks for the smallest test set. One seat phase per slot, plus the `merge --verdict` case, plus one `attempts` case proves the same. Criterion 2 already covers the incident.

D9. All three briefs list the configured `checks` as three commands. `AK/issues/config.yaml` has four: `test_changed` is also blocking. Write "every configured `checks` command" and name none.

## Anchors

D10. `failed-stop-guard/design.md:23` says the guard goes "before the slot check at line 199". To meet "stderr contains the sentence" for an illegal target it must also be decided whether it sits before the legal-move check at `src/phase.ts:185`. Placed after 185, `phase <slug> merged --slot B` on a failed leaf returns "Illegal move", not the new sentence. Criterion 1 only lists active phases, so either placement passes. State the placement so a reviewer does not dispute it.

All other anchors check out: `shapes.md:132,170,172`, `SKILL.md:41`, `implement-issue/SKILL.md:31-32`, `worker-protocol.md:17`, `src/phase.ts:198,199`, the four named recovery tests (`tests/phase.test.ts:996,1111,1134`), `docs/guide/problems.md:16`, `docs/guide/phases.md:73`, and the three `state.yaml` files against the template (`shapes.md:150-158`).

Not verified: I did not run the fixture sequence in `failed-stop-guard/design.md:20`. I did not read the B slot that it cites.
