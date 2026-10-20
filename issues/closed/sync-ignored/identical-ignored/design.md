# Design: identical-ignored

## Binding decisions, verbatim

### equality-rule (chart issues/chart/sync-identical-ignored/forks/equality-rule.md)

Operator 2026-10-19: "1a | 2a | 3a" (after "elid").

1. 1a: identical means the same raw bytes (`git hash-object --no-filters`), plus the same type and executable bit. Reason: the operator's file is never rewritten without asking; a line-ending-only difference still refuses, which is rare and safe.
2. 2a: `moveCheckout`'s equal-collider loop stays as it is. Reason: it handles non-ignored untracked paths after a failed move, a different case; changing it widens the fix.
3. 3a: sync prints no list of adopted paths. Reason: identical files lose nothing.

Settled by all slots (slots/notes-merged.md): the guard stays in shared `integrate` (A,B,C); only an exact incoming blob entry qualifies, so ancestor and descendant shape collisions, gitlinks, directories and other local types keep the refusal (A,B,C); replayed paths stay collisions even when equal, because add-then-delete replay removes an equal file (B probe, C), and so does a replayed ancestor or descendant of an equal path (B,C); a symlink is compared by `lstat` and its link text, never by hashing the path, which follows the link (B,C); a stat, hash or tree lookup failure propagates as its own error with path and command context, never as the collision refusal (B, operator error rules); every candidate is compared before the move runs (B).

Foreclosed: removing the guard, per-route comparators, Git's filtered equality, hash-only equality, deleting or staging identical files before the move, exempting replayed paths, printing adopted paths, changing `moveCheckout`.

Known limits (B): an exempted file can change between the hash and the move, and the move then overwrites it. A checkout conversion (an `eol` or `text` attribute, `core.autocrlf`, a smudge filter) can write bytes that differ from an exempted raw-equal file; raw equality proves equality with the committed blob only. No mechanism is added for either, and no filter handling or filtered equality is added (B).

### Standing design

Installed path: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Interpretation for this leaf: each criterion is proven by a CLI-level test in `tests/sync.test.ts` (and the self-update part of criterion 1 in `tests/self-update.test.ts`) using the existing remote and self-update fixtures, temporary repos and `put`; criterion 1 is red first on the current guard. The existing ignored-collision matrix and the differing-file self-update test stay as they are. No machinery, no live run, no outside call.

## Leaf architecture

Owned surface: the ignored-path block of `integrate` in `src/sync.ts`, and the tests above.

Interface: the collision filter keeps its shape (exact, ancestor and descendant checks over incoming plus replayed names) and gains one exemption: a candidate whose only overlap is an exact incoming entry, with no exact, ancestor or descendant overlap with replayed paths, and that is no directory of an incoming path (B,C). The incoming entry's mode and blob id come from the incoming tree with NUL-delimited, literal path handling; the existing odd test path (`collision [1]* \n`) must keep working. Local type and executable bit come from `lstat`; a regular file's id from `git hash-object --no-filters -- <path>`; a symlink's id from its link text hashed as a blob. Only ids, never file bytes, pass through the string command helpers.

Consumers: `syncCommand` and self-update's `gitStage`, both through `integrate`; neither changes. `moveCheckout` in `src/self-update.ts` is unchanged.
