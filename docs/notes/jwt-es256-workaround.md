# JWT ES256 Workaround for Edge Functions

**Date:** 2025-01-06
**Status:** Active workaround
**Affects:** `supabase/functions/impact-assist/index.ts`, `src/lib/api/impact-assist.ts`

## Problem

Supabase rotated JWT signing keys from **HS256 (legacy)** to **ECC P-256 (ES256)** on 2025-01-02.

After this rotation:
- User access tokens are signed with ES256
- The `anon` and `service_role` keys still use HS256
- **Supabase Edge Functions' automatic JWT verification layer does not accept ES256 tokens**

This causes all authenticated Edge Function calls to fail with:
```json
{"code": 401, "message": "Invalid JWT"}
```

## Root Cause

The Edge Functions platform verifies JWTs at the infrastructure level before the request reaches our code. This verification only supports HS256, not ES256.

## Workaround

We bypass the automatic JWT verification by:

1. **Client side (`src/lib/api/impact-assist.ts`):**
   - Pass the `anon` key in the `Authorization` header (satisfies the platform layer)
   - Pass the user's access token in a custom header `x-user-token`

2. **Edge Function side (`supabase/functions/impact-assist/index.ts`):**
   - Accept the request (anon key passes platform verification)
   - Extract user token from `x-user-token` header
   - Manually verify user authentication using `supabase.auth.getUser()` with the user token
   - Use RPC `check_workspace_membership` (SECURITY DEFINER) to verify workspace access

3. **Database (`supabase/migrations/20260106100000_check_workspace_membership.sql`):**
   - New RPC function with SECURITY DEFINER to bypass RLS for membership checks
   - Required because direct table access with service_role was blocked

## Security Considerations

- The anon key is already public (exposed in frontend)
- User authentication is still verified inside the function
- RLS policies still apply to database queries
- This is equivalent security to the standard flow, just with an extra step

## When to Remove This Workaround

Remove this workaround when:
1. Supabase updates Edge Functions to support ES256 JWT verification
2. Or we rotate back to HS256 keys (not recommended long-term)

Monitor Supabase changelog and GitHub issues for updates.

## Related Files

- `src/lib/api/impact-assist.ts` - Client-side API call
- `supabase/functions/impact-assist/index.ts` - Edge Function
- `supabase/migrations/20260106100000_check_workspace_membership.sql` - RPC for membership check
- `.env.local` - Contains `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## References

- Supabase Dashboard: Settings > API > JWT Keys
- Current key: ECC (P-256) - Key ID: 909bfd21-2f26-4b5b-bde1-02947873c2f6
- Previous key: Legacy HS256 - Rotated 4 days ago
