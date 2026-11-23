# Chart: footprint

## Destination

Akrogon and every repo it manages keep a minimal disk footprint that cannot grow without bound: no redundant node_modules bytes, no dead worktrees, releases, temp or evidence kept past their use, on any PC.

Route: pending map merge (forks/map.md)

## Forks taken

- [Signposts](forks/signposts.md): taken (A), copy

## Open forks

- map: merged (forks/map.md), disputes X1-X5, Q1 taken (forks/archives.md)
- owner-roots: taken (forks/owner-roots.md)

## Fog

- what "optimally loaded" node_modules means per filesystem (btrfs reflink, ext4, others)

## Off route

none

## Pending steps

- one-time cleanup of provably dead items (A, after census)

## Mode record

- mode 2026-11-22 t126: on full autopilot, opened from operator words in chat; consultants B t350, C t351

## Direct attempt: release-slim

Landed 0a74a994 2026-11-22, see direct/report-release.md.

## Direct attempts: owner roots

Landed 2026-11-23: locks release 1 1f3f0622, owner-workers 5c45ca3e, owner-skills 27569274. D rounds 1-4. Locks release 2 (dbfbc3ba rebased) waits for drain of pre-release-1 commands; release 1 deployed at 2026-11-22T22:01:50Z.
Locks release 2 landed 9dc4d1c5 2026-11-23; first sweep 13,857 -> 2 line locks (one live slice entry left, then gone), one-time 5m13s pass, next pass 1.5 s.

## Direct attempt: stop-archives

Landed b9fe502784d08ac2edbfcbf61fb515dbb9e4cef6 2026-11-23: completion deletes plain logs instead of packing evidence.tar.zst; failure names come from captured output; known-red receipt reads stored failures. D rounds 1-2 fix (F1-F4), F4 test fixed as asked with D probe replayed.

## Direct attempt: hc-pin

Landed 0c677ab501043e556e75442b4cec4ec6af174cbd 2026-11-23: pinned hc 0.1.22 schema (new optional events.subscribe docs filter; listener subscribes by label, unaffected). Every verify was red on it. No review round: mechanical pin.

## Direct attempt: bun-run-cache

Landed 33c119848ff329160b08f226b8a1e673568d4e19 2026-11-23: checks keep Bun transpiler cache in their run root (B,C,D picked per-run; seats unchanged, measure growth after a day). D round 1 ready.

## Direct attempt: hc-follow

Landed c689573b23b0adfd543783719673ab32c5c11424 2026-11-23: operator D1 O1 drop the pinned hc schema test (B,C,D agreed); D2 O1 one shared hcReader classifies stream lines by hc discriminators, reads missed as a snapshot, drops events at or below the latest snapshot seq, skips unread kinds. D rounds 1-4, ready at round 4.
