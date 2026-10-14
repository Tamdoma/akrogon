# Issue: concurrent-checks

- [worker-test-duty](worker-test-duty/brief.md): workers run targeted tests only; long checks run in the background with an exit file
- [memory-start-check](memory-start-check/brief.md): remove the run permit; start runs unless the slice is near its memory limit
- [run-units](run-units/brief.md): one unit per run, scoped stop-run, cleanup on wrapper death, per-run memory reservations
