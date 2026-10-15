# Slot B: evidence-location rebuttal

## F1. Framework's receipt count is misstated

The Evidence line says “77 resolve exact, 75 via open→closed, 1 by neither.” My measurement was **77 total references: 1 exact, 75 via open→closed, 1 unresolved**. These categories sum to 77, not 153. This matters because nearly every retained locator already needs relocation handling. Evidence: B's read-only receipt/path measurement on 2026-10-15, recorded in evidence-B.md F2.

## F2. Closed-owner evidence also has agent readers

I disagree with “After close only flaky and a person read them.” Later charting, review and maintenance seats can follow historical evidence. `skills/learn-issues/SKILL.md:14-22` directs a seat to inspect historical failure evidence, and `skills/check-issue/SKILL.md:39` requires following relevant evidence and contracts. In this exchange B itself read closed framework artifacts, including `issues/closed/test-scratch/browser-socket-runtime/review-B.md:69`, which cites logs to judge proof chronology.

Correction: after closure, both people and later seats need full-log access through the resolver. Do not remove instructions for agent access merely because the original owner has finished.

## F3. completeOwner is not an enforced last writer

P5 states “completeOwner is the last writer.” It moves the owner directory (`src/phase.ts:223-224`), but does not seal evidence writes. `run-check` accepts an explicit holder (`src/run-check.ts:126-127`) and later creates the target directory and copies the log (`:207-209`), without a closed-owner refusal. A writer holding an old open-directory target can recreate it after the rename. Looking only for plain logs under `issues/closed` misses that case.

Correction: describe closure as the proposed archive publication point, not a proven last-writer invariant. Specify how an already-running writer and later explicit-holder writes remain discoverable without losing their logs. This is the publication/coverage question raised in my original R6, not a request to archive other log types.

## F4. “Written once” does not settle interrupted archive publication

D-shared answers my coordination concern with “written once at close, never rewritten.” That is a useful steady-state policy, but an interrupted close can retry. The proposed sequence verifies the archive, deletes plain sources, then reaches the existing owner rename (`src/phase.ts:223-224`). Interruption between those steps leaves an archive plus only some or none of the original files. A retry must not replace the complete archive with one made from the remaining subset.

Correction: make a verified archive recoverable across retry, including its member inventory and the pending owner move. I withdraw routine archive rewrites as an objection to the stated write-once design. The retry requirement remains.

## F5. External placement is not itself evidence loss or junk

O3's excerpt is lossy **only if it replaces the retained full object**. The proposed option retains full logs externally, so its actual unresolved problem is durable retrieval and backup, not compression loss. Nor does a directory of required evidence become junk merely because it lives under `~/.akrogon`. My original objection was that no separate durability contract had been established. The merged C observation that this host has only GitHub backup makes that objection concrete.

Correction: reject the current external-store option because a repository clone/backup would omit the full evidence and no replacement backup is established. Do not claim external storage inherently violates losslessness or the clean-store rule.

## Q-commit

Keep full logs committed while owners are open or failed. Do not ignore their only durable copies.
The reported 23 MiB owner archives versus 117 MiB per-log files changes my preference to O1, subject to F3/F4 publication safety.
With O1, commit plain logs until the verified archive replaces them; closure must not be the first backup.
Accept the historical plain blobs and report tree savings separately. This preserves the base-red-rule.md:27 keep-logs lock for owners that never close.
