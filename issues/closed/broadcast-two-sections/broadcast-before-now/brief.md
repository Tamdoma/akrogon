# Brief: broadcast-before-now

## What
The completed-issue broadcast has two sections, `Before` and `Now`, under the unchanged title line `## 🧪 <repo>: <headline> (MM/DD/YY)`. The sender schema accepts exactly `summary`, `before` and `now`, renders `**Before**` then `**Now**`, and rejects any payload carrying `next`. The skill text tells the merge slot how to write for readers in marketing, design, account management and development: the headline is one plain sentence stating the result, `Before` names what was wrong or missing, `Now` states what is better about the system, and detail scales only as far as a non-developer needs. The guide example on the merge page shows the same shape.

## Why
Three sections split one idea ("what changed" and "how it helps") across two lists, and the message rules let developer wording through. Readers are beginners from several departments who need to see the before and after in one glance.

## Done-criteria
1. `bun test` run inside `skills/broadcast-issue/` passes with fixtures and exact-content assertions that use only `summary`, `before` and `now`; a payload with a `next` key or without `now` fails validation before any request is made, covered by a test.
2. `bun run typecheck` inside `skills/broadcast-issue/` passes.
3. A rendered message from the sender against a local fake webhook starts with `## 🧪 ` and the summary, then the date in parentheses, then `**Before**`, then `**Now**`, and contains no `**Next**`; the test asserting this keeps the existing chunk-splitting coverage with two sections.
4. `skills/broadcast-issue/SKILL.md` describes two sections, states that `Before` is always present and names what was missing when the work is an addition, states that `Now` says what is better about the system rather than what code changed, states that the headline after the repo name is one plain sentence a non-developer understands, forbids file names, command names, code identifiers and unexplained acronyms in addition to the existing forbidden items, and replaces the per-shipped-part scaling rule with: scale detail to what a broad-audience reader needs, merge parts when that reads better, keep small issues to a few short bullets, and never drop a shipped outcome the reader would care about. Its JSON example carries the two-key body.
5. `docs/guide/merge.html` example and the surrounding sentences show the two-section shape and the readability scaling rule; `grep -rn '\*\*Next\*\*' skills docs README.md --exclude-dir=node_modules` returns nothing.
6. No file under `issues/` changes on the leaf branch.
