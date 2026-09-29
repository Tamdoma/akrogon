# Config swap owner merged
- (A,B) Recommend: door commits the operator's current config.yaml edit alone (config-only commit, no issues/ files) and pushes it to origin/main before the swap leaf is allocated. The swap leaf then sets a = pi/meta/muse-spark-1.3-contributor/max and b = codex/gpt-6.1-sol/high in config.yaml, touching only those two seat entries, in the same branch as the code.
- (A,B) Rejected: door swaps working-copy lines now. Old routes would make codex implement and pi merge the swap leaf, against the locked job choice.
- (B) Alternative kept for the record: leaf changes code only, door swaps config at activation. Splits delivery.
- (A,B) Activation: update local main (akrogon sync or git pull --ff-only) only after the swap leaf's old-A merger has finished its merged call and broadcast (tab closed). Earlier would reject its `--slot A` completion.
- (A) Local main is 1 behind origin/main (c39309c, skills only), so fast-forward before the config commit.
