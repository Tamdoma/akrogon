# Report: installed-step-transfer

Slot A implement, serial-solo (plan.md: one unit, no workers). Base `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`, head `c127338e2188a4820b3c0560f82821588298b68d`. No grants, credentials, paid or live operations.

## Changed files

- `skills/lesson-rule.md` — Transfer bullet rewritten (plan D1): transfer now reaches an installed akrogon step by `realpath` classification; installed step gets nothing added, deletes the line with the `§` history citation (`release <sha>` under `<akrogon home>/releases/`, else `HEAD <sha>`), or proposes a rewrite counted as stay; checkable-never-transfers, leaf-never-transfers, `Applied` ban and Sort order untouched.
- `skills/learn-issues/SKILL.md` — `## Sort` Transfer bullet (D2): installed step named as eligible, covering sentence quoted in sort output, unreached step stays naming repo or install; `## Apply` Transfer bullet (D3): `realpath` classification, same-repo add-at-step unchanged, installed step's delete/rewrite procedure with the history-line formats. Footer text unchanged.
- `docs/use/learn-from-work.md` — Transfer bullet (D4): same outcome stated in user-facing terms.
- `tests/docs-links.test.ts` (planning commit `aed1ecb9`) — criterion-2 case asserting all five `skills/*/lesson-rule.md` index entries are mode `120000`.

Brief/design note (from plan.md, kept): the brief's history template reads `at release <sha>`; its B,C clause cites a checkout HEAD for the non-release case. The text spells both citation forms (`release <sha>` / `HEAD <sha>`) so the template never prints "release" for a HEAD sha; the release case keeps the brief's `at release <sha>` shape.

## Commands run

- `check criterion2-3-docs-links-leaf: 0 implementation/check-criterion2-3-docs-links-leaf-1794956072726-1896587.log` — `bun test tests/docs-links.test.ts` on the edited tree: 13 pass, 0 fail (proves C2 mode check and C3 link resolution on the new text).
- `verify leaf c127338e2188a4820b3c0560f82821588298b68d: green` — `akrogon verify` on the committed head; all configured checks green, `check test: 0 implementation/check-test-1794956245392-1918064.log` (1225 pass, 0 fail).
- Planning proofs (recorded in plan.md): `check criterion2-symlink-red: 1 implementation/check-criterion2-symlink-red-1794955981054-1592422.log` (deliberate break: index mode flipped to 100644, restored in the same command) and `check criterion2-3-docs-links: 0 implementation/check-criterion2-3-docs-links-1794955984999-1597959.log`.
- Refresh: `git fetch origin` + `git rebase origin/main` before the unit; branch was already current, no move, no conflict.

## Criterion 1: per-case walk

The new Sort/Apply text offers each case below what is named; the deciding sentence is quoted from the leaf-head text or the installed step. Reviewing seat judges the read.

- `2026-09-30-resolver-guidance-prose-tests` — **Transfer** to `standing-design.md` § "Standing design lines", the sentence "What a model is asked to decide (quality, sufficiency, relevance, similarity, wording, intent, which items apply and the like) is the model's choice ... no count, share, similarity score, keyword or output-text match ... stands in for it." An exact-prose assertion on agent instructions is a wording proxy, which that sentence states; the case's evidence sits on check-issue review paths (review B Nits). Deciding sentence in the new text: Apply's "when it already states the lesson's rule, delete the line and append `Transferred ...`".
- `2026-09-30-offer-analytics-guide-checks` — **Transfer** to the same standing-design sentence: a regex asserting `@heading`/`steps` on one physical line is an output-text match on model-readable instructions. Same deciding sentence.
- `2026-10-01-discovery-prose-assertions` — **Transfer** to the same sentence: required phrases (`surface the staleness`, `non-empty path segments`) are wording, the model's choice. Same deciding sentence.
- `2026-10-03-prefix-regex-does-not-prove-meaning` — **Rewrite candidate** against the model-choice line (reassessed for B F1, 2026-11-18): its first sentences carry the guarantee-vs-wording rule the installed line states, but the learning's final instruction, "Seed a break of the claimed meaning and a harmless wording change to distinguish the two," is a deliberate break holding an expected value over prose meaning, which the installed line forbids ("The choice itself takes no test, case or deliberate break holding an expected value"; "a proxy for a model's choice is a false expectation under this line"). The case's own evidence agrees: the seeded key deletion "proves key membership, not the explanation distinctions." That is contradiction, not partial coverage: the proposed rewritten line keeps the guarantee-vs-wording rule, drops the seed-break instruction, and appends `<YYYY-MM-DD>: rewritten against <installed citation>, approved by <who>: <reason>`. Deciding sentence: Apply's "when it contradicts or only partly covers the lesson, propose the rewritten line in the same diff ...".
- `2026-10-05-analytics-guard-proof` — **Rewrite candidate** against the same standing-design line: it carries the lesson's prose-guard judgment rule, but the lesson's "retained outcome probes" duty (agent-executed fixtures that distinguish real conditions) is only partly covered by the installed recorded-output rule, which governs proof replay rather than requiring the probes. Deciding sentence: Apply's "when it contradicts or only partly covers the lesson, propose the rewritten line in the same diff and append `<YYYY-MM-DD>: rewritten against <installed citation>...`".
- `2026-10-08-residue-triage-prose-proof-layout` — **Rewrite candidate** against the same line: covered for judging prose by substantive content, but "one real recording does not establish a presentation contract ... exercise the actual report reader" adds a duty the model-choice line does not state (the recorded-output rule covers replay validity, not rejecting one recording's layout as contract). Same deciding sentence.
- `2026-10-17-noop-step-commit-proof` — **Rewrite candidate or Transfer** against `skills/plan-issue/SKILL.md`'s proof-command rule, deciding sentence "A done-criterion locks only its observable result; `plan.md` owns the command that proves it" and the correction rule that replaces a wrong proof command. That covers "a plan's proposed observable can be wrong without the binding behavior changing"; "judge completion against the operation's permitted outcomes" is only partly stated, so the sort offers a rewrite keeping the permitted-outcomes clause against the installed citation.
- `2026-09-12-injector-and-routes` — **Stays with a stated reason**: no installed akrogon step states "name each criterion-enumerated item verbatim in the record"; report-record requirements in implement-issue name links and evidence, not verbatim enumeration. Deciding sentence: Sort's "a judgment lesson whose step is not reached stays and names the repo or install where it would live."
- `2026-10-29-cross-site-repeat-fix-layer` — **Stays with a stated reason**: the lesson is about the framework's deterministic floor vs model judge (`verify-network.ts` `rawPageSentences`), a path no akrogon step reaches. Same deciding sentence.
- `2026-10-16-stash-shared-across-worker-worktrees` — **never transfers**: checkable (a fixed `git stash` pattern in worker briefs). Deciding sentence, unchanged: "a checkable lesson never transfers."

The sort runs for real only in the framework checkout in a later `/learn-issues` pass; this leaf changes rule text read by models, so the per-case outcomes above are this seat's read, not executed transfers.

## Criteria 2–4

- **C2**: five `skills/*/lesson-rule.md` entries are mode `120000` on the leaf head (`git ls-files -s` inside `check criterion2-3-docs-links-leaf`, green). "Same Transfer" across `skills/lesson-rule.md`, learn-issues Sort and Apply, and `docs/use/learn-from-work.md`: all four name the `realpath` classification, the same-repo `<file:line>` form, the installed `§` citation forms, the rewrite-with-history form, the stay count for rewrites and the unchanged exclusions; prose consistency read by the reviewing seat per plan C2, no script wording assertion (exact-prose checks are what this leaf retires).
- **C3**: links in the changed files resolve — `bun test tests/docs-links.test.ts` green on the leaf head; the new text adds no relative links (standing-design named as text inside `SKILL.md`, where a `../chart-issues/...` link would break the folder bound).
- **C4**, stated: the framework lines leave only in a later framework `/learn-issues` pass with operator approval (Tamdoma/tamdoma-framework#650); naming a one-right-answer source in kept lessons' histories stays framework work (design Q5 5b); an orphaned transfer after a later akrogon edit goes undetected (accepted cost).

## Known limitations

- Criterion 1 stays unproven in the mechanical sense by design: whether each framework lesson transfers is the sorting model's choice in a future framework pass; this report's walk and the changed rule text are what the reviewing seat reads.
- No framework files were edited; `learnings/` in this repo unchanged.

## Implementation notes

No implementation-only constraint beyond plan.md surfaced. No model-choice readings beyond the criterion-1 reading plan.md already records. No test edits at implement (the criterion-2 case was committed at planning, `aed1ecb9`).

## check.fix — 2026-11-18

- Input: B's `Handed to A` F1 — redo the `2026-10-03-prefix-regex-does-not-prove-meaning` criterion-1 reading, weighing the history's seed-break instruction against the installed rule. Repaired above in the criterion-1 walk: outcome changed from Transfer to rewrite candidate, with the contradiction named and the rewritten-line form recorded. `plan.md` `## Implementation notes` carries the same correction dated 2026-11-18.
- Repair commits: none — record-only repair; head remains `c127338e2188a4820b3c0560f82821588298b68d`, product diff unchanged, so criterion-2/3 proof from `check criterion2-3-docs-links-leaf` and the green verify receipt on `c127338e` stand.
- Refresh: `git fetch` + `git rebase origin/main` — already current, no move.

## check.fix — 2026-11-18, red-merge pass

- Rejected run: merge attempt `ccec1674-d4f3-48db-a32a-ef7578e5ff75`, target `868cac1b071ea34adf5e5e58e89dc2f8192714a3`, applied top `a8c64d1d4500b0380cf81ca7a9a190feebd37f28`. Recorded command `bun test --timeout=30000 --parallel=4 --no-isolate`, exit 1, 1224 pass/1 fail — `tests/hc-identity.test.ts:130` (run `21160252`, log `check-test-1794956666827-3694216.log`) then `tests/next.test.ts:514` on the unchanged-head retry (receipt `eb1d85e9`, log `check-test-1794956761350-3978877.log`). `verify --known-red` judged `fail` because base `868cac1b` already holds whole-green receipt `21875ec0`.
- Reproducing commands and rerun: `akrogon run-check --name checkfix-repro-next -- bun test --timeout=30000 tests/next.test.ts` → `check checkfix-repro-next: 0 implementation/check-checkfix-repro-next-1794956831036-71187.log` (201 pass); `akrogon run-check --name checkfix-repro-hc-identity -- bun test --timeout=30000 tests/hc-identity.test.ts` → `check checkfix-repro-hc-identity: 0 implementation/check-checkfix-repro-hc-identity-1794956839146-144687.log` (7 pass). Both green on the rejected head `a8c64d1d` over base `868cac1b`; the narrowest commands are green, so no repair was needed.
- Refresh: `git fetch` + `git rebase origin/main` — already on the rebased top, no move.
- Normal proof: `akrogon verify` on committed head `a8c64d1d` → `verify leaf a8c64d1d4500b0380cf81ca7a9a190feebd37f28: green`, `check test: 0 implementation/check-test-1794956956748-180957.log` (1225 pass, 0 fail; format and typecheck also exit 0 in the same receipt). Both merge-run failures reproduce neither in isolation nor in the full suite on the identical head; cause is flake in hc fixture process/socket timing, outside the leaf's diff (prose + one index-reading test).
- Commits: none this pass; the merge attempt's rebase rewrote the leaf commits as `8141972a` (test, `Test-Change` trailer carried) and `a8c64d1d` (prose).
