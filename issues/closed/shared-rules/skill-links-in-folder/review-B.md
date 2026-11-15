# Review B: skill-links-in-folder

Date: 2026-11-11. Phase: check.review. Verdict: **fix**.

Base: `a33d967b5dd07829b81b9dd87802c8a72f8effbd`.
Reviewed head: `0bc7d2e91f05cd72682ea94322e0dcc50fe1d368`.

Read the brief, design, plan, implementation report, check-issue skill and references before reviewing the whole diff. Initial review was blind. No code edits, commits, paid calls or live operations were made.

## Fix

### F1: Shorter fences incorrectly close a longer fenced block

Location: `tests/docs-links.test.ts:16-25`, `proseOnly`.

The parser remembers only the fence character. It treats any run of at least three matching characters as a closer, even when the opening fence has four characters. A closing fence must be at least as long as its opener.

The delivered input already uses this shape: `skills/chart-issues/assets/questions.md:5-35` wraps its question template in four backticks and includes a three-backtick diagram at lines 17-23. The parser prematurely closes the outer block at line 17 and scans the diagram as prose. Placing `[example](missing.md)` inside that existing diagram produces a missing-file error, although the example remains inside the outer fenced block. The current diagram contains no Markdown link, so the delivered-tree scan happens to pass.

This blocks **brief criterion 3's named outcome**, that link-shaped text inside a fenced block is not reported. The proof modifies the existing template in memory to exercise that outcome. It does not claim the unchanged diagram currently contains a broken link or rely on a hypothetical production incident.

Evidence, read back with `akrogon log`:

`check review-b-nested-fence: 1 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/skill-links-in-folder/implementation/check-review-b-nested-fence-1794393142117-507373.log`

Expected no errors. Actual: `skills/chart-issues/assets/questions.md: missing file missing.md`.

Replay from the worktree, through `akrogon run-check --name review-b-nested-fence -- bun -e '<script>'`:

```javascript
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { deepStrictEqual } from 'node:assert';
const source = readFileSync('tests/docs-links.test.ts', 'utf8');
const helperSource = source.slice(source.indexOf('type FileResolver'), source.indexOf('const repoRoot:'));
const javascript = new Bun.Transpiler({ loader: 'ts' }).transformSync(helperSource + '\nreturn { brokenLinks, proseOnly };');
const { brokenLinks } = new Function('resolve', 'dirname', javascript)(resolve, dirname);
const path = resolve('skills/chart-issues/assets/questions.md');
const template = readFileSync(path, 'utf8');
const markdown = template.replace("<option 1a's drawn", '[example](missing.md)');
const broken = brokenLinks(path, markdown, (target) => existsSync(target) ? readFileSync(target, 'utf8') : null, resolve('skills/chart-issues'));
console.log(JSON.stringify({ expected: [], actual: broken }, null, 2));
deepStrictEqual(broken, []);
```

Repair: retain the opening fence length and close only on a matching marker with sufficient length. Add the smallest regression case for this criterion, show it red before the repair and green afterward, and rerun the planned proof and required checks. This is an implementation repair, with no locked decision or proof-command change required.

## Other criteria and documentation

- Criterion 1: the five same-folder links and seven SKILL.md substitutions match the plan. `planSkillLinks` still links each skill directory whole. Lexical resolution of each same-folder reference reaches its in-folder symlink, whose filesystem traversal reaches the shared text. No installer change is needed.
- Criterion 2: the index contains five mode-120000 lesson-rule entries, all with the same `../lesson-rule.md` blob, and one mode-100644 shared text. Its diff changes only the Seed and Home links into word references, preserving the rule.
- Criterion 4: opened the changed behavior's documentation in `skills/AREA.md`, `tests/AREA.md`, `docs/reference/skills.md` and `docs/use/learn-from-work.md`, following `docs/reference-index.md`. The shared-file mechanism is stated once. The two human-doc links still resolve to the shared file.

Both changed AREA files had their named paths listed from the repository root in one command: `check review-b-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/skill-links-in-folder/implementation/check-review-b-area-paths-1794393045314-67052.log` (read back). Skill paths exist. The tests listing's apparent missing `watch-check.e2e.ts` is a basename continuing the preceding `tests/e2e/` path, which exists. `issues/config.yaml` and `issues/merge-attempts.jsonl` exist in the registered checkout and are absent only from this sparse worktree. `cleared-<run>.md` and chart `direct/` describe runtime artifact locations, not fixed source files. Follow-up existence evidence: `check review-b-receipts: 0 .../implementation/check-review-b-receipts-1794393072266-191666.log` (read back). No dead-pointer Fix.

## Verification audit

The final reviewed tree is `2e90d471e0ec70ee19580eedeb606dbdd10e99b6`, identical to verified head `2d2082565546d391136bb6eab66880eaee883149`. The amendment changed the commit message only. `tests/docs-links.test.ts` last changed in `6e8fbcedd41cf7d8c7e65b3d9fa055cd4397d1dd`, before the final red, green and full verification runs. No runner, config, fixture or helper changed afterward. No planned test was skipped, filtered or disabled, and no proof-command correction was recorded or needed.

Read back these implementation logs with `akrogon log`:

- `check docs-links-final-red: 1 implementation/check-docs-links-final-red-1794392677686-2513153.log`: final test rejects all seven original escaping lesson-rule links. This proves the deliberate-break requirement.
- `check docs-links-traverse: 1 implementation/check-docs-links-traverse-1794392652442-2487369.log`: assets escape and missing-file errors, plus shared-file errors attributed to the reader-facing link path. Fenced and untracked examples are absent from the errors.
- `check docs-links-sparse-link: 1 implementation/check-docs-links-sparse-link-1794392661445-2496678.log`: committed symlink fallback traverses the absent link and reports its target's missing link through the reader-facing path.
- `check docs-links: 0 implementation/check-docs-links-1794392702210-2541327.log`: 10 tests pass on the delivered tree. This does not cover F1.

The `verify-runs.jsonl` receipt `2bac9e27-d6f9-46a8-a788-6fd2f25255aa` records successful setup and all configured checks with the planned commands. Format and typecheck logs were read back. `check test: 0 implementation/check-test-1794392957569-3198809.log` reports 1154 passing tests across 81 files, running `bun test --timeout=30000 --parallel=4 --no-isolate` as planned. Receipt evidence: `check review-b-receipts: 0 .../implementation/check-review-b-receipts-1794393072266-191666.log`.

The earlier configured test red is **inconsistent**, not known-red: `implementation/check-test-1794392775525-2550097.log` fails the agy reset-helper stage-order assertion in `tests/door-reset.test.ts:221`. The same-command retry, `implementation/check-test-1794392837570-2863615.log`, passes all 1154 tests. Both were read back. The diff changes Markdown and the docs-links test only, with no plausible cause for the reset helper stopping after its first stage. The later full receipt is green. No base-red filing applies.

No full-suite rerun was needed during review because the verified tree is unchanged. F1's focused red is caused by this leaf's parser change and requires repair. A receipt-discovery inspection initially used nonexistent filename globs and exited 2. The corrected inspection read `issues/verify-runs.jsonl` successfully. That inspection error was not a test result.

## Test-Change trailers

All trailers in base..HEAD, judged against `src/test-files.ts`:

1. `6e8fbced`: `Test-Change: tests/docs-links.test.ts brief criterion 3 + design standing rule: widened link check is the proof; adds bound and fenced-block cases to existing helpers, no existing expectation changed`. Accepted source: criterion 3 and the design's widened-check requirement. Existing assertions and fixtures remain. The parser's F1 defect is separate from the trailer's authorization.
2. `0bc7d2e9`: `Test-Change: tests/AREA.md brief criterion 4 doc checklist: the widened link-check line, doc text only, no test behavior changed`. Accepted source: the plan's D8/doc checklist and criterion 4's documentation requirement. This changes the test-area description only.

No Nits or operator actions. No grant-covered operations were planned or launched. The leaf's recorded check names are local inspections, setup, test and verification runs, consistent with its no-paid/no-live report.

## 2026-11-11 check.repair

Read both initial reviews against head `0bc7d2e91f05cd72682ea94322e0dcc50fe1d368`. B's F1 is the only Fix. A's N1 describes the same shorter-fence defect and is resolved by this repair.

F1 repaired in two commits:

- `d6284d65f450f7444f8948f713170732ff943f54`: adds one reproduction case matching the existing question template's four-backtick outer fence and three-backtick inner diagram. The test was shown red before the fix and committed separately.
- `0ebf3c9c243c0d1cdb205ebd7fa9ebe21924dc85`: retains the opening marker's length and requires a same-character closer of at least that length. The existing shared `proseOnly` helper serves both `linkTargets` and `headingSlugs`, so both callers receive the repair. No other parser instance exists in this file.

Both commits carry `Test-Change: tests/docs-links.test.ts` trailers citing F1, criterion 3 and the existing question-template source. No existing assertion, fixture or expected value changed. Only the parser and its one reproduction test changed. No documented behavior changed, no plan/design edit was needed, and no temporary files were created.

Red/green evidence, read back with `akrogon log`:

- `check repair-b-fence-red: 1 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/skill-links-in-folder/implementation/check-repair-b-fence-red-1794393290554-901829.log`: the new reproduction is the only failing test, reporting the fenced `missing.md` example as missing.
- `check repair-b-fence-green: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/skill-links-in-folder/implementation/check-repair-b-fence-green-1794393315815-927919.log`: the planned `bun test tests/docs-links.test.ts` proof passes all 11 tests after the final parser edit. Setup ran first under the configured install lock. The pre-existing delivered-tree link scan, written before B's repair, also passes.

The changed helper requires the planned link-check proof to rerun for criteria 1, 3 and 4, which the green run supplies. Criterion 2's symlink modes, targets and shared rule text did not change, so its earlier observation remains valid.

Criterion 3's deliberate break was repeated after the repair: temporarily changed plan-issue's lesson-rule reference back to `../lesson-rule.md`, ran the planned link-check command, and restored the exact original file in `finally`. `check repair-b-link-break: 1 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/skill-links-in-folder/implementation/check-repair-b-link-break-1794393437563-1299156.log` reports that escaping link as the only error. The restored tree passes all 11 tests: `check repair-b-restored-links: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/skill-links-in-folder/implementation/check-repair-b-restored-links-1794393449216-1311012.log`. Both logs were read back, and the latter command also confirmed an empty worktree diff.

`akrogon verify` completed green on committed head `0ebf3c9c243c0d1cdb205ebd7fa9ebe21924dc85`, tree `569efba227dea6ec67cc5389ad04ca58383236e8`, receipt `1b4dcef2-3307-4fb2-88f9-012d5c870168`. Setup, format, typecheck and the full configured test command all exited 0. No retry or known-red handling was needed. Read-back evidence:

- `check format: 0 implementation/check-format-1794393343542-953909.log`.
- `check typecheck: 0 implementation/check-typecheck-1794393345880-953909.log`.
- `check test: 0 implementation/check-test-1794393406014-953909.log`: 1155 tests pass across 81 files under `bun test --timeout=30000 --parallel=4 --no-isolate`.

The receipt itself was captured and read back through `check repair-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/shared-rules/skill-links-in-folder/implementation/check-repair-b-receipt-1794393424794-1286537.log`. The temporary verification terminal was removed after its successful exit. No `merge_checks` ran.

Nothing is handed to A. No operator action, unresolved Nit or covered operation remains.
