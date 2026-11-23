# Fork: evidence archives

## Question
Keep committing closed leaves' evidence.tar.zst (about 6 MB a day in framework), or keep only what git and the ledgers already hold?

## Taken
Operator, 2026-11-22: the operator reads old logs only through agents asking "what happened, where". If git history and the ledgers answer that, keep nothing physical.

Consequence for the design: the record that stays (commits, verify-runs/log/merge-attempts rows, reports in the closed folder) must let an agent name the failing check, the failing tests and a short excerpt for any closed leaf. Archives stop being committed only once that is proven on a sample of past questions. Archives already in history stay (no history rewrite).

## Proof and pick (A, autopilot, 2026-11-23)
Proof: B (slots/archives-B.md) and C (slots/archives-C.md) each answered "what failed, where, why" for 6 closed red leaves across akrogon and framework, with and without the archive: archive needed 0 of 12. Names live in verify-runs rows, reasons in review notes.
Pick: stop creating evidence.tar.zst at owner completion; delete the owner's plain logs instead (B's O1). No excerpt (C's extract needs a parser per tool and changed no answer in the sample; B R4: a seatless red can add one reason line to its own row if ever needed).
Required with it (C): knownRedReceipt (src/verify.ts:259-272) must prefer stored failures and never read a closed leaf's log. Old archives stay readable; akrogon pack keeps working for charts until its own call is decided.
