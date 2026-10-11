# Slot A notes (written before reading B and C)
- framework formspark-build-wiring: implement 135 min, check.fix 263 and 230 min, third open (log 2307-2372). review-B.md:228,307 sections are titled "New defects introduced by A's repair": F7, F8, F10-F12 are all in run-formspark-build-wiring-proof.ts (the proof harness), not product code.
- brief.md:17-23: seven criteria, criterion 1 alone needs real builds of 7 blueprint paths; criterion 5 a headless browser submission to a live provider.
- fix_rounds cap (src/phase.ts:306-311, default 3) counts B->A handoffs, not effort inside a pass.
- Root cause view: the leaf contains the product change and the new machinery that proves it; the loop review -> harness repair -> new harness defect -> review never drains the criteria stock, and nothing bounds a single pass.
