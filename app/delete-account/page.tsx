import Link from "next/link";

export const metadata = {
  title: "Delete your account — LightsNGo",
  description:
    "How to permanently delete your LightsNGo account and what happens to your data.",
};

export default function DeleteAccountInfoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-paper/85">
      <Link href="/" className="text-sm text-paper/50 hover:text-paper">
        ← Home
      </Link>

      <h1 className="mt-3 font-display text-3xl font-700 text-paper">
        Delete your LightsNGo account
      </h1>
      <p className="mt-2 text-sm text-paper/60">
        You can permanently delete your account and data at any time, on the
        website or in the app.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            Delete it yourself
          </h2>
          <ol className="ml-5 list-decimal space-y-1">
            <li>Log in to LightsNGo.</li>
            <li>Open your Profile page.</li>
            <li>
              At the bottom, under &ldquo;Danger zone&rdquo;, choose
              &ldquo;Delete my account&rdquo;.
            </li>
            <li>Type your username to confirm.</li>
          </ol>
          <Link
            href="/profile"
            className="mt-4 inline-block rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90"
          >
            Go to my profile
          </Link>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            Can&rsquo;t log in?
          </h2>
          <p>
            Email us at{" "}
            <a
              href="mailto:lightsngoo@gmail.com?subject=Delete%20my%20LightsNGo%20account"
              className="text-flag-amber hover:underline"
            >
              lightsngoo@gmail.com
            </a>{" "}
            from the email address you signed up with, and include your
            username. We&rsquo;ll delete your account within 30 days and
            confirm by email.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-600 text-paper">
            What gets deleted
          </h2>
          <p>
            Deleting your account immediately and permanently removes your
            profile, profile photo, posts, comments, likes, city guide tips and
            replies, contacts, blocks, and both sides of your private messages,
            including attached files. This can&rsquo;t be undone.
          </p>
          <p className="mt-2">
            Reports you made about other users may be kept to keep the
            community safe, but they are no longer linked to you. See our{" "}
            <Link href="/privacy" className="text-flag-amber hover:underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </section>
      </div>
    </div>
  );
}
