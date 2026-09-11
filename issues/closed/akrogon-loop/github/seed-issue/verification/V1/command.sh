repo=upstream/intake
title='Settings save does not persist'
gh issue create -R "$repo" --title "$title" --body-file - <<'SEED_ISSUE_BODY'
Unverified intake.

## Observation
Saving settings reports success, but reopening the page shows the old value.

## Location
Settings page.

## Reproduction
Save settings and reopen the page. Frequency: Not provided.

## Expected behavior
Saved settings persist when reopening the page.

## Urgency
Not provided.
SEED_ISSUE_BODY
