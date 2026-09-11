# Item start deadlocked on an empty proof directory

What failed: `start-item` looped forever. `.akrogon/<slug>/` was created with no files at
consult-position, git cannot commit an empty directory, so `itemStarted` never became true and no
seat was ever dispatched.

Root cause: the started-check trusted directory listing over the thing git can actually record.
The design assumed every item carries chunk files at start; a chunk-less item satisfied the code
path but not the invariant.

Fix: 4e734e5f — brief.md and design.md are copied into the proof directory alongside the chunks,
so the start commit always has content.

Lesson: any state transition proven "by committed artifact" must guarantee the artifact is
committable. When a check reads git, self-test the empty-input case (no chunks, no files) — the
fixture only covered the populated case. Chart issues should state, per phase, what the committed
evidence of that phase is, so a phase with no evidence is caught at issue-creation time.
