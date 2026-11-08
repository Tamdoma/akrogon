# Merged map: round-drawings (#125)

Sources: slots/map-A.md, map-B.md, map-C.md.

## Evidence

- `skills/chart-issues/assets/questions.md` "Operator questions and peer exchange": text-only template; no drawing rule; A's pre-send read checks every part. No mention of drawings in skills/chart-issues or docs/use. (A,B,C)
- No test pins the round shape (`tests/` grep: none). (C)
- herdr-panels INTAKE "Round 2"/"Round 3": drawings settled three picks; the first drawn round had dropped required parts (B); none of those drawings survives in a fork file (C).
- The questions.md template is itself a fenced block, so a drawing inside it needs a different fence. (C)
- The planned Needs-you panel parses option codes from the pane (herdr-panels forks/needs-you.md Taken 2a). (C)

## Forks and positions

1. When: a question gets drawings when its options differ in something a person sees or follows (screen, layout, state change, flow, file or tree shape) and a drawing makes the choice much easier; none otherwise. (A,B,C)
2. Where and how: one fenced text block directly after that question's option bullets, before How to choose; one drawing per option captioned with its code; side by side when they fit about 80 columns, else stacked; the drawing replaces no required part. (A,B,C; C on placement and width)
3. Autopilot: same rule for every presented round. (A,B,C)
4. Signposts light round: same usefulness test (A,B) vs. none, since its questions are about session values (C).
5. Fork record: the fork's Taken keeps the chosen option's drawing verbatim. (C; A,B silent)

## Pitfalls

- Decoration: the "much easier" test and the pre-send read. (A,B,C)
- Wrapping in narrow panes: stack. (A,B,C)
- Nested fences in the template. (C)
- Needs-you parser seeing captions: recorded for that leaf only. (C)
- Docs drift: one sentence in `docs/use/plan-work.md` "Answer one fork per round". (A,B,C)

## Split

One akrogon text leaf: questions.md and plan-work.md. (A,B,C)

## A's proposed picks

1 and 2 and 3 as merged. 4: same test, one word in the signposts exception sentence (one rule, no exception; rarely fires). 5: adopt C's; the clause goes in questions.md beside "The fork records the chosen option's avoidance mechanisms".
