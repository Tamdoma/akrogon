# Leaf review 2, slot B

## run-permit

no disagreement

## seat-containment

### F1. The proof plan cannot establish the required systemd readback

- File and criteria: `seat-containment/design.md:94` says criteria 1 and 6 are proven with fake `systemctl` and `busctl`. `seat-containment/brief.md:10` requires the user manager to report the installed slice limits, and `:15` requires `systemctl --user show` to report the scope's SIGHUP and timeout properties.
- Problem: those fakes can verify the requested commands and files, but cannot establish that systemd accepted and loaded them. A fake returning the expected values would still pass if the actual unit file or transient-unit call did not produce those values. The live proof instructions at `design.md:94-96` currently require cgroup placement evidence, not these property readbacks.
- Evidence: chart `proofs.md:6-8` (T6) establishes the distinction by reading both manager properties and kernel cgroup values. T2 establishes the effect of SIGHUP on real scope shutdown. Those chart probes predate the leaf implementation. The installed standing design requires proof that catches the criterion's failure and final-commit evidence for changed stages.
- Replacement text for the interpretation: "Use temporary HOME and AKROGON_HOME with fake systemctl, busctl and herdr to prove installation paths, conflict handling, command construction, criteria 3 and 4, and criterion 5's unreadable branch. During the existing isolated live proof for criterion 2, also read the real manager's akrogon.slice properties from the unit delivered by this leaf and the created pane scopes' SendSIGHUP and TimeoutStopUSec properties. Record the actual values alongside the cgroup paths. These readbacks complete criteria 1 and 6. Keep installation's herdr integration and plugin operations pointed at the isolated server. No extra live run or proof runner is needed."

## leaf-stop

no disagreement
