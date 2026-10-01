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
      <p className="mt-1 text-sm text-paper/50">Last updated: 1 October 2026</p>

      <div className="mt-6 rounded-sm border border-asphalt-700 bg-asphalt-900 p-4 text-sm leading-relaxed">
        <h2 className="mb-2 font-display text-base font-600 text-paper">
          The short version
        </h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            We collect what you need to use LightsNGo: your email, username,
            birth year (to confirm you&rsquo;re 18+), and anything you choose
            to add or post.
          </li>
          <li>
            Your profile is visible to other members. City guide tips are
            public. Your email is never shown, and private messages are only
            seen by you and the person you&rsquo;re talking to.
          </li>
          <li>We don&rsquo;t sell your data and we don&rsquo;t show ads.</li>
          <li>
            You can delete your account at any time from your Profile page,
            and everything you created is deleted with it.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            1. Who we are
          </h2>
          <p>
            LightsNGo (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is run by
            Cosmin Dima, a private individual based in Romania, who is
            responsible for your personal data (the &ldquo;data
            controller&rdquo;). For any question about this policy or your
            data, contact us at lightsngoo@gmail.com.
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
              <strong>Required profile data:</strong> username and birth year.
              We ask for your birth year to confirm you are 18 or older.
            </li>
            <li>
              <strong>Optional profile data you choose to add:</strong>{" "}
              country, gender, favorite team and driver, tracks visited,
              profile photo, and bio.
            </li>
            <li>
              <strong>Content you create:</strong> posts, comments, chat room
              messages, city guide tips and replies, and private messages,
              including any files you attach to them.
            </li>
            <li>
              <strong>Age and consent records:</strong> a record showing you
              confirmed you are 18+ and accepted the Terms and this policy.
            </li>
            <li>
              <strong>Technical data:</strong> basic log and session data
              needed to keep you signed in and keep the service secure.
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
              your account and showing you the feed, chat rooms, city guides,
              and messages.
            </li>
            <li>
              <strong>To keep LightsNGo 18+ only</strong> (legitimate
              interest) — using your birth year and confirmation to make sure
              only adults can join.
            </li>
            <li>
              <strong>With your consent</strong> — the optional profile fields
              you choose to fill in. You can remove them at any time.
            </li>
            <li>
              <strong>Legitimate interest</strong> — keeping the platform
              secure, blocking automated abuse, and moderating harmful
              content.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            4. Who we share it with
          </h2>
          <p>
            We don&rsquo;t sell your data. We use the following service
            providers to run LightsNGo. They only process data on our
            instructions:
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>
              <strong>Supabase</strong> — database, sign-in, file storage, and
              real-time messaging. Our database is hosted in London, United
              Kingdom.
            </li>
            <li>
              <strong>Vercel</strong> — hosting the website itself.
            </li>
            <li>
              <strong>Resend</strong> — sending account emails, such as
              sign-up confirmation and password reset. Resend receives your
              email address and the content of these emails.
            </li>
            <li>
              <strong>hCaptcha</strong> — protecting forms from automated
              abuse. hCaptcha may process technical data such as your IP
              address and browser information when you complete a check.
            </li>
          </ul>
          <p className="mt-2">
            <strong>If LightsNGo changes owner.</strong> If LightsNGo is sold,
            transferred to a new owner, or moved to a company set up to run
            it, your data may be transferred as part of that change. The new
            owner must keep protecting your data under this policy, and
            we&rsquo;ll let you know before the transfer happens, so you can
            delete your account if you prefer.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            5. Where your data is processed
          </h2>
          <p>
            Our database is stored in the United Kingdom, which the European
            Union recognizes as giving personal data an adequate level of
            protection. Supabase, Vercel, Resend, and hCaptcha are based in
            the United States, so your data may also be processed there.
            When that happens, it is protected by the legal safeguards
            required under the GDPR, such as the European Commission&rsquo;s
            Standard Contractual Clauses or the EU&ndash;US Data Privacy
            Framework.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            6. What other people can see
          </h2>
          <p>
            LightsNGo is a community, so some of your information is shared
            to help fans find and connect with each other.
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>
              <strong>Your profile is visible to all registered members.</strong>{" "}
              This includes your username, profile photo, country, gender,
              birth year, team, favorite driver, tracks visited, and bio.
            </li>
            <li>
              <strong>Your profile photo</strong> is stored at a public web
              link. Anyone who has that link can open the image, even without
              an account.
            </li>
            <li>
              <strong>City guide tips and replies are public.</strong> Anyone
              can read them, including visitors without an account, together
              with your username and profile photo.
            </li>
            <li>
              <strong>Feed posts, comments, likes, and chat room messages</strong>{" "}
              are visible only to registered members, not to visitors without
              an account.
            </li>
            <li>
              <strong>Your email address is never shown</strong> to other
              members.
            </li>
            <li>
              <strong>Your private messages</strong> and any files you send in
              them can only be seen by you and the person you are talking to.
            </li>
          </ul>
          <p className="mt-2">
            You can change your profile at any time from your Profile page.
            For gender, you can choose &ldquo;Prefer not to say&rdquo;.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            7. Deleting conversations and contacts
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Deleting a conversation</strong> removes it for you
              only. The other person keeps their copy.
            </li>
            <li>
              <strong>Removing a contact</strong> ends the contact for both of
              you, so neither of you can send new messages, and deletes the
              conversation for you. The other person keeps their copy.
            </li>
            <li>
              Files sent in a private conversation stay stored while the other
              person can still have them in their copy. They are permanently
              deleted when either of you deletes your account.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            8. How long we keep it
          </h2>
          <p>
            We keep your account and content for as long as your account is
            active. You can permanently delete your account at any time from
            your Profile page. This immediately deletes your profile, profile
            photo, posts, comments, likes, city guide tips and replies,
            contacts, and both sides of any private messages you&rsquo;ve
            exchanged, including attached files. This can&rsquo;t be undone.
            You can also ask us to delete your account by emailing
            lightsngoo@gmail.com.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            9. Your rights (GDPR)
          </h2>
          <p>If you are in the EU/EEA or UK, you have the right to:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
            <li>Get a copy of your data in a portable format</li>
            <li>Object to or restrict certain processing</li>
            <li>Withdraw consent for optional profile fields at any time</li>
            <li>
              Lodge a complaint with a data protection authority — in Romania,
              the ANSPDCP, or the authority in the country where you live
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email us at lightsngoo@gmail.com.
            We&rsquo;ll respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            10. Cookies
          </h2>
          <p>
            We use only the essential cookies needed to keep you signed in and
            your session secure. When you complete a verification check,
            hCaptcha may also use cookies or similar technology to tell humans
            and bots apart. We don&rsquo;t use tracking or advertising
            cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            11. Age requirement
          </h2>
          <p>
            LightsNGo is only for people aged 18 and over. You must give your
            birth year and confirm you are 18+ to create an account. We
            don&rsquo;t knowingly collect data from anyone under 18. If we
            learn an account belongs to someone under 18, we will delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            12. Changes to this policy
          </h2>
          <p>
            We may update this policy as LightsNGo grows. We&rsquo;ll change
            the date at the top of this page and let you know about
            significant changes.
          </p>
        </section>
      </div>
    </div>
  );
}
