# Rebuttal, slot D: trailer-message (#142)

Q1. I change my pick from 1b to 1a.

- B and C's second cost is real. `requireFrozenCitations` reads a different range per path (`lastTouch^..to`) and counts empty-commit values against the frozen record. A raw-line scan would have to repeat that range logic to stay truthful, which is more code than the failure deserves.
- Their first cost is wrong. 1b would not "misfire on quoted body text": a flush-left `Test-Change: <path>` line that git did not parse is exactly what the hint reports, quoted or not. This does not change the pick.
- 1a's rule text is missing one cause. My probe: two valid trailers plus one flush-left wrap line in the same paragraph printed nothing. So "last paragraph, one line each, no paragraph after" is not the whole rule. Add: that paragraph holds only trailer lines, because one other line hides every citation in it. Without it a seat can fix its own wrapped line's neighbour and still be refused.
- The merged note lists a third wide cause, "a bare path with no reason is read by git but dropped by `trailerValues`". I did not find or probe that. It is tagged (C,D). It is C's alone.

Q2. No disagreement.

Q3. Partly disagree.

- The standing-design line C cites does require it ("a model writer's instructions state the checker's rule"), so the writer side is in scope. I had left it out and concede.
- The same line says "a kept second copy says why and has an agreement test". Stating "one line each" in five skill files makes five copies with no agreement test. State the full rule once, in brief-template section 8 where the trailer format is already defined, and leave the other four files' existing short mentions as they are. They say "final trailer block", which stays true.
- "One line each" for writers while the checker accepts indented continuation is a deliberate gap. Fine, but the refusal text must then say the same "one line each" and not advertise the indented form. Otherwise writer rule and refusal disagree in plain view.

Pitfalls: "the test reading the shared rule text from the module" proves the constant is printed, not that it is right. Acceptable, because the review seat reads the text. Say so in the proof line.

Proof and retirement: no disagreement.
