---
slots:
  a: {harness: claude, model: claude-opus-5-5, effort: medium}
---
# Issue: host-test-load

- [run-permit](run-permit/brief.md): one host-wide permit so only one run-check or base-run command runs at a time
- [seat-containment](seat-containment/brief.md): every leaf pane shell lives in a capped, stoppable systemd scope with the session bus cut
- [leaf-stop](leaf-stop/brief.md): `akrogon stop` and `akrogon start` end and resume everything a leaf started
