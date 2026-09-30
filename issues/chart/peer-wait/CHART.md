# Chart: peer-wait

## Destination
In chart-issues, slot A reads a named peer's return file only after that peer has started and finished its turn, however long the turn takes, on any harness.

## Forks taken
- [Wait mechanism](forks/wait-mechanism.md): guarded prompt `--wait --until working --timeout 5000`, any non-zero exit to the operator; bounded repeated `herdr agent wait --timeout <T>` before and after the prompt; proven live against slot B.

## Open forks

## Fog

## Off route
- Tamdoma/akrogon#43: already owned and delivered by leaf `review-bar/realistic-review-bar` (merged 242a2af, closed on GitHub 2026-09-30) via chart `realistic-fix-bar`.
- Changes to herdr itself or to the command's prompt delivery in `src/next.ts`.

Handed off 2026-09-30
