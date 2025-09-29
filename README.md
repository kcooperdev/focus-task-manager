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

## Security

- `.gitignore` prevents committing `.env` files
- Only `VITE_`-prefixed env vars are exposed to the client
# focus-task-manager
# focus-task-manager
# focus-task-manager
