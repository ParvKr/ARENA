# Google and Apple sign-in setup

The application uses Supabase Auth for social sign-in. Do not add provider client secrets to `.env.local`; configure them in the Supabase Dashboard under **Authentication → Sign In / Providers**.

## Redirect configuration

In **Authentication → URL Configuration**, set the production Site URL and add these redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://your-production-domain/auth/callback`

## Google

1. In Google Cloud Console, create a **Web application** OAuth client.
2. Add the Supabase callback displayed in the Google provider panel as an authorized redirect URI. It has the form `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Copy the Google client ID and client secret into the Google provider settings in Supabase, then enable the provider.

## Apple

1. In Apple Developer, enable **Sign in with Apple** for your App ID and create a Services ID for the web app.
2. Configure its return URL as the Supabase callback shown above.
3. Create an Apple Sign in with Apple key, then enter the Services ID, Team ID, Key ID, and private key in Supabase's Apple provider settings.
4. Enable the provider in Supabase.

After a successful first social sign-in, Arena creates a competitor profile automatically. Apple may provide a private relay email and does not reliably return a name, so the app supplies a safe default display name and unique handle when needed.
