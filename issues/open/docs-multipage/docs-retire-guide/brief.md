# Brief: docs-retire-guide

## What
Delete `docs/guide.html` once every page exists, and verify that every relative link in `docs/*.html` resolves to a file in `docs/`.

## Why
Page leaves copy their sections from guide.html, so it can only go after all of them land. Nothing in the repo links to it.

## Done-criteria
1. `docs/guide.html` does not exist.
2. Every `href` in `docs/*.html` that is not absolute and not a bare fragment names a file present in `docs/`, shown by a command whose output is recorded as evidence.
3. `grep -rn "guide.html" src skills plugin docs REFERENCE.md` returns nothing.
