# Intake: plan-is-contract

## Scope
Destination: `plan.md` is the whole-leaf execution contract. The mandatory second whole-leaf `implementation/brief.md` goes. One completion record stays. Worker sub-briefs stay for delegated units. implement-issue, check-issue, brief-template.md and the guide lines that describe the brief change. One prose leaf in akrogon; no command change.

## Provenance
- Operator: 2026-09-14 chat, "ok, let's chart in that order. Let's go", accepting the L3 line below.
- Operator-placed source: `astra-6-akrogon-audit.md` F2 at the repo root, named in the L3 line.

## Source: operator 2026-09-14
L3 Plan is the implementation contract. Astra F2. implement-issue, check-issue and the brief template change. Worker sub-briefs and the report stay.

Goals for this charting: keeping simplicity, not increasing complexity unless it REALLY benefits the process, but even then only minimal. Then cost, then speed.

## Source: Astra F2, verbatim
**Claim.** Akrogon requires B to rewrite an execution contract that B has just synthesized. This duplicates acceptance criteria, read-first paths and ordered work without creating an independent check.

**Proposal.** Keep `plan.md` as the whole-leaf execution contract. Put any implementation-only constraint missing from that contract there once before execution, then retain one completed implementation evidence record. Write a separate worker brief only when delegating a bounded subset whose scope differs from the whole leaf. Do not delete the operator brief or the locked design.

**Removes.** The mandatory second whole-leaf contract and the requirement to restate its criteria, interfaces and ordered steps. Checker and merger read the plan plus completion evidence instead of two versions of the same instruction.

**Keeps.** Original intent, binding decisions, plan grounding, scoped worker boundaries, mismatch returns, tests and actual completion evidence. Worker reports remain subordinate to B's verified leaf-level result.

**What breaks.** A consumer that expects all execution instructions at `implementation/brief.md` needs its read path updated once. A worker receiving only a scoped brief still needs all binding facts relevant to its scope. The change must not replace those facts with an unexplained pointer.

## Agent findings
Verified 2026-09-14 against `skills/`, `docs/guide/` and the three registered repos' `issues/`.

1. Read paths. implement-issue SKILL.md:21 reads `plan.md` and `implementation/brief.md`; :33 writes the brief from the template; :55 standalone plans in `implementation/brief.md`. check-issue SKILL.md:14 reads `plan.md`, `implementation/brief.md` and ponytail; :22 judges against "plan, brief criteria/change list/exclusions/done/report and live contracts". merge-issue SKILL.md:14 reads "plan, implementation report and reviews". plan-issue SKILL.md:14 reads `brief.md` and `design.md`. Neither implement nor check reads `design.md`.
2. Template. brief-template.md line 5 makes the whole-leaf brief mandatory and gives sub-briefs `brief-1.md`, `brief-2.md` the same eight sections. Section 8 ends in four fill-in report lines. worker-protocol.md has workers "return the brief's report and changed-test output" and B judge "the four contents, not their headings or order".
3. Counts. akrogon: 37 leaves, 36 `brief.md`, 19 sub-briefs in 9 leaves, 14 `report.md`. framework: 96 leaves, 95 `brief.md`, 158 sub-briefs, 39 `report.md` plus 22 `report-1..3.md`, 10 `brief-fix-1.md`, 13 `leaf-log.md`. pi-extensions: 5 leaves, 5 `brief.md`, 2 sub-briefs, 3 `report` without extension, plus `plan.md`, `a.md`, `b.md` under `implementation/`. No skill names `report.md`; it is the worker return the protocol describes, saved by B under three different names.
4. Sizes. akrogon closed leaves: plan 4.7 to 21 KB, brief 2.6 to 10 KB, the brief 40 to 100 percent of its plan. `status-empty-open-fix`: 5,298 and 5,311 bytes with the same decisions and criteria. The brief's only new content is section 7 (the resolved changed-test command with `AKROGON_BASE`) and the filled section 8.
5. Command. `grep -rn implementation src/ tests/` is empty. The change is prose only. `akrogon phase` refuses `issues/` files on the branch, so every artifact is written in the registered checkout.
6. Guide and index. phases.html:61 (implement "writes implementation/brief.md"), files.html:104 (row), skills/AREA.md:25 ("gives the eight-section contract"). merge-issue:14 already says "implementation report".
7. Report gaps. Slot B review F-B4: pi-extensions `bash-row-renderer` merged with the four placeholder lines unfilled. check-issue:39 blocks a report gap only when material to correctness or verification. Astra H8: replace template presence with one material completion record, keep semantic review, merge with F2.
8. Plan sections today (`status-empty-open-fix`): Decisions, Read first, Grounding and review note, Acceptance criteria, Ordered execution checklist, Interfaces and dependencies, Open limitation. Absent: exclusions (the design carries them), the resolved changed-test command (known only at implement from `akrogon config` in the worktree), a report shape.

## Practitioners
Anthropic's Claude Code guidance (code.claude.com/docs/en/best-practices, primary docs the team runs internally, read 2026-09-14): explore, plan, implement "verifying against its plan", and show evidence rather than asserting success. Anthropic's research-system team (anthropic.com/engineering/multi-agent-research-system, first-hand write-up, read 2026-09-14): each delegated subagent needs an objective, an output format, tool guidance and clear boundaries; vague delegation duplicated work. Birgitta Böckeler, Thoughtworks (martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html, 2025-10-15): tried Kiro, spec-kit and Tessl, found the markdown pile overkill for a medium feature, "I'd rather review code than all these markdown files", and watched agents ignore notes inside specs. Addy Osmani, Google Chrome (addyosmani.com/blog/good-spec, 2026-01-13): layered spec, plan, tasks; "If you discover that the spec was incomplete or unclear, update the spec document". GitHub spec-kit (github.com/github/spec-kit/blob/main/spec-driven.md, primary docs): tasks are derived from the plan and the implementer reads tasks, writing no further document. Google engineering practices (google.github.io/eng-practices/review/developer/cl-descriptions.html): a change description states what and why, with limitations and results in the body.

They agree on one contract, evidence over assertion, and a bounded brief for anything delegated. They split on layers: Osmani and spec-kit keep a tasks layer beside the plan, Böckeler would cut layers and take small steps. What flips the advice is size: a large feature with several people earns layers, a leaf-sized change does not. Akrogon's plan already holds the ordered checklist, so the tasks layer sits inside it, and the practitioners' evidence rule lands on the completion record.
