import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions — LightsNGo",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-paper/85">
      <Link href="/" className="text-sm text-paper/50 hover:text-paper">
        ← Home
      </Link>

      <h1 className="mt-3 font-display text-3xl font-700 text-paper">
        Terms and Conditions
      </h1>
      <p className="mt-1 text-sm text-paper/50">
        Last updated: [DATE] — Draft template. Replace all [bracketed]
        placeholders and have this reviewed by a lawyer before public launch.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            1. Acceptance of terms
          </h2>
          <p>
            By creating an account on LightsNGo, operated by [YOUR LEGAL
            NAME / COMPANY NAME], you agree to these Terms and Conditions and
            our{" "}
            <Link href="/privacy" className="text-flag-amber hover:underline">
              Privacy Policy
            </Link>
            . If you don&rsquo;t agree, please don&rsquo;t use the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            2. Eligibility
          </h2>
          <p>
            You must be 18 years or older to create an account. By signing
            up, you confirm you meet this requirement. Accounts found to
            belong to someone under 18 will be removed.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            3. Your account
          </h2>
          <p>
            You&rsquo;re responsible for keeping your password secure and for
            all activity on your account. Tell us right away at
            [YOUR CONTACT EMAIL] if you think someone else has accessed your
            account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            4. Acceptable use
          </h2>
          <p>You agree not to use LightsNGo to:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>Harass, threaten, or abuse other users</li>
            <li>Post illegal, hateful, or sexually explicit content</li>
            <li>Impersonate another person or misrepresent your identity</li>
            <li>Spam, scam, or solicit money from other users</li>
            <li>
              Post travel/city guide tips you know to be false or
              misleading
            </li>
            <li>Scrape, copy, or resell content or user data from the platform</li>
            <li>Attempt to disrupt or gain unauthorized access to the service</li>
          </ul>
          <p className="mt-2">
            We can remove content or suspend/terminate accounts that break
            these rules, at our discretion.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            5. Your content
          </h2>
          <p>
            You keep ownership of what you post (posts, messages, city guide
            tips, your profile photo). By posting publicly (feed, chat rooms,
            city guides), you allow other users to see and interact with
            that content within the platform. Don&rsquo;t post anything you
            don&rsquo;t have the right to share.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            6. Meeting other users
          </h2>
          <p>
            LightsNGo helps fans connect around race weekends, including
            through city guides and chat. Any meetups or in-person contact
            arranged through the platform are between users directly — we
            don&rsquo;t organize, vet, or supervise them, and we&rsquo;re not
            responsible for what happens at them. Use common sense: meet in
            public places, tell someone your plans, and trust your
            judgment.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            7. No affiliation with Formula 1
          </h2>
          <p>
            LightsNGo is an independent, fan-made community platform. We are
            not affiliated with, endorsed by, or sponsored by Formula 1,
            FIA, Liberty Media, or any F1 team. Team and driver names are
            used only for fans to describe their own preferences.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            8. Service "as is"
          </h2>
          <p>
            We&rsquo;re a small, growing platform. The service is provided
            "as is" without guarantees it will be error-free or
            uninterrupted. We&rsquo;re not liable for damages arising from
            your use of the service, to the fullest extent permitted by law.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            9. Ending your account
          </h2>
          <p>
            You can delete your account at any time by contacting us at
            [YOUR CONTACT EMAIL]. We may suspend or terminate accounts that
            violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            10. Governing law
          </h2>
          <p>
            These terms are governed by the laws of [YOUR COUNTRY/
            JURISDICTION]. [Add a dispute resolution / arbitration clause
            here if your lawyer recommends one.]
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            11. Changes to these terms
          </h2>
          <p>
            We may update these terms as the platform grows. We&rsquo;ll post
            the updated date at the top of this page.
          </p>
        </section>
      </div>
    </div>
  );
}
