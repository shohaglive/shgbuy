"use client";

import { useState } from "react";

export function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section aria-labelledby="newsletter-title" className="bg-ink text-canvas">
      <div className="container-page flex flex-col items-center py-16 text-center lg:py-24">
        <p className="eyebrow text-canvas/70">Newsletter</p>
        <h2 id="newsletter-title" className="mt-4 text-canvas">Receive the first look</h2>
        <p className="mt-4 text-canvas/80">
          New arrivals, private sales and stories from the journal, delivered to your inbox.
        </p>

        {done ? (
          <p role="status" className="mt-8 font-display text-2xl">Thank you. You&rsquo;re on the list.</p>
        ) : (
          <form
            className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              className="field flex-1 border-canvas/40 bg-transparent text-canvas placeholder:text-canvas/60 hover:border-canvas focus-visible:border-canvas focus-visible:outline-canvas"
            />
            <button type="submit" className="btn border-canvas bg-canvas text-ink hover:bg-transparent hover:text-canvas">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
