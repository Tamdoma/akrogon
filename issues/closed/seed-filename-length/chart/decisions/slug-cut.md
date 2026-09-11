# How is the seed slug shortened?

## Question
Cut the hyphenated slug to at most 40 characters at a hyphen boundary, never mid word. A single word longer than 40 characters is hard cut at 40. Number stays first.

### Carries
None.

## Findings
- Reporter: the number is the identity, nothing reads the words. Word boundary is only for readability.

## Resolution
Reporter statement taken as the answer (2026-09-11): "the slug is cut to about 40 characters at a word boundary. The number stays first and is the identity; nothing reads the words." Foreclosed: keeping 100, or cutting mid word.
