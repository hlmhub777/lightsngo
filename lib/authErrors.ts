// Turns Supabase auth / database errors into short, friendly messages.
// Supabase error texts are technical ("Database error saving new user"),
// so we match on the error code first and the message text second.

type MaybeError = {
  code?: string | null;
  message?: string | null;
  status?: number | null;
} | null | undefined;

export function friendlyAuthError(err: MaybeError): string {
  if (!err) return "Something went wrong. Please try again.";
  const code = (err.code ?? "").toLowerCase();
  const msg = (err.message ?? "").toLowerCase();

  const has = (...needles: string[]) =>
    needles.some((n) => code === n || msg.includes(n));

  if (has("invalid_credentials", "invalid login credentials"))
    return "Wrong email or password. Please try again.";

  if (has("email_not_confirmed", "email not confirmed"))
    return "Your email isn't confirmed yet. Please click the link we sent you (check spam too).";

  if (has("user_already_exists", "email_exists", "user already registered", "already been registered"))
    return "An account with this email already exists. Try logging in instead.";

  // The profile trigger fails when the username is already taken.
  if (has("database error saving new user", "duplicate key", "23505", "profiles_username_key"))
    return "That username is already taken. Please choose another one.";

  if (has("weak_password", "password should be", "password is too weak"))
    return "That password is too weak. Use at least 8 characters, mixing letters and numbers.";

  if (has("same_password", "should be different from the old password"))
    return "Your new password must be different from your old one.";

  if (
    has("over_email_send_rate_limit", "over_request_rate_limit", "rate limit", "too many requests") ||
    err.status === 429
  )
    return "Too many attempts. Please wait a minute and try again.";

  if (has("captcha"))
    return "The verification check failed. Please complete it again.";

  if (has("user_not_found", "user not found"))
    return "We couldn't find an account with that email.";

  if (has("otp_expired", "token has expired", "link is invalid or has expired", "expired"))
    return "This link has expired. Please request a new one.";

  if (has("signup_disabled", "signups not allowed"))
    return "New sign-ups are paused right now. Please try again later.";

  if (has("provider is not enabled", "unsupported provider", "validation_failed"))
    return "Google sign-in isn't available right now. Please use email and password.";

  if (has("failed to fetch", "networkerror", "network request failed"))
    return "We can't reach the server. Check your internet connection and try again.";

  if (has("access_denied"))
    return "Sign-in was cancelled.";

  return "Something went wrong. Please try again.";
}
