# Intake: framework-test-scope

## Scope
Destination framework: each leaf runs only the tests its change affects plus cheap whole-repo checks; the full suite runs once on main before release, with a named owner; the per-leaf full run is removed only after both work.

## Provenance
- Operator: 2026-10-02 split of Tamdoma/akrogon#53; source text and GitHub provenance live in [test-runs INTAKE](../test-runs/INTAKE.md), which owns that identity.

## Source: operator 2026-10-02
I pulled another issue, let's chart it as well right now. It's about timing the tests, and the problems I'm having with that.

## Agent findings
See ../test-runs/slots/ maps. Relevant: framework `merge_checks.verify` runs 72 stages per leaf (framework issues/config.yaml:13-14, package.json:94-95); the changed template is tested by deploy-core.test.ts:5359-5373; no CI tests main and release-branch.yml publishes main untested.
