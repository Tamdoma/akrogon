---
name: braindump-issues
description: Fold an operator's raw thoughts into one user-owned intake file, `issues/chart/INTAKE.md`, sanity-checking each thought against a fetched source before it lands, so `chart-issues` has grilled, sourced, undecided notes to start from. Use when the operator is thinking out loud about work whose route is not known yet, before any chart exists. Operator-invoked only, never a gate.
disable-model-invocation: true
argument-hint: [intake-path]
---

# Braindump Issues

Turn the operator's thinking into one intake document that `chart-issues` reads. The operator throws thoughts in, this skill checks each one against a real source and folds it into the file in the operator's voice. Nothing in the file is decided. Decisions belong to the chart.

Intake path: `$0`, default `issues/chart/INTAKE.md`. Create it on first use with the title, one paragraph saying nothing here is decided, and a closing `## Notes as they come` section marked newest last. The file is user-owned. `chart-issues` reads exactly this one path and follows no links from it.

## Voice and shape

The file reads as the operator talking, first person, present tense. Headings and subheadings only, prose under them, each paragraph on one line. No bullets, tables, decision codes, or checklists inside the file. The reason: the chart grills the operator on their own words, and structure the operator did not write becomes structure the chart mistakes for a decision.

Your own solutions enter the file only as advice the operator received, marked as such in the sentence, with the point left open. Give the advice itself in chat.

A repeated thought adds only its new detail to the paragraph that already holds it. A changed mind is recorded as the operator changing their mind, not by deleting the earlier text.

Measurements and comparisons cite the evidence with a path or commit in the repo, or a URL, so the chart can reopen them.

## Sanity check before folding

Every thought gets checked online or in the repo before it lands, fetched before cited, and the result goes into the same paragraph as the thought, starting with "Sanity check" and naming the source and its tier. Tiers and the recording shape are in [references/sanity-check.md](references/sanity-check.md). A thought the sources contradict stays in the file as the operator's thought with the contradiction beside it. Never drop a thought because it is wrong.

## Session loop

1. Read the intake file once at the start of the session.
2. For each thought the operator gives: check it, fold it, then reply in chat with what changed in the file and any advice, in a few sentences, most important last.
3. When the operator asks a question instead of giving a thought, answer in chat and fold nothing unless they say so.
4. When the file passes about 400 lines or 20,000 words, tell the operator once and let them decide how to split. Do not split on your own, because the chart reads one path.
5. When the operator says the intake is ready, the handoff is one line in chat: open a session in the repo and run `/chart-issues`.

A worked example of one thought going through the loop is in [references/example.md](references/example.md).

## Boundaries

Edit only the intake file. No commits, no other files, no issue folders, no chart files. Never write a decision, a plan, or a recommendation into the file as settled. Never fold chart output back into the intake. Never rewrite paragraphs the operator wrote by hand beyond adding the sanity check and new detail they gave.

If the operator asks for a handoff summary before clearing context, write it to the path they name, outside `issues/chart/`, covering the rules in force, research done with source and tier, verified numbers, positions recorded, advice given, and next steps.
