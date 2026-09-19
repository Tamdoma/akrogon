# Merged map: docs upkeep

Mechanism (both): implement-issue:27 is the updater, check-issue:35 checks only AREA files already in the diff, plan-issue:25 reads the index. (B) src/config.ts:35-43 already accepts grounding.docs, surfaces, indexed_scopes with no reader in src/ or skills/.

Evidence (both, B's per-window method is the sounder one): akrogon 6/10 recent merge windows updated an AREA, 1/10 the index; watch-issues-skill merged with no index or README row (F3 B); framework 1/10, human docs under .claude/docs do get updated by leaves; pi 3/10 index updates plus two dead entries deleted 09-12 (F2 both); mdcny index never grew past the scaffold while README did (F4 B); boulevard grounding none by choice; clinique no own leaves. (A) tests/AREA.md untouched since 09-11 across 63 tests/ commits. (B F5) framework AREA shorthand paths look missing under a literal root check; not deletions.

Root cause (both): F1 review blind spot, check-issue:35 verifies only what implement touched; the rule fires only if the implementer remembers.

Q1 discovery (both A recommended): plan names the affected agent and human docs from the index and README in its checklist, implement updates them, check verifies from the diff. (B) alternative: define a consumer for the existing grounding.docs field. (A) optional: index lines may link the human page per area.
Q2 review (both A): check derives affected docs from the changed behavior and may read the unchanged page; the "open no area file outside the diff" restriction is revised. (B) no forced doc edit per change, no exact-section requirements.
Q3 repair now (both A): pi two dead entries, mdcny scaffold index; akrogon watch-skill omission goes to the pending guide-markdown leaf; framework shorthand optional; boulevard untouched.

Split (both): L1 akrogon rule in plan/implement/check prose; L2 pi index repair; L3 mdcny index repair. Independent.
