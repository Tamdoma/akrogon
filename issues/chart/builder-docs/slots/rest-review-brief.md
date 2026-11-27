# Brief: review the remaining docs work before handoff (slots B and C)

Work blind: do not read another slot's file in this folder.

Context: the charting chapter merged (docs/guide/04 to 08, docs/pictures/charting-session.svg and mode-and-route.svg). The operator read it and said, verbatim, in /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/forks/signposts.md under "Operator correction after reading the charting chapter" (read that block and the last lines of the file). Latest words: "if there is a better architecture, we don't have to keep the old one. I was just talking about how good the text is, and this is exactly what I want with the addition of more images."

Read:
- The merged pages docs/guide/04 to 08 and the two pictures (render them with rsvg-convert to see them).
- The remaining contract: /home/ivan/Work/infra/akrogon/issues/parked/builder-docs-rest/ (EPIC.md, and each leaf's ISSUE.md, brief.md, design.md, state.yaml): guide-chapters, charting-pictures-more, guide-pictures.
- Current docs/ tree and README.md.

Answer, under 60 lines, each claim with a path:
1. Docs architecture: is the 13-page guide plan (guide-chapters design `## Guide plan`) plus docs/reference shelf the best shape for the reader (agency owner or mid-market operator, semi-technical) and the operator's working pattern (setup, three tabs, charting, lifecycle, merging, overnight watcher)? Propose a better one if you see it, with what it removes.
2. Leaf split: is guide-chapters / charting-pictures-more / guide-pictures the right split and order? Is one leaf drawing 30+ pictures sound, or should it split (by chapter, or pictures inside each text leaf)? What does each option break or invite?
3. Do the briefs carry all three operator corrections (full consultant examples with slot, harness, model, effort; no em dashes anywhere incl. 04 to 08 with a guard; a picture per section in the approved style; logo vertical placement)? Name gaps or wrong readings.
4. Any done-criterion that cannot be proven as written, or will refuse good output.

Write to /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/slots/rest-review-<your slot letter lowercase>.md, then run `hc send t126 "done <your slot letter>: <path>"`.
