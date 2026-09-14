# Fork: state-last

## Question
Where does the write-order rule live and what does the sample phase line say?

## Carries
shapes.md:150-160 and :166-170, src/next.ts:99-104.

## Findings
- repo (both): the scanner discovers leaves by state.yaml; a state without brief is dispatchable.
- (B) F3: the sample already pairs plan.synthesis with debate no; keep both semantics.

## Taken
Operator answer (2026-09-14): `28a` one write-order sentence (brief and design before state.yaml, prerequisites before dependents) and a comment on the sample phase line for the debate-yes value. Forecloses no change.
