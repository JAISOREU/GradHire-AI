import { useInView } from '../../../core/hooks/useInView';
import { motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 0.95,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

export const FloatingCards = () => {
  const { ref } = useInView();

  return (
    <div ref={ref} className="floating-cards" aria-hidden="true">
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <motion.div className="floating-card floating-card--1" variants={cardVariants}>
          <div className="floating-card__title">Software Engineer</div>
          <div className="floating-card__meta">Remote · Full-time</div>
        </motion.div>
        <motion.div className="floating-card floating-card--2" variants={cardVariants}>
          <div className="floating-card__title">Data Analyst</div>
          <div className="floating-card__meta">Hybrid · Manila</div>
        </motion.div>
        <motion.div className="floating-card floating-card--3" variants={cardVariants}>
          <div className="floating-card__title">Frontend Developer</div>
          <div className="floating-card__meta">Remote · Philippines</div>
        </motion.div>
        <motion.div className="floating-card floating-card--4" variants={cardVariants}>
          <div className="floating-card__title">Product Designer</div>
          <div className="floating-card__meta">Hybrid · Singapore</div>
        </motion.div>
      </motion.div>

      <style>{`
        .floating-cards {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .floating-card {
          position: absolute;
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .floating-card--1 {
          top: 12%;
          left: 2%;
        }

        .floating-card--2 {
          top: 48%;
          right: 2%;
        }

        .floating-card--3 {
          bottom: 12%;
          left: 8%;
        }

        .floating-card--4 {
          top: 28%;
          right: 4%;
        }

        .floating-card__title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
        }

        .floating-card__meta {
          font-size: var(--text-xs);
          color: var(--color-text);
          margin-top: var(--space-1);
          white-space: nowrap;
        }

        .floating-card::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(79, 70, 229, 0.06), transparent 60%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .floating-card:hover::before {
          opacity: 1;
        }

        @media (max-width: 1024px) {
          .floating-cards {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-card {
            opacity: 0.95;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};
