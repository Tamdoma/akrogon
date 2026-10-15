# Slot B: existing-backlog blind notes

## Q1 — 1. Pick, reason and cost

**D1. Migrate the existing logs losslessly in a normal forward commit in each repo, after the packer and readers land.** Pack closed owners and ended charts into the already chosen archive locations. Keep historical report and receipt paths as lookup keys. Preserve every source byte and member name, including duplicate logs. This removes the large plain-log footprint from the current tree while keeping the evidence available through `akrogon log`. Do not rewrite history.

**D2. Apply that migration to the live disk inventory, with an explicit reconciliation against tracked paths.** The accepted pack scans all disk logs, not just tracked logs. Akrogon currently has 61 untracked logs under closed owners and 18 under an ended chart. Four indexed open paths are absent but have byte-identical counterparts under closed. Do not silently skip those four, restore stale open folders, or drop the untracked evidence. Confirm the moved correspondence and archive the current closed copies.

**D3. Leave the nine tracked logs outside the chosen archive layout unchanged in this migration.** They total 1,128 bytes and are chart coordination records under `system-speed/slots/`, not direct check logs. The chosen pack command only accepts charts and packs their `direct/` folder. There is no accepted reader layout for a slots archive. Do not invent one or delete these records to claim that every `.log` is gone. This is an explicit, tiny exception to migrating the supported roots, not a new retention policy.

Cost: one repo-local migration operation and commit per repo, archive verification before deletion, deploying the new reader first, and some added Git objects. Ordinary `cat` and GitHub file links to the old paths no longer open the logs in the new tree. `akrogon log` is the supported read path. The retained history still contains all old plaintext blobs, so a normal full clone does not become history-free or necessarily smaller on the wire. The intake's “whole checkout at a couple hundred MB” target is not established by this change.

### Who runs it and when

**A1. Akrogon implementation leaf:** deliver and verify the packer, resolver, flaky integration, ignore updates and a bounded one-time migration entry point. The accepted `akrogon pack <chart>` handles charts only. It cannot be presented as the existing command for migrating closed owners. `completeOwner` also cannot migrate them because it returns immediately for a closed leaf (src/phase.ts:190–191). The migration entry point must call the shared verified pack function for supported closed-owner roots without replaying completion, source closing or push operations.

**A2. Operator, in the akrogon registered root, after that leaf lands:** run the migration using the new tool version, reconcile the four moved paths and preserve unrelated pending changes, verify the archive contents and reader results, then commit the scoped archive additions/plain-log removals and required ignore changes. Refresh the inventory immediately before this run. The code leaf need not pack its own owner while it is still open.

**A3. Operator, in the framework registered root, after the same tool version is installed:** perform a separate consumer migration and scoped commit. If delegated, this is a separately assigned framework maintenance task. The akrogon implementation leaf does not commit to framework. Delivering an akrogon code change alone does not alter framework's existing logs or `.gitignore`.

Open or parked owners encountered at execution time remain plain locally until normal close, following the taken policy. Removing already tracked active logs from the index would remove them from fresh clones while leaving local files intact. Do not silently do that as part of a supposedly lossless backlog migration: either retain existing tracked evidence until close, or get an explicit choice about losing its current-tree remote copy. Today's measured disk inventory has no open or parked logs in either repo, so that choice is not needed for this snapshot. The four indexed akrogon open paths are already moved evidence, not active-owner logs.

## Q1 — 2. Other options and their consequences

| Option | Current working tree and archive | Git object pack/history | Fresh clone after the commit | Reports, verify-runs.jsonl and flaky | Actor and timing |
|---|---|---|---|---|---|
| **O1. Lossless forward migration — pick** | Supported closed-owner and ended-chart plain logs become verified `evidence.tar.zst` files. Other nine tracked coordination logs stay plain. Reports and receipt records remain. | Old plaintext blobs remain reachable through old commits. New archive blobs are added. Local repacking may change physical storage but cannot discard reachable history. No pack-size reduction promised. | The latest checkout contains archives, not the migrated plaintext. An ordinary full-history clone still receives reachable old history. A shallow clone has different history semantics and is not assumed here. | Updated `akrogon log` resolves supported old paths to members. Updated flaky reads the same bytes. Raw filesystem links cease to work. Existing unresolved paths remain a separately recorded baseline gap. | Tool delivered in akrogon first, then operator runs and commits separately in each repo. |
| **O2. Remove logs from the tree without archives — reject** | Deletion gives the smallest latest log footprint, but removes normal current evidence access. No archive replaces the files. If “remove” means index-only untracking, this host still has the plaintext and the checkout footprint remains. | Old blobs remain in history in either version, so this does not erase historical Git storage. | A clone of the new tip has no logs or archives for these paths. History may permit manual recovery, but the chosen resolver does not search historical commits. Index-only removal therefore hides a problem that this host's plain-file reader can mask. | Reports retain dangling citations. Receipts still contain strings, but reading their log bytes fails. flaky reports `(log gone)` when neither plain nor archive exists. Green receipt gates can still pass because they inspect metadata, not log existence. | Would also require an explicit operator-run deletion/untracking and commit in each repo after choosing the evidence-access loss. The akrogon leaf cannot delete framework evidence. |
| **O3. Leave existing tracked logs — reject as the final outcome** | Existing plain bytes remain. New close-time packing only handles future completions, so old closed owners do not automatically shrink. Ended charts may gain status warnings until explicitly packed. | No migration archive objects are added now. Existing historical objects remain. | A current full checkout still materializes about 944.9 MiB of framework tracked logs and 18.34 MiB of akrogon tracked logs. | Existing valid plain-file readers keep working. Historical bad paths remain bad. Ignore additions do not stop already tracked files from being tracked. | No backlog run in either repo. Operator still must roll out the future ignore rules/tool. Deferring migration means accepting the existing footprint indefinitely, rather than assuming a later close will revisit it. |

O2 conflicts with retaining readily readable evidence. O3 does not address the reported existing footprint. O1 is the only listed option that improves the current checkout while retaining normal access to the evidence. None of the three removes reachable Git history without the excluded history rewrite.

## Q1 — 3. Evidence, tier, source and date

All observations below are read-only, 2026-10-15. No migration, deletion, index write, commit or push was run.

**E1. Tier 1 — operator material.** INTAKE.md records the requirement to retain evidence losslessly and the reported approximately 1 GB footprint. existing-backlog.md Question excludes history rewrite. The Taken sections of evidence-location.md and log-coverage.md define owner archives, chart/direct archives, recursive dotfile-inclusive packing, verified deletion, retry union, the reader and the accepted open-log policy. These decisions govern this recommendation. The intake's 19 MB compressed figure is for one combined tar stream, not a measurement of one archive per owner.

**E2. Tier 3 — current repository measurement.** Repo roots came from `akrogon config`. Akrogon HEAD: `f3557d8dc8a74459eefcc63dacb419332df1659e`. Framework HEAD: `28d1f011c533ef9cd30bf86c6ecb561652dc11db`.

Method: `git ls-files --stage -z -- issues`, filter paths ending `.log`, query each indexed blob size with `git cat-file --batch-check`, and independently stat current files. Group closed/open/parked by the second path component, chart direct by `issues/chart/<chart>/direct/`, everything else as other. Dotfiles and nested log paths are included. Neither repo had staged issue changes, nonzero index stages or tracked symlink logs. “Tracked bytes” below means bytes of indexed content, including absent worktree files.

| Repo | Place | Tracked files | Indexed bytes | Present tracked files | Present tracked bytes |
|---|---|---:|---:|---:|---:|
| akrogon | Closed owners | 694 | 18,663,690 | 694 | 18,663,690 |
| akrogon | Open owners | 4 | 3,920 | 0 | 0 |
| akrogon | Parked | 0 | 0 | 0 | 0 |
| akrogon | Chart direct | 36 | 561,992 | 36 | 561,992 |
| akrogon | Other | 9 | 1,128 | 9 | 1,128 |
| **akrogon total** | | **743** | **19,230,730 (18.340 MiB)** | **739** | **19,226,810** |
| framework | Closed owners | 4,460 | 988,961,655 | 4,460 | 988,961,655 |
| framework | Open owners | 0 | 0 | 0 | 0 |
| framework | Parked | 0 | 0 | 0 | 0 |
| framework | Chart direct | 2 | 1,813,202 | 2 | 1,813,202 |
| framework | Other | 0 | 0 | 0 | 0 |
| **framework total** | | **4,462** | **990,774,857 (944.877 MiB)** | **4,462** | **990,774,857** |

The tracked closed logs span 27 akrogon owners and 45 framework owners. Tracked direct logs span four akrogon charts and one framework chart.

**E3. Tier 3 — disk/index differences matter to migration.** Akrogon's full disk set has 755 closed logs / 19,567,887 bytes across 29 owners, and 54 direct logs / 2,722,698 bytes across five ended charts. This includes 61 untracked closed logs / 904,197 bytes and 18 untracked direct logs / 2,160,706 bytes. Other disk logs total ten files / 13,008 bytes, including one untracked file outside the archive scope. Framework's on-disk set equals its tracked set. Neither repository currently has `evidence.tar.zst` under issues.

All four absent indexed paths are `issues/open/merge-batch/stacked-turn/implementation/check-test-*.log`. Their current `issues/closed/merge-batch/stacked-turn/implementation/` counterparts match the indexed bytes exactly, checked by reading each index blob and comparing file bytes. Their sizes are 1,937, 846, 240 and 897 bytes. This is existing unstaged movement, not permission to reset the root checkout.

The nine other tracked logs are `issues/chart/system-speed/slots/.ask-{B,D,E}.log`, `.fc-{B,D,E}.log`, and `.r2-{B,D,E}.log`. `.ask-B.log:1` is a JSON peer-command outcome and return-file path. They total 1,128 bytes.

All six direct folders measured are ended: akrogon handoff-gaps CHART.md:19 Closed, merge-green-rate:43 Closed, overnight-recs:20 Handed off, system-flow:31 Handed off, system-speed:37 Closed, and framework merge-green-rate:43 Closed. system-flow accounts for the 18 untracked direct logs. There is no active direct log folder in this snapshot.

**E4. Tier 3 — Git storage measurement and limits.** `git count-objects -v` reported akrogon `size-pack: 10599` KiB and loose `size: 27916` KiB; framework `size-pack: 177731` KiB and loose `size: 134160` KiB. Those are whole-repository local object-storage figures, not log-only sizes or network-transfer measurements. Framework's packed objects alone are about 173.6 MiB before migration. A forward commit retains the previous tip as an ancestor, so the old trees and their log blobs remain reachable. Adding archives cannot be described as removing those historical blobs. No clone, garbage collection or archive-size benchmark was performed in this pass, and no post-migration total-size claim is established.

**E5. Tier 3 — real citations and code readers.** Framework `issues/closed/analytics-setup/lookup-tools-webfetch/review-B.md:160–165` cites six files in `merge-evidence-295532cc/`, including contracts.log and selftest.log. `issues/closed/flaky-tests/flaky-test-fixes/review-B.md:19` cites an implementation/check-cheap log with a line number. Akrogon `issues/chart/system-speed/direct/review-B-1.md:20–22` cites four check logs, including unsuccessful setup runs. Preserve member names and bytes so those citations retain their meaning through the resolver, with relative paths resolved from their documented holder directory.

src/verify.ts:27 stores each command's log path, :36–46 reads verify-runs.jsonl, and :174–187 records completed runs. src/verify.ts:63–82 checks green receipt metadata without opening log files. src/flaky.ts:10–16 currently reads plain files at the exact recorded path or its open-to-closed substitution. :20–35 opens a prior red log when a later green run matches its tree/command. The new shared archive resolver must be deployed before old plain logs disappear. Merely preserving verify-runs.jsonl is not preserving flaky's evidence access.

Current receipt-path baseline, measured over every command.log in each repo's verify-runs.jsonl using today's exact/open-to-closed search:

| Repo | References (all unique) | Exact file exists | Open-to-closed file exists | Neither exists |
|---|---:|---:|---:|---:|
| akrogon | 54 | 21 | 21 | 12 |
| framework | 77 | 1 | 75 | 1 |

These are path-reference counts, not counts of actual flaky transitions. The twelve akrogon unresolved references use `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-akro-2a/system-flow/direct/...`, without an `/issues/chart/` component. All twelve basenames exist in the current system-flow direct folder, but basename equality alone is not proof that an automatic alias is safe. A sample occurs on issues/verify-runs.jsonl:8. Framework's unmatched reference at :67 uses `wt-fw-2a/system-flow/direct/check-verify-1792049043778-2991388.log`, and no file with that basename exists anywhere under its current issues folder. Packing does not fix those already bad references. The chosen resolver's normal checkout-root remapping also does not inherently define these old non-issues paths.

**E6. Tier 3 — rollout does not happen automatically.** src/init.ts:67–76 only writes ignore additions when init runs. Neither current root .gitignore contains the chosen new open/parked/direct log rules. src/phase.ts:190–191 skips already closed leaves. src/sync.ts:140–165 collects changed, deleted and untracked issue records and stages/commits them broadly; it is not a narrowly scoped migration commit helper. src/sync.ts:38–42 refuses staged non-issue paths such as .gitignore. Therefore the rollout needs an explicit repo-local ignore update and scoped commit plan, not simply “run sync.”

## Q1 — 4. Pitfalls and what removes them

- **R1. Calling a smaller working tree a smaller Git history.** Report current-tree log savings separately from object-pack size and full-clone transfer. Keep history rewrite excluded. Do not promise the intake's whole-repository size target.
- **R2. Losing evidence through a tracked-only inventory or silent missing-file skip.** Reconcile indexed paths against the live files before deletion. Include every disk log in supported archive roots. Treat the four proven moves explicitly. A genuinely absent tracked log needs recovery from its indexed/history bytes or a reported blocker, not omission from a “lossless” result.
- **R3. Removing bytes before a reader can reach them.** Deploy the resolver/flaky changes first. For every migrated source, verify the same member bytes through the installed reader before committing its plain-file removal. Check report-relative and recorded absolute paths, and distinguish baseline unresolved paths from regressions. Keep receipt and report contents intact unless a separately agreed path repair is needed.
- **R4. Treating ignore rules as migration.** Install the rules in both consumer roots. They affect new untracked logs, not existing tracked entries. Review the actual Git diff showing archive additions and migrated plaintext removals. Archive additions must not be ignored.
- **R5. Accidentally rerunning lifecycle completion or crossing repo ownership.** The migration entry point only archives selected supported roots. It must not call phase, close sources, or rename already closed owners. The operator performs framework's migration separately after tool delivery. Root-local unrelated changes are neither reset nor swept into the migration commit.
- **R6. Reintroducing files from old worktrees or retrying destructively.** Use the accepted close/publication guards and archive-plus-plain union. Reinventory before each per-repo run, verify all members before removing matching sources, preserve old archive members on retry, and leave no success-shaped partial migration. A fresh checkout inspection of the committed result must use the new reader without relying on this host's leftover plaintext.
- **R7. Expanding a bulk .log cleanup beyond the selected layouts.** Explicitly preserve the nine tiny tracked slots records and the unrelated untracked slots log. Do not extend `akrogon pack <chart>` to arbitrary folders, invent a slots archive, or delete coordination evidence in this leaf.

## Q1 — 5. Additional question

**Q2. Should this migration also repair historical receipt paths that already fail today?** My pick is to preserve all currently readable paths, record the 12 akrogon and 1 framework baseline failures, and keep historical path repair separate unless the operator explicitly includes it. A requirement that every historical reference resolve would need an explicit proven mapping for the old non-issues paths and a recovery source for framework's missing log before anyone can claim that outcome. The migration can preserve today's bytes losslessly without pretending those older gaps were repaired.
