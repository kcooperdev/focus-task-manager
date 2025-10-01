# Production Deployment Guide

## 🚀 Quick Fix for Production

If you're getting "Error processing payment" in production, here's how to fix it:

### Option 1: Deploy to Railway (Recommended)

1. **Install Railway CLI:**

   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy:**

   ```bash
   railway up
   ```

3. **Set Environment Variables in Railway Dashboard:**
   - Go to your project in Railway dashboard
   - Go to Variables tab
   - Add these variables:
     ```
     STRIPE_SECRET_KEY=sk_live_your_live_secret_key
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_SITE_URL=https://your-domain.railway.app
     ```

### Option 2: Vercel

1. **Install Railway CLI:**

   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy:**

   ```bash
   railway up
   ```

3. **Set Environment Variables in Railway Dashboard**

### Option 3: Netlify Functions

1. **Create `netlify/functions/` directory**
2. **Move API files to `netlify/functions/`**
3. **Deploy to Netlify**

## 🔧 Environment Variables Needed

```bash
# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase (Get from https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Your domain
VITE_SITE_URL=https://your-domain.com
```

## 📝 Create Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create these products:
   - **Premium Plan**: $15/month
   - **Pro Plan**: $30/month
3. Copy the Price IDs and update `src/services/stripeService.ts`:

```typescript
export const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: "price_1234567890", // Your actual price ID
  PRO_MONTHLY: "price_0987654321", // Your actual price ID
} as const;
```

## 🧪 Test in Production

1. Use Stripe test cards: `4242 4242 4242 4242`
2. Test the complete payment flow
3. Verify subscription management works

## 🆘 If Still Having Issues

1. Check browser console for errors
2. Check server logs in your deployment platform
3. Verify all environment variables are set
4. Make sure Stripe keys are for the correct environment (test vs live)
