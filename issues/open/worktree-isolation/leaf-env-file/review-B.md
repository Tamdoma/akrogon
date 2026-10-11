# Review B: leaf-env-file

Date: 2026-10-11
Base: `309d742605a0516067840863ffdf3be29b03fc0c`
Reviewed head: `6573c84d3245d662da6bb595526bf92959df17d4`
Verdict: **fix**

## Scope and grounding

Reviewed the complete base-to-head diff against brief.md, design.md, plan.md including implementation notes, and implementation/report.md. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. Read src/AREA.md, docs/reference-index.md, docs/guide/next.md and docs/guide/setup.md, plus the affected skill instructions and src/test-files.ts. No peer review was read.

The dispatch documentation now describes the real private file and live-tab reuse correctly. One repository-root listing of every path named by src/AREA.md confirmed that src/akrogon.ts, src/preflight.ts, src/config.ts, src/init.ts, src/phase.ts, src/shell.ts, src/readiness.ts, docs/reference-index.md and tests/helpers.ts all exist. No dead pointers or conflicting documented behavior found.

## Fixes

### F1: JSON serialization changes declared dotenv values

Location: `src/next.ts:338`.

Source and contract: brief done-criterion 1 requires the declared names to retain the root values. The design explicitly accepts quoted dotenv values. An operator can supply a declared password containing a double quote using single-quoted dotenv syntax, or a declared path containing a literal backslash. Both are valid inputs to the exact `node:util.parseEnv` parser used by writeLeafEnv and readiness.

Trace: dispatch calls allocate → ensureWorktree → writeLeafEnv, parses the registered file, and serializes each parsed value with JSON.stringify. JSON escaping is not decoded back to the original string by the dotenv parser. A consumer parsing the new leaf file receives a different password or path, so authentication or file access can fail even though dispatch succeeds. This violates the value-preservation outcome of criterion 1. Plan D3's assertion that JSON quoting is lossless is incorrect. The implementation follows that decision, so repairing it may require A to correct the plan as well.

Verification used synthetic strings entirely in memory, with the installed Bun v1.4.2 runtime and node:util.parseEnv. No .env files were opened or written by the review probe:

```ts
import { parseEnv } from 'node:util';
const sources: string[] = ["KEY='has\"quote'", "KEY='path\\segment'"];
for (const source of sources) {
  const original: string = parseEnv(source).KEY;
  const encoded: string = `KEY=${JSON.stringify(original)}\n`;
  const copied: string = parseEnv(encoded).KEY;
  console.log(JSON.stringify({ equal: original === copied, originalLength: original.length, copiedLength: copied.length }));
}
```

Observed results:

```text
quote: equal=false, originalLength=9, copiedLength=10
backslash: equal=false, originalLength=12, copiedLength=13
```

The copied quote value contains an additional backslash. The copied path contains two backslashes where the original has one. A multiline control case was preserved, so the defect is specifically established for quotes and backslashes rather than assumed for all quoting.

Required repair: emit dotenv syntax that preserves the parsed values for supported quoted input. Add a dispatch-boundary test that parses the generated file and compares the declared quote/backslash values with the original values. The current subset test covers only a digit and spaces, and therefore passes with the broken serializer. Preserve the existing subset, mode, freeze and refusal checks.

## Verification

- `bun test tests/next.test.ts tests/batch-dispatch.test.ts --test-name-pattern '\.env' --timeout=30000`: exit 0, 15 pass, 0 fail, 241 filtered, 127 assertions. This specifically reruns the changed env behavior because of F1. The batch test has no matching title and was not exercised by this filtered command.
- Reused implementation/report.md evidence for unchanged full checks at the reviewed head: format clean, typecheck exit 0, changed tests 572 pass / 0 fail, full suite 717 pass / 0 fail. No red check required a detached-base comparison.
- Live-tab freeze, generation bump after tab death, mode 0600, declared subset, missing-name refusal without sentinel disclosure, existing tracked/ignore refusals, replacement of old links/files and worktree cleanup are covered by the reviewed tests. The failing criterion-1 quote/backslash scenario is F1 above.
- First-write generation 0 and defaulted state fields follow the recorded implementation refinements and do not contradict the brief's required bump on redispatch.
- No code edits or commits were made during review. No operator action is needed for this verdict.

## Test-Change trailers

- `17ad882e8faac205f5ab05e4e7ad5974c33a22bb`: `Test-Change: tests/next.test.ts rewrote .env dispatch block for real-file writes per plan D1-D8`. Accepted: brief criteria 1–2 and locked design 2a replace symlink behavior with snapshot files. Tracked/ignored refusals remain covered. Old real-file/foreign-link refusals contradict the required replacement behavior.
- `f23c7eefcd450f46118503cb5b49a326e4a61470`: `Test-Change: tests/batch-dispatch.test.ts updated .env assertions for real-file writes per plan D1/D3`. Accepted: the declared list is empty, so criterion 1 requires an empty regular file, not exposure of undeclared root content. Merge-clean assertions remain intact.
- `6573c84d3245d662da6bb595526bf92959df17d4`: `Test-Change: tests/state.test.ts adds env_names/env_generation defaults to the supported-State fixture for the new stateSchema fields`. Accepted: the state fixture follows the schema defaults recorded in the implementation notes and does not weaken an assertion.

## Nits

None.

## check.repair — 2026-10-11

Reviewed both initial verdicts at `6573c84d3245d662da6bb595526bf92959df17d4`. A has no Fixes. B's F1 is the only blocking finding. No operator actions are open.

### Handed to A

- F1: correcting the value-preservation defect requires replacing plan D3's explicit JSON.stringify emission rule and its losslessness claim. Plan changes belong to A under check-issue's check.repair rules. A should update D3, add the dispatch-boundary quote/backslash regression test, show it failing against the current serializer, then implement lossless dotenv emission and show it passing. The code repair and plan correction are one finding and are handed over together.

No repair commits or code changes were made. The worktree remains clean at the reviewed head. Full-check evidence remains the implementation report's format/typecheck/changed-test/full-suite results, plus B's 15 passing targeted dispatch tests and the failing in-memory F1 proof above. No checks were rerun because no code changed and the remaining failure is already established. Criterion 1 remains blocked by F1. Criteria 2–4 retain the recorded passing evidence. No merge checks ran.

No reusable Nits are held by B, so no lesson was added.

## Re-check after check.fix — 2026-10-11

Prior reviewed head: `6573c84d3245d662da6bb595526bf92959df17d4`
Repair head: `d1e9c108cb076fee585927aeeedcbf2cad142396`
Verdict: **fix**

Reviewed only the repair diff, its two commits, revised plan D3 and the check.fix report entry. No code edits or commits were made. This was not a red-merge repair, so merge replay evidence is not required.

### Earlier finding

F1 is resolved for the recorded quote/backslash inputs. The new dispatch-boundary round-trip test passes with the raw-copy implementation. The report records fail-before/pass-after results and all checks passing at the repair head. Plan D3 now describes the implemented raw-copy mechanism.

### F2: raw line scanning disagrees with dotenv parsing

Location: `src/next.ts:340–344`, introduced by `d1e9c10`.

Source and contract: an operator dispatching a repository with declared names in a valid dotenv file can use whitespace around `=` or quoted multiline values. The exact parseEnv used for root presence validation accepts these forms. Brief criterion 1 requires the leaf to preserve those root values. The initial implementation also preserved the multiline control case recorded in B's first review, so truncation is introduced by this repair.

Trace: writeLeafEnv validates presence with parseEnv, but then independently scans physical lines with a regular expression requiring `=` immediately after the name. The emission trusts scanned.get(name) despite the scanner recognizing a different grammar. Multiline quote context is also discarded. Dispatch succeeds while the leaf receives a different value.

A probe using the exact new scan/emission expressions and node:util.parseEnv in Bun v1.4.2 produced these results, entirely in memory:

- S1: source `KEY = value` parses to `value`, but the scanner has no KEY entry. Emission is `KEY=undefined`, so the consumer gets the literal string `undefined`.
- S2: source `KEY="line one` followed by `line two"` on the next physical line parses to a two-line value. The leaf contains only `KEY="line one`, and its parsed value is the truncated string including the opening quote.
- S3: source `KEY=outside` followed by a quoted multiline OTHER value containing a physical `KEY=inside` line still parses KEY as `outside`. The scanner treats the interior line as an assignment and emits `inside` instead.

Observed probe output (synthetic values only):

```json
{"case":"spaced","original":"value","copied":"undefined","equal":false}
{"case":"multiline","original":"line one\nline two","copied":"\"line one","equal":false}
{"case":"nested","original":"outside","copied":"inside","equal":false}
```

Consequence today: valid declared configuration or credentials change during dispatch, breaking the brief's value-preservation outcome even while presence checks succeed. The multiline case can also copy content belonging to an undeclared variable into a declared variable. This is one scanner/parser mismatch finding, with three concrete criterion-1 failures, rather than three separate fixes.

Required repair: preserve values for the grammar accepted by the root parser without an independent physical-line scanner that loses assignment whitespace and quote context. Extend the dispatch-boundary tests to compare parsed root/leaf values for S1–S3, showing fail-before/pass-after. Merely allowing spaces in the regex does not fix the multiline cases.

### Verification and trailers

- `bun test tests/next.test.ts --test-name-pattern '\.env' --timeout=30000`: exit 0, 16 pass, 0 fail, 212 filtered, 130 assertions. The new quote/backslash test passes. None of these tests exercises S1–S3.
- Reused the check.fix report's unchanged-head evidence: tests/next.test.ts 228 pass / 0 fail, typecheck and format clean, changed tests 573 pass / 0 fail, full suite 718 pass / 0 fail. No check failed, so no detached-base run was required.
- `6055590547490a89681fc7fa6cbd5458f9748e38` Test-Change trailer names tests/next.test.ts and cites F1 for the new round-trip test and raw-copy subset expectation.
- `d1e9c108cb076fee585927aeeedcbf2cad142396` Test-Change trailer names tests/next.test.ts and cites F1 for the raw-copy expectations and quote/backslash round-trip expectation. Both trailers are present in the final trailer block. The changed expectations retain the existing behavioral assertions and follow the revised plan D3. No unrelated regression assertion was removed.
- No operator actions or new Nits. F2 is the only remaining blocking finding.

## check.repair for F2 — 2026-10-11

Current head: `d1e9c108cb076fee585927aeeedcbf2cad142396`.
Read the latest B re-check findings and current plan D3. F1 remains resolved. F2 is the sole open Fix. No operator actions are open.

### Handed to A

- F2: plan D3 and its Implementation notes explicitly require copying a raw assignment line, with one line per declared name. Preserving quoted multiline values requires changing that rule, not merely adjusting assignment whitespace in the regex. Plan changes belong to A under check-issue's check.repair rules. A should correct D3 to preserve the root parser's accepted values, add dispatch-boundary tests for S1 (spaces around `=`), S2 (multiline declared value) and S3 (assignment-like text inside an undeclared multiline value), show fail-before/pass-after, and retain the passing F1 quote/backslash test. The plan correction and code repair are one finding and are handed over together.

No independently repairable Fix remains for B. No code changes or commits were made, and the worktree is clean. The unchanged-head check.fix report and B's latest 16 passing targeted tests remain the check evidence. The in-memory S1–S3 probes establish that criterion 1 is still blocked by F2. Criteria 2–4 retain their passing evidence. No checks were rerun without a code change or new verification concern, and no merge checks ran. B holds no reusable Nits, so no lesson was added.

## Re-check after check.fix repair 2 — 2026-10-11

Prior reviewed head: `d1e9c108cb076fee585927aeeedcbf2cad142396`
Repair head: `2c92c02530428f26bfed2abaab51bcf1bb668b75`
Verdict: **fix**

Reviewed only the latest repair diff and its two commits, revised plan D3 and the repair-2 implementation report. No code edits or commits were made. This was not a red-merge repair, so merge replay evidence is not required.

### Earlier findings

F1 remains fixed by the passing quote/backslash test. F2's S1–S3 are fixed: the new boundary test confirms spaced assignments, a multiline declared value and assignment-like content inside an undeclared multiline value. The scanner was removed. The report records the test commit's failing results and passing checks after the fix.

### F3: the encoder corrupts or rejects valid declared values

Location: the new emit function and unwritable refusal in `src/next.ts`, and `next refuses a declared value that cannot be written as dotenv` in `tests/next.test.ts`. Introduced by `2c92c02` and its new refusal test.

Source and contract: an operator can supply either `KEY='`literal`'` (single quotes enclosing literal backticks) or `KEY=a'b"c` (an unquoted value containing both quote types) in the registered dotenv file. Both are accepted by the exact parseEnv used in dispatch. Brief criterion 1 requires preservation of the root values, not a new refusal of representable values. The preceding raw-copy implementation preserved both forms, so these are defects introduced by this repair.

Trace and consequence:

- S4: parseEnv reads the backtick-containing root value as the string including both literal backticks. emit considers it safe for unquoted output and writes `KEY=`literal``. parseEnv treats backticks as quoting and returns `literal`, losing both characters. A declared password or configuration value changes while dispatch succeeds.
- S5: parseEnv reads `KEY=a'b"c` as the five-character value containing both quote types. emit returns null and dispatch refuses it. The root's own unquoted assignment already demonstrates that this value is representable as dotenv. The new refusal blocks a valid dispatch and its new test enforces that incorrect result.

Verification extracted the actual emit function from src/next.ts, removed only its TypeScript signature annotation to execute it with Function, and passed these synthetic parsed values through it. No .env file was opened or written by the probe. Output:

```json
{"case":"mixedQuotes","original":"a'b\"c","emitted":null,"copied":null,"equal":false}
{"case":"backticks","original":"`literal`","emitted":"KEY=`literal`","copied":"literal","equal":false}
```

Required repair: make the encoder preserve these parser-supported values, retaining the passing F1/F2 scenarios. Add a dispatch-boundary backtick round-trip regression and change the new mixed-quote refusal test to successful value preservation. Criterion 1 and the concrete parseEnv result above are the cited source contradicting that refusal expectation. Plan D3's claim that both quote types are unwritable must also be corrected. S4 and S5 are one encoder-grammar finding.

### Verification and trailers

- `bun test tests/next.test.ts --test-name-pattern '\.env|dotenv' --timeout=30000`: exit 0, 18 pass, 0 fail, 212 filtered, 141 assertions. F1/F2 boundary tests pass. S4 is absent from these tests and S5's test asserts the defective refusal.
- Reused repair-2 report evidence at the reviewed head: tests/next.test.ts 230 pass / 0 fail, typecheck/format clean, changed tests 575 pass / 0 fail, full suite 720 pass / 0 fail. No check failure required a detached-base comparison.
- `41097c7fe9be9328b9f939a7c8b332b152779672`: Test-Change trailer names tests/next.test.ts and cites F2 for added spaced-assignment, multiline, nested-assignment and refusal tests. The F2 regression cases are appropriate. The new refusal test contradicts criterion 1 and is part of F3.
- `2c92c02530428f26bfed2abaab51bcf1bb668b75`: Test-Change trailer names tests/next.test.ts and cites F2. The final diff preserves the earlier tests and adds the new tests above. No unrelated old assertion was removed.
- No operator actions or new Nits. F3 is the sole remaining Fix.

## check.repair for F3 — 2026-10-11

Current head: `2c92c02530428f26bfed2abaab51bcf1bb668b75`.
Read the latest B re-check findings and current plan D3. F1 and F2 remain resolved. F3 is the sole open Fix. No operator actions are open.

### Handed to A

- F3: D3 explicitly excludes quotes from unquoted output and requires refusal for values containing both quote types. The S5 source is a valid unquoted assignment that contradicts this planned refusal. Correcting the encoder's grammar, S4 backtick corruption and S5 refusal therefore requires correcting D3 and its Implementation notes. Plan changes belong to A under check-issue's check.repair rules. A should add the S4 dispatch-boundary round-trip test, replace the S5 refusal expectation with successful value preservation citing criterion 1 and the existing parseEnv proof, show fail-before/pass-after, and retain F1/F2 regressions. The plan correction and code repair are handed over together as F3.

No code edits or repair commits were made. The worktree remains clean at the reviewed head. B's latest 18 passing targeted tests and the repair-2 full-check evidence remain unchanged; the actual-emitter probes establish criterion 1 failures S4/S5. Criteria 2–4 retain their passing evidence. No checks were rerun without a code change or new concern. No merge checks ran. No reusable Nits are held by B, so no lesson was added.

## Re-check after check.fix repair 3 — 2026-10-11

Prior reviewed head: `2c92c02530428f26bfed2abaab51bcf1bb668b75`
Repair head: `a7f589b506be3c9ab24b9465a526b61bf074e56d`
Verdict: **fix**

Reviewed only the latest repair diff, its commits, revised D3 and the repair-3 report. No code edits or commits were made. This was not a red-merge repair, so merge replay evidence is not required.

### Earlier findings

F1/F2 remain covered by passing boundary tests. F3's original S4 literal-backtick and S5 mixed-quote values now round-trip through the actual encoder. An in-memory probe extracted the current emit function directly from src/next.ts, removing only the TypeScript function signature annotation to execute it. Its results were:

```json
{"case":"literalBackticks","original":"`literal`","emitted":"KEY='`literal`'","equal":true}
{"case":"mixedQuotes","original":"a'b\"c","emitted":"KEY=a'b\"c","equal":true}
```

### F3 remains open: refusal still rejects a representable value

The repair changes the refusal test to source `SYNTHETIC_HARD="a\r\"b"`. This is a new fixture and expectation in the reviewed repair diff. parseEnv accepts that assignment and produces a value consisting of `a`, a carriage return, a backslash, a double quote and `b`. The emitter returns null because it rejects every value containing a double quote from its double-quoted branch.

The new test's claim that this source cannot be written as dotenv is false. Re-encoding the carriage return as backslash-r and keeping the already-escaped double quote produces a double-quoted assignment that parseEnv reads identically. The root assignment itself is also concrete proof of representability. This is the same unresolved F3 valid-value-refusal mechanism, demonstrated by the replacement fixture introduced in this repair, not a new review of unrelated behavior.

Actual-emitter probe output:

```json
{"case":"refusalFixture","original":"a\r\\\"b","emitted":null,"equal":false,"candidateEqual":true}
```

The candidate was constructed from the parsed original value using:

```ts
const candidate: string = `KEY="${original.replace(/\r/g, '\\r')}"\n`;
const candidateEqual: boolean = parseEnv(candidate).KEY === original;
```

Source/consequence/criterion: the repair's real dispatch-boundary test writes a valid operator-supplied root assignment accepted by the dispatch parser. Dispatch refuses that declared value even though it can be preserved. The new refusal expectation contradicts brief criterion 1's value-copy outcome and the parser result. Correct the expectation to successful preservation and remove the incorrect representability restriction, with fail-before/pass-after evidence. The current D3 assertion that double quote plus carriage return is unwritable is also false.

The S4 regression test is also still missing: `SYNTHETIC_TICK=`literal`` in the new round-trip test parses at the root to `literal`, without literal backticks, and the assertion explicitly expects `literal`. It therefore does not catch the original S4 bug. Use single quotes around the backtick pair at the root and compare the resulting string including both backticks. The actual emitter currently passes S4, but the requested realistic regression remains unguarded.

### Verification and trailers

- `bun test tests/next.test.ts --test-name-pattern '\.env|dotenv' --timeout=30000`: exit 0, 19 pass, 0 fail, 212 filtered, 148 assertions. Existing F1/F2 tests and the new mixed-quote test pass. The refusal test passes by asserting the incorrect behavior described above.
- Reused repair-3 report evidence at the reviewed head: tests/next.test.ts 231 pass / 0 fail, typecheck/format clean, changed tests 576 pass / 0 fail, full suite 721 pass / 0 fail. No red check required a detached-base comparison.
- `1a072bacabb4fcf5c3ae233172c959fd1f382919` has a Test-Change trailer for tests/next.test.ts citing F3. Changing the original mixed-quote refusal to successful preservation is justified by F3 and criterion 1. The replacement refusal fixture is not justified: the source is representable as demonstrated above. The purported backtick regression does not reproduce S4.
- `a7f589b506be3c9ab24b9465a526b61bf074e56d` changes only src/next.ts, which does not match the test-file path rule and requires no Test-Change trailer.
- No operator actions or new Nits. F3 is the sole remaining Fix.

## check.repair for remaining F3 — 2026-10-11

Current head: `a7f589b506be3c9ab24b9465a526b61bf074e56d`.
Read the latest B re-check findings and current D3. F1/F2 remain resolved. F3 is the sole remaining Fix. No operator actions are open.

### Handed to A

- F3: D3 still explicitly rejects double quotes in the double-quoted emission branch and claims double quote plus carriage return is unwritable. The replacement refusal fixture demonstrably round-trips with a double-quoted candidate, so completing F3 requires correcting that plan rule as well as the encoder. Plan changes belong to A under check-issue's check.repair rules. A should turn the current refusal fixture into a successful parsed-value-preservation test, correct the S4 fixture to single-quote the literal backtick pair and assert both backticks survive, correct D3 and its Implementation notes, and show fail-before/pass-after while retaining F1/F2 coverage. These are the remaining parts of F3 and are handed over together.

No code edits or repair commits were made. The worktree remains clean at the reviewed head. The latest 19 passing targeted tests and repair-3 full checks remain the unchanged-head evidence. The actual-emitter probe and successful candidate round-trip establish the remaining criterion-1 failure. Criteria 2–4 retain their passing evidence. No checks were rerun without a code change or new verification concern. No merge checks ran. B holds no reusable Nits, so no lesson was added.

Phase result: `akrogon phase leaf-env-file check.fix --slot B` returned `moved failed`. The command enforced the configured repair cap. F3 remains unresolved; no merge path was opened.

## Resumed check.repair — 2026-10-11

The operator restored check.repair at unchanged head `a7f589b506be3c9ab24b9465a526b61bf074e56d`. Existing F3 evidence and the preceding Handed to A entry are reused. D3 still requires the disproven refusal, so the plan-dependent F3 handoff remains necessary. No review or tests were repeated and no code changed. State fix_rounds and issues/config.yaml fix_rounds both remain 3. The required check.fix request is therefore still subject to the exhausted cap.
