# Slot D review of session-flake follow-up, round 8

**Verdict `ready`** for `f657af09` on `0349c523`.

- **F14 closed.** Both detached workloads retained `HC_SESSION` and lacked `HC_RUNTIME=1`. Core teardown succeeded and removed the runtime while each workload was still alive. Restoring the round 7 matcher made the cleared-variables case fail. The sweep still found and stopped the daemon launched from the copied `bin/hc`.
- **F15 closed.** I held both children between `setsid` and `exec cat serve` after their parent published the PID. The revised tests waited for the actual `cat serve` command line before calling `core.stop`.

Typecheck, `git diff --check`, and 91 focused tests across seven files passed on hc 0.1.22. The supplied Verify log `direct/check-test-1795454017411-2427779.log` reports 1,393 suite passes and 35 repeat passes.
