# Design: known-red-filing

## Binding decisions, verbatim

From `issues/chart/known-red-intake/forks/filing-rule.md` `## Taken` (autopilot pick by A, 2026-10-27, not operator words):

1. Trigger and filer: on every route the seat that judged a red also red on base with no cause in the diff files it through the `seed-issue` skill inside its pass: implement end and check.fix (implement-issue Shared context known-red rule), check.review and check.repair (check-issue known-red rule, either slot), merge red verify (merge-issue), and the door's direct landing (chart-issues `## Direct route` landing step 3). It fires for a configured command after a `verify --known-red` pass whose judgment agrees, and for a command outside `checks` (done-criterion proof or ad-hoc suite) when the seat's own completed base run of the same command fails the same tests. A green retry (`inconsistent`), a disagreeing judgment, or a killed or incomplete base run is not filed as a base red.
2. Filing never changes a verification status: a red done-criterion stays blocking, a known-red pass stays a pass. The filing reuses the evidence the pass already holds and starts no extra verification. seed-issue's `Next: none` footer becomes a line in the pass record and the pass continues to its own phase action and footer. A `gh` failure while filing is not an operator blocker for the leaf.
3. Content: one report per observed defect, grouping commands and failing tests together only when evidence supports a common cause, otherwise filing them separately rather than delaying intake or inventing a cause (B final check); it names the exact command and scope, the head and compared base SHAs, the retry result, a short failing excerpt, kept log paths and the leaf, and claims nothing about main beyond the compared SHA.
4. Already filed: seed-issue's existing lookups judge coverage by mechanism. An open covering report suppresses the filing and its URL is recorded. In seed-issue, a closed report covers only through an open report it names (closed as duplicate) that covers the failure; a supported recurrence of a defect whose closed report's fix was delivered, or a current defect with no open covering report, posts fresh with the closed report on its Related line, never reopening or commenting. Best-effort, not exactly-once.
5. Failure: the created or found URL, or the failing command and its error, is recorded in that seat's own pass record (`implementation/report.md`, `review-<slot>.md`, `review-B.md` at merge, or `<chart>/direct/report.md`); the leaf continues; no retry queue, timer or wait; a later encounter files through the ordinary lookup. No eventual-delivery guarantee.

Reason: the seat's existing judgment gate is the only place that both knows the red is main's and sees commands outside `checks`; seed-issue already owns routing and dedupe, so the change is skill text with no new code path, store or outside call in akrogon code.

Rejected: verify calling `gh` (misses the #121 case, runs before judgment, duplicates routing); a local record under `issues/` (leaf branches cannot write it, not a bug filing); one report per test (38 for one cause); keeping today's closed-report rule (a closed report hides a returned red); blocking until filed (reintroduces the foreclosed base-red wait).

Carried locks: known reds pass inside `akrogon verify`; nothing waits or is marked failed for a base red (`issues/chart/base-red/forks/red-base-policy.md` `## Taken`, 2026-10-17). Done-criteria proofs stay blocking. No new timers or polling.

Off route (chart record, not this leaf): removing or changing the herdr main-red notice in `src/verify.ts`; skipping a base comparison because a filed report exists; auto-charting repair; closing issues on green; Tamdoma/akrogon#120 (owned by `killed-check-log`).

## Standing design

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. This leaf changes skill text only. No auth, server, secret or backend mutation is touched. No test is added: each done-criterion is a stated rule in a named skill section, proven by reading that section, and criterion 7 by the diff listing; a test asserting skill wording would be a vanity test. No live run, outside call or model stage runs during implementation.

## Leaf architecture

Owned surfaces:
- `skills/seed-issue/SKILL.md`: a new section for filing from a lifecycle pass (criterion 5), and the covering-report sentence in `## Report` (criterion 6). The standalone flow (Destination, Report, Submit and finish) is otherwise unchanged; the new section says the caller's record takes the final two lines instead of the turn ending there.
- `skills/implement-issue/SKILL.md` Shared context known-red paragraph (criterion 1).
- `skills/check-issue/SKILL.md` check.review known-red paragraph (criterion 2). The check.repair sentence that refers to "the check.review paragraph beginning 'During check.review, a red test or check'" keeps working only if that paragraph's opening words stay unchanged.
- `skills/merge-issue/SKILL.md` red verify paragraph (criterion 3).
- `skills/chart-issues/SKILL.md` `## Direct route` landing step 3 (criterion 4).

State the filing contract once in seed-issue and point to it by section name from the four seat skills. Each seat skill keeps only its own trigger point and record file.

Consumers of changed preconditions:
- implement-issue's operator-blocker stop (Shared context, the paragraph about operator-only blockers) must not catch a `gh` failure while filing. Criterion 1 states the exclusion where the filing is introduced. Open for the plan: whether the operator-blocker paragraph also needs a one-clause exclusion so the two never read as conflicting.
- seed-issue's routing owner test reads paths "the report names as the failure's location". A lifecycle filing cites skill paths as context. Open for the plan: whether the new section must say that the failure's location is the failing test or command path, so a framework test routes to the framework and not to akrogon.
- `docs/reference/checks.md` `## Known red` already defers seat rules to these skills and needs no change.

Exclusions: no change to `src/`, `tests/`, `docs/` or `issues/`.

Dependencies: none. Sources: Tamdoma/akrogon#121.
