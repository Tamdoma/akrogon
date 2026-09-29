# Draft contract: independent round B

Locks accepted: completion will retain charts in issues/chart without a Closed marker; readable capacity uses normal activity plus one reservation per unreadable entry; phase lookup remains strict. These are chosen contracts, not a claim that implementation has shipped. No draft-contract Findings or competing slot files read. Sources are repository contracts, code and supplied framework evidence. No outside research was needed or performed.

## Q1. Does the door contract still need a change?

**O1 (recommended): no change for #39.** Keep the existing brief/design review and handoff contract. Do not add a draft filename convention, temporary storage requirement, validator or migration.

Why: `skills/chart-issues/SKILL.md:61` already asks for every brief and design to be drafted, not a staged lifecycle state. `skills/chart-issues/assets/questions.md:46` places post-creation peer exchanges under chart slots and requires exact output paths. `skills/chart-issues/assets/shapes.md:15` says charts have no state.yaml or lifecycle phase, while line 172 defines the final state write after brief/design. “Scratchpad” is imprecise, but these rules can be followed together without changing the workflow.

More importantly, the chosen archive fix removes the dependency between draft representation and leaf discovery. Both scanners start at open/closed (`src/next.ts:110-113`, `src/state.ts:104-107`). Once completion stops transferring charts into those roots, a poorly named draft inside a retained chart cannot cause this incident. Correctness should not depend on the agent remembering an additional filename rule.

**O2: clarify location only.** Replace “scratchpad” in SKILL.md:61 with an explicit chart-slots location for brief/design drafts, referring to questions.md:46. Keep the existing no-lifecycle-state rule and final handoff sequence. This resolves a wording ambiguity if the operator wants a defined persistent home for review drafts, but it adds no necessary runtime protection under the locks. No new leaf is justified solely by this clarification.

**O3: standardize complete draft bundles with state.draft.yaml.** This permits review of prospective state fields in a separate file and formalizes the manual workaround. It also introduces a draft representation and conversion step that the mandatory exchange does not currently require (`SKILL.md:61`, `assets/shapes.md:172`). Reject for this issue: the archive boundary already supplies the protection, and reviewing state correctness remains part of the handoff audit regardless of file format (`assets/shapes.md:168-172`).

## Evidence and practitioner challenge

- F1: The current open framework example already uses prose drafts: `issues/chart/renderer-nav-chrome/slots/leaf-draft/site-nav.brief.md:1-12` and `site-nav.design.md:1-18` under `/home/ivan/Work/infra/tamdoma/framework`. The inspected leaf-draft directory contains brief/design Markdown and ISSUE.md, with no state draft. This demonstrates a usable existing representation, not proof that every future door follows it.
- F2: The eight renamed state drafts now appear under framework's closed charts, rather than the open chart locations seen in the earlier map. An example still carries executable leaf fields (`issues/closed/audit-prose-and-log/chart/slots/leaf-draft/comparison-log/state.draft.yaml:1-9`). This evidence supports the original incident and manual recovery, not a need to standardize that workaround.
- F3: Practitioner challenge: “The instructions already existed and the agent still wrote state.yaml. Why leave them unchanged?” Because the selected code change removes the operation that made that mistake dangerous. Another prose restriction would not enforce the boundary more reliably. If the operator independently needs predictable draft storage for review/resumption, O2 is a reasonable workflow choice, but that is distinct from fixing dispatch.

## Pitfalls

- R1: Do not call a state.yaml in chart slots compliant merely because it becomes harmless to scanners. The existing chart contract still says no lifecycle state (`assets/shapes.md:15`). O1 keeps that rule.
- R2: Do not move, rename or delete framework evidence as part of implementation. Existing archived charts stay where they are under the archive-boundary lock, and the intake excludes consumer repair.
- R3: Do not replace the archive regression with a wording test. Verify completion retains a chart containing nested draft state files and that those files never enter leaf inventory. The approved runtime boundary must work even when draft prose rules are violated.

Decision requested: O1, no additional door-contract change. The archive and capacity leaves remain the work needed for this issue.
