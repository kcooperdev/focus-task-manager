#!/bin/bash

echo "🚀 Deploying tunlvzn to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Deploy to Railway
echo "📦 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to your Railway dashboard"
echo "2. Set these environment variables in your Railway project:"
echo "   - STRIPE_SECRET_KEY=sk_live_your_live_secret_key"
echo "   - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key"
echo "   - VITE_SUPABASE_URL=your_supabase_url"
echo "   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo "   - VITE_SITE_URL=https://your-domain.railway.app"
echo ""
echo "3. Create products in Stripe Dashboard:"
echo "   - Premium Plan: \$15/month"
echo "   - Pro Plan: \$30/month"
echo ""
echo "4. Update price IDs in src/services/stripeService.ts"
echo ""
echo "🎉 Your app will now redirect to real Stripe checkout!"
