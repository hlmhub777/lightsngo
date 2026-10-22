import Link from "next/link";

export const metadata = {
  title: "Child Safety Standards — LightsNGo",
  description:
    "LightsNGo's standards against child sexual abuse and exploitation (CSAE), and how to report a concern.",
};

export default function ChildSafetyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-paper/85">
      <Link href="/" className="text-sm text-paper/50 hover:text-paper">
        ← Home
      </Link>

      <h1 className="mt-3 font-display text-3xl font-700 text-paper">
        Child Safety Standards
      </h1>
      <p className="mt-1 text-sm text-paper/50">Last updated: 14 October 2026</p>

      <div className="mt-6 rounded-sm border border-asphalt-700 bg-asphalt-900 p-4 text-sm leading-relaxed">
        <h2 className="mb-2 font-display text-base font-600 text-paper">
          The short version
        </h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            LightsNGo has zero tolerance for child sexual abuse and
            exploitation (CSAE) and child sexual abuse material (CSAM).
          </li>
          <li>LightsNGo is only for adults aged 18 and over.</li>
          <li>
            Anyone can report a concern from inside the app, or by email to
            contact.lightsngo@gmail.com.
          </li>
          <li>
            We remove violating content, ban the accounts involved, and report
            to the relevant authorities.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            1. Our standards
          </h2>
          <p>
            LightsNGo is a community for Formula 1 fans. The following is
            strictly prohibited anywhere on LightsNGo, including posts,
            comments, race chat rooms, city guides, profiles, photos and
            private messages:
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>
              Any content that shows, promotes or links to the sexual abuse or
              sexual exploitation of children, including child sexual abuse
              material (CSAM) of any kind, whether real, drawn or generated
            </li>
            <li>Content that sexualizes minors in any way</li>
            <li>
              Grooming: contacting, befriending or manipulating a minor for
              sexual purposes, or trying to move a minor to another platform
              for that reason
            </li>
            <li>
              Sextortion, or threatening anyone with the release of intimate
              images
            </li>
            <li>
              Trafficking, or advertising or soliciting minors for any sexual
              purpose
            </li>
            <li>Sharing, requesting or trading any of the content above</li>
          </ul>
          <p className="mt-2">
            These rules are part of our{" "}
            <Link href="/terms" className="text-flag-amber hover:underline">
              Terms and Conditions
            </Link>
            , which every member accepts when they sign up.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            2. Adults only
          </h2>
          <p>
            You must be 18 or older to use LightsNGo. Every member gives their
            birth year and confirms they are 18+ when they create an account.
            If we learn that an account belongs to someone under 18, we delete
            it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            3. How to report a concern
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>In the app:</strong> use the Report option on any post,
              comment, chat message, city guide tip, private message or
              profile. Choose &ldquo;Illegal content&rdquo; or &ldquo;This
              person may be under 18&rdquo;, and add any details that help.
              The person you report is never told who reported them.
            </li>
            <li>
              <strong>By email:</strong> write to contact.lightsngo@gmail.com
              with &ldquo;Child safety&rdquo; in the subject line. You
              don&rsquo;t need an account to report.
            </li>
          </ul>
          <p className="mt-2">
            If a child is in immediate danger, contact your local police or
            emergency services first (112 in Romania and across the EU).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            4. What we do when we receive a report
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>We review child safety reports as our highest priority.</li>
            <li>
              We remove content that breaks these standards and permanently
              ban the accounts involved.
            </li>
            <li>
              We keep the information needed for an investigation, as the law
              allows, so it can be given to the authorities.
            </li>
            <li>
              We report apparent child sexual abuse material and exploitation
              to the relevant authorities, including the Romanian police and
              the National Center for Missing &amp; Exploited Children
              (NCMEC), and cooperate with law enforcement requests.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            5. Compliance with the law
          </h2>
          <p>
            LightsNGo complies with the child safety laws that apply to it,
            including Romanian and European Union law, and reports to
            regional and national authorities as required.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            6. Child safety contact
          </h2>
          <p>
            Our designated contact for child safety, including questions about
            our CSAM prevention and compliance practices, is Cosmin Dima,
            reachable at contact.lightsngo@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}
