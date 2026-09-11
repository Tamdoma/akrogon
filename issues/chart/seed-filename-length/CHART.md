# Chart: seed filenames cut the slug at about 40 characters

## Destination
`akrogon pull` writes `<number>-<slug>.md` where the slug is cut to at most 40 characters at a word boundary. The number stays first and identifies the seed.

## Decisions So Far
- [Slug cut rule](decisions/slug-cut.md): as reported. Direct item, nothing unspecified.

## Open Decisions
None.

## Not Yet Specified
None.

## Out Of Scope
- Renaming seeds already on disk. The next pull rewrites the desired set and unlinks stale numbered files, so old long names disappear on their own.

Handed off 2026-09-11 into `../../open/seed-filename-length/`.
