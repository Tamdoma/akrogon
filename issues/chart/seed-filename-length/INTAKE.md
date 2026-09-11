# Intake: seed-filename-length

## Scope
One issue, one leaf, in src/pull.ts slug() and tests/pull.test.ts.

## Provenance
- GitHub: Tamdoma/akrogon#4

## Source: Tamdoma/akrogon#4

Unverified intake.

## Observation
`akrogon pull` names seed files `<number>-<full-title-slug>.md`, with slugs up to 100 characters. Long names wrap across two lines in a directory listing.

## Location
Project: akrogon. Surface: `akrogon pull` CLI command, seed file naming.

## Reproduction
Run `akrogon pull` against an issue with a long title and list the resulting seed files. Frequency: every pull of a long-titled issue.

## Expected behavior
The slug is cut to about 40 characters at a word boundary. The number stays first and is the identity. Nothing reads the words in the slug.

## Urgency
Impact: cosmetic, listings are harder to scan. Workaround: Not provided.
## Agent findings
- src/pull.ts slug() lowercases, hyphenates, then slice(0, 100) and strips a trailing hyphen. It cuts mid word.
- tests/pull.test.ts line 70 asserts a 100-character slug survives. That assertion changes.
- pull already removes numbered files not in the desired set, so existing long names are replaced on the next pull without extra work.
