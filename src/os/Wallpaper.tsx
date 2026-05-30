/**
 * Wallpaper — a hand-painted Studio Ghibli "My Neighbor Totoro" meadow.
 *
 * A sunny forest scene built with pure CSS + inline SVG, layered back to front:
 *   1. Sky gradient (--sky-top → --sky-bottom)
 *   2. A soft warm sun glow high on one side
 *   3. Slowly drifting fluffy white clouds (--cloud)
 *   4. Rolling layered hills (--hill-far behind, --hill-near in front)
 *   5. A chunky rounded camphor-tree silhouette (--tree) on a hill, off-centre
 *   6. A scatter of bobbing susuwatari soot sprites (--soot)
 *
 * Purely decorative: absolute inset-0, behind everything, aria-hidden.
 * All animation is plain CSS (no Framer) so this stays a simple component.
 * Scene tokens are set by the palette agent in src/styles/theme.css.
 */

/** Little soot sprite — a fuzzy dark circle with a soft spiky halo, gently bobbing. */
function Susuwatari({
  left,
  bottom,
  size,
  delay,
  duration,
}: {
  left: string
  bottom: string
  size: number
  delay: string
  duration: string
}) {
  return (
    <span
      className="totoro-soot"
      style={{
        left,
        bottom,
        width: size,
        height: size,
        animationDelay: delay,
        animationDuration: duration,
      }}
    >
      {/* fuzzy halo of tiny dots gives the soft sooty edge */}
      <span className="totoro-soot-fuzz" />
    </span>
  )
}

export function Wallpaper() {
  return (
    <div aria-hidden className="totoro-scene absolute inset-0 overflow-hidden">
      {/* 1. Sky */}
      <div className="totoro-sky absolute inset-0" />

      {/* 2. Soft sun glow, high on the right */}
      <div className="totoro-sun absolute inset-0" />

      {/* 3. Drifting clouds */}
      <div className="totoro-cloud totoro-cloud--a" style={{ top: '14%', left: '-12%' }} />
      <div className="totoro-cloud totoro-cloud--b" style={{ top: '24%', left: '20%' }} />
      <div className="totoro-cloud totoro-cloud--c" style={{ top: '9%', left: '52%' }} />
      <div className="totoro-cloud totoro-cloud--d" style={{ top: '32%', left: '70%' }} />

      {/* 4. Rolling hills + 5. camphor tree, drawn together so the tree sits on a hill */}
      <svg
        className="totoro-hills absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMax slice"
        role="presentation"
      >
        {/* far hill */}
        <path
          fill="rgb(var(--hill-far))"
          d="M0 300 C 240 210 470 220 720 280 C 980 342 1180 250 1440 300 L1440 520 L0 520 Z"
        />

        {/* the big rounded camphor tree, on the left, rooted into the near hill */}
        <g className="totoro-tree">
          {/* trunk */}
          <path
            fill="rgb(var(--tree))"
            d="M300 470 C 300 420 296 392 308 360 L356 360 C 368 392 364 420 364 470 Z"
          />
          {/* chunky rounded canopy — overlapping blobs for a soft camphor crown */}
          <g fill="rgb(var(--tree))">
            <circle cx="332" cy="250" r="118" />
            <circle cx="232" cy="296" r="80" />
            <circle cx="432" cy="296" r="80" />
            <circle cx="288" cy="190" r="74" />
            <circle cx="392" cy="196" r="70" />
            <circle cx="332" cy="158" r="58" />
          </g>
        </g>

        {/* near hill — drawn last so it tucks over the trunk base */}
        <path
          fill="rgb(var(--hill-near))"
          d="M0 392 C 260 330 520 460 760 430 C 1040 396 1240 470 1440 412 L1440 520 L0 520 Z"
        />
      </svg>

      {/* 6. Susuwatari soot sprites, scattered low across the meadow */}
      <Susuwatari left="14%" bottom="9%" size={20} delay="0s" duration="4.2s" />
      <Susuwatari left="27%" bottom="15%" size={14} delay="0.8s" duration="5.1s" />
      <Susuwatari left="45%" bottom="7%" size={24} delay="0.3s" duration="3.8s" />
      <Susuwatari left="58%" bottom="13%" size={16} delay="1.4s" duration="4.7s" />
      <Susuwatari left="71%" bottom="8%" size={20} delay="0.6s" duration="5.4s" />
      <Susuwatari left="84%" bottom="16%" size={13} delay="1.1s" duration="4.0s" />
      <Susuwatari left="92%" bottom="6%" size={18} delay="0.2s" duration="4.9s" />

      <style>{`
        /* ---- 1. Sky ---- */
        .totoro-sky {
          background: linear-gradient(
            to bottom,
            rgb(var(--sky-top)) 0%,
            rgb(var(--sky-bottom)) 100%
          );
        }

        /* ---- 2. Sun glow ---- */
        .totoro-sun {
          background: radial-gradient(
            42rem 42rem at 82% 8%,
            rgb(var(--cloud) / 0.55) 0%,
            rgb(var(--accent-3) / 0.18) 32%,
            transparent 62%
          );
        }

        /* ---- 3. Clouds ---- */
        .totoro-cloud {
          position: absolute;
          width: 18rem;
          height: 6.5rem;
          background: rgb(var(--cloud) / 0.92);
          border-radius: 9999px;
          filter: blur(10px);
          opacity: 0.9;
          will-change: transform;
        }
        /* puffy bumps on top of each cloud blob */
        .totoro-cloud::before,
        .totoro-cloud::after {
          content: '';
          position: absolute;
          background: rgb(var(--cloud) / 0.92);
          border-radius: 9999px;
        }
        .totoro-cloud::before {
          width: 9rem;
          height: 9rem;
          top: -3.5rem;
          left: 3rem;
        }
        .totoro-cloud::after {
          width: 6.5rem;
          height: 6.5rem;
          top: -2.25rem;
          right: 3rem;
        }
        /* each cloud drifts across at its own pace/scale */
        .totoro-cloud--a { animation: totoro-drift-a 90s linear infinite; }
        .totoro-cloud--b { animation: totoro-drift-b 120s linear infinite; }
        .totoro-cloud--c { animation: totoro-drift-c 105s linear infinite; }
        .totoro-cloud--d { animation: totoro-drift-d 135s linear infinite; }
        @keyframes totoro-drift-a { from { transform: translateX(0) scale(1); } to { transform: translateX(125vw) scale(1); } }
        @keyframes totoro-drift-b { from { transform: translateX(0) scale(0.72); } to { transform: translateX(125vw) scale(0.72); } }
        @keyframes totoro-drift-c { from { transform: translateX(0) scale(1.15); } to { transform: translateX(125vw) scale(1.15); } }
        @keyframes totoro-drift-d { from { transform: translateX(0) scale(0.85); } to { transform: translateX(125vw) scale(0.85); } }

        /* ---- 4/5. Hills + tree sizing ---- */
        .totoro-hills {
          height: clamp(280px, 42vh, 520px);
        }
        .totoro-tree {
          transform-box: fill-box;
          transform-origin: 332px 470px;
          animation: totoro-sway 9s ease-in-out infinite;
        }
        @keyframes totoro-sway {
          0%, 100% { transform: rotate(-0.6deg); }
          50% { transform: rotate(0.6deg); }
        }

        /* ---- 6. Susuwatari soot sprites ---- */
        .totoro-soot {
          position: absolute;
          border-radius: 9999px;
          background: rgb(var(--soot));
          box-shadow:
            0 0 0 1px rgb(var(--soot) / 0.5),
            0 4px 8px -3px rgb(var(--soot) / 0.4);
          will-change: transform;
          animation-name: totoro-bob;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        /* tiny dots around the rim → fuzzy soot edge */
        .totoro-soot-fuzz {
          position: absolute;
          inset: -28%;
          border-radius: 9999px;
          background:
            radial-gradient(circle at 50% 0%, rgb(var(--soot)) 0 22%, transparent 24%),
            radial-gradient(circle at 90% 25%, rgb(var(--soot)) 0 20%, transparent 22%),
            radial-gradient(circle at 95% 75%, rgb(var(--soot)) 0 20%, transparent 22%),
            radial-gradient(circle at 50% 100%, rgb(var(--soot)) 0 22%, transparent 24%),
            radial-gradient(circle at 10% 75%, rgb(var(--soot)) 0 20%, transparent 22%),
            radial-gradient(circle at 5% 25%, rgb(var(--soot)) 0 20%, transparent 22%);
        }
        @keyframes totoro-bob {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(3px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .totoro-cloud,
          .totoro-tree,
          .totoro-soot { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
