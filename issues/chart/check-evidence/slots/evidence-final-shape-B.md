# Slot B: evidence-location final-shape defects

Checked 2026-10-15 against the draft and current source. No source or evidence files changed. The Bun probe below ran entirely in memory.

## F1. The new writer restriction breaks chart-direct and explicit-holder checks

Draft line 8 refuses every target outside `issues/open/`. `src/run-check.ts:126-127` deliberately supports an explicit holder with no lifecycle owner. `src/verify.ts:95,154-167` carries that holder into setup and check runs. Chart-direct checks use `issues/chart/<chart>/direct`, so this restriction would reject existing supported verification rather than just late writes to a closed owner.

Correction: apply the closed-owner rule to lifecycle-owned evidence. Preserve explicit-holder/chart-direct writes and define their publication policy in log-coverage. Do not replace owner-state validation with a blanket `issues/open/` prefix test.

## F2. The location check does not prevent a late writer, and refusal can erase its only saved output

Draft lines 7–8 still have a publication race. `checkedRun` resolves its target before a potentially long command, then calls `mkdirSync(target)` and copies the log after that command returns (`src/run-check.ts:148-165,187-209`). A target string under `issues/open/` remains such a string after `completeOwner` moves that directory (`src/phase.ts:224`), so the writer can recreate the old open path. Even checking current owner state before starting the command does not protect its later publication.

Putting a refusal only at publication has another consequence: the outer finally unconditionally deletes `runRoot` (`src/run-check.ts:220-221`). If publication throws, this can destroy the only captured full output. Printing it to the seat is not a durable retained log.

The same gap affects archive retry: a new or changed plain file appearing after a verified archive was published must not be deleted merely because an archive already exists. Draft line 7 prevents rebuilding from a subset, but does not specify what happens to new bytes absent from that archive.

Correction: coordinate writer admission/publication with the owner's final snapshot and move. Already-admitted writers must publish before sealing, and a publication failure must preserve their captured bytes. Remove only files whose exact current content has been verified in the retained archive. On retry, new or changed unmatched files must stop destructive cleanup until accounted for. An archive's existence or successful decoding alone is not proof that it contains every source being removed.

## F3. An open-only gitignore rule does not establish “sync never commits plain logs”

Draft line 6 overstates gitignore. Already-tracked logs remain tracked. `src/sync.ts:140-165` collects modified/deleted tracked files as well as untracked files and commits staged changes. Git explicitly documents that ignore rules do not affect tracked files: [gitignore documentation](https://git-scm.com/docs/gitignore), checked 2026-10-15.

There is also a non-close move: parking renames an owner to another issues area (`src/park.ts:61-68`). Ignored plain files moved out of `issues/open/` cease matching that rule and become eligible untracked issue records for sync. A failed owner's logs can therefore enter Git without any archive or completion.

Correction: state the transition policy for already-tracked/staged plain logs, coordinated with existing-backlog, and cover parked owners in the ignore/sync policy if “only the packed file enters git” is the requirement. Do not remove retained bytes as part of untracking. This correction does not reopen the operator's choice to leave open/failed evidence local.

## F4. The promised read command needs context for relative references and relocation

Draft line 9 accepts “any recorded path” but defines only a tail after `issues/`. Existing report references include `implementation/check-crit1-fix-1792054342810-2938167.log` (framework `issues/closed/test-scratch/scratch-lifetime/review-B.md:102`, inspected in the opening notes). Such a reference has no `issues/` tail. Parked owners also move their plain logs (`src/park.ts:68`), while draft line 9 only names open/closed paths.

Dropping an absolute checkout prefix also drops repository identity. The same owner/member tail can exist in two registered repos, so a tail alone cannot identify which repo the caller means.

Correction: specify how the reader selects the registered repo, resolves report-relative paths using an explicit holder/base or documented cwd, and follows the owner's current open/closed/parked location. Unknown or ambiguous identity must fail rather than print another repo's same-named log. Keep archive member names owner-relative as proposed, but separate that member name from the caller's original locator.

## F5. The tar.zst encoder/reader route is missing from the final shape

No npm dependency is needed, but `Bun.Archive`'s compression option is gzip, not zstd (`node_modules/bun-types/bun.d.ts:9751-9767,9859-9902`). Use two explicit stages rather than an assumed `compress: "zstd"` archive option.

A read-only runtime probe on installed **Bun 1.4.3** succeeded with:

```ts
const tar = await new Bun.Archive({
  "implementation/check example.log": originalBytes,
}).bytes();
const packed = Bun.zstdCompressSync(tar);
const members = await new Bun.Archive(Bun.zstdDecompressSync(packed)).files();
const restored = await members.get("implementation/check example.log").bytes();
```

Measurement: source bytes `[0, 1, 10, 13, 128, 255]` round-tripped byte-equal, and the spaced member name survived. `Bun.Archive`, `Bun.zstdCompressSync` and `Bun.zstdDecompressSync` were all present. This proves the format route on the installed runtime, not its memory use on the full backlog or disk-crash behavior. The zstd API is declared at `node_modules/bun-types/bun.d.ts:5968-5989`.

Correction: name this built-in tar-then-zstd / zstd-then-tar route, or explicitly choose the system-tool route. This host has `/usr/bin/tar` and `/usr/bin/zstd`, but their presence here does not establish their availability in every consumer installation. Validate raw bytes and print the selected member's bytes without an extra newline or lossy text conversion. Do not unpack the whole archive onto disk just to read one log.
