## Getting Started

1. Install dependencies

```
npm install
```

2. Configure environment variables

- Copy `ENV_EXAMPLE.txt` to `.env` and set:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon
VITE_SITE_URL=http://localhost:5173

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

3. Start dev server

```
npm run dev
```

## Production

1. Build

```
npm run build
```

2. Deploy the `dist/` folder to your host (Vercel/Netlify/etc.)
3. Configure the same env vars in your hosting provider
4. In Supabase Auth settings:
   - Add your site URL to Redirect URLs
   - Choose: disable email confirmations for auto-login after signup, or keep them on and use confirmation links

## Payment Setup

To enable payments and the 3-day free trial:

1. **Create a Stripe Account**

   - Go to [stripe.com](https://stripe.com) and create an account
   - Get your publishable and secret keys from the dashboard

2. **Configure Stripe Products**

   - Create a product in Stripe Dashboard
   - Set up pricing: $15/month for Premium
   - Note the price ID for your backend

3. **Backend Implementation**

   - Implement the API endpoints in `/api/` folder
   - Use Stripe SDK to create checkout sessions
   - Handle webhooks for subscription events

4. **Database Schema**
   - Add subscription tracking to your Supabase database
   - Store customer IDs and subscription status

## Security

- `.gitignore` prevents committing `.env` files
- Only `VITE_`-prefixed env vars are exposed to the client
- Stripe secret keys should only be used on the backend

# focus-task-manager

# focus-task-manager

# focus-task-manager

# focus-task-manager
