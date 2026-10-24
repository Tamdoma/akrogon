no defects

F1 and F2 are closed: a failed workspace list now yields an empty set (`src/next.ts:1303-1305`), so the typed pass skips the repo and never adds it to `acting` (`src/next.ts:1321-1322`), and the tab_closed hook returns before any reconcile (`src/next.ts:1445`). The host step can no longer judge such a repo's slices from the invoking session's panes.
