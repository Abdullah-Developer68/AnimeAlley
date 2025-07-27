# Pure JWT Authentication Setup for Cross-Domain Deployment

## Authentication Strategy: Pure JWT (No Sessions)

Both local authentication and Google OAuth now use JWT tokens stored in cookies.

- Google OAuth: Uses Passport with custom callback (no sessions)
- Local Auth: Direct JWT creation and cookie storage
- Token Verification: JWT decode from cookies
- Logout: Simple cookie clearing (no session destruction)

## Required Environment Variables

### Server Environment Variables (.env)

```bash
# Basic Configuration
NODE_ENV=production
JWT_KEY=your_super_secure_jwt_secret_key_here

# Database
MONGODB_URI=your_mongodb_connection_string

# Client URL (CRITICAL for CORS)
CLIENT_URL=https://anime-alley-beige.vercel.app

# Cookie Domain Configuration (CRITICAL for cross-domain)
# For Vercel subdomains: use .vercel.app
COOKIE_DOMAIN=.vercel.app

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Client Environment Variables (.env)

```bash
# API Base URL - Point to your production server
VITE_API_BASE_URL=https://your-server-domain.vercel.app
# or your custom domain: https://api.yourdomain.com
```

## Cookie Configuration Explanation

### Development vs Production

- **Development**: Same-origin (localhost) - cookies work normally
- **Production**: Cross-origin - requires special configuration

### Cookie Security Settings

```javascript
{
  httpOnly: true,           // Prevents XSS attacks
  secure: true,            // HTTPS only in production
  sameSite: "none",        // Required for cross-origin
  path: "/",               // Available on all paths
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain: process.env.COOKIE_DOMAIN // Critical for cross-domain
}
```

## CORS Configuration

### Allowed Origins

- Add your production client URL to `CLIENT_URL_PRODUCTION`
- Ensure both development and production URLs are included
- Remove wildcards (\*) in production for security

### Required Headers

- `credentials: true` - Essential for cookie transmission
- `Access-Control-Allow-Credentials: true`
- Specific origin domains (no wildcards with credentials)

## Deployment Checklist

### Before Deployment

- [ ] Set all environment variables in production
- [ ] Verify HTTPS is enabled on both client and server
- [ ] Test cookie domain configuration
- [ ] Confirm CORS origins are correct
- [ ] Check JWT secret is secure and different from development

### After Deployment

- [ ] Test login/logout functionality
- [ ] Verify cookies are being set in browser dev tools
- [ ] Check cross-origin requests work
- [ ] Test token persistence across page refreshes
- [ ] Validate Google OAuth (if used)

## Troubleshooting Common Issues

### Cookies Not Being Set

1. Check HTTPS is enabled
2. Verify `sameSite: "none"` with `secure: true`
3. Confirm COOKIE_DOMAIN matches your server domain
4. Check CORS credentials configuration

### Cross-Origin Errors

1. Verify CLIENT_URL matches exactly (no trailing slashes)
2. Check `withCredentials: true` in axios config
3. Ensure server allows credentials in CORS

### Token Not Persisting

1. Check cookie expiration settings
2. Verify domain configuration
3. Test in incognito mode to rule out browser cache

## Security Considerations

### Production Security

- Use strong JWT secrets (minimum 32 characters)
- Enable HTTPS on all domains
- Set appropriate cookie expiration
- Implement rate limiting
- Use environment-specific configurations

### Cookie Security

- `httpOnly: true` prevents XSS
- `secure: true` ensures HTTPS only
- `sameSite: "none"` for cross-origin (with secure)
- Proper domain configuration prevents cookie leakage
