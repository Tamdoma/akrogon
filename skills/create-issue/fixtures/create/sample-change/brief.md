# Brief: sample-change

## What

Make the command-line invalid-repo error actionable.

## Why

A caller needs to identify a valid repo without guessing.

## Done-criteria

1. An unconfigured repo name returns a nonzero exit.
2. The error lists every configured repo key.
3. Rejection changes no files.
4. Valid-repo behavior remains unchanged.
