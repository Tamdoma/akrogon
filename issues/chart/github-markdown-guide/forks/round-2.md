Operator 2026-09-19, verbatim (reopens the Q2 rewrite bound from round 1):
"Let's create another fork or two to make sure that the documentation is built properly and that we rewrite what needs to be rewritten. The intent behind this is to make sure that the documentation is newbie friendly, which means someone who already is into agentic engineering but they don't have their own software factory yet. Would you even consider this repo a software factory? Look it up online and see how you would classify it. We need to make sure that all of the language is newbie-friendly and that all of the steps are explained from first principles as well as in practice. If rewriting needs to happen, that's fine as well."
Round 1 taken answers stand except the Q2 bound (correct only the sync claim), which this round replaces.

## Findings
Full rounds in slots/round-2-A.md and slots/round-2-B.md, merge in slots/round-2-merged.md, rebuttal in slots/round-2-rebuttal-B.md.
- Classification (both): practitioner mager.co 2026-03-19 (four subsystems: intake, orchestrator, execution, feedback loop), Simon Willison 2026-02-07 on StrongDM (strict no-human-reads-code model), vendor factory.com 2026-07-18 (standardized inputs, tooling, measurable output, replayability). Akrogon has all four subsystems at one-operator scale, stops at merge, no deploy or monitoring, no independent scenario validation. A and B are seats, not vendors (config.yaml:2-10).
- Drift (B, F1-F12, A spot-checked F2 and F4): parts.html:72 and idea.html:59 vendor identity; create.html:67-83 one-level leaf example refused by src/state.ts:86-91; "phase is the only signal" vs src/next.ts:512-542; attempts semantics vs src/next.ts:350-391; `next --all` scope vs src/next.ts:674-682; blocker re-check src/next.ts:534-542; sync scope src/sync.ts:17-33; stops and recovery src/routing.ts:35-38; manual state edit vs src/phase.ts:95-112; small-item chart skills/chart-issues/SKILL.md:37; README skill roots src/install.ts:11-21 and `--from` src/init.ts:13-23 with tests/command-reference.test.ts:12; gacp semantics.
- Estimate (B): 12-14 of 17 pages substantively rewritten, two-thirds of effort fact checking and explanation.
- Rebuttal (B, taken): a grep-shaped "every token exists in src/" criterion cannot cover gacp or placeholder paths; reshaped into Q4-A.
- Page shape (A, with B's caution): what it is and why, how it works, in practice; not forced as identical headings on every page; one small issue as running example.

## Taken
Operator 2026-09-19, verbatim: "1a | 2a - also make it stylistically good to read. Instruct the implementer to write like this: - use contractions and mix sentence lengths (short punch, long breath)
- add tangents and show the thinking process
- keep language conversational and simple
- create texture with imperfect structure
- inject opinion, edge, specific examples. | 3a | 4a"

- Q1 A: README opens with "Akrogon is a lightweight software factory that runs work you define through planning, implementation, review and merge using two configurable coding-agent seats in Herdr." followed by what the operator owns and that it stops at merge. Foreclosed: mechanism sentence without the label, any dark-factory or deployment claim.
- Q2 A plus voice: rewrite every page for the reader against src/, config.yaml and skills/ as truth; the voice instruction above is binding for every page and README prose. Foreclosed: patch-only pass.
- Q3 A: one sentence under the title names the reader. Foreclosed: unstated reader.
- Q4 A: truth criterion as stated; report carries correction list with file:line and one walkthrough. Foreclosed: prose review only, exact-prose tests.
