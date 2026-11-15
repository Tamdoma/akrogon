# Final check on name-restore, slot C

Read: the "Correction to Q3" paragraph in forks/name-restore.md, the Done-criteria of brief.md, the "(C)" lines and Leaf architecture of design.md, the proof list of readiness.yaml.

No disagreement with the decision: three skip reasons, the name stage catches nothing, a thrown error ends the helper before anything more is typed. My leaf-review points D1 to D4 are all carried, and readiness.yaml now holds the proof for an operator-given name across `/clear`.

Three defects in the text, none changing the decision:

- T1. Two words are missing from the binding paragraph, in both forks/name-restore.md and design.md. It reads "may have pasted  without enter" and "A blank  counts as no name of its own". The dropped tokens are probably `/rename <name>` and `customTitle`, lost as backticked text in a shell command. The second gap leaves the rule unreadable: blank what. Restore both.
- T2. The stated reason "the transcript and the herdr-app document were already read by earlier stages, so a read cannot fail by itself" is not exact. Q1 reads the tab "from the herdr-app document at that moment", which is a second `docGet` call with its own 10 s deadline (`DISCOVERY_DEADLINE_MS`, src/hc.ts `rpc`). It can fail when the first did not. The outcome is still right, because a core that fails that call would likely fail the reset keys next. Say that instead, and name it as a second narrow exception to signpost 5a ("cannot be read ... continue"), beside the open-turn stop.
- T3. brief.md criterion 3 lists four cases (no tab lists A, blank tab name, control character or line break, other harness) and then says "these three reasons". The Taken text counts "no tab lists A or its name is blank" as one. Use the same grouping in the criterion so the count matches.
