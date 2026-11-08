# Round 15 (door A): review agy handover support

Review commit 953d6054 on branch fix/handover-log in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/k5 (`git show HEAD`; ab97c2ed below it is the mkdir fix you passed).

Live probe by door A on a throwaway agy 1.5.3 (removed):
- No conversation and no lock before the first prompt; after it, `conversations/<id>.db` (+shm/wal) and `presence/<id>.lock` are open.
- `/clear` typed as keys: the new `<id2>.db` and `presence/<id2>.lock` open at once, the old lock closes, the old .db stays open. hc status went done -> idle, turn unchanged (no status turn).
- A fresh `/clear` database already has its `steps` table with 0 rows. No step on disk has a null payload (65 dbs).
- After a prompt: step 0 type 14 holds the prompt text, replies are type 15; bun:sqlite readonly reads the live WAL database.

So B and C were right on the lock, D's open-.db rule would be ambiguous after /clear.

Concrete defects only: the lock lookup (src/transcript.ts agyConversation), the shared reader `transcriptRecords`/`transcriptEnd` (JSONL behavior must be unchanged from the old byte-offset code), the agy schemas and boundary in door-reset.ts, the fake's realism, and anything a database path breaks among consumers (log-tail and chart-usage stay out of scope: they already fail loudly for agy). Read-only. Write round15-<letter>.md: verdict, file:line. Reply with the path.
