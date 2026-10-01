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
      <p className="mt-1 text-sm text-paper/50">Last updated: 1 October 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            1. Acceptance of terms
          </h2>
          <p>
            LightsNGo is run by Cosmin Dima, a private individual based in
            Romania (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account
            or using LightsNGo on the website or in the app, you agree to these
            Terms and Conditions and our{" "}
            <Link href="/privacy" className="text-flag-amber hover:underline">
              Privacy Policy
            </Link>
            . If you don&rsquo;t agree, please don&rsquo;t use the service.
            You can contact us at lightsngoo@gmail.com.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            2. Eligibility
          </h2>
          <p>
            LightsNGo is only for people aged 18 and over. To create an
            account, you must give your birth year and confirm you are 18 or
            older. Accounts that belong to someone under 18 will be removed.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            3. Your account
          </h2>
          <p>
            You&rsquo;re responsible for keeping your password secure and for
            all activity on your account. Tell us right away at
            lightsngoo@gmail.com if you think someone else has accessed your
            account. One person, one account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            4. What&rsquo;s not allowed
          </h2>
          <p>
            These rules apply everywhere on LightsNGo: the feed, comments,
            race chat rooms, city guide tips and replies, private messages,
            and your profile. You must not post or send:
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>Harassment, bullying, insults, or threats against anyone</li>
            <li>
              Hate speech, or content that attacks people for their race,
              ethnicity, nationality, religion, gender, sexual orientation,
              disability, or similar characteristics
            </li>
            <li>Sexual content, nudity, or sexual messages to other users</li>
            <li>Violent, graphic, or shocking content</li>
            <li>
              Any content involving the sexual exploitation of minors. We have
              zero tolerance for this and will report it to the authorities.
            </li>
            <li>Illegal content, or content that promotes illegal activity</li>
            <li>
              Other people&rsquo;s private information, such as addresses,
              phone numbers, or photos, without their permission
            </li>
            <li>Spam, scams, or requests for money</li>
            <li>
              Advertising or affiliate links without clearly saying so
            </li>
            <li>
              City guide tips you know to be false or misleading
            </li>
            <li>Content you don&rsquo;t have the right to share</li>
          </ul>
          <p className="mt-2">You also must not:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>Impersonate another person or misrepresent who you are</li>
            <li>Create a new account to get around a ban</li>
            <li>
              Scrape, copy, or resell content or user data from LightsNGo
            </li>
            <li>
              Try to disrupt the service, spread malware, or access accounts
              or data that aren&rsquo;t yours
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            5. Reporting, blocking, and moderation
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Report:</strong> you can report any post, comment,
              message, tip, reply, or user using the &ldquo;Report&rdquo;
              option. The person you report is never told who reported them.
            </li>
            <li>
              <strong>Block:</strong> you can block any user. They won&rsquo;t
              be able to message you or add you as a contact, and you
              won&rsquo;t see their content. They aren&rsquo;t notified.
            </li>
            <li>
              <strong>What we do:</strong> we review reports and, when
              something breaks these rules, we may remove the content, warn
              the user, or suspend or permanently ban the account, depending
              on how serious it is. Serious illegal content may be reported to
              the authorities.
            </li>
            <li>
              We don&rsquo;t check everything before it&rsquo;s posted, so
              your reports really help keep LightsNGo safe.
            </li>
            <li>
              You can also report illegal content by email to
              lightsngoo@gmail.com. If you think we removed your content or
              suspended your account by mistake, email us and we&rsquo;ll take
              another look.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            6. Your content
          </h2>
          <p>
            You keep ownership of what you post. By posting, you give us
            permission to store and show it on LightsNGo so the service can
            work, for as long as it stays on the platform. Feed posts,
            comments, and chat room messages are visible to registered
            members. City guide tips and replies are public, so anyone can
            read them, including visitors without an account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            7. Meeting other users
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
            8. No affiliation with Formula 1
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
            9. Service &ldquo;as is&rdquo;
          </h2>
          <p>
            LightsNGo is a small, growing platform. It is provided &ldquo;as
            is&rdquo;, without guarantees that it will be error-free or always
            available. Tips and information from other users are their own
            opinions; check important details like prices and transport
            yourself. To the extent permitted by law, we&rsquo;re not liable
            for damages arising from your use of the service. Nothing in
            these terms limits rights you have under consumer protection
            law.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            10. Ending your account
          </h2>
          <p>
            You can delete your account at any time from your Profile page,
            or by following the steps on our{" "}
            <Link
              href="/delete-account"
              className="text-flag-amber hover:underline"
            >
              account deletion page
            </Link>
            . We may suspend or close accounts that break these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            11. Governing law
          </h2>
          <p>
            These terms are governed by the laws of Romania. If you live in
            another EU country, you also keep the protections that the
            consumer laws of your country give you.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            12. Changes to these terms
          </h2>
          <p>
            We may update these terms as LightsNGo grows. We&rsquo;ll change
            the date at the top of this page and let you know about
            significant changes.
          </p>
        </section>
      </div>
    </div>
  );
}
