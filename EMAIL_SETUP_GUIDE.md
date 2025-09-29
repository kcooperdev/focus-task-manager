# 📧 Email Confirmation Setup Guide

## 🎯 Quick Setup Steps

### 1. **Enable Email Confirmation in Supabase Dashboard**

1. Go to your **Supabase Dashboard**
2. Click **"Authentication"** in the left sidebar
3. Click **"Settings"**
4. Scroll to **"Email Auth"** section
5. **Turn ON** "Enable email confirmations"
6. **Turn ON** "Enable email change confirmations"
7. Click **"Save"**

### 2. **Configure URL Settings**

1. In **Authentication > Settings**
2. Scroll to **"URL Configuration"**
3. Set **Site URL**: `http://localhost:5173`
4. Add **Redirect URLs**:
   - `http://localhost:5173/auth`
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/`

### 3. **Customize Email Template**

1. Go to **Authentication > Email Templates**
2. Click **"Confirm your signup"**
3. Update the template:

```html
<h2>Welcome to Task Manager!</h2>
<p>Thanks for signing up. Please confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Confirm Email</a></p>
<p>If the button doesn't work, copy this link:</p>
<p>{{ .ConfirmationURL }}</p>
```

### 4. **Test Email Confirmation**

1. **Start your app**: `npm run dev`
2. **Go to signup page**: `http://localhost:5173/signup`
3. **Enter a real email address** (not fake)
4. **Check your email** (including spam folder)
5. **Click the confirmation link**
6. **You should be redirected** to your app

## 🔧 Troubleshooting

### **Emails Not Arriving?**

1. **Check spam/junk folder**
2. **Use a real email address** (Gmail, Yahoo, etc.)
3. **Wait 1-2 minutes** for delivery
4. **Check Supabase logs** in Dashboard > Logs

### **Confirmation Link Not Working?**

1. **Verify Site URL** is `http://localhost:5173`
2. **Check Redirect URLs** include your app URLs
3. **Make sure your app is running** on port 5173
4. **Try a different browser** or incognito mode

### **Still Having Issues?**

1. **Check Supabase Dashboard > Logs** for errors
2. **Try with a different email provider** (Gmail, Outlook)
3. **Verify your Supabase project** is active
4. **Check your internet connection**

## 📱 Production Setup

When deploying to production:

1. **Update Site URL** to your production domain
2. **Add production redirect URLs**
3. **Configure custom SMTP** for better deliverability
4. **Test with real email addresses**

## ✅ Success Indicators

You'll know it's working when:
- ✅ User gets "Check your email" message after signup
- ✅ Email arrives within 1-2 minutes
- ✅ Clicking link redirects to your app
- ✅ User is automatically logged in after confirmation

## 🚀 Your App Already Handles This!

Your `AuthForm.tsx` component already:
- ✅ Shows "Check your email" message
- ✅ Handles both confirmed and unconfirmed users
- ✅ Redirects properly after confirmation
- ✅ Manages authentication state correctly

Just follow the Supabase Dashboard setup steps above! 🎯

