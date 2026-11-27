# Brief: charting-fixes

## What

Apply the operator's two text corrections before anything else builds on the charting chapter:
- Remove every em dash (—) from README.md, docs/**/*.md and the text of docs/pictures/*.svg by rewriting each sentence so it reads naturally. Swapping in " - ", "--" or an en dash is not a fix.
- Every example that starts consultants, on docs/guide/04 to 08 and docs/README.md, names each slot with harness, model and effort, for example `Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`. Page 04 gains one sentence: while charting, consultants sit in slots B, C, D, and a Lifecycle task later gets its own fresh slot B (the reviewer).
- Add a guard test that fails when an em dash appears in README.md, any docs/**/*.md or any docs/pictures/*.svg, reading the files from disk.

## Why

The operator read pages 04 to 08: "It needs to use the full example. Which two consultants? Look at what I do. I use slot B, make it something, and slot C, make it something, mentioning the harness and the model and the efforts" and "tell him to remove the m dashes. This is a dead AI giveaway." Every later leaf copies this chapter, so it must be right first (rest shape R5).

## Done-criteria

1. No em dash remains in README.md, docs/**/*.md or docs/pictures/*.svg. Slot B reads the diff and confirms each changed sentence was rewritten, not given a dash substitute.
2. Every example on docs/guide/04 to 08 and docs/README.md that starts consultants (including singular forms such as "Use consultant B.") names each slot with harness, model and effort. Page 04 holds the slots sentence.
3. The guard test fails on a file holding an em dash and passes on the delivered tree. The report shows one deliberate break turning it red.
4. No other wording changes beyond what criteria 1 and 2 need. The destination's `checks` pass.
