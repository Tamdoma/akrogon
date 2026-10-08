# Slot A map (written before reading map-B)
- #59: name resolution needs ambiguity refusal; blocked reporting must be scoped to operator targets, since sweep also serves hooks, --resume, dependents (src/next.ts:710,1151,1271). Inputs-blocked leaves also wait silently in sweep (next.ts:638-643). Failed leaves return waiting before eligibility (next.ts:622).
- #60: one fix, split from B then `herdr pane swap --source-pane <new A> --target-pane <B>`; herdr 0.9.3 split allows right|down only. Fake herdr has no pane order and no swap (tests/fake-herdr.ts:123). No real fork.
- #61: where the pause lives (machine-local file under globalHome vs repo issues/config.yaml vs marker), which paths it gates (hook events, startup --resume, mergePass after hooks, mergeWake from phase), what unpause does, status visibility. Machine config.yaml is gitignored and hand-edited, so a command should not rewrite it.
- Split: three standalone issues in akrogon, no dependency.
