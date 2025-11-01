# Authentication Setup Guide 🔐

Your authentication system is now complete! Here's how to configure and use it.

## ✅ What's Been Built

### Authentication Pages
- **Sign Up** (`/auth/sign-up`) - Create new account with email verification
- **Sign In** (`/auth/sign-in`) - Login with email/password
- **Forgot Password** (`/auth/forgot-password`) - Request password reset
- **Reset Password** (`/auth/reset-password`) - Set new password

### Features
- ✅ Email/password authentication
- ✅ Email verification on signup
- ✅ Password reset flow
- ✅ Protected routes (dashboard requires login)
- ✅ Session management
- ✅ User menu with sign out
- ✅ Form validation
- ✅ Error handling

---

## 🔧 Supabase Configuration Required

You need to configure email settings in Supabase for the full auth flow to work.

### Step 1: Access Supabase Email Settings

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Email Templates**

### Step 2: Configure Email Templates (Optional but Recommended)

Customize these templates:
- **Confirm signup** - Sent when users register
- **Reset password** - Sent when users request password reset
- **Magic link** - For passwordless login (future feature)

### Step 3: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`

### Step 4: Email Provider Settings

**Development (Default):**
- Supabase provides email service for development
- Limited to ~100 emails/hour
- Uses their SMTP server

**Production (Recommended):**
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your email provider:
   - **SendGrid** (recommended)
   - **AWS SES**
   - **Mailgun**
   - Or any SMTP provider

---

## 🎯 How to Use the Auth System

### For Users:

1. **Sign Up:**
   - Visit `/auth/sign-up`
   - Fill in name, email, password
   - Check email for verification link
   - Click link to verify account
   - Redirected to dashboard

2. **Sign In:**
   - Visit `/auth/sign-in`
   - Enter email and password
   - Redirected to dashboard

3. **Forgot Password:**
   - Visit `/auth/forgot-password`
   - Enter email
   - Check email for reset link
   - Click link and enter new password

### For Developers:

#### Check if User is Authenticated (Server Component)
```typescript
import { getUser } from '@/lib/auth/actions';

export default async function MyPage() {
  const user = await getUser();
  
  if (!user) {
    // Not logged in
  }
  
  return <div>Hello {user.email}</div>;
}
```

#### Sign Out
```typescript
import { signOut } from '@/lib/auth/actions';

<form action={signOut}>
  <button>Sign Out</button>
</form>
```

#### Protect a Route
Routes starting with `/dashboard` are automatically protected by middleware.

To protect other routes, edit `middleware.ts`:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/your-protected-route/:path*',
  ],
};
```

---

## 🚀 Testing the Auth System

### 1. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
pnpm dev:web
```

### 2. Test Sign Up Flow
1. Visit http://localhost:3000
2. Click "Get Started"
3. Fill out the signup form
4. Check your email for verification link
5. Click the verification link
6. You should be redirected to the dashboard

### 3. Test Sign In
1. Visit http://localhost:3000/auth/sign-in
2. Enter your credentials
3. Should redirect to dashboard

### 4. Test Protected Routes
1. Sign out
2. Try to visit http://localhost:3000/dashboard
3. Should redirect to sign-in page

### 5. Test Password Reset
1. Visit http://localhost:3000/auth/forgot-password
2. Enter your email
3. Check email for reset link
4. Click link and set new password

---

## 📧 Email Verification Notes

### Development Mode:
- Supabase sends real emails
- Check spam folder if not received
- Emails may be delayed (up to 5 minutes)

### Testing Without Email:
If you want to test without waiting for emails:

1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Find your user
4. Click the menu (•••)
5. **Send verification email** or **Confirm email**

Or disable email verification temporarily:
1. **Authentication** → **Providers** → **Email**
2. Turn off **Confirm email**

---

## 🔒 Security Features

### What's Protected:
- ✅ Passwords are hashed (bcrypt by Supabase)
- ✅ Sessions are secure (httpOnly cookies)
- ✅ CSRF protection
- ✅ Rate limiting (by Supabase)
- ✅ SQL injection protection (parameterized queries)

### Best Practices Implemented:
- ✅ 6+ character password minimum
- ✅ Email verification required
- ✅ Server-side validation
- ✅ Secure password reset flow
- ✅ Session expiry

---

## 🐛 Troubleshooting

### "Email not verified"
- Check spam folder
- Request new verification email from Supabase dashboard
- Or temporarily disable email verification

### "Invalid login credentials"
- Check email/password are correct
- Ensure email is verified
- Try password reset if forgotten

### "Too many requests"
- Wait a few minutes
- Supabase has rate limits in development

### Emails not sending
1. Check Supabase email logs: **Authentication** → **Logs**
2. Verify Site URL is configured
3. Check redirect URLs are correct

---

## 🎨 Customization

### Change Password Requirements
Edit `/lib/auth/actions.ts`:
```typescript
// Add your validation logic
if (password.length < 8) {
  return { error: 'Password must be at least 8 characters' };
}
```

### Add Social Login (Google, GitHub, etc.)
1. Configure in Supabase: **Authentication** → **Providers**
2. Add buttons to sign-in page
3. Use `supabase.auth.signInWithOAuth()`

### Custom Email Templates
Design custom templates in Supabase dashboard with your branding.

---

## 📊 What's Next?

Now that auth is working, you can:
1. Create user profiles
2. Save user-specific data
3. Add role-based permissions
4. Build the collection features
5. Deploy to production

---

## 💡 Quick Reference

| Action | URL |
|--------|-----|
| Sign Up | `/auth/sign-up` |
| Sign In | `/auth/sign-in` |
| Forgot Password | `/auth/forgot-password` |
| Reset Password | `/auth/reset-password` |
| Dashboard (Protected) | `/dashboard` |

**Questions?** Check the Supabase Auth docs: https://supabase.com/docs/guides/auth

---

Built with ❤️ using Supabase Auth

