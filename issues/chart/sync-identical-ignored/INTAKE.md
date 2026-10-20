# Intake: sync-identical-ignored

## Scope

`akrogon sync` and self-update move the operator checkout when an ignored local file equals the incoming tracked file, and still refuse when content, type or mode differs.

Part of a six-chart pass opened 2026-10-18 over seeds #102-#108; sibling charts: paid-proof-bounds, merge-stacks, owner-completion, state-unknown-keys, criterion-outcomes, sync-identical-ignored. No dependency between them.

## Provenance

- GitHub: Tamdoma/akrogon#106
- Operator: 2026-10-18 chart-issues invocation
- Operator: 2026-10-18 split round answer

## Source: operator 2026-10-18 invocation

> Let's check all of the issues that were pulled and chart them out. Use slot b and c consultants that are already active. We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code.

## Source: operator 2026-10-18 split round

> 1a | 2a | 3a | 4a

Round answered 2026-10-18: 1a fold #103 and #108 into one chart; 2a order #107, #104, #103+#108, #102, #105, #106; 3a leave the two flaky tests out; 4a no framework replay-resume chart now.

## Source: Tamdoma/akrogon#106

# akrogon sync refuses to move the operator checkout when ignored local files are byte-identical to the incoming tracked files

Source: Tamdoma/akrogon#106
URL: https://github.com/Tamdoma/akrogon/issues/106

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

`akrogon next --all` in the framework operator checkout (`/home/ivan/Work/infra/tamdoma/framework`, branch main) printed `self-update failed: Cannot sync over ignored operator paths:` followed by 28 paths under `.claude/skills/write-satellite-publish-cadence/test/fixtures/satellite-network/drip-cadence-fixture/.spec/workspaces/seo/satellite-network/fixture-drip-2026-q2/deployed/`. Local main sits at `00ea78f4c`, 61 commits behind origin/main (`5c32d6c4b`).

All 28 local files are ignored by the root `.gitignore:4` (`.spec/`), date from 2026-10-05, and are byte-identical to the blobs origin/main now tracks (checked with `git show origin/main:<path> | cmp -s - <path>`: same=28 diff=0). Merged leaf cadence-inputs commit `3f1f6ce46` force-tracked these fixture files under the ignored `.spec/` pattern.

## Location

akrogon `src/sync.ts:94-122` (release `9e0df5b049fd`), reached from the self-update step of `akrogon next`.

## Reproduction

1. Have an ignored file at path P in the operator checkout.
2. Merge a commit to the default branch that tracks P with the same content.
3. Run any akrogon command that self-updates, or `akrogon sync`.

The sync throws on every run until the operator deletes P.

## Expected behavior

A local ignored file whose content already equals the incoming tracked blob is not a collision, because moving the checkout loses nothing. Only differing content, or an ignored file where a directory is incoming (or the reverse), should stop the sync.

## Urgency

The operator checkout stays behind origin/main. Merges still land, since merges use their own path. The operator's view of skills, hooks and `issues/` under main lags until fixed. Workaround: delete the identical ignored files, then run `akrogon sync`.

## Suspected cause

Agent view. `sync.ts:115-121` marks every ignored path as a collision when it, or one of its ancestors, is in the incoming tree, without comparing content. The main condition is the content-blind check. The contributing condition is a merged commit tracking files under an ignored directory (`.spec/`), so stale copies of generated fixtures exist locally as ignored files.

Files read: `~/.akrogon/current/src/sync.ts:94-135` (installed release copy, resolved to `~/.akrogon/releases/9e0df5b049fdcbe71bdd85d55e28d2955f9c2595`, not the destination source checkout), framework `.gitignore:4`, `git show --stat 3f1f6ce46`.

Not inspected: whether the Git move step itself would fail on identical ignored files. Would disprove: a content-equal path that Git still refuses to overwrite.

Related reports: none found (Tamdoma/akrogon, queries "ignored operator paths" and "sync ignored", all states, limit 5-8, plus the filing account's reports since 2026-10-16).

## Agent findings

Opening map merged with attribution: issues/chart/paid-proof-bounds/slots/map-merged.md, sections for #106.
