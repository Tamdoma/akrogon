# Round 2 B: classification and a guide for first-time operators

This round settles how README describes Akrogon, how deeply the guide is rewritten, and whether conversion and rewriting ship together. The audience already uses coding agents but has not operated a system that takes work through planning, implementation, review and merge. Round 1 still governs the entrance, page locations, removal of illustrations and HTML machinery, the link test, and the new gacp page. Only its narrow content-correction boundary has been reopened. No A files were read.

## Research findings

Sources below were read on 2026-09-19. These definitions are published usage, not an industry certification.

- **Practitioner:** [Simon Willison, “How StrongDM’s AI team build serious software without even looking at the code,” 2026-02-07](https://simonwillison.net/2026/feb/7/software-factory/). Willison develops agent tooling and reports a firsthand visit to StrongDM's working system. His account emphasizes the validation needed when people no longer review implementation code, including independent scenarios and simulated services. It supports distinguishing an agent workflow from a demonstrated lights-out production system.
- **Practitioner / primary implementation account:** [StrongDM AI Lab, “Software Factories and the Agentic Moment”](https://factory.strongdm.ai/). The team describes its own noninteractive, specification-and-scenario-driven development system. This is a stricter factory model, with agents implementing and validating without human code review. It is evidence of one operating model, not a requirement every product using the term must satisfy.
- **Vendor / primary documentation:** [Factory, “Inside the software factory, and what it takes to build one,” 2026-07-18](https://factory.com/articles/what-is-a-software-factory). Its definition is broader: repeatable inputs, standardized tooling and measurable outputs, with scoped work becoming validated changes. This is the sense in which Akrogon fits.
- **Practitioner / primary framework:** [Daniele Procida, Diátaxis: Start here](https://diataxis.fr/start-here/) and [How to use Diátaxis](https://diataxis.fr/how-to-use-diataxis/). Distinguish learning by doing, accomplishing a task, looking up facts and understanding why. Apply these distinctions to improve existing material rather than imposing empty categories or a new documentation structure.
- **Model knowledge:** not used as an authority for the definition. The classification and rewrite estimates below are my inferences from these sources and inspected repository code.

Synthesis: the sources agree on moving beyond individual prompts to a repeatable system for producing validated changes. They differ on the autonomy and validation that deserve the strongest label. Akrogon provides lifecycle routing, configured checks, agent review and merge instructions. The inspected code does not establish StrongDM-style independent scenario validation or a production deployment system. Human ownership of scope is compatible with a factory, and agent review is not human review. Avoid claiming that all factories must be dark factories, or that Akrogon requires a person to approve every merge.

### Q1 · Should README call Akrogon a software factory, or describe its mechanism without that label?

Akrogon's routes cover planning through merge (`src/routing.ts:26-43`). Harnesses are configured separately from those roles (`src/next.ts:218-225`), and merge instructions run configured checks and push to the configured branch (`skills/merge-issue/SKILL.md:25,33-39`). The mechanism supports the broader factory classification.

Research: practitioner first · Willison and StrongDM above show the stricter model; vendor/primary · Factory supplies the broader definition; repository primary · the routing and merge surfaces establish what Akrogon actually does. The distinction changes the adjective and explanation, not product scope.

- **A (recommended):** Use this sentence: **“Akrogon is a lightweight software factory that runs work you define through planning, implementation, review and merge using two configurable coding-agent seats in Herdr.”** Follow it with a short explanation of operator responsibility, configured checks and visible failures. It answers the audience's question while stating the actual mechanism.
- **B:** Use **“Akrogon coordinates two configurable coding-agent seats in Herdr to plan, implement, review and merge work you define.”** Explain later that this is a small software-factory workflow. This avoids an unsettled category in the opening sentence but is less direct for readers seeking their first factory.

Pitfalls: do not say two vendors are required, or claim unattended success, independent validation, deployment or production readiness. The current machine config uses pi with `devin/swe-2-max` in both slots (`config.yaml:2-10`). A and B are roles, not brands. A factory label does not establish the quality of a repository's checks.

### Q2 · Should every page be rewritten around the reader's task, or should we retain the prose and patch errors?

The operator has authorized rewriting where needed and explicitly named the audience. The guide already contains useful topics, but a reader cannot reliably copy its examples or infer its behavior from several current claims. A short factual patch pass will not explain concepts such as a registered checkout, leaf, worktree or phase from first principles.

Research: operator · `forks/round-2-carry.md` reopens the old correction boundary and asks for both first principles and practice; practitioner · Procida's framework separates practical steps from deeper explanation without requiring a new site structure; repository primary · the drift table below shows this is substantive content work.

- **A (recommended):** Review and rewrite every page for this audience, preserving useful content and the settled topic paths. Introduce the concept and why it exists, connect it to the workflow, then show a realistic use or interpretation. Task pages state prerequisites, which checkout/session to use, the command or skill, the expected result and what to do when it fails. Reference pages explain fields with examples rather than inventing tasks. Use one small issue as a running example. Rewrite outdated facts against current code/configuration and skill contracts, not against the previous prose.
- **B:** Keep the existing narrative and patch verified errors, adding short definitions and examples only where necessary. Smaller editing effort, but it risks leaving unexplained jumps and contradictions between individually patched pages.

Pitfalls: first principles means explaining this system's concepts, not teaching programming or all of Git. Use short contextual definitions and links instead of repeating the same explanation on every page. Do not force identical section headings or an example command onto a conceptual page. Preserve the README reference tables in place, but correct their facts and affected semantic tests when evidence requires it. Keep machine-specific paths and model selections out of universal claims. Do not change code to make it match the guide.

## Verified rewrite scope

Repository paths below are relative to `/home/ivan/Work/infra/akrogon`.

| Finding | Guide statement or example | Inspected current authority and required treatment |
| --- | --- | --- |
| F1: Seat identity | A is Claude, B is Codex; introduction requires different vendors (`docs/guide/parts.html:72`, `idea.html:59,82`, `index.html:57`) | `config.yaml:2-14`, `src/next.ts:218-225`. Explain slot, harness and model separately. Treat vendor diversity as a choice, not an invariant. |
| F2: Valid leaf layout | Example creates `issues/open/rename-flag/state.yaml` directly (`docs/guide/create.html:67-83`, `parts.html:84-94`) | `src/state.ts:86-97` permits depth two or three beneath open, not one. Use an issue folder containing a leaf folder. This is a broken starter example, not stylistic preference. |
| F3: What drives dispatch | Phase is the only signal (`docs/guide/parts.html:71`, `state.html:79`) | `src/next.ts:408-419,512-542` also checks done slots, pane status, prompt history, hand-built state and dependencies. Explain phase as the workflow position, not the only input. |
| F4: Attempt meaning | Attempts count prompts and fail at three (`docs/guide/state.html:83`) | `src/next.ts:350-391` resets attempts on successful delivery and counts consecutive failed deliveries. Document the error record and one-pass behavior, not an obsolete prompt counter. |
| F5: Dispatch scope | `next --all` always visits every registered repo (`docs/guide/next.html:61-62,97`) | `src/next.ts:674-682` scopes it to the current registered repo, or all registered repos outside one. Every dispatch example needs a working directory. |
| F6: Dependencies after start | A running leaf's blocker list is never read again (`docs/guide/limits.html:57`, `in-practice.html:114`) | `src/next.ts:534-542` checks dependencies before dispatch, including an already allocated leaf. Distinguish stopping a current process from preventing later dispatch. |
| F7: Sync scope | Stages everything (`docs/guide/files.html:63`, `limits.html:64`, `cheat.html:66-67`) | `src/sync.ts:17-33,109-114`. Explain eligible issue records versus unrelated changes, preserving the round-1 correction. |
| F8: Stops and recovery | Troubleshooting mainly describes three failures and points to reviews (`docs/guide/problems.html:59-61`, `phases.html:66`) | `src/state.ts:11-28`, `src/routing.ts:35-38`, `skills/implement-issue/SKILL.md:31-33,43`. Include seat-declared human blockers, delivery failures, where the reason lives, and choosing a valid recovery phase after resolving the cause. Do not equate all blocked terminal UIs with the skill asking the operator a question. |
| F9: Manual state editing | Send a leaf back by editing its phase (`docs/guide/in-practice.html:119-120`) | `src/phase.ts:95-112` clears related bookkeeping during a command move. Teach supported recovery rather than implying that a one-line edit performs the same transition. |
| F10: Small chart | A small item skips the chart (`docs/guide/create.html:60`) | `skills/chart-issues/SKILL.md:37` says it creates the same chart structure and proceeds directly to handoff. Explain less interviewing, not absent records. |
| F11: README is also a source to correct | README lists two skill roots and requires `--from` in its init row (`README.md:14,38`) | `src/install.ts:11-21` links four roots; `src/akrogon.ts:32-37` and `src/init.ts:13-23` allow absent `--from`. The current test hardcodes the README contract (`tests/command-reference.test.ts:12`). Preserve test coverage while correcting the reference and its expectation together. |
| F12: Gacp needs an accurate beginner explanation | New page, sourced from `/home/ivan/.local/bin/gacp` | Lines 4-19 require `main`, stage `.` relative to the current directory, commit the entire already-staged index if nonempty, pull/rebase/autostash from `origin main`, then push there. The commit can precede a failed pull, so “checkout unchanged” is not a whole-operation rollback promise. Explain this difference from sync. Use a subshell-bodied function so lines 2,7,17 do not change shell options or exit the interactive shell. |

These are representative findings, not a claim to have completed an exhaustive correctness audit. Some apparently old details still match code: `docs/guide/files.html:106` says a matching chart moves under the completed owner, and live `src/phase.ts:172-174` does that. A documentation author must flag conflicting authorities rather than assuming every historical sentence is wrong.

**Estimate:** all 17 source pages need an audience and fact review. Roughly 12–14 need substantive rewriting or example correction: index, idea, parts, state, setup, create, chart, next, files, in-practice, limits, problems and cheat are the main candidates. Install, phases, merge and learn retain more useful structure but still need verification and explanation. The gacp page is new writing. Expect approximately two-thirds of the effort to be fact checking, examples and explanation, and one-third format conversion, navigation and test retirement. This is a planning estimate, not a measured word-change percentage. In particular, it is not “rename 17 files and fix sync.”

### Q3 · Should conversion and rewriting ship as one leaf, or as conversion followed by a rewrite leaf?

The same operational examples need both Markdown conversion and semantic repair. Shipping the conversion first exposes a newly presented guide with known broken instructions, then requires reviewing the same content again.

Research: operator · round 1 selected same-leaf retirement of HTML and its tests; repository history · `learnings/history/2026-09-11-guide-source-spec.md:3-9` records failures caused by deleting sources separately from dependent tests. The factual inventory above identifies the real content workload. This favors one complete reader outcome over a format-only intermediate release.

- **A (recommended):** Keep one `github-markdown-guide` leaf, with a larger but bounded writing contract. Internally work through concept/reference pages, then the practical path and gacp, then navigation and verification. One review checks the complete guide against one current baseline. No new runtime feature or documentation framework.
- **B:** First leaf converts and retires HTML/tests; a second dependent leaf rewrites the Markdown. Choose this only if an intermediate format-only delivery has real value and the operator accepts its known inaccuracies. The rewrite leaf depends on the new Markdown artifacts, not merely on overlapping files. It must already have an owner and complete scope rather than becoming an unspecified cleanup promise.

Pitfalls: one leaf does not mean one undifferentiated task. Its done criteria should cover a reader completing one representative workflow, every page receiving a fact review, the gacp function's safe shell scope, and the settled link/test retirement work. A link test cannot judge clarity or truth. Avoid exact-prose tests, hidden style quotas and executing push/phase examples against live repositories.

## Proposed ownership and validation

For Q3-A, own README, all migrated guide pages plus gacp, reference-index links, the selected link test, command-reference test corrections required by verified syntax, the four browser specs and four configurations, `tests/AREA.md`, and package/lockfile dependency removal. No edits to runtime source, machine config, skill policy or `issues/` on the implementation branch. Source/config/skills are evidence, not change targets. If they conflict, record the conflict for an operator decision rather than silently designing new behavior.

Retain round-1 commitments: 16 non-index guide topics plus gacp, homepage content in README, existing references below it, no illustrations or replacement diagram assets, removal of HTML/CSS/Playwright in the same delivery, one link-and-anchor test. Keep executable snippets literal and test functional syntax where needed. Use temporary repositories and a fake remote for any gacp behavior check. Present a reader walkthrough and an evidence-backed correction list in the implementation report, not a new permanent documentation ledger.

Reply `1-A 2-A 3-A`, or give numbered alternatives.

Challenge check: “software factory” is defensible in the broad 2026 usage, but “dark factory” would make an unsupported validation claim. The rewrite recommendation applies first principles proportionately: clear concepts and usable examples, not an elementary computing textbook. The estimate is large enough to reject a mechanical conversion contract, but the settled 17-page destination remains bounded enough for one leaf.
