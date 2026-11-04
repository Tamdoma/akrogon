# Brief: tasks-side-open

## What

The panel bar opens the Tasks view at side width (368 px, main kept) when the panel is opened from closed, instead of full width. Files and Changes keep opening full width. The full-width toggle in an open panel still grows and shrinks it.

## Why

Chart tasks-hierarchy (akrogon): the operator opens Tasks when the red dot lights while working, and the board is designed narrow first; opening full hides the terminal they came from.

## Done-criteria

1. From closed, a request to open or toggle the tasks view shows the panel at side width with main shown, and the panel is not full.
2. From closed, a request for the files or changes view still opens full width with main hidden, as today.
3. With Tasks open at side width, grow makes it full width and shrink returns it to side width; switching views in an open panel keeps its current width.
