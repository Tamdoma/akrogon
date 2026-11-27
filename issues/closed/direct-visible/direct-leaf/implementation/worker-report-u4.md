# Wave-2 worker U4 report (archive note)

Commit 3468e22a (picked as aec44d83): leafStart exported, direct leaves total TIME from creation
across status text/JSON and timing-report; waits_on slot names correct under direct threading.
Both direct-timing start-time tests green. Noted limitation: a missing created ISO would surface
at render as an upstream corrupt input.
