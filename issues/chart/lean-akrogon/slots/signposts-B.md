# Signposts B: additions to A's draft

Nothing here was checked in code. Items marked (map) are questions for the opening map.

- B1. Priority, changes 1a. Reds, queue time, host load and spend are one loop, not four ranked goals: red land → repair round → more seat work and checks → higher load → timeouts → more reds. The serial lane is the constraint (891 h queued against 243 h running). Two rules follow. (a) The land run gets first claim on CPU, IO and scratch over leaf checks and seats, inside `akrogon.slice` first. Raising akrogon against `app.slice` is a separate trade the operator feels on the desktop. (b) New work is admitted by merge-queue depth, not only by `max_active`. (map: do leaves waiting in merge count against `max_active`, and does the capacity refill from repo-caps 436b5179 start new leaves while the queue is deep?)
  Reason: work started beyond the lane's throughput only adds queue, stale bases, load and spend. The operator's working workaround was already "lower `max_active`".

- B2. Ordering. The minimal part of P11 ships with P1, not in group 4: each land writes its failure cause, and each unit saved by a rerun is written by name to the ledger.
  Reason: P1 compensates for reds whose causes sit elsewhere (#148, #151, P5). Without the count, flaky units pile up unseen until both runs fail, and no later chart can show it helped.

- B3. Hard limit. Take a baseline from the ledgers before the first chart lands. Each chart names one figure, the script that reads it, and the value that would make us undo the change.
  Reason: charts land back to back and the evidence arrives a day later from framework runs, so effects blur together. The undo figure extends 3a: the next reversal becomes a measured decision.

- B4. Hard limit. Nothing akrogon creates outlives its owner, and the owner's end removes it, not a later sweep. This covers run folders, compile cache, verify worktrees, `node_modules`, test slices and ledgers that are re-read whole. (map: can run scratch be a per-run tmpfs with a size cap, owned by the run's systemd unit, so it goes when the unit ends? That could replace K4's admission reading and K5's sweep with one part.)
  Reason: the tmpfs and disk reversals, #148, K5, P9 and P12 are the same fault: a store with inflow and no outflow tied to a lifecycle event.

- B5. Hard limit. A sweep acts only on things whose name carries this home's id. No ownership by guessing. The #151 naming fix lands before K5 and P12.
  Reason: #151 is a sweep guessing ownership from global names, and K5 and P12 add two more sweeps of the same kind.

- B6. Changes 2a. "Any PC" also means any repo. Do not size akrogon to framework's test suite (11 GB peak, 36 GB budget). Where the cause is in framework tests (full clones, 55,000-file installs, tests that do not remove what they create), seed it to framework and do not build an akrogon part to absorb it.
  Reason: fixed in the wrong layer, it stays in akrogon as a permanent part and every other repo pays for it.

- B7. Priority, changes 6. LLM spend is ranked last and has no number. (map) Pull spend or seat rounds per phase per leaf. Run the two audits #149 left unmeasured on the existing `review-B.md` files before picking P3: the share of first-round Fix findings that are product defects, and whether A's first round finds anything B lacks. Also ask why 31 of 100 handed items are proof-command errors. If implement's exit ran the brief's proof commands mechanically, that class never reaches a reviewer.
  Reason: 70% of first rounds go to repair, which points at implement's exit, not at who repairs. P3 moves the work to another seat. A mechanical exit check removes it.

- B8. Hard limit. The installed release drives the live lanes of akrogon and framework. Each chart must leave ledgers and state readable by both the previous and the new release, be safe for runs in flight at the switch, and be undone by switching back to the previous release. (map: when does a landed commit become the installed release?)
  Reason: P1, K2, K3, P9 and P11 change land, scratch and ledger shapes under a running lane, and a bad switch stalls every repo.
