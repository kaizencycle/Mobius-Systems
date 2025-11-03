#!/usr/bin/env bash
set -euo pipefail

# Kaizen OS Lab Promotion Script
# Promotes a concept lab to a proof lab via git subtree
# Usage: ./scripts/promote_lab.sh <lab-name> <remote-repo-url>
#
# Example: ./scripts/promote_lab.sh lab7 git@github.com:kaizencycle/lab7-proof.git

LAB="${1:?Usage: $0 <lab-name> <remote-repo-url>}"
REMOTE_REPO="${2:?Usage: $0 <lab-name> <remote-repo-url>}"
PROOF="${LAB}-proof"

echo "🚀 Promoting ${LAB} → ${PROOF}"

# Validate lab exists
if [ ! -d "labs/${LAB}" ]; then
  echo "❌ Error: labs/${LAB} does not exist"
  exit 1
fi

# 1. Split lab history into its own branch
echo "📦 Splitting subtree history..."
git subtree split --prefix="labs/${LAB}" -b "promote/${PROOF}" || {
  echo "❌ Failed to split subtree. Is labs/${LAB} tracked in git?"
  exit 1
}

# 2. Create remote and push
echo "📤 Pushing to dedicated repo..."
git remote add "${PROOF}" "${REMOTE_REPO}" 2>/dev/null || git remote set-url "${PROOF}" "${REMOTE_REPO}"
git push "${PROOF}" "promote/${PROOF}:main" --force || {
  echo "❌ Failed to push. Ensure remote repo exists and you have access."
  exit 1
}

# 3. Clean up old proof path if exists
echo "🧹 Cleaning up monorepo path..."
git checkout main || git checkout master
if [ -d "labs/${PROOF}" ]; then
  git rm -r "labs/${PROOF}" 2>/dev/null || true
  git commit -m "chore: prepare path for ${PROOF}" || true
fi

# 4. Import as subtree
echo "📥 Importing as subtree..."
git subtree add --prefix="labs/${PROOF}" "${PROOF}" main --squash || {
  echo "❌ Failed to add subtree. Check git subtree is available."
  exit 1
}

# 5. Cleanup branch
git branch -D "promote/${PROOF}" 2>/dev/null || true

echo ""
echo "✅ ${LAB} promoted to ${PROOF} and synced back as subtree"
echo "📦 Dedicated repo: ${REMOTE_REPO}"
echo "📂 Monorepo path: labs/${PROOF}"
echo ""
echo "To sync future updates:"
echo "  git subtree pull --prefix=labs/${PROOF} ${PROOF} main --squash"
