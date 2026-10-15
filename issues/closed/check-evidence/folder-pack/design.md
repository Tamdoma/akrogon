# Design: folder-pack

## Binding decisions, verbatim

### Evidence location
From [evidence-location.md](../../../chart/check-evidence/forks/evidence-location.md).

Operator, 2026-10-15: Q2 `2a`; Q1 first reopened with "What does zip like mean? The problem is that these logs need to be read often when I refer to them. If we zip them they won't be able to be read.", then `1a`.

Reason: keep history small; logs stay readable whenever they are referred to; plain logs of an open owner living on one host for a few hours is accepted.

Foreclosed: one compressed file per log in the repo; a host store outside the repo (no backup besides GitHub, other clones hold dead pointers); leaf temp reaped at leaf end; committing plain logs until the archive replaces them.

Final shape, verbatim:
  7. Pack and read with `Bun.Archive` plus `Bun.zstdCompressSync` level 19 and `Bun.zstdDecompressSync`, no new dependency and no child process (B,D). Probe, A 2026-10-15, Bun 1.4.3: a 174-char member name and bytes 0,1,10,13,128,255 round-tripped byte-equal, and GNU tar 1.35 `tar -I zstd -xOf` read the same file. Reads hold the whole owner in memory, 148 MB for the largest owner today (C): accepted.

Excluded here: items 1-6, 8 and 9 belong to [log-reader](../log-reader/brief.md) and [close-pack](../close-pack/brief.md); item 7 applies through the shared pack this leaf reuses.

### Log coverage
From [log-coverage.md](../../../chart/check-evidence/forks/log-coverage.md).

Operator, 2026-10-15: `1a | 2a | 3a`. Chart direct logs are packed when the chart ends, by one command the door runs, with a status warning for an ended chart holding loose logs. Every kept command output goes through `akrogon run-check`, which prints the saved path; skills stop telling seats to copy logs. No guard against stray logs; the close-time pack takes them.

Reason: every log has one writer and one naming rule, and every folder ends clean (operator, worktree-cleanup: "I want all folders to be clean of junk and leftover files").

Foreclosed: committing chart direct logs plain; ignoring them and keeping them on this host only; a hook in chart-usage.ts plus a sync pass as the trigger; allowing purposeful hand-saved extra logs; a filename or duplicate-content guard at phase moves.

Final shape, verbatim:
  1. The pack is one shared function used by completeOwner and by a new command `akrogon pack <chart>`, which packs only `<chart>/direct` (B). The log set is every `*.log` under the folder, recursive, dotfiles included, the same set for pack, status warning and ignore (C).
  2. `.closing`: completeOwner writes it before packing and keeps it through the rename, removing it after the move (B). `akrogon pack` writes it and removes it on success; a failed pack leaves it and exits non-zero naming it, and rerunning the pack finishes and removes it (B,C).
  3. The chart door runs `akrogon pack <chart>` before appending `Closed`, `Held` or `Handed off` when `<chart>/direct` holds a log (chart-issues SKILL.md:85,114,121). Archive `<chart>/direct/evidence.tar.zst`, members relative to `direct/`. A reopened chart writes new plain logs and the next pack merges them.
  6. Plain `akrogon status` (the Failed/Missing loop, src/status.ts:381-396) warns for each chart whose last marker is an end marker and whose `direct/` still holds a plain log, naming `akrogon pack <chart>` (C). The 53 loose logs in five ended akrogon charts today are its first cases (C).

This leaf owns the `akrogon pack <chart>` command (items 1 and 2 for the command), the door's pack step (item 3) and the status warning (item 6). The shared function and completeOwner's `.closing` belong to close-pack; items 4 and 5 belong to close-pack and log-reader; items 7-9 belong to [check-path-print](../check-path-print/brief.md).

### Existing backlog
From [existing-backlog.md](../../../chart/check-evidence/forks/existing-backlog.md).

Operator, 2026-10-15: `1a | 2a`. Migrate the old logs once with the same pack, akrogon first then framework; delete the 9 slots scraps in the akrogon run.

Reason: one lossless pack path for new and old logs; history rewrite is out.

Foreclosed: removing the old logs from the tree; leaving them; a one-time migrate verb removed later; a broad sync commit for the migration; keeping the slots scraps.

Final shape, verbatim:
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


This leaf owns items 1, 2 (for closed owners), 4, 5 and 6, and calls the shared verification of item 3 owned by close-pack. Items 7 and 8 are the chart door's step on main, recorded in the chart's Pending steps; they are copied here because this leaf's command is what the migration runs.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here an `akrogon` invocation or exported function over a temporary repo and temporary `AKROGON_HOME`/`HOME` with the existing test helpers (tests/helpers.ts). No bug fix is in scope. Closed-owner cases use a temporary git repo with committed, modified, deleted and untracked logs. New behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion, and no live run. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces:
- `akrogon pack <folder>...`: a new `pack` case in the CLI switch in `src/akrogon.ts`, its README command-table row (`tests/command-reference.test.ts`), and a command module (for example in the close-pack module or `src/pack-command.ts`).
- Entry check: each argument is resolved with `realpathSync` and must equal `<repo.root>/issues/closed/<owner>` (one level under closed) or `<repo.root>/issues/chart/<chart>` (one level under chart, packing its `direct/`), where `repo` comes from `requireRepo` (src/config.ts) and `repo.root` is the registered root. A worktree's `issues/` copy resolves outside `repo.root` and is refused.
- `.closing` for the command: written before the pack, removed on success, left on failure with a non-zero exit naming it. A rerun treats an existing `.closing` as a retry.
- Tracked-log check for closed owners, from the recorded proof (existing-backlog `## Proofs`): tracked = `git ls-files -z -- <owner>` filtered to `*.log`; modified on disk = `git ls-files -z --modified` minus `git ls-files -z --deleted`; missing = `--deleted`, accepted only when the git object id computed over the archive member's bytes (`blob <len>\0` plus bytes, algorithm from `git rev-parse --show-object-format`) equals the indexed oid from `git ls-files -s -z -- <owner>`, so log bytes are never decoded as text (C; B raised the same defect); untracked = the disk `*.log` set minus the tracked set (not `--others --exclude-standard`, which hides ignored chart logs). Git path listings run through the existing `run` helper (src/shell.ts) at `repo.root`; `run` decodes and trims stdout, so it never carries log bytes (B,C).
- Status listing in `status` in src/status.ts, next to the `Failed:`/`Missing:` loops: closed owners and ended charts holding a plain `*.log` (same recursive set as the pack, `direct/` only for charts) and any folder under `issues/` holding `.closing`, each naming `akrogon pack <folder>`. Ended means the last `Handed off`/`Closed`/`Held` line in CHART.md, the same match the chart row builder in src/status.ts uses. A stranded `.closing` in an open owner names `akrogon next <slug>` for a merged leaf under it, the completion retry (B,C). Open for the plan: whether to extract the marker match into a shared helper.
- skills/chart-issues/SKILL.md lines that append the end markers (today :85, :114, :121): the pack step before each append.

Consumers of the changed state:
- `akrogon sync` stages the archive and the deletion of tracked plain logs after a pack; the migration commits through it (existing-backlog item 7.6). Nothing in sync changes.
- Plain `status` output is read by the door and by seats reading `Missing:` lines; tests/status.test.ts pins the `Failed:`/`Missing:` prefixes, so the new lines use a prefix of their own (C). Open for the plan: any other reader of plain status output.

Exclusions: the shared pack, completeOwner, run-check refusal and ignore lines (close-pack); `akrogon log` and the resolver (log-reader); the writer rule in skills (check-path-print). The migration run itself, the 9 slots-scrap deletion and the close of Tamdoma/akrogon#92 are the door's steps on main.
