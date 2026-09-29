import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — LightsNGo",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-paper/85">
      <Link href="/" className="text-sm text-paper/50 hover:text-paper">
        ← Home
      </Link>

      <h1 className="mt-3 font-display text-3xl font-700 text-paper">
        Privacy Policy
      </h1>
      <p className="mt-1 text-sm text-paper/50">
        Last updated: [DATE] — Draft template. Replace all [bracketed]
        placeholders and have this reviewed by a lawyer before public launch.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            1. Who we are
          </h2>
          <p>
            LightsNGo ("we", "us") is operated by [YOUR LEGAL NAME / COMPANY
            NAME], [COUNTRY]. For any question about this policy or your
            data, contact us at [YOUR CONTACT EMAIL]. If you are in the EU
            and we are required to have one, our EU representative is
            [EU REPRESENTATIVE NAME AND ADDRESS, if applicable].
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            2. What data we collect
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Account data:</strong> email address and password
              (stored securely, hashed, by our authentication provider).
            </li>
            <li>
              <strong>Profile data you choose to add:</strong> username,
              country, gender, birth year, favorite team/driver, tracks
              visited, profile photo, bio.
            </li>
            <li>
              <strong>Content you create:</strong> posts, chat room messages,
              city guide tips, and private messages.
            </li>
            <li>
              <strong>Age and consent records:</strong> a timestamp showing
              you confirmed you are 18+ and accepted these terms.
            </li>
            <li>
              <strong>Technical data:</strong> basic log/session data needed
              to keep you signed in and keep the service secure.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            3. Why we process it (legal basis)
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>To provide the service</strong> (contract) — creating
              your account, showing you the feed, chat rooms, and messages.
            </li>
            <li>
              <strong>With your consent</strong> — optional profile fields,
              and any marketing communication, if we ever add it.
            </li>
            <li>
              <strong>Legitimate interest</strong> — keeping the platform
              secure, preventing abuse, moderating harmful content.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            4. Who we share it with
          </h2>
          <p>
            We don&rsquo;t sell your data. We use the following processors to
            run the service, who only process data on our instructions:
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>
              <strong>Supabase</strong> (database, authentication, real-time
              messaging) — data hosted in [SUPABASE PROJECT REGION].
            </li>
            <li>
              <strong>Vercel</strong> (hosting the website itself).
            </li>
          </ul>
          <p className="mt-2">
            Other users can see content you post publicly (feed, chat rooms,
            city guide tips) and the profile fields you choose to fill in.
            Private messages are only visible to you and the recipient.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            5. How long we keep it
          </h2>
          <p>
            We keep your account and content for as long as your account is
            active. If you delete your account, we delete your profile data;
            some content (like messages you sent to others) may remain
            visible to the other party as is standard for messaging
            services, unless you request full deletion by contacting us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            6. Your rights (GDPR)
          </h2>
          <p>If you are in the EU/EEA or UK, you have the right to:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data ("right to be forgotten")</li>
            <li>Export your data in a portable format</li>
            <li>Object to or restrict certain processing</li>
            <li>
              Lodge a complaint with your local data protection authority
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email us at
            [YOUR CONTACT EMAIL]. We&rsquo;ll respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            7. Cookies
          </h2>
          <p>
            We use only the essential cookies needed to keep you logged in
            and your session secure. We do not currently use tracking or
            advertising cookies. [UPDATE THIS SECTION if you add analytics
            or advertising later — you'll need a cookie consent banner.]
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            8. Age requirement
          </h2>
          <p>
            LightsNGo is only for people aged 18 and over. We don&rsquo;t
            knowingly collect data from anyone under 18. If we learn an
            account belongs to someone under 18, we will delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            9. Changes to this policy
          </h2>
          <p>
            We may update this policy as the platform grows. We&rsquo;ll post
            the updated date at the top of this page, and notify you of
            significant changes.
          </p>
        </section>
      </div>
    </div>
  );
}
