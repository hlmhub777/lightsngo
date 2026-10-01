"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function Captcha({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void;
  onExpire: () => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    // No site key configured yet — fail open rather than blocking every
    // signup/login. Once NEXT_PUBLIC_HCAPTCHA_SITE_KEY is set (and the
    // matching secret added in Supabase), this renders the real widget.
    return null;
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        sitekey={siteKey}
        theme="dark"
        onVerify={onVerify}
        onExpire={onExpire}
      />
    </div>
  );
}
