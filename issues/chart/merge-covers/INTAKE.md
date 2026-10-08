# Intake: merge-covers

## Scope
Destination akrogon. One leaf adding the `merge_covers` repo key, its config refine, and the merge-issue prose that applies it.

## Provenance
- Framework chart: /home/ivan/Work/infra/tamdoma/framework/issues/chart/verify-speed (fork forks/verify-shape.md, Taken round 4 Q3, operator 2026-10-08).
- Framework source: Tamdoma/tamdoma-framework#199 (framework:verify takes 30-60 minutes per merge).

## Source
In the framework repo, merge runs every `checks` command and then `merge_checks.verify` (`bun run framework:verify`), which runs parity, contracts, test, test_changed and selftest again. That repeat costs about 106 s per merge (2026-10-07 merge logs).
