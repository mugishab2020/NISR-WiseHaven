"use client";

import Link from "next/link";

export default function HeroSection() {
  function scrollTo(href: string) {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main className="wh-page">
      <nav className="wh-nav" aria-label="Main navigation">
        <Link className="wh-brand" href="/" aria-label="WiseHaven home">
          <span className="wh-brand-mark" aria-hidden="true">W</span>
          <span>WiseHaven</span>
        </Link>

        <div className="wh-nav-links">
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo("#how-it-works"); }}>How it works</a>
          <a href="#features"     onClick={(e) => { e.preventDefault(); scrollTo("#features"); }}>Smart envelopes</a>
          <a href="#features"     onClick={(e) => { e.preventDefault(); scrollTo("#features"); }}>Emergency vault</a>
        </div>

        <Link className="wh-nav-cta" href="/dashboard">
          Get started <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <section className="wh-hero" aria-labelledby="wh-headline">
        <div className="wh-copy">
          <div className="wh-eyebrow">
            <span className="wh-status-dot" />
            SMART ENVELOPE WALLET
          </div>

          <h1 id="wh-headline">
            Give Every
            <br />
            Franc a
            <br />
            <span>Purpose.</span>
          </h1>

          <p className="wh-description">
            Lock in your priorities.
            <br className="wh-desktop-break" />
            Unlock financial peace of mind.
          </p>

          <div className="wh-actions">
            <Link className="wh-primary" href="/dashboard">
              Explore WiseHaven <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="wh-secondary"
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); scrollTo("#how-it-works"); }}
            >
              See how it works <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="wh-note">
            <span className="wh-note-icon">✓</span>
            <span>Built for more intentional money habits.</span>
          </div>
        </div>

        <div
          className="wh-art"
          aria-label="Abstract lime sculpture surrounded by protective orbital rings"
          role="img"
        >
          <div className="wh-art-glow" />

          <svg
            className="wh-orbit wh-orbit-one"
            viewBox="0 0 500 500"
            fill="none"
            aria-hidden="true"
          >
            <ellipse
              cx="250" cy="250"
              rx="190" ry="94"
              stroke="rgba(190,245,50,0.28)"
              strokeWidth="1"
              transform="rotate(-32 250 250)"
            />
          </svg>

          <svg
            className="wh-orbit wh-orbit-two"
            viewBox="0 0 500 500"
            fill="none"
            aria-hidden="true"
          >
            <ellipse
              cx="250" cy="250"
              rx="176" ry="115"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1"
              transform="rotate(48 250 250)"
            />
          </svg>

          <svg
            className="wh-sculpture"
            viewBox="0 0 420 440"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="wh-front" x1="100" y1="70" x2="320" y2="360" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E4FF88" />
                <stop offset=".35" stopColor="#BEF532" />
                <stop offset=".75" stopColor="#83BA14" />
                <stop offset="1"   stopColor="#405E0B" />
              </linearGradient>

              <linearGradient id="wh-side" x1="100" y1="150" x2="325" y2="310" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A9E529" />
                <stop offset="1" stopColor="#243606" />
              </linearGradient>

              <linearGradient id="wh-inner" x1="160" y1="140" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                <stop stopColor="#101506" />
                <stop offset="1" stopColor="#000000" />
              </linearGradient>

              <filter id="wh-shadow" x="20" y="10" width="390" height="420">
                <feGaussianBlur stdDeviation="12" />
              </filter>
            </defs>

            {/* Soft cast shadow */}
            <path
              d="M108 338 Q211 401 318 325"
              stroke="#BEF532"
              strokeWidth="23"
              opacity=".22"
              filter="url(#wh-shadow)"
            />

            {/* Outer sculptural loop */}
            <path
              d="M210 57
                 C145 48 91 92 81 154
                 C69 228 122 288 187 292
                 C229 295 257 271 281 240
                 L320 190
                 C337 167 367 182 362 207
                 C355 244 322 283 287 314
                 C244 352 195 371 146 350
                 C77 320 41 256 48 181
                 C56 93 119 34 197 29
                 C238 27 269 43 293 66
                 L257 108
                 C244 84 230 65 210 57Z"
              fill="url(#wh-side)"
              stroke="#D7FF73"
              strokeWidth="1.4"
            />

            {/* Inner recessed opening */}
            <path
              d="M201 105
                 C159 102 125 134 123 175
                 C121 218 151 250 190 253
                 C214 255 233 241 252 216
                 L286 173
                 C303 151 335 151 350 174
                 C363 194 354 222 338 243
                 L310 276
                 C283 309 240 330 198 326
                 C133 320 88 270 89 203
                 C90 143 130 96 181 84
                 C212 77 240 88 258 105
                 L235 135
                 C224 116 215 107 201 105Z"
              fill="url(#wh-inner)"
            />

            {/* Folded ribbon crossing the opening */}
            <path
              d="M181 84
                 C210 78 240 88 258 105
                 L235 135
                 C218 119 205 116 190 122
                 C164 132 152 160 160 185
                 C168 210 190 221 210 214
                 L246 201
                 L269 234
                 L224 252
                 C182 269 137 243 124 202
                 C108 153 135 99 181 84Z"
              fill="url(#wh-front)"
              stroke="#DFFF88"
              strokeWidth="1"
            />

            {/* Top folded highlight */}
            <path
              d="M181 84 C212 76 240 88 258 105 L235 135 C220 119 204 116 190 122Z"
              fill="#E9FFAE"
              opacity=".85"
            />

            {/* Lower inner ribbon */}
            <path
              d="M210 214
                 C235 207 256 187 273 165
                 L307 124
                 C326 102 354 107 366 129
                 C378 151 366 174 350 194
                 L320 232
                 C296 262 270 286 238 301
                 L213 267
                 C237 255 256 238 269 219
                 L246 201Z"
              fill="url(#wh-front)"
            />

            {/* Fine rim light */}
            <path
              d="M258 105 C280 125 278 147 262 169"
              stroke="#F1FFD0"
              strokeWidth="2"
              strokeLinecap="round"
              opacity=".8"
            />
          </svg>

          <span className="wh-orbit-point wh-point-one" />
          <span className="wh-orbit-point wh-point-two" />

          <div className="wh-float-label wh-label-top">
            <span className="wh-label-dot" />
            <div>
              <small>YOUR PRIORITIES</small>
              <strong>Protected.</strong>
            </div>
          </div>

          <div className="wh-float-label wh-label-bottom">
            <span className="wh-mini-symbol">↗</span>
            <div>
              <small>EVERY FRANC</small>
              <strong>Has a purpose.</strong>
            </div>
          </div>

          <span className="wh-art-index">01 / INTENTIONAL MONEY</span>
        </div>
      </section>

      <div className="wh-bottom-line">
        <span>PLAN WITH INTENTION</span>
        <span className="wh-line" />
        <span>SPEND WITH CLARITY</span>
        <span className="wh-line" />
        <span>BUILD YOUR HAVEN</span>
      </div>
    </main>
  );
}
