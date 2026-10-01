"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export type CaptchaHandle = {
  reset: () => void;
};

const Captcha = forwardRef<
  CaptchaHandle,
  {
    onVerify: (token: string) => void;
    onExpire: () => void;
  }
>(function Captcha({ onVerify, onExpire }, ref) {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  const captchaRef = useRef<HCaptcha>(null);

  useImperativeHandle(ref, () => ({
    reset: () => captchaRef.current?.resetCaptcha(),
  }));

  if (!siteKey) {
    // No site key configured yet — fail open rather than blocking every
    // signup/login. Once NEXT_PUBLIC_HCAPTCHA_SITE_KEY is set (and the
    // matching secret added in Supabase), this renders the real widget.
    return null;
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        theme="dark"
        onVerify={onVerify}
        onExpire={onExpire}
      />
    </div>
  );
});

export default Captcha;
