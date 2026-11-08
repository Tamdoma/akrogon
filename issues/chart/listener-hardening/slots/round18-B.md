# Round 18 B

Verdict: changes needed.

Reviewed `a9cac8c4aaddcb3798b11beb6305e3d7807a905a` and the subsequent Pi-label amendment `009324dc09648b6e9d81bd5690f97f907a8ba7fe` in k6. F1 remains in both.

## F1: “own seat” must include the HC session

`skills/chart-issues/scripts/transcript.ts:17–19` treats matching terminal IDs as proof that `PI_SESSION_FILE` belongs to the requested seat. But `repoSpace()` resolves the repository's session across all live cores (`src/hc.ts:242–275`). It need not be the caller's core. Terminal IDs can collide between cores.

Reproduced by importing the actual script with in-memory boundary mocks: caller `HC_SESSION=source`, `HC_TERMINAL_ID=t7`, `PI_SESSION_FILE=/source/.pi/agent/sessions/--repo--/now_owner.jsonl`; repository resolves to session `target`, requested address `t7`. The script returns the source Pi file and invokes:

```text
label("target", "t7", {"akrogon.transcript": "/source/.pi/agent/sessions/--repo--/now_owner.jsonl"})
```

It never calls `transcriptFor()` for the target seat. This reports another conversation as the target's identity and changes another terminal's label. The target can even be a non-Pi seat. No live labels were changed by the reproduction.

Restrict self-publication to the same resolved core/session and terminal, using the caller's bound HC identity. Otherwise resolve the requested target normally. Add a regression with equal terminal IDs in different sessions and assert that the foreign label is untouched and the target lookup supplies the answer.

## Remaining checks

The helper performs its transcript reads before reset (`door-reset.ts:75,90`). After reset it only sends the start prompt and, when needed, enter (`:97–104`). I found no remaining outside transcript read after reset.

The skill's entry check explicitly covers any receiving session before chart work, retries unknown/equal once, and leaves a failed handover unconsumed (`SKILL.md:163`). This covers a reset that leaves the old conversation receiving the prompt.

At `a9cac8c4`, an existing Pi label also overrode a replacement Pi process's new argv transcript. The amendment adds the older-label rejection and a regression. That original reproduction is addressed. A correctly scoped Pi without `--session-id` can publish its tool-provided `PI_SESSION_FILE` without consulting argv. A non-Pi process that names its transcript does not take the resolver's Pi-only override.

Validation: `bun test tests/door-reset.test.ts tests/session-reads.test.ts` passed on the amended worktree: **17 pass, 0 fail, 164 assertions**. The original worktree run passed 16 tests before the new regression was added. Own test terminals were removed. No implementation files were changed.

## Re-check of 41eefacd

Re-check: ready. F1 is fixed. Self-publication now requires both the repository's session to match `HC_SESSION` and the requested address to match `HC_TERMINAL_ID`.

Repeated the original cross-session reproduction against the actual script: it returned `/target/current.jsonl`, called the target resolver once, and made no label writes. The new regression also checks that a foreign caller with the same address cannot replace the target label. Same-session Pi self-publication still passes the handover case.

Validation: `bun test tests/door-reset.test.ts` passed: **11 pass, 0 fail, 119 assertions**. Reviewed only this repair. No implementation files were changed.
