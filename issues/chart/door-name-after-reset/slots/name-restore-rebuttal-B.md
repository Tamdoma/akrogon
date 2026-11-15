# Disagreement from B

- R1. The proposed stand-in must model `/rename` as an hc turn, not “with no turn.” A's P4 observed working → done and P6 explicitly waited for that turn before `/clear`. The selected implementation depends on this wait, so a no-turn fixture cannot prove it. Keep rename local with no model reply, but emit working/done status around it and test that `/clear` arrives only after rename finishes. This distinguishes an hc turn from a paid model turn.
