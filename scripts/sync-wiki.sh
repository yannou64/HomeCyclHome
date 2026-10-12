#!/bin/sh
# Resynchronise la copie versionnée docs/wiki/ à partir du vault Obsidian externe
# (source de vérité). Ne commit rien : stage seulement (git add).
set -e

VAULT="/Users/yannickbiot/Documents/Mini Brain/30 Projets/HomeCycl'Home"
REPO_ROOT="$(git rev-parse --show-toplevel)"

rm -rf "$REPO_ROOT/docs/wiki"
mkdir -p "$REPO_ROOT/docs/wiki"
cp -R "$VAULT/." "$REPO_ROOT/docs/wiki/"
git -C "$REPO_ROOT" add docs/wiki

echo "docs/wiki resynchronisé depuis le vault et stagé (git add)."
