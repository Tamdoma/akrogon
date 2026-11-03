The per-row correction still omits the whole-receipt command-list requirement. knownRedReceipt's head selection currently checks tree and completion, but not sameCommands (src/verify.ts:218). Its entry lookup matches individual commands (src/verify.ts:222).

Example: a completed row contains A=0/B=1. Config later removes B, so the expected list is [A]. The proposed per-row fallback accepts A immediately without a linked base comparison. The whole-green fast path rejects that same row because sameCommands requires equal list length and matching entries (src/verify.ts:127, :164). The gate therefore still accepts evidence that the fast path will not reuse.

Require the same command-list eligibility for candidate head rows as the shared whole-receipt matcher. Judging one row at a time alone does not close this mismatch.

