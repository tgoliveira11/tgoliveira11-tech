#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is dirty. Commit or stash changes before merging upstream."
  exit 1
fi

git fetch upstream

if git merge-base --is-ancestor upstream/main HEAD; then
  echo "Already up to date with upstream/main."
  exit 0
fi

upstream_short="$(git rev-parse --short upstream/main)"
echo "Merging upstream/main (${upstream_short}) into $(git branch --show-current)..."

if git merge upstream/main -m "sync: merge upstream/main (${upstream_short})"; then
  echo "Merge complete. Run validation, then push to origin (never upstream)."
else
  echo ""
  echo "Merge conflict. Resolve files, then:"
  echo "  npm install && npm run typecheck && npm run lint && npm test"
  echo "  git add . && git commit"
  echo "  git push origin $(git branch --show-current)"
  exit 1
fi
