#!/bin/sh
# Logs argv and whether the slice link existed at call time.
linked=no
[ -L "$FAKE_SLICE_LINK" ] && linked=yes
printf '%s linked=%s\n' "$*" "$linked" >> "$FAKE_SYSTEMCTL_LOG"
