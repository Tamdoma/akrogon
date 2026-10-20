# Chart: sync-identical-ignored

## Destination

`akrogon sync` and self-update move the operator checkout when an ignored local file equals the incoming tracked file, and still refuse when content, type or mode differs.

Route: lifecycle (debate no)

Handed off 2026-10-19: issues/open/sync-ignored/identical-ignored (sources Tamdoma/akrogon#106).

## Forks taken

- [equality-rule](forks/equality-rule.md): shared `integrate` exempts an exact incoming blob with the same raw bytes, type and executable bit, not touched by replayed commits; `moveCheckout` unchanged; no adopted-path output.

## Open forks

none

## Fog

none

## Off route

none

## Pending steps

none
