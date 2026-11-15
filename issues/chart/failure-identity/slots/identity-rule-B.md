# Identity rule: blind notes B

Evidence tiers used here: T1 is inspected repository code or recorded log bytes; T2 is a contract inference or a proposed local counterexample, not an observed incident. All inspection is 2026-11-11. Signposts and coverage-rule Taken remain binding.

## Q1. Names returned for a red log

**Pick, reason and cost.** Prefer amended 1a (1d): collect failures per stream, retain the innermost script rather than changing wrapper groups, retain every independently failed stream, and suppress redundant wrapper failures. Qualify real test identities by their innermost script too when that prefix exists. Preserve source kind in equality, independently of the rendered label. A title named literally `(script) foo` must not equal the coarse failure of script `foo`. An unprefixed real title remains usable. Bare `(unnamed)` remains coarse, qualified by its script when present. Keep the check-level nameless marker rather than introducing a new check display label. Cost: real prefixed test identities change, and equality needs to retain information the parser already has. No universal failure-format framework is needed.

**Rejected options.** Unamended 1a drops script ownership from real titles: `script-X | (fail) shared title` and `script-Y | (fail) shared title` still compare equal despite the available distinguishing fact. This is a local counterexample, not a reported bad merge. 1b adds file-header state and a new check marker beyond the selected coarse-identity contract. Different hooks within one script may remain one coarse unit under 1d, with whole-log causal judgment required. 1c creates redundant script/test units and unstable keys when wrapper grouping changes.

**Evidence.** T1: `src/flaky.ts / failedTests` currently discards prefix ownership and returns strings; `src/verify.ts / knownRedReceipt, newRedUnits` compare those strings. T1: merged-map Facts records the same `test:remote-image` under `rest-c` and `rest-d`. T1: framework run `1704b5ef-ff4f-44e5-b4fd-5c4ab45ba6f6`, recorded `issues/open/dilutor-overlap/dilutor-rebalance/implementation/check-verify-1793306012300-1260164.log`, has two `(unnamed)` hooks in `test:emdash-kit` and a separate failed `test:variant-parity` stream. I inspected its Bun file headers: `local-dev.test.ts` and `worker-response.test.ts` precede the two unnamed failures. T2: same-title cross-script and literal-marker collisions follow from losing owner/kind before equality.

**Pitfalls and removal.** A whole-log named-test preference drops the custom-script failure: collect per stream. Wrapper failures count one cause repeatedly: eliminate redundant ancestors without dropping a separately failing descendant. Free-text `[FAIL]` controls pollute identities: use only the permitted structural sources. Cosmetic padding changes keys: parse tokens, not padded lines. Marker spelling collides with a real title: retain source kind in the comparison identity instead of inferring it solely from display text.

**Unasked question.** Is failure identity allowed to discard a known script owner merely because a real title is present? Signpost 2a's X-versus-Y distinction should apply to that case too. Choose the identity contract here, leaving the smallest concrete representation to the plan.

## Q2. What the seat may treat as proof

**Pick, reason and cost.** 2a, using Q1's correctly distinguished identities. Keep the subset comparison and require whole-log causal judgment whenever the head includes any coarse identity, including `(unnamed)`. Every red command still requires both real logs. Cost: a coarse match remains command eligibility rather than causal proof, and some cases stop because the logs establish too little.

**Rejected options.** 2b contradicts signposts 1a/2a: a script can fail for several reasons. 2c duplicates part of the existing seat completeness judgment and adds a new parser/refusal surface. It is not needed to prevent a signaled run from being accepted by the seat. It must not be bundled into 2a as an unexplained command tightening.

**Evidence.** T1: `src/verify.ts / knownRedReceipt` already requires every head name on the linked base and rejects a missing head log; a missing base log cannot satisfy an available head identity. T1: `skills/lifecycle-rules.md / Red check with no cause in the leaf's diff` and `skills/chart-issues/assets/direct-route.md / Direct route`, landing step 3, already require completeness and causal agreement, excluding killed, timed-out or crashed nameless commands. T1: `tests/verify.test.ts` ordinary nameless and merge-member cases preserve #133's intended eligibility.

**Pitfalls and removal.** Recognizing `(fail) (unnamed)` as a named test recreates the shortcut: classify it as coarse at extraction. A mixed head with one real title and one coarse failure takes the wrong branch: the coarse rule applies when any head unit is coarse. A stored label lets missing raw evidence through: known-red continues to read both logs. Preserve the blocked-check exception, own-criterion proof requirement and refusal matrix unchanged.

**Unasked question.** Does the new seat wording require the stronger read when any head identity is coarse, even if other head failures are real test titles? Record an explicit yes. No new comparison of output bytes, exits or signal markers is required.

## Q3. Stored names and reader priority

**Pick, reason and cost.** 3a. Store the parsed identities on executed red entries using the existing receipt writer. Reporting reads stored identities first; old rows use their live evidence. Known-red always parses both real logs with the current reader. Cost: an older binary's strict schema cannot read the new ledger field, and later parsers do not retroactively improve stored reporting identities.

**Rejected options.** 3b lets names and incident keys change after retirement or a parser upgrade, defeating stable reporting. 3c introduces another durable file that must stay synchronized with the ledger and owner movement.

**Evidence.** T1: `src/verify.ts / verifyRunSchema` uses strict command objects without identity fields; `runOnce` writes actual results and blocked proxies through the existing locked ledger update. T1: `src/flaky.ts / flips` excludes blocked/reused entries; `newRedUnits` owns unresolved-incident matching. T1: `tests/verify.test.ts / the receipt schema accepts both old entries and entries carrying a reused source run` supplies the existing compatibility shape. T2: strict-schema rejection explains the rollback consequence without a separate migration subsystem.

**Pitfalls and removal.** A blocked entry stores its blocker's failures as if executed: store only genuine executed reds. A missing-log placeholder becomes durable alleged identity: capture from readable live output, never from a missing-log result. History silently regroups under a new parser: reporting honors stored identity. Old rows become unreadable: the field is optional at the schema boundary. Archive corruption gets converted into absence: retain existing specific error propagation.

**Unasked question.** Are these stored comparison identities, including Q1's kind/owner, or just display labels? They must preserve the same identity information reporting uses to group incidents. Note the old-binary rollback limitation at handoff without adding backup or upgrade machinery.

## Q4. Existing logs outside issue-owner grammar

**Pick, reason and cost.** 4b, narrowly: preserve current owner/archive resolution for issue-shaped paths, and support an existing literal file outside that grammar in the shared reader. Resolve a literal file once in cross-repo lookup rather than counting the same file as a match in every registered repo. Cost: a small shared-reader change and focused log-CLI/cross-repo tests. This should be a separate leaf if the map's conditional split is retained.

**Rejected options.** 4a makes the name reader understand a real log that `akrogon log` still refuses, and direct-file-first can select an old checkout's stale issue-shaped file instead of the canonical current owner's evidence. 4c contradicts signpost 5a and still leaves known-red unable to read future outside-grammar logs, since Q3 deliberately does not let stored identity establish known-red eligibility.

**Evidence.** T1: `src/evidence.ts / locate, readLog` rejects paths outside the issue grammar; `readLogAcross` enumerates repos and treats multiple matches as ambiguous. T1: `skills/lifecycle-rules.md / Kept command output` says a cited log is read back with `akrogon log <path>`. T1: `tests/log-reader.test.ts / log resolves cwd-relative paths outside known checkout roots` still uses issue-shaped paths and thus does not cover this new case. T1: merged-map Facts identifies two existing akrogon files affected today.

**Pitfalls and removal.** Every repo claims the same absolute file: handle literal reading once at the lookup boundary. A stale open-owner file wins over current closed evidence: preserve canonical priority for issue-shaped paths. A corrupt archive becomes an excuse to open unrelated evidence: only outside-grammar literal-file support is added, and archive/member errors continue to raise. A disappeared file acquires guessed identity: retain the existing unavailable result.

**Unasked question.** Can the exact log path accepted for known-red identity also be read through the seat's required `akrogon log` command? Under 4b yes. This is the concrete reason to prefer shared-reader work over a name-reader exception.
