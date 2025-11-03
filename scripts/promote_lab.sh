#!/usr/bin/env bash
set -euo pipefail

# Kaizen OS Lab Promotion Script
# Promotes a concept lab to a proof lab by:
# 1. Splitting lab history into dedicated repo
# 2. Importing back as git subtree for bidirectional sync
#
# Usage: ./scripts/promote_lab.sh <lab-name> <remote-repo-url>
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
echo "📦 Step 1: Splitting lab history..."
git subtree split --prefix="labs/${LAB}" -b "promote/${PROOF}"

# 2. Create remote and push
echo "📤 Step 2: Pushing to dedicated repo..."
git remote add "${PROOF}" "${REMOTE_REPO}" 2>/dev/null || true
git push "${PROOF}" "promote/${PROOF}:main" --force

# 3. Clean up old proof path if exists
echo "🧹 Step 3: Cleaning up old proof path..."
git checkout main || git checkout -b main
if [ -d "labs/${PROOF}" ]; then
  git rm -r "labs/${PROOF}" || true
  git commit -m "chore: prepare path for ${PROOF}" || true
fi

# 4. Import as subtree
echo "📥 Step 4: Importing as subtree..."
git subtree add --prefix="labs/${PROOF}" "${PROOF}" main --squash || true
git commit -m "feat(${PROOF}): import as live service (subtree)" || true

# 5. Cleanup
echo "🧹 Step 5: Cleaning up..."
git branch -D "promote/${PROOF}" 2>/dev/null || true

echo ""
echo "✅ ${LAB} promoted to ${PROOF} and synced back as subtree"
echo "📦 Dedicated repo: ${REMOTE_REPO}"
echo "📂 Monorepo path: labs/${PROOF}"
echo ""
echo "💡 To sync updates later:"
echo "   git subtree pull --prefix=labs/${PROOF} ${PROOF} main --squash"
