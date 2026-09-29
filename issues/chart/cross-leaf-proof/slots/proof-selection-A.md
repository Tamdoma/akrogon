# proof-selection, slot A

Q1: 1a. Standing-design line ("each done-criterion is proven by the cheapest command that can catch its failure; a slow or live run names the property no smaller test proves"), plan-issue synthesis maps each criterion to command, expected runtime and rerun trigger (SKILL.md:55 already asks for "concrete verification" only), check-issue treats a slow proof with no named property, or a defect class a cheaper test would catch but none does, as a Fix. Reason: M4 shows #13/#15/#16/#17 and the writer/checker drift needed no live run, yet only the live run caught them. 1b plan-issue only misses the chart, which writes the done-criteria (live-replay criteria were chart-written). 1c relies on forks 2-4 and leaves single-leaf work unaddressed.

Q2: 2a no number. The plan records expected runtime per command so it is visible; no measured stage durations exist (B), and one incident cannot set a universal budget. 2b a number (e.g. blocking checks under 10 min, acceptance under 1 h per Farley) gives a hard trigger but lacks evidence for this consumer and would fire on framework:verify:core, which is already long.

Research: Wacker (Google Testing Blog 2015) and Vocke (Practical Test Pyramid) favour the smallest test that catches the defect; Farley's pipeline moves common late failures into fast stages. None prescribes a universal minute budget for agent-run pipelines.

Pitfall: "cheapest" read as "skip E2E". The lock at standing-design.md:9 stays and must be stated beside the new line.
