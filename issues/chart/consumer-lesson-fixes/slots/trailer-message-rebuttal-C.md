# Rebuttal C: trailer-message

T1. 1a as worded teaches two writer rules at once: one line, or continuation lines starting with a space. That fights Q3's "one line each". Git accepts folding, but the refusal and the skill lines should state only one line. Teaching the folded form invites the next writer to fold by hand and get the leading space wrong.

T2. The pitfall fix "test reads the shared rule text from the module" is wrong. A test that imports the production string proves only that the builder was called, never that the text states the right rule. The test should assert its own short phrases (such as the one-line rule) independently, as existing tests in tests/phase.test.ts already do with "final trailer block".

T3. The Retire line overstates under 1a. 1a "does not claim a wrap happened", so no cause is named for the case at hand, only the rule. "With the cause named, the wrap half can leave" claims more than 1a delivers. Under 1a the honest record is: refusal now states the reading rule, retirement stays arguable, the framework pass decides.

Pick now: 1a over 1b, with Q2 and Q3. A second reader buys per-case diagnosis a model reader does not need once the rule is printed.
