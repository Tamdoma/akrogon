# Duplicated browser test helpers across page leaves

## Case

docs-concepts added `tests/browser/docs-concepts.pw.ts`. Its plan (D6) and brief forbade editing the existing `docs-shell.pw.ts`, so the spec copied `destinations`, `extract`, `fonts`, `reveal` and `styles` verbatim from the shell spec instead of sharing them. Ten more page leaves in docs-multipage will follow the same pattern.

## Evidence

Review A of docs-concepts, Nit N1: `diff` of the helper blocks between the two specs is empty. Reviewed head 8b5b9e1.

## Learning

When a plan locks existing tests for sibling leaves, it should still allow a shared helper module under the test directory so each new leaf imports rather than copies. Locking the spec file is enough to protect its assertions.
