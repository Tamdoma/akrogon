# Free dry run of a model-stage fixture before its paid recording

Date: 2026-11-14. Case: framework leaf theme-owned-research-plan, slot B check.review of head `b0d54ebbe6`.

The plan's criterion 4 red run only showed the three-theme config was absent. The fixture was then written and the paid recorder ran (invocation 1, USD 0.78) before the fixture had passed the free downstream steps its own replay uses. The recording met the record-to-theme map, but the replay then reached `runInit`, which refused the config (missing site-type counts), and init's hosting labels moved the seed hash. The config fix (`5bfa68a400`) made invocation 1 STALE. Invocation 2 on the fixed config stopped at `site-3 article need 10 have 9`. The grant (2 invocations) was spent and criterion 4 was cut under signpost 5a. The three-theme README's short-theme counts were written before the config fix.

Evidence: framework `issues/open/topic-theme-fit/theme-owned-research-plan/implementation/report.md` (Grant count), `check-record-topic-ownership-1794609826579-3737654.log`, `check-crit45-1794609837723-3757366.log`, `check-record-topic-ownership-2-1794610189650-3893609.log`.

Learning: before a bounded paid recording, run the fixture through every free step the replay will run (here plain build, a planted-ownership owned build, `runInit`, `network-plan`) with a hand-written stand-in for the model output, and re-derive any fixture numbers a README states after the last config edit. A fixture defect found after the paid run costs a grant slot. Which free steps cover the replay is a judgment per leaf, so this is a judgment lesson and files nothing.
