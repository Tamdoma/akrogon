# Design: log-reader

## Binding decisions, verbatim

### Evidence location
From [evidence-location.md](../../../chart/check-evidence/forks/evidence-location.md).

Operator, 2026-10-15: Q2 `2a`; Q1 first reopened with "What does zip like mean? The problem is that these logs need to be read often when I refer to them. If we zip them they won't be able to be read.", then `1a`.

Reason: keep history small; logs stay readable whenever they are referred to; plain logs of an open owner living on one host for a few hours is accepted.

Foreclosed: one compressed file per log in the repo; a host store outside the repo (no backup besides GitHub, other clones hold dead pointers); leaf temp reaped at leaf end; committing plain logs until the archive replaces them.

Final shape, verbatim:
  5. `akrogon log <path>` takes a recorded path, absolute from any checkout root or relative to cwd. It resolves the repo from cwd, or outside a repo against every registered repo, failing when ambiguous (B,C). The first part after `open/`, `closed/` or `parked/` is the owner, the rest is the member (C,D). It prints the plain file, else the member from `evidence.tar.zst`, as raw bytes (B). No match or an unreadable archive exits non-zero naming the path.
  6. `akrogon flaky` uses the same resolver. `(log gone)` only when neither a plain file nor an archive exists; a broken archive or a member missing from an existing archive is an error (D).
  7. Pack and read with `Bun.Archive` plus `Bun.zstdCompressSync` level 19 and `Bun.zstdDecompressSync`, no new dependency and no child process (B,D). Probe, A 2026-10-15, Bun 1.4.3: a 174-char member name and bytes 0,1,10,13,128,255 round-tripped byte-equal, and GNU tar 1.35 `tar -I zstd -xOf` read the same file. Reads hold the whole owner in memory, 148 MB for the largest owner today (C): accepted.
  8. Skills that cite or read logs tell seats to use `akrogon log <path>`.

Excluded here: items 1-4 and 9 (the close-time pack, `.closing`, run-check refusal, ignore lines and failed-leaf logs) belong to [close-pack](../close-pack/brief.md); item 7 applies to this leaf for reading only, and the packing half belongs to close-pack.

### Log coverage
From [log-coverage.md](../../../chart/check-evidence/forks/log-coverage.md).

Operator, 2026-10-15: `1a | 2a | 3a`. Chart direct logs are packed when the chart ends, by one command the door runs, with a status warning for an ended chart holding loose logs. Every kept command output goes through `akrogon run-check`, which prints the saved path; skills stop telling seats to copy logs. No guard against stray logs; the close-time pack takes them.

Reason: every log has one writer and one naming rule, and every folder ends clean (operator, worktree-cleanup: "I want all folders to be clean of junk and leftover files").

Foreclosed: committing chart direct logs plain; ignoring them and keeping them on this host only; a hook in chart-usage.ts plus a sync pass as the trigger; allowing purposeful hand-saved extra logs; a filename or duplicate-content guard at phase moves.

Final shape, verbatim:
  5. The `akrogon log` resolver and flaky add `chart/<chart>/direct/<member>`.

Excluded here: items 1-4 and 6 belong to close-pack and folder-pack; items 7-9 belong to [check-path-print](../check-path-print/brief.md).

### Existing backlog
From [existing-backlog.md](../../../chart/check-evidence/forks/existing-backlog.md).

Operator, 2026-10-15: `1a | 2a`. Migrate the old logs once with the same pack, akrogon first then framework; delete the 9 slots scraps in the akrogon run.

Reason: one lossless pack path for new and old logs; history rewrite is out.

Foreclosed: removing the old logs from the tree; leaving them; a one-time migrate verb removed later; a broad sync commit for the migration; keeping the slots scraps.

Final shape, verbatim:
  3. Verification reads every member back through the same resolver `akrogon log` uses, by its original path, and compares it with the source bytes before deleting that plain file, so a member-naming error fails before any delete (C).

This leaf owns the resolver item 3 reads through; the verification itself belongs to close-pack. Items 1, 2 and 4-8 are excluded: folder-pack owns items 1, 2, 4-6, and the chart door owns items 7-8 as a step on main.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here an `akrogon` invocation or exported function over a temporary repo and temporary `AKROGON_HOME`/`HOME` with the existing test helpers (tests/helpers.ts). A fix of a proven bug shows its test failing before and passing after. Archive fixtures are built inside the test with `Bun.Archive` and `Bun.zstdCompressSync`, which is temporary setup, not machinery. New behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion, and no live run. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces:
- A new resolver module (for example `src/evidence.ts`) with three exports: `locate` maps a recorded path and cwd to the repo, the owner folder and the member name; `readMember` reads one member from an owner folder's `evidence.tar.zst`; `readLog` composes them with the plain-file lookup and returns the log's bytes or throws a specific error naming the path. It is the only code that maps a recorded path to bytes. close-pack's read-back calls `locate` on each original path and `readMember` on the archive, so a member-naming error fails even while the plain file still exists; `akrogon log` and flaky call `readLog`.
- `akrogon log <path>`: a new `log` case in the CLI switch in `src/akrogon.ts`, writing the bytes to stdout unchanged (no text decoding), plus its README command-table row (`tests/command-reference.test.ts` reads both).
- `src/flaky.ts` `failedTests`: replaces its open→closed `existsSync` lookup with the resolver.
- Skill lines that read recorded logs, outside check-path-print's item 8 list (implement-issue SKILL.md:25,38,65,80, worker-protocol.md:29, brief-template.md:43; check-issue SKILL.md:18,67,69,83,85,101; merge-issue SKILL.md:18,41,53,55,75; plan-issue SKILL.md:69), which check-path-print edits and also points at `akrogon log` (C): skills/learn-issues/SKILL.md:14-22 (old evidence) and merge-issue SKILL.md:73 (receipt logs). Open for the plan: any further line outside that list that opens a recorded log path.

Resolution rules:
- The repo is the registered repo whose Git common directory matches cwd (`currentRepo`, src/config.ts). Outside any repo, every registered repo is tried; more than one match is an error naming them.
- A recorded absolute path is mapped to repo-relative by stripping a known checkout root of that repo first: the registered root or a path `git worktree list` prints for it. A path under no known root is cut at the first `/issues/open/`, `/issues/closed/`, `/issues/parked/` or `/issues/chart/<chart>/direct/` boundary, keeping the whole member suffix after it, so a member path containing its own `issues/` folder is never truncated (B). The 12 akrogon receipts pointing at `.../tmp/wt-akro-2a/system-flow/direct/...` and framework's 1 dead receipt are excluded by existing-backlog Taken item 8: they stay unresolved and need no alias (B).
- Owner and member: after `issues/open/`, `issues/closed/` or `issues/parked/`, the first part is the owner and the rest is the member; after `issues/chart/<chart>/direct/`, the owner folder is `issues/chart/<chart>/direct` and the rest is the member.
- Lookup order: plain file at `issues/<state>/<owner>/<member>` for state open, closed, parked (in that order, so a recorded open path finds its closed copy), then the member inside `<owner folder>/evidence.tar.zst` for the first owner folder that exists.
- Archive read: `Bun.zstdDecompressSync` then `new Bun.Archive(bytes)` and its file listing; the whole archive is held in memory (accepted, 148 MB worst case today).

Consumers of the changed state:
- `failedTests` in src/flaky.ts relies today on a plain file existing under open or closed; after this leaf it relies on the resolver and keeps its `(log gone)` and `(no test name)` outputs.
- close-pack's pack read-back (not yet written) relies on `locate` and `readMember` working while the owner is still under `issues/open/` and its plain files still exist.

Exclusions: writing archives, `.closing`, run-check refusal and ignore lines (close-pack); `akrogon pack` and status listing (folder-pack); the run-check stderr path and writer skill lines (check-path-print).
