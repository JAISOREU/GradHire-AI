import { useEffect, useRef } from 'react';
import { PhosphorIcon, PhosphorIconName } from '../../components/PhosphorIcon';
import { Button } from '../../components/Button';
import { useAuth } from '../../core/auth/AuthContext';

interface JourneyStage {
  key: string;
  icon: PhosphorIconName;
  title: string;
  text: string;
  tags: string[];
}

const STAGES: JourneyStage[] = [
  {
    key: 'profile',
    icon: 'User',
    title: 'Profile',
    text: 'Your starting point. Education, resume, and career preferences come together in one place.',
    tags: ['Resume', 'Education', 'Preferences'],
  },
  {
    key: 'skills',
    icon: 'Lightning',
    title: 'Skills',
    text: 'Gradture AI reads what you can do from your profile and resume — skills, strengths, and certifications.',
    tags: ['Skills extracted', 'Strengths', 'Certifications'],
  },
  {
    key: 'education',
    icon: 'GraduationCap',
    title: 'Education',
    text: 'Your academic background is recognised and structured so it can be weighed against real requirements.',
    tags: ['Degree', 'Institution', 'Field'],
  },
  {
    key: 'experience',
    icon: 'Briefcase',
    title: 'Experience',
    text: 'Roles, projects, and internships become concrete evidence for matching.',
    tags: ['Roles', 'Projects', 'Timeline'],
  },
  {
    key: 'match',
    icon: 'Sparkle',
    title: 'Career match',
    text: 'Everything is evaluated against live opportunities — you see the fit, the gaps, and the reasoning.',
    tags: ['Match score', 'Fit breakdown', 'Gap analysis'],
  },
  {
    key: 'opportunity',
    icon: 'Target',
    title: 'Opportunity',
    text: 'A real opportunity surfaces. Apply, track progress, and take the next step from one platform.',
    tags: ['Apply', 'Track', 'Interview'],
  },
];

const SEGMENTS = STAGES.length - 1;
const SEGMENT_MS = 1050;
const GAP_MS = 340;
const INITIAL_MS = 460;
const DASH = 16;
const HORIZONTAL_MIN = 860;

/**
 * CareerJourney
 * -------------
 * A step route linking the six career signals Gradture AI connects — Profile,
 * Skills, Education, Experience, Career Match, Opportunity. On wide screens the
 * stages form a horizontal roadmap (a 3 + 3 snake grid) whose path runs
 * left-to-right: a dash rises from each milestone, a horizontal run carries it
 * across, and it drops into the next. Narrower screens fall back to a vertical
 * zigzag of alternating cards. The path draws itself over time — only the first
 * parts show at first, then each connecting segment eases in and the earlier
 * ones stay lit. Reduced-motion users get the full path and every card
 * immediately.
 */
export const CareerJourney = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRefs = useRef<(HTMLElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const guideRef = useRef<SVGPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const headRef = useRef<SVGCircleElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const runningRef = useRef(false);
  const reducedRef = useRef(false);

  const { user } = useAuth();
  const jobsLink = user?.role === 'STUDENT' ? '/student/jobs' : user?.role === 'EMPLOYER' ? '/employer/post-job' : '/jobs';

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const wrap = section.querySelector<HTMLElement>('.journey-stages');
    const svg = svgRef.current;
    const guide = guideRef.current;
    const path = pathRef.current;
    const head = headRef.current;
    if (!wrap || !svg || !guide || !path || !head) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const slide = section.closest<HTMLElement>('.presentation-slide');

    let observer: MutationObserver | null = null;
    let settleTimer: number | null = null;
    let resizeTimer: number | null = null;
    let finalTimer: number | null = null;

    const setStageState = (count: number) => {
      stageRefs.current.forEach((el, i) => el?.classList.toggle('journey-stage--active', i < count));
    };

    const applyProgress = () => {
      const p = Math.max(0, Math.min(1, progressRef.current));
      path.setAttribute('stroke-dasharray', `${p.toFixed(4)} ${(1 - p).toFixed(4)}`);
      path.setAttribute('stroke-opacity', p > 0 ? '1' : '0');
      const total = path.getTotalLength();
      if (total > 0 && p > 0 && p < 1) {
        const pt = path.getPointAtLength(p * total);
        head.setAttribute('cx', pt.x.toFixed(1));
        head.setAttribute('cy', pt.y.toFixed(1));
        head.style.opacity = '1';
      } else {
        head.style.opacity = '0';
      }
    };

    const buildPath = () => {
      const wrapRect = wrap.getBoundingClientRect();
      if (wrapRect.width === 0 || wrapRect.height === 0) return;
      const pts: { x: number; y: number }[] = [];
      for (const el of stageRefs.current) {
        const n = el?.querySelector<HTMLElement>('.journey-stage__node');
        if (!n) return;
        const r = n.getBoundingClientRect();
        pts.push({ x: r.left - wrapRect.left + r.width / 2, y: r.top - wrapRect.top + r.height / 2 });
      }
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      const horizontal = window.matchMedia(`(min-width: ${HORIZONTAL_MIN}px)`).matches;
      if (horizontal) {
        for (let i = 0; i < pts.length - 1; i += 1) {
          const raise = pts[i].y - DASH;
          d += ` L ${pts[i].x.toFixed(1)} ${raise.toFixed(1)}`;
          d += ` L ${pts[i + 1].x.toFixed(1)} ${raise.toFixed(1)}`;
          d += ` L ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
        }
      } else {
        for (let i = 0; i < pts.length - 1; i += 1) {
          d += ` L ${pts[i].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
          d += ` L ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
        }
      }
      svg.setAttribute('width', wrapRect.width.toFixed(1));
      svg.setAttribute('height', wrapRect.height.toFixed(1));
      guide.setAttribute('d', d);
      path.setAttribute('d', d);
      applyProgress();
    };

    const tick = (now: number) => {
      rafRef.current = null;
      if (reducedRef.current || doneRef.current || !runningRef.current) return;

      const t = now - startRef.current;
      let global = 0;
      for (let k = 0; k < SEGMENTS; k += 1) {
        const segmentStart = INITIAL_MS + k * (SEGMENT_MS + GAP_MS);
        if (t < segmentStart) break;
        const eased = 1 - Math.pow(1 - Math.min(1, (t - segmentStart) / SEGMENT_MS), 3);
        global = (k + eased) / SEGMENTS;
      }
      if (t >= INITIAL_MS + SEGMENTS * SEGMENT_MS + (SEGMENTS - 1) * GAP_MS) {
        global = 1;
        doneRef.current = true;
        runningRef.current = false;
        if (finalTimer === null) {
          finalTimer = window.setTimeout(() => {
            finalTimer = null;
            buildPath();
          }, 650);
        }
      }

      progressRef.current = global;
      const lit = global <= 0 ? 0 : doneRef.current ? STAGES.length : Math.max(1, Math.ceil(global * SEGMENTS));
      setStageState(lit);
      applyProgress();

      if (!doneRef.current) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      doneRef.current = false;
      runningRef.current = true;
      progressRef.current = 0;
      startRef.current = performance.now();
      setStageState(0);
      buildPath();
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const complete = () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      doneRef.current = true;
      runningRef.current = false;
      progressRef.current = 1;
      setStageState(STAGES.length);
      buildPath();
    };

    const isActive = () => slide?.classList.contains('is-active') === true;

    reducedRef.current = mql.matches;

    if (slide) {
      observer = new MutationObserver(() => {
        if (isActive()) {
          if (settleTimer !== null) window.clearTimeout(settleTimer);
          settleTimer = window.setTimeout(buildPath, 1000);
          if (reducedRef.current) {
            complete();
          } else if (!runningRef.current) {
            start();
          }
        }
      });
      observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
    }

    if (isActive()) {
      if (reducedRef.current) complete();
      else start();
    }

    const onReducedChange = () => {
      reducedRef.current = mql.matches;
      if (isActive()) {
        if (reducedRef.current) complete();
        else if (!runningRef.current) start();
      }
    };

    const scheduleResize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        if (isActive()) buildPath();
      }, 150);
    };

    mql.addEventListener('change', onReducedChange);
    window.addEventListener('resize', scheduleResize);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      if (finalTimer !== null) window.clearTimeout(finalTimer);
      observer?.disconnect();
      mql.removeEventListener('change', onReducedChange);
      window.removeEventListener('resize', scheduleResize);
    };
  }, []);

  return (
    <section className="journey-section" ref={sectionRef} aria-labelledby="journey-title">
      <div className="journey-header">
        <span className="journey-header__eyebrow">Career map</span>
        <h2 id="journey-title" className="journey-header__title">
          Your career, mapped
        </h2>
        <p className="journey-header__subtitle">
          Six signals Gradture AI connects — watch the route light up.
        </p>
      </div>

      <div className="journey-inner">
        <svg className="journey-path" ref={svgRef} aria-hidden="true" role="presentation">
          <path className="journey-path__guide" ref={guideRef} pathLength={1} />
          <path className="journey-path__overlay" ref={pathRef} pathLength={1} />
          <circle className="journey-path__head" ref={headRef} r={5} />
        </svg>

        <div className="journey-stages">
          {STAGES.map((stage, index) => {
            const side = index % 2 === 0 ? 'journey-stage--left' : 'journey-stage--right';
            return (
              <article
                key={stage.key}
                className={`journey-stage ${side}`}
                ref={(el) => {
                  stageRefs.current[index] = el;
                }}
              >
                <span className="journey-stage__node" aria-hidden="true">
                  <PhosphorIcon name="Check" size={10} weight="bold" />
                </span>
                <div className="journey-stage__icon" aria-hidden="true">
                  <PhosphorIcon name={stage.icon} size={18} weight="duotone" />
                </div>
                <div className="journey-stage__body">
                  <h3 className="journey-stage__title">{stage.title}</h3>
                  <p className="journey-stage__text">{stage.text}</p>
                  <ul className="journey-stage__tags">
                    {stage.tags.map((tag) => (
                      <li key={tag} className="journey-stage__tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  {index === STAGES.length - 1 && (
                    <div className="journey-stage__cta">
                      <Button
                        to={jobsLink}
                        variant="secondary"
                        size="sm"
                        iconRight={<PhosphorIcon name="ArrowRight" size={14} weight="bold" />}
                      >
                        Find your opportunity
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};