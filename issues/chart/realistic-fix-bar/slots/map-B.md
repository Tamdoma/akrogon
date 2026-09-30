# Territory map B: #43

Blind inspection, no A work read, no locks. Operator note: "it's killing me how detailed the new slot b check-issue model is. It's good, but it finds details that will almost never be used in production, and we need to compromise on that a bit so the leafs move faster."

Case references below mean `/home/ivan/Work/infra/tamdoma/framework/issues/open/landing-multi-offer/offer-join-deploy/review-B.md`.

## Findings and practitioner research

- **F1:** Reproducibility currently suffices without production reachability. Several independent rules can block: defect/contract, missing tests, documentation, rule duplication and target-size checks (`skills/check-issue/SKILL.md:35-49`). Changing only line 43 leaves bypasses.
- **F2:** The late cases prove behavior, not production likelihood. Round 4 manufactures a nested template containing import-like content (`Case:541-559`). Round 5 manufactures regex data inside interpolation and proves a current/prior-head regression (`Case:586-610`). Neither cited section identifies a real producer of that input. This does not prove no producer exists.
- **F3:** The lifecycle already distinguishes advisory findings. `nits` permits merge; any `fix` sends repair and can exhaust the cap (`src/phase.ts:227-235`). The count increments on review-to-repair and resets on recovery from failed (`src/phase.ts:107-112`); default cap is three (`src/config.ts:32`). A larger cap would prolong this problem.

Practitioner sources, read 2026-09-30:

- [Google Engineering Practices: review standard](https://google.github.io/eng-practices/review/reviewer/standard.html): Google's engineering team favors improving code over demanding perfection and treats unimportant polish as optional. It explicitly rejects using this principle to worsen overall code health.
- [Google: what to look for](https://google.github.io/eng-practices/review/reviewer/looking-for.html): reviewers still examine edge cases and concurrency, but resist functionality for speculative future needs. This supports limiting scope, not assuming all unusual inputs are irrelevant.
- [GitLab Engineering: code-review guidelines](https://docs.gitlab.com/development/code_review/): its production review process labels nonmandatory suggestions nonblocking and advances when only those remain. It also expects requirements and correctness, so it does not establish that every synthetic defect is optional.

Synthesis: both experienced teams distinguish required repairs from optional improvements and protect forward progress. Neither supplies a probability threshold or endorses downgrading every genuine regression. The intake's production-plausibility rule is an operator policy that needs a precise boundary.

## Material forks

**Q1. What evidence makes a defect realistic enough to block?**

- **1a (recommended):** Require a credible path from a supported build, user action/content, integration or reachable trust boundary to the failure, plus its consequence. A code/data-flow trace or representative producer output can suffice; production history is unnecessary. A handcrafted reproduction alone does not establish that path. Without it, record a Nit and the missing evidence.
- **1b:** Block only after observed production input or an actual build reproduces it. Stronger proof, but misses new-feature defects and legitimate security/concurrency findings.
- **1c:** Continue blocking every valid reproducible input. Preserves the present problem.

Evidence: `skills/check-issue/SKILL.md:31,41-49`; `Case:545-559,590-610`. Google's edge-case guidance supports 1a over requiring prior incidents. Apply the same bar to both initial seats and every B re-check; newness or an old Fix label does not establish plausibility (`skills/check-issue/SKILL.md:10,53`).

**Q2. Can a broad correctness promise override the plausibility bar?**

- **2a (recommended):** Keep failed configured checks and explicitly demanded acceptance scenarios blocking. A general claim such as “only references normalize” still needs Q1's realistic path for a newly invented counterexample. Reachable malicious input counts as realistic even when uncommon. Maintainability findings need a concrete current maintenance consequence, not a fabricated input.
- **2b:** Any broken promise blocks regardless of realistic use. Broad parser contracts would keep the reported loop alive.
- **2c:** Downgrade even failed required checks or explicitly demanded cases when judged unlikely. This conflicts with the current contract/check rules and would require authorizing their revision.

Evidence: `skills/check-issue/SKILL.md:33,43,47,49`; `skills/implement-issue/SKILL.md:50,56`; `Case:530,541,586`; `skills/check-issue/ponytail.md:28-30`. Challenge: 2a deliberately accepts some known theoretical defects, whereas Google's standard warns against degraded code health. Do not claim that Google specifically endorses this compromise.

**Q3. Where does a deferred finding live, and must anyone repair it now?**

- **3a (recommended):** Record the reproduction, reason for deferral and evidence that would justify promotion in the existing review's Nits. It is optional follow-up, excluded from this leaf's required repairs. No automatic ticket or extra lifecycle state.
- **3b:** Require a new tracked issue for each deferred finding. Adds external writes and backlog work beyond the current review record.

Evidence: `skills/check-issue/SKILL.md:41,55`; `docs/guide/learn.md:3-9`; `skills/implement-issue/SKILL.md:56-60`. The repair instruction currently reads all recorded findings without explicitly separating mandatory Fixes from optional Nits. GitLab's nonblocking labels support making that distinction explicit.

## Practitioner questions

- **Q4:** Would the new rule classify F12/F17 as Nits on the evidence actually recorded, rather than merely reword their severity? Their synthetic browser proof and F17's regression proof are strong, but establish no producer path (`Case:545-559,590-610`).
- **Q5:** What happens when a generic criterion sounds universal but the operator wants practical coverage? Settle Q2 before handing off; reviewers cannot silently change acceptance criteria (`skills/implement-issue/SKILL.md:56`).
- **Q6:** How will judgment be checked? Use reviewed scenarios: contrived parser input, ordinary supported build, realistic boundary exploit, missing test for a reachable failure, and a repair-introduced contrived regression. Do not write string-matching tests for skill prose (`skills/check-issue/SKILL.md:45`).

## Pitfalls

- **R1:** “Valid JavaScript” and “Chromium executes it” are not proof of a supported production producer. Conversely, rarity alone does not dismiss realistic exploits, data loss or concurrency failures.
- **R2:** Independent automatic-Fix wording at lines 35, 37 and 47 can defeat a revised definition. Harmonize the rules, including the re-check at line 53, rather than stacking contradictory exceptions.
- **R3:** A can accidentally repair deferred Nits while repairing genuine Fixes. Clarify their nonmandatory status in the consumer (`skills/implement-issue/SKILL.md:56`).

## Off route and fog

Off route: changing models/reasoning effort, fix-round limits, routing/state schemas, deployment/test cadence, framework's parser, or retroactively revising the running framework leaf. Expected scope is review/repair instructions and directly affected guide wording (`docs/guide/phases.md:99-105`, `docs/guide/learn.md:5-7`); ponytail guidance needs reconciliation only if the chosen policy conflicts with it.

Fog remains: the plausibility evidence bar, precedence of explicit contracts/checks, and whether “deferred follow-up” means the existing review record or a required new ticket. The case report establishes the defects but not production likelihood; do not invent that missing evidence. No probability percentage, severity scoring system or review time limit is justified by the supplied intake.
