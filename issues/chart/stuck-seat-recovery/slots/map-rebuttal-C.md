# Rebuttal C to map-merged.md

1. **K1 pitfall misattributed.** "(A,C) pi-extensions ... currently running subagent-concurrency-three" is not from C. C said only: separate repo with its own release path, and a herdr state enum change is needed. Drop the C tag or keep the claim as (A).

2. **#32 chain drops the retry loop.** `akrogon:src/shell.ts:100` marks `agent_blocked` retryable, so the shell retries a dispatch that can never succeed. Without it the chain reads as one skipped dispatch, not a standing loop. Add it after `next.ts:414`.

3. **#32 root cause statement dropped.** The merge gives the chain but no root cause. C's one line: a permanent admission fault is published under a transient herdr status (`blocked`, meant for human input), so no consumer owns clearing it. That framing is what makes K1 option 1 the source fix rather than one of three equal options.

4. **L5 held disagreement is weaker than stated.** B objects that a generated founder name is invented identity. `generate-persona.ts:104-113` already invents `business_name`, `brand_archetype`, `voice_seed` for every site. The objection applies equally to the existing persona, so it does not separate the two options; the real fork is operator-supplied facts versus generated facts for the whole persona, not just the author.

5. **#75 "covered for new networks" overstates.** The pool-smell threshold and ban list live in `pool-smell-freeze`, which is `implement`, not merged, and `live-replay` failed at content-prep on exactly that check. Status should read "expected covered, unproven".

6. **Section 5 dropped.** The merge has no sources or nothing-found list. The obsolete verdicts rest on empty searches (`parallel_override` in orchestrator-wrapper.ts and runbook; `design-fill-image-slots` outside its skill; `contact`/`formspark` in dev-render-satellite; `class~=` in dev-anonymize-dom; `sticky` in styles.ts). Without them a reader cannot tell "obsolete" from "not looked".
