# Final shape: existing-backlog (operator `1a | 2a`, 2026-10-15)

Builds on the Taken sections of evidence-location.md and log-coverage.md in /home/ivan/Work/infra/akrogon/issues/chart/check-evidence/forks/.

1. `akrogon pack <folder>...` accepts a closed owner (`issues/closed/<owner>`) or a chart (packs its `direct/`), one or more per call. Any other folder is refused naming the accepted forms. Open and parked owners are refused.
2. Packing a closed owner uses the shared pack: every `*.log` under it on disk, recursive, dotfiles included, tracked or not; byte-equal read-back of every member before deleting its plain file; retry union; `.closing` while it runs, removed on success.
3. Before packing a closed owner, the pack refuses that owner when a tracked log under it is modified on disk or missing, and names each path. Untracked logs are packed and listed apart in its output. Output per folder: members packed, of them tracked, of them untracked, plain files deleted.
4. Plain `akrogon status` lists each closed owner and each ended chart whose folder still holds a plain `*.log`, naming `akrogon pack <folder>`. This list is both the migration worklist and the lasting net.
5. Migration runs per repo on its main checkout after the leaf is merged and akrogon is installed there, while no chart door or learn pass is open on that repo: record `akrogon flaky` output; run `akrogon pack` on every folder status lists; compare `akrogon flaky` output; read a few cited paths through `akrogon log`; stage only the packed folders (`git add -A -- <folders>`) and the `.gitignore` lines from `akrogon init`, and commit and push them, leaving unrelated pending work unstaged. akrogon first, framework second.
6. The 4 tracked akrogon open paths under `issues/open/merge-batch/stacked-turn/implementation/` are moved files whose byte-identical copies sit under closed; the akrogon run stages their deletion with the migration.
7. The akrogon run deletes the 9 files `issues/chart/system-speed/slots/.{ask,fc,r2}-{B,D,E}.log` and stages that deletion in the same commit, listed apart from the evidence migration.
8. The 13 receipt paths that resolve to nothing today (akrogon 12, framework 1) are left unedited and recorded as a known gap.
9. Who runs step 5: the chart door, as a pending step on each repo's main once the leaf is merged and installed.
