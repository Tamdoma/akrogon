# The intake line beats both slots

Model Tiering, 2026-09-09. Intake line 259 said the machinery must not know about subagents. Both slots read it, and both still designed a `workers` config key, a spawn table and worker effort settings, and the operator had accepted the key the day before inside Config Shape. The operator caught it on the batch: akrogon knows only the slot models.

Rule: before a batch is merged, each recommendation that adds a config key, a table or a rule is checked against the intake lines the decision file cites. A line that says "the machinery must not know X" forecloses every lever on X, in every later decision, not only the one that quoted it.
