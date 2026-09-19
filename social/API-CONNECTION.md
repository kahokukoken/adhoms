# X API connection check

This read-only check uses the four repository Actions Secrets configured by the
owner: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET.
It sends one OAuth 1.0a signed GET to https://api.x.com/2/users/me and requires
the returned username to be kahokuadhoms. Credentials and response bodies are
never logged. Redirects and automatic retries are disabled.

The workflow runs on manual dispatch on main, or when its own workflow file
changes on main (including initial installation). It does not run on a schedule
or expose secrets to pull-request jobs. API requests may consume X credits;
this code never purchases credits or enables auto-recharge.

Success proves authentication and account identity only. It does not prove
write permission or implement posting. The existing manually posted introduction
must not be reposted. If HTTP 401 occurs, check that all four secrets belong to
the current app; regenerate user tokens if necessary after key changes. HTTP
402 or 403 requires checking X credits/access in the console, not repeated retries.

Run manually from Actions > X connection check > Run workflow, selecting main.
No callback server is used: the app owner's access token is generated in X's
console. Keep all token values out of chat, source files and screenshots.
