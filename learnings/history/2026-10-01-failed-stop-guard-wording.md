# Explanatory wording in behavior tests

Date: 2026-10-01.
Case: failed-stop-guard, review B N1.

Evidence: tests/phase.test.ts adds a full recovery explanation as seatRefusal and requires it in stderr, alongside exit-code, state/history and Herdr assertions. The reviewed head was 4e9c31f5d65bfd38155829dba8470e119de5ac87. All 39 phase tests passed. The locked criterion explicitly required the sentence, so this was deferred as a nit rather than a repair.

Learning: define behavioral criteria around refusal, relevant reason and unchanged effects. Requiring explanatory prose verbatim makes a wording-only edit fail otherwise correct behavior tests. Reserve literal text assertions for commands, numbers and references consumed literally.
