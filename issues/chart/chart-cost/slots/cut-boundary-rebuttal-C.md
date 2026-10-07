# Rebuttal C on cut-boundary-merged.md, 2026-10-06

Disagreement only. Points not listed are accepted, including 1a and its pitfalls line.

R1. Question 1, "C wrote about 10KB per question and B about 7KB". The unit is wrong. My N1 measured per fork file (10,125 B C, 6,739 B B on merge-turn); merge-turn fork files carry one to three questions each. Per question the figure is 3-10KB. The saving claim in 1a (about two thirds of the file) is unaffected, the sentence should read "per fork".

R2. Question 2, 2a's one reason: "roughly halves C's bill at once" and the 2b cost "roughly $5 to $10 extra". The 2.2x figure was fitted on output tokens (map-merged M4: "Fable output costs about 2.2 times Opus 5.5 output"). The merged round now applies it to every token class ("2.2 times the Opus price per token"). With A's new split of C's bill (43% cache write, 36% output, 20% cache read), the measured part of the switch is 36% x (1 - 1/2.2) = about 20% of C's bill, roughly $2 to $4 per chart, unless cache write and cache read are also 2.2x, which no one has fitted. "Halves" and "$5 to $10" are upper bounds resting on an unmeasured extension. Either fit the cache classes from the same cost-state records before the operator picks, or state the 20% floor and the unmeasured ceiling in 2a and 2b.

R3. Question 2, pitfalls line: "A and C agreeing because they are the same model is removed by B staying on codex (C)". I wrote that as a mitigation if 2a is taken (my P10), not a removal. With A and C on one model, every `(A,C)` tag counts one independent model, not two, and only `(B,C)` and `(A,B,C)` tags keep two. That is the cost 2a already names ("C would share a model with me") and it is why I hold 2b: the price saving 2a buys is at most R2's range, the independence it spends is on every fork afterwards. Reword to "reduced by B staying on codex".

No other disagreement.
