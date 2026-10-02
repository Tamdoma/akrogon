# Blocker record

## Question
Q1. How does a seat check presence, record a missing input, and (key-creation 2a) save a key its leaf produced, without its command text or file access tripping deny rules: one akrogon command that reads and writes the env by name, or the operator reconciling the user deny rules at their source?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a.
- F4: user deny `Bash(* .env*)` matches command text; it blocked reason text and this door's own intake write.
- F7: empty values count as missing.
- From env-source B R2: phase skills forbid env writes (skills/implement-issue/SKILL.md:45, check-issue:31, merge-issue:29); user deny `Edit(**/.env)` wins over any allow; taken key-creation 2a needs a permitted narrow write.

## Findings

## Taken
