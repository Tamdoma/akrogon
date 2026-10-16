# Review test-command equivalence

Date: 2026-10-16

Case: framework leaf `no-zone-yet`, slot B review and repair. Review blocked a join bring-up test after two ad-hoc deploy-directory runs hit Bun's 5000 ms default timeout. The repository already configured `test:cf-workers-deploy` with `--timeout=30000`. Repair changed no test, timeout or product code for that finding.

Evidence: framework `package.json:49` records the configured command. `akrogon log /home/ivan/Work/infra/tamdoma/framework/issues/open/workers-deploy-run/zone-optional/no-zone-yet/implementation/check-review-B-retry-skill-tests-1792133626555-1778797.log` records 429 pass and a 5004 ms timeout. `akrogon log /home/ivan/Work/infra/tamdoma/framework/issues/open/workers-deploy-run/zone-optional/no-zone-yet/implementation/check-repair-B-deploy-suite-1792133781991-1965895.log` records the configured command passing all 430 tests, with the same case taking 5245.85 ms.

Learning: preserve the repository runner's timeout, environment, preload and file-scope semantics when evaluating a failure. A stricter ad-hoc invocation can reveal a different contract, so compare it with the configured command before assigning a product Fix. Whether two commands are equivalent requires judgment. This does not justify suppressing failures of required checks or weakening their budgets.
