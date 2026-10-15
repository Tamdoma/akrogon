# Slot B: leaf draft disagreements

Draft paths below are relative to `/home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/`. Source paths are relative to `/home/ivan/Work/infra/akrogon/`.

## F1. folder-pack's selected Git helper cannot return indexed log bytes unchanged

**Draft:** folder-pack/design.md:77 says all Git calls use `run` from src/shell.ts, including `git cat-file blob :<path>` for byte equality.

**Evidence:** src/shell.ts:61 decodes stdout as UTF-8, and :118 strips trailing whitespace with trimEnd. Thus even a normal indexed log ending in a newline differs from its intact archive member. Byte 255 also cannot round-trip through that decoding. The retry acceptance in folder-pack/brief.md:14 would reject valid already-packed logs.

**Exact fix:** keep the text helper for Git path listings, but give folder-pack ownership of a byte-preserving indexed-blob read. Use the existing file capture primitive in src/shell.ts:24–47 and read its output as bytes before cleanup, or an equally narrow byte-returning helper. Do not use run, command, or finishCaptured for blob contents. Make the criterion cover indexed logs with trailing newlines and non-UTF-8 bytes, as required by the lossless contract.

## F2. The late-publication guard must detect an owner that has already moved

**Draft:** close-pack/design.md:67 checks whether the captured target is under closed or its owner has `.closing`. That is insufficient for close-pack/brief.md:16, which requires refusal when completion happens during the command.

**Evidence:** src/run-check.ts:142–143 resolves the target before execution. It remains an absolute open-owner path through :207–209. src/phase.ts:224 renames the owner, taking `.closing` with it. After the move, the old target still spells `issues/open/...`, but no marker exists there. The described checks both pass, and mkdirSync recreates the old open directory before publishing the late log.

**Exact fix:** at publication, resolve the captured logical owner against the registered root's current lifecycle location and reject a closed owner even when the captured target still spells open. Do not rely only on the captured path prefix or a marker at that stale path. Add the observable case where the entire move and marker removal finish before the command returns, and require that no old open directory is recreated. Keep the captured out.log on this refusal.

## F3. Chart holders are exempted from the guard that chart packing needs

**Draft:** close-pack/design.md:67 says “A target under issues/chart/ is not refused,” and close-pack/brief.md:16 only positively says chart holders remain accepted. folder-pack creates `<chart>/direct/.closing`, but owns no writer guard.

**Evidence:** explicit holders resolve straight to a target in src/run-check.ts:126–127, and checkedRun publishes to that target at :207–209. The accepted chart pack sets a marker at the direct root, not a lifecycle owner root. An unconditional chart exemption lets a command start or publish during that pack. The original final shape explicitly required chart refusal while the holder has `.closing`.

**Exact fix:** assign the chart guard to close-pack alongside the lifecycle guard. State in its design and done-criterion that chart/direct holders are accepted when not closing and refused at both start and publication while their direct archive root holds `.closing`. Match the exact marker location folder-pack writes. A successful pack removes that guard so later chart attempts remain writable.

## F4. The retained late-write capture is still deleted by reconciliation

**Draft:** close-pack/design.md:67 preserves a refused publication's run folder by skipping checkedRun's finally removal. Its consumer list at :70–74 discusses reconcile's owner-move prediction but misses scratch cleanup.

**Evidence:** run-check writes a PID/boot owner record at src/run-check.ts:159–161. Once the refused command exits, ownerDead becomes true (src/reconcile.ts:100–110). reconcile then deletes every such run directory at :410–427, and can delete the enclosing leaf scratch directory at :437–439. src/next.ts:1323–1327 invokes this cleanup. The only retained copy can therefore disappear on the next normal reconciliation.

**Exact fix:** add scratch reconciliation to close-pack's owned consumers. Mark a capture retained because publication was refused, make reconciliation preserve and report that capture and its parent, and specify its eventual explicit recovery/removal disposition. Extend the observable retention criterion through a subsequent reconciliation, not just the return from run-check. This is necessary to implement the already-chosen retention, not a general change to scratch retention.

## F5. The claimed reusable phase retry falls through after completion

**Draft:** close-pack/brief.md:13 names `akrogon phase <slug> merged` as recovery. close-pack/design.md:71 treats the existing merged-leaf branch as that reusable path.

**Evidence:** src/phase.ts:780 calls completeOwner for a merged leaf, but does not return. The same invocation falls through to transition at :839–840. transition reads the old leaf.path at :238 and rejects merged state at :240. If completeOwner just moved the owner, that old path is absent. If no move occurred, the terminal-state rejection remains. A successful archive recovery therefore still ends in an error.

**Exact fix:** make the explicit merged-completion retry a terminal success branch after completeOwner succeeds, without invoking transition again or pushing/replaying the merge. Keep other illegal transitions rejected. Include the CLI exit and absence of a repeated phase move in criterion 2, rather than checking only the final files. This change belongs to close-pack's src/phase.ts ownership.

## F6. The status criterion promises an invalid recovery command for open owners

**Draft:** folder-pack/brief.md:16 requires every `.closing` folder to name `akrogon pack <folder>`. Its own :15 refuses open owners. folder-pack/design.md:78 acknowledges the contradiction but leaves the command choice “Open for the plan.”

**Evidence:** completeOwner's new marker necessarily exists while the owner is still open, per close-pack/design.md:66. Existing recovery entry points are src/phase.ts:780 and src/next.ts:772–775. Such an owner cannot be handled by the restricted closed-owner/chart pack command.

**Exact fix:** split the observable recovery output by holder kind. Closed owners and chart/direct roots name `akrogon pack` with the accepted owner/chart argument. An open completion owner names a merged leaf's completion retry, corrected by F5. Do not emit a command the same leaf must reject. Keep chart markers mapped to the chart argument, not its direct directory.

## F7. The resolver's last-/issues/ cut can truncate a valid member path

**Draft:** log-reader/design.md:66 proposes taking the suffix from the last `/issues/` segment. :67 then interprets that suffix as the owner/member boundary.

**Evidence:** src/run-check.ts:126–127 permits an explicit holder directory, and :207–209 writes there. A holder such as `issues/chart/<chart>/direct/nested/issues/` therefore produces a valid nested log. The recursive pack promised by close-pack/design.md:65 must preserve it. Taking the last `/issues/` truncates that recorded path to `/issues/check-...log`, losing the chart and archive root and breaking both reading and pack read-back.

**Exact fix:** strip a known checkout prefix when available. For historical roots, identify the lifecycle/chart root boundary and preserve the whole member suffix, refusing genuine ambiguity rather than choosing the last occurrence. Add the nested `issues` directory case to the resolver criterion. Also remove the twelve old job paths without an issues component from the open implementation question: existing-backlog Taken item 8 explicitly leaves those historical gaps unchanged, so they are an exclusion rather than implicit alias-repair work.

## F8. Two named consumers are not real consumers

**Draft:** folder-pack/design.md:83 says watch-issues/scripts/observe.ts reads plain akrogon status. check-path-print/design.md:37 names a separate “batch path” caller of checkedRun.

**Evidence:** observe.ts calls akrogon config at :49–62, reads leaf state files at :85–108 and enumerates them at :262–264. It does not call or parse akrogon status. Searching src for checkedRun finds its definition, the runCheck wrapper at src/run-check.ts:143, and verify's calls at src/verify.ts:154,167. There is no separate batch caller of checkedRun.

**Exact fix:** remove observe.ts from the plain-status parser consumers and remove the nonexistent batch caller. Name verify as the shared runner consumer. Retain a search for actual status/stderr parsers without directing implementers to change these unrelated surfaces.
