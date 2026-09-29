# Cutover round A
- Recommend: switch when zero unfinished leaves exist in every registered repo and no leaf tab remains open (merged tabs close when the merge seat goes idle, src/next.ts:745-753, so an open tab means the merger may still be broadcasting). Then in one sitting: `git pull --ff-only` on akrogon local main and swap slots.a/b values in config.yaml. No plugin disable: with no unfinished leaf, hook passes find no owner (src/next.ts:735-738) and no leaf to dispatch. New leaves only arrive through an operator handoff, which the operator holds for the minute this takes.
- State lives uncommitted in the registered checkout (src/phase.ts:114, 138-173), so go-live is purely the local main fast-forward (installed binary and skills are symlinks, src/install.ts:15-21).
- Leaf must not touch config.yaml: the operator has an uncommitted edit there and ff-only would refuse.
- Rejected: migration of in-flight state (no role-version field, src/state.ts:35-58).
