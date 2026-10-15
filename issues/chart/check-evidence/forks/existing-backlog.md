# Existing backlog

## Question
Q1. What happens to the 944.9 MiB of logs already tracked in framework (and about 18 MiB in akrogon): migrate them losslessly to the chosen form going forward, remove them from the tree, or leave them? History rewrite is out (A,B,C,D).

### Carries
- [Evidence location](evidence-location.md) (taken): one `evidence.tar.zst` per owner at close; open and parked logs ignored; `akrogon log <path>` reads plain or packed.
- [Log coverage](log-coverage.md) (taken): `akrogon pack <chart>` for chart direct logs; all kept output through run-check.
- Operator, worktree-cleanup Round 2 answer 5, verbatim: "I want all folders to be clean of junk and leftover files".

## Findings
- Notes 2026-10-15: [merged](../slots/backlog-merged.md), rebuttals `backlog-rebuttal-{B,C}.md` (B codex, C pi).
- Tracked logs at HEAD: akrogon 743 (closed 694 in 27 owners, open 4, chart direct 36 in 4 charts, slots 9); framework 4,462 under issues/ (closed 4,460 in 45 owners, chart direct 2) plus 3 test fixtures outside issues/ (B,C).
- akrogon disk extras: 61 untracked logs in closed owners (904,197 bytes), 18 untracked in system-flow/direct (2,160,706 bytes); the 4 tracked open paths are moved, byte-identical copies now under closed (B).
- Per-owner packed, tracked subset: framework 23.43 MiB over 46 groups, 110 s; akrogon 1.18 MiB over 31 groups (C). The full akrogon disk set has 34 roots (B).
- History keeps framework's 3,965 log blobs (115.7 MiB of the pack); migration adds about 23 MiB of archives; checkouts drop about 921 MiB (C).
- Readers at risk: only flaky opens recorded logs; timings `check_end.log` is never opened (src/timing.ts:48); reports cite 520 (akrogon) and 1,996 (framework) log paths (C). Reader support is the taken design, not yet code (B).
- 12 akrogon receipts point at an old job worktree path `.../tmp/wt-akro-2a/system-flow/direct/...` with the same basenames as today's untracked system-flow/direct logs; framework has 1 dead receipt (B,C).
- completeOwner skips closed leaves (src/phase.ts:190-191) (B). sync stages all eligible issues/ changes (src/sync.ts:141-165) and refuses staged non-issues paths (:38-42) (B,C).
- Picks: migrate (A,B,C). Entry: `akrogon pack` accepts a closed owner as well as a chart (A,B); a one-time migrate verb removed later (C). Disk set: pack untracked extras, stop an owner whose tracked log is modified or missing other than the 4 proven moves (B,C). Commit: scoped to migrated paths, not broad sync, preserving unrelated pending work (B). Run while no chart door or learn pass is open on that repo (C).
- Slots scraps: leave (B); delete (C).

## Taken
- Operator 2026-10-15: `1a | 2a`. Migrate the old logs once with the same pack, akrogon first then framework; delete the 9 slots scraps in the akrogon run.
- Final shape after the final-shape check ([draft](../slots/backlog-final-shape-draft.md); returns `backlog-final-shape-{B,C}.md`):
  1. `akrogon pack <folder>...` accepts a closed owner (`issues/closed/<owner>`) or a chart (packs its `direct/`), each resolved by realpath against the registered `repo.root` (src/config.ts:238-256); anything else, including a worktree's inert `issues/` copy and open or parked owners, is refused naming the accepted forms (C).
  2. Packing a closed owner uses the shared pack: every `*.log` under it on disk, recursive, dotfiles included, tracked or not; retry union; `.closing` while it runs, removed on success.
  3. Verification reads every member back through the same resolver `akrogon log` uses, by its original path, and compares it with the source bytes before deleting that plain file, so a member-naming error fails before any delete (C).
  4. Before packing a closed owner, a tracked log modified on disk refuses that owner, naming the path. A tracked log missing on disk is accepted only when the existing archive holds its member with the indexed bytes (a retry); otherwise refused (B). Untracked logs are packed and listed apart. Output per folder: packed, of them tracked, of them untracked, deleted.
  5. Several folders per call: each folder is packed or refused on its own; the call exits non-zero naming every folder not packed (C).
  6. Plain `akrogon status` lists each closed owner and ended chart whose folder holds a plain `*.log`, and each folder holding a stranded `.closing`, naming `akrogon pack <folder>` (B).
  7. Migration per repo, run by the chart door on that repo's main checkout after the leaf is merged and akrogon is installed; no other chart door or learn pass writes to that repo meanwhile (B,C):
     1. `akrogon sync` commits pending issues/ work first, so the pack commit holds only pack changes. In akrogon this lands the pending `merge-batch` open→closed move, after which the 4 tracked open logs are ordinary closed logs (C).
     2. `akrogon init` adds the ignore lines; its `.gitignore` change is committed and pushed alone; any other diff init makes stops the run for review (C).
     3. Record `akrogon flaky` output; run `akrogon pack` on every folder status lists; status lists none afterwards.
     4. Compare `akrogon flaky` output; read through `akrogon log` one tracked path per packed owner and compare with `git show HEAD:<path>`, plus one chart-direct and one untracked member per repo (C).
     5. akrogon only: delete `issues/chart/system-speed/slots/.{ask,fc,r2}-{B,D,E}.log` (9 files, operator `2a`).
     6. `akrogon sync` commits and pushes the archives and deletions with its lock, fetch and rebase (C).
     akrogon first, framework second.
  8. The 13 receipt paths that resolve to nothing today (akrogon 12, framework 1) stay unedited and are recorded as a known gap.

## Proofs
- Read-only git listing, A 2026-10-15, git 2.56.0, throwaway repo under the job temp dir (removed after, absence checked). Commands: `git ls-files -z -- <owner>`, `git ls-files -z --modified -- <owner>`, `git ls-files -z --deleted -- <owner>`, `git ls-files -z --others --exclude-standard -- <owner>`, `git cat-file blob :<path>`. Result: tracked listing included the dotfile `.c.log` and the nested `x/a.log`; `--modified` listed both the edited and the deleted log; `--deleted` listed only the deleted one; `--others --exclude-standard` listed the untracked log; `cat-file blob :<path>` printed the deleted log's indexed bytes. Limits: `--modified` includes deletions, so "modified on disk" is modified minus deleted; `--exclude-standard` hides untracked logs matched by the new ignore lines (chart `direct/`), so untracked is the disk set minus the tracked listing, not `--others`. Not proven: behaviour inside a linked worktree (the pack runs only at the registered root).
- Indexed-object comparison, A 2026-10-15, git 2.56.0, Bun 1.4.3, throwaway repo under the job temp dir (removed after, absence checked), raised by C's leaf review. Commands: `git rev-parse --show-object-format` printed `sha1`; `git ls-files -s -z -- <owner>` printed the committed log's oid; Bun `CryptoHasher('sha1')` over `blob <len>\0` plus the file bytes (bytes 0, 255, CR LF) printed the same oid. Limits: sha256 repositories not run; the comparison proves equality with the indexed blob, not with HEAD.
