repo=consumer/app
title='Saving settings prints $(touch SHOULD_NOT_EXIST) and `touch ALSO_NOT_EXIST`, $HOME, quotes '"'"' and ".'
gh issue create -R "$repo" --title "$title" --body-file - <<'SEED_ISSUE_BODY'
Unverified intake.

## Observation
Saving settings prints $(touch SHOULD_NOT_EXIST) and `touch ALSO_NOT_EXIST`, $HOME, quotes ' and ".

## Location
Not provided.

## Reproduction
Not provided.

## Expected behavior
Not provided.

## Urgency
Not provided.
SEED_ISSUE_BODY
