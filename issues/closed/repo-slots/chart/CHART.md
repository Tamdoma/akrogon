# Chart: repo-slots

## Destination
A repo's `issues/config.yaml` may override seat A and/or B with a full {harness, model, effort}; omitted seats inherit the global config; `akrogon config` prints the pair dispatch will use; an unknown harness key is refused at init and before dispatch allocates.

## Forks taken
- [seat-shape](forks/seat-shape.md): whole-seat override, harness/model/effort selection only.

## Fog
none

## Off route
- Per-repo harness templates or launch flags: new composition rule for no named need.
- Per-repo max_active: machine seat cap, not a repo property.
- Restarting running seats on config change: needs restart policy; override applies at next start.

Handed off 2026-09-20
