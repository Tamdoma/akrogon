# Output text

## Question
Q1: Should app.py print exactly "hello world" through print()?

### Carries
Operator: app.py prints hello but should print hello world.

## Findings
app.py is print("hello"). Changing the literal is the whole fix.

## Taken
A's own pick under autopilot: print("hello world"), default newline kept. Reason: the operator asked for that output and the change is one literal. Rejected: sys.stdout.write without newline, which changes output bytes beyond the request. Standing consultant dissent: none, no consultants.
