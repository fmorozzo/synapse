# GitHub Personal Access Token Setup 🔑

Quick guide to push your code using a Personal Access Token.

---

## 🎯 Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: "Synapse Local Development"
   - **Expiration**: 90 days (or your preference)
   - **Scopes**: Check ✅ **repo** (this gives full repo access)
4. Scroll down and click **"Generate token"**
5. **Copy the token immediately!** (You won't see it again)

It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🎯 Step 2: Update Git Remote URL

In your terminal, run:

```bash
cd /Users/federico/Dev/Gitlab/perso/synapse

# Update remote URL with your token
git remote set-url origin https://YOUR_TOKEN@github.com/fmorozzo/synapse.git

# Replace YOUR_TOKEN with the actual token you copied
```

**Example:**
```bash
git remote set-url origin https://ghp_abc123xyz789@github.com/fmorozzo/synapse.git
```

---

## 🎯 Step 3: Push to GitHub

```bash
git push -u origin main
```

Done! 🎉

---

## 🔒 Security Notes

- ⚠️ Don't share your token with anyone
- ⚠️ Don't commit the token to git
- ⚠️ If exposed, delete it and create a new one
- ✅ Token is stored locally in git config (safe)

---

## 🔄 Alternative: Using SSH (More Secure)

If you prefer SSH keys:

### 1. Check if you have SSH keys:
```bash
ls -al ~/.ssh
```

### 2. If not, generate SSH key:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 3. Add SSH key to GitHub:
```bash
# Copy your public key
cat ~/.ssh/id_ed25519.pub

# Then paste it at: https://github.com/settings/keys
```

### 4. Change remote to SSH:
```bash
git remote set-url origin git@github.com:fmorozzo/synapse.git
git push -u origin main
```

---

## 💡 Which to Choose?

**Personal Access Token (HTTPS)**
- ✅ Easier to set up
- ✅ Works everywhere
- ❌ Less secure than SSH
- ❌ Needs renewal

**SSH Keys**
- ✅ More secure
- ✅ Never expires
- ❌ Slightly more complex setup
- ❌ Need to set up on each computer

---

## 🐛 Troubleshooting

### "Permission denied"
- Make sure token has `repo` scope
- Check token isn't expired
- Verify you copied the entire token

### "Authentication failed"
- Token might be expired - create a new one
- Make sure you're using the right token

### "remote: Repository not found"
- Check repository name is correct
- Verify token has access to the repo

---

Ready to push! 🚀

