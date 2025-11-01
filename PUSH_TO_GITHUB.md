# Push Synapse to GitHub 🚀

Complete guide to push your code to GitHub.

---

## 📋 Prerequisites

You need:
- ✅ GitHub account
- ✅ Git installed (you already have it)

---

## 🎯 Step 1: Create GitHub Repository

### 1.1 Go to GitHub
Visit: https://github.com/new

### 1.2 Create Repository
- **Repository name**: `synapse` (or whatever you prefer)
- **Description**: "Multi-platform music collection manager with Discogs integration"
- **Visibility**: 
  - ✅ **Private** (recommended - keeps your code private)
  - or **Public** (anyone can see it)
- ⚠️ **DO NOT** check:
  - Add README
  - Add .gitignore  
  - Choose a license

(We already have these files!)

### 1.3 Create Repository
Click **"Create repository"**

### 1.4 Copy the URL
You'll see a URL like:
```
https://github.com/YOUR_USERNAME/synapse.git
```
Or:
```
git@github.com:YOUR_USERNAME/synapse.git
```

Keep this handy!

---

## 🎯 Step 2: Initialize Git Locally

Run these commands in your terminal:

```bash
cd /Users/federico/Dev/Gitlab/perso/synapse

# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit: Synapse music collection manager

- Next.js web app with authentication
- React Native mobile app
- Supabase database integration
- Discogs API integration
- AI features with OpenAI
- shadcn/ui components"
```

---

## 🎯 Step 3: Connect to GitHub

```bash
# Add GitHub as remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/synapse.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/synapse.git

# Verify it's added
git remote -v
```

---

## 🎯 Step 4: Push to GitHub

```bash
# Push to GitHub
git push -u origin main

# If you get an error about 'master' branch, try:
# git branch -M main
# git push -u origin main
```

---

## ✅ Done!

Your code is now on GitHub! 🎉

Visit your repository:
```
https://github.com/YOUR_USERNAME/synapse
```

---

## 🔒 Important: Check .gitignore

Your `.env` files should NOT be pushed to GitHub. Let's verify:

1. Open: `.gitignore`
2. Make sure it includes:
   ```
   .env
   .env.local
   .env*.local
   ```

✅ Already included! Your secrets are safe.

---

## 📝 Future Commits

When you make changes:

```bash
# See what changed
git status

# Add changed files
git add .

# Or add specific files
git add apps/web/app/page.tsx

# Commit with message
git commit -m "Add new feature"

# Push to GitHub
git push
```

---

## 🌿 Working with Branches (Optional)

```bash
# Create a new branch for a feature
git checkout -b feature/new-feature

# Work on your feature, then commit
git add .
git commit -m "Add new feature"

# Push the branch
git push -u origin feature/new-feature

# Then create a Pull Request on GitHub
```

---

## 🔧 Troubleshooting

### "fatal: not a git repository"
Run: `git init` first

### "Permission denied (publickey)"
You need to set up SSH keys:
1. https://docs.github.com/en/authentication/connecting-to-github-with-ssh

Or use HTTPS instead:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/synapse.git
```

### "Updates were rejected"
Someone else pushed changes. Pull first:
```bash
git pull origin main
```

### Large file warning
Git has file size limits. If you get warnings:
```bash
# See large files
git ls-files -z | xargs -0 du -h | sort -h | tail -20

# If needed, add to .gitignore
```

---

## 💡 Pro Tips

### 1. Write Good Commit Messages
```bash
# Good ✅
git commit -m "Add user authentication with Supabase"

# Bad ❌
git commit -m "fix stuff"
```

### 2. Commit Often
Small, frequent commits are better than huge ones.

### 3. Use Branches
For big features, create a branch:
```bash
git checkout -b feature/collection-management
```

### 4. Pull Before Pushing
If working with others:
```bash
git pull origin main
git push origin main
```

---

## 📊 What Gets Pushed

✅ **WILL be pushed:**
- All your code
- Configuration files
- Documentation
- README files

❌ **WON'T be pushed:** (thanks to .gitignore)
- `node_modules/`
- `.env` files (your secrets!)
- `.next/` build folder
- Log files
- IDE settings

---

## 🎨 Add a Nice README Badge

After pushing, you can add badges to your README:

```markdown
# Synapse 🎵

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
```

---

## 📖 Resources

- **Git Basics**: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- **GitHub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

Happy coding! 🚀

