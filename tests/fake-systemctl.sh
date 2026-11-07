#!/bin/sh
# Logs argv, whether the slice link existed at call time and, when
# FAKE_DEPLOY_RECORD is set, whether the deploy record existed then.
linked=no
[ -L "$FAKE_SLICE_LINK" ] && linked=yes
record=''
if [ -n "$FAKE_DEPLOY_RECORD" ]; then
  record=' record=no'
  [ -f "$FAKE_DEPLOY_RECORD" ] && record=' record=yes'
fi
printf '%s linked=%s%s\n' "$*" "$linked" "$record" >> "$FAKE_SYSTEMCTL_LOG"
