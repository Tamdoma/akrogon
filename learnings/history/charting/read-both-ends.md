# A pane read is complete when both ends are present

## What was not good

Slot B's batch was read with a guessed line count. The first read cut off the first two questions, the second read never checked for the intro paragraph. The merge went ahead on an unverified read.

## What the updated way does

A read counts only when it shows the prompt that asked for the batch at the top and the challenge check at the bottom. Missing either end means read again with more lines.

## Why

Herdr returns rows, it does not know where a reply starts or ends. The operator asked how slot A could know it had picked up everything, and it could not.

## How it improves the process

A merge never starts on a partial batch, and a lost question is caught by the reader instead of the operator.
