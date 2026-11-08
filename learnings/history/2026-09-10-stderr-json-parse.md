# Unguarded JSON parse of an external process's stderr

Case: bootstrap/command check.review, 2026-09-10, slot A Nit F2, carried at merge.

Evidence: `src/next.ts` `retryable` runs `JSON.parse(result.stderr)` on every failed `herdr agent start` or `agent prompt` and reads `error.code` to decide whether to retry. Herdr emits a JSON error body on a rejected request, but a panic, a usage error or a socket failure writes plain text. On that path the command dies with a SyntaxError from the parser and the operator sees neither the herdr text nor the command that failed. The fake herdr in tests always writes JSON, so the suite cannot show it.

Learning: at a process boundary, parse stderr with a schema that fails soft, and on a parse miss throw the existing `CommandError` carrying argv, cwd, code and the raw stdout and stderr. The retry decision then reads only from a successful parse. Same shape applies to every `gh` call the pull-close leaf adds.

Generalized 2026-11-08 by herdr-sweep: the herdr site (`retryable` in `src/shell.ts`) is deleted with old herdr; the class still applies to every outside CLI. `src/hc.ts` `errorKind` parses hc stderr with a `SyntaxError` guard and keeps the raw text on `HcError`; it has no dedicated test.
