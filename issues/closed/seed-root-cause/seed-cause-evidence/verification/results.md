# Verification: seed-cause-evidence

Verified code head: `57bbe3c5c3f4822a26cacaaad0313a158e7efeac`. B's replacement proof, 2026-10-05.

## Method and actual boundary

B followed the final lane skill on the preserved reporter inputs, inspected the named destination-source functions and one-hop contracts, judged recorded lookup bodies, authored reports and final outcomes, and executed substituted gh calls. These are local Codex B model-authored replays, not fresh independent-agent runs. Final-output.txt preserves B's authored outcome after reading the actual create result; it is not gh output.

Evidence root: `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/seed-B-proof-7v0irj41`. Per-case evidence is under `capture/<case>/`: calls.txt, create-body.md, create-count and final-output.txt. Intact six-case runs also preserve lookup outputs/statuses and the actual create status/output. Canned historical lists are copied from prior recorded fixtures. The closed #40 body is explicitly a hand-written edge fixture, not verified live history.

The existing reliable `/tmp/seed-replay-kCKg/bin/gh` was reused. Every create receives `--body-file -` and the literal authored body on stdin. The submitted capture was compared byte for byte with the authored body. This checks transport, not prose wording. All ten new runs have nonempty captures and exactly one substituted create. No new helper script or project test was created. No live issue was created.

## Intact cases

| Case | Actual submitted bytes | Outcome |
|---|---:|---|
| r124 | 2,927 | Six complete sections; refusal/selection facts in Observation, checkManifestRule full-set/supersession reasoning in Suspected cause; related #123 contextual, noise excluded; no root line |
| r125 | 3,031 | Six complete sections; links open #124 sharing record blocking; original #124 body does not cover the combined direct-mode-invisibility condition and its cases; root line prints after the second historical report, and footer names it |
| r126 | 2,701 | Six complete sections; title is “Motion coverage CLI exits 1 and reports findings on working drawer and accordions”; parser/driver explanation stays in Suspected cause; unrelated same-session #124/#125 and keyword noise excluded; no root line |
| closedprec | 2,025 | Links CLOSED #40 fixture with historical-evidence reason and open #124; no root line because #124 covers this narrow report |
| closed-only | 2,947 | CLOSED #40 fixture linked as evidence; no open report sharing the condition exists, so no root line; closed work is not treated as an open sibling |
| causestmt | 2,366 | Reporter explicitly states a suspected shared early-selection cause; title marks it suspected; canned world has only open #124/#127 symptom reports, no #128/#125 cause coverage; other trigger conditions hold, but the cause-statement guard suppresses the line |
| faillist | 1,888 | Each required lookup fails, is retried once with a visible warning, then one complete report is submitted; body and final outcome disclose command/error/exit and lookup failure; no root line |

r125 root action:

```text
/seed-issue Suspected root cause: phase progression requires blueprint-mode dispatch bookkeeping despite checked deliverables. Seen in Tamdoma/tamdoma-framework#124, Tamdoma/tamdoma-framework#125. Based on inspected close/filter/pruning code and reporter statements; consumer state and logs not inspected.
Next: none intake submitted; root-report line printed above
```

The historical #125 identity represents the report being replayed. The returned substituted/repo/issues/42 URL is a fixture, not the identity of a live newly created report. This fixture limitation applies to every replay URL.

## Deliberate breaks

B applied instruction variants to the same inputs and canned worlds, recording separate calls, stdin and authored final outcomes. These are model-judged functional comparisons, not exact-prose tests or independent harness invocations.

- break-root-line removes the print rule: the same qualifying r125 world loses the root action, failing C8. Its intact counterpart now actually prints the action, unlike round 2.
- break-cause-guard removes only the cause-statement exclusion: the isolated cause-statement input emits a root action, failing C8. Existing cause coverage no longer masks this guard.
- break-lookups removes the lookup rule/commands: no list call occurs and the body acknowledges no search, failing C5. The intact r124 makes both required list calls.

Variants are preserved under `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/seed-B-proof-7v0irj41/variants/`, with judgments in variant-judgments.md. Earlier removal of only the discovery sentence did not change behavior because the files-read placeholder also prompted inspection. That limitation is retained rather than claimed as a failed scenario.

## Other named criteria and retained proof

The text repair only separates observed facts from cause reasoning. It adds no lookup, discovery, copy-provenance, routing or submission behavior. Previously valid evidence for these unaffected paths remains:

- C2: `/tmp/seed-replay-kCKg/capture/s6-thin/create-body.md` posts no supported hypothesis plus the evidence gap; no root line.
- C3: s7-contradicted's submitted body explicitly records the infinite-loop suspicion as contradicted by bounded source loops.
- C4: B's source reads for repaired cases inspect advance-phase.ts, hook-state-tracking.ts, checkpoint controls, motion-vocabulary/index.js, check-review-summary.ts and the named blueprint. Reads inspect the named source/caller/shared contracts, not reproduction commands, installs or edits. No broader exploration was performed for these proofs.
- C5: new closed cases and unrelated-match exclusions prove linking by body; author searches retain @me, explicit 2026-10-03 window, all states and finite limits. Historical author results rebuild siblings without relying on session memory.
- C6: new faillist gives one submitted complete body and an error-bearing final outcome, distinct from r126's successful empty-related result and s9-failcreate's failure exit.
- C7/C10: the new intact calls are list/list/create (plus two list retries on faillist), with plain owner/repo#number references in actual submitted stdin. No linked-issue mutation occurs.
- C8: new r125 prints with corrected footer; new r124/r126 suppress; isolated causestmt suppresses; faillist suppresses. Original s5-post128 used real gh list/view, links open #128 and prints none. This retained read-only proof supplies the design's live-read scenario. Original s9-failcreate records one failed create with failure outcome/no retry/no root line. Original r127 suppression remains within the original proof limits.
- C1 copy provenance: original s10-vendor flags the inspected installed copy and unverified destination link. Destination-source replays use the inspected framework origin/routing. Related bodies flow verbatim into seeds via unchanged src/pull.ts.
- C9: corrected r126 title describes the observed failure, omitting parser diagnosis. causestmt is the explicit suspected-cause title case.
- C11: final skill 82 lines, 6,451 bytes (about 1,613 tokens by the design estimate); 19 meaning groups, including five separate new placeholders; gh only added dependency. C12: create.md still describes the section, links, root action and bounded discovery, without invented missing details.

## Checks

At head 57bbe3c: format and typecheck exit 0; changed-test check exits 0 with no affected tests; full test check passes 415/415 with 4,566 assertions (12.19 seconds). Full log: `/tmp/akrogon-1000/seed-cause-evidence-761bcf91ca8a/tmp.LovAqt6F8G`. No merge checks were run.

## Superseded evidence and limits

Round-1 r126 is truncated and s8 creates twice; neither is passing proof. All six primary round-2 create-body captures are empty; their saved authored drafts are not submitted-body proof. Their r124 separation and r126 parser-title claims were also incorrect. These artifacts remain untouched for audit and are replaced by the new captures above.

Original pi fresh-agent runs and these Codex B local replays are the exercised harnesses. Other harnesses and cross-org views remain unproven. Root condition/coverage classification is model judgment and may vary across runs; the new r125 records the specific combined condition and the evidence supporting its classification. This proof validates the demonstrated executions, not guaranteed compliance by every model.
