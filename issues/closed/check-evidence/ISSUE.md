# Issue: check-evidence

- [log-reader](log-reader/brief.md): `akrogon log <path>` and one resolver reading plain or packed logs; flaky reads through it.
- [close-pack](close-pack/brief.md): completeOwner packs an owner's logs into `evidence.tar.zst` at close; run-check refuses closed owners; init ignores open, parked and chart-direct logs.
- [folder-pack](folder-pack/brief.md): `akrogon pack <folder>...` for charts and closed owners, with tracked-log checks and a status list of loose logs.
- [check-path-print](check-path-print/brief.md): run-check prints the kept log path; skills keep command output only through run-check.
