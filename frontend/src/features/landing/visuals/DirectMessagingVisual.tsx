import { useInView } from '../../../core/hooks/useInView';
import { motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export const DirectMessagingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className="feature-visual feature-visual--messaging" aria-hidden="true">
      <motion.svg
        viewBox="0 0 420 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <defs>
          <linearGradient id="chat-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <linearGradient id="msg-candidate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" />
          </linearGradient>
        </defs>

        <motion.g className="chat-window" variants={itemVariants}>
          <rect x="50" y="30" width="320" height="220" rx="14" fill="url(#chat-bg)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="50" y="30" width="320" height="40" rx="14" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="50" y="56" width="320" height="14" fill="var(--color-surface-muted, #fefcf8)" stroke="none" />
          <text x="210" y="58" textAnchor="middle" fill="var(--color-text, #1a1814)" fontSize="12" fontWeight="700">Hiring Team</text>
          <circle cx="320" cy="50" r="5" fill="var(--color-text)" />
          <text x="328" y="54" textAnchor="start" fill="var(--color-text)" fontSize="9" fontWeight="700">Online</text>
        </motion.g>

        <motion.g className="msg-candidate" variants={itemVariants}>
          <rect x="210" y="86" width="150" height="40" rx="10" fill="url(#msg-candidate)" />
          <text x="340" y="110" textAnchor="end" fill="var(--color-primary-text, #ffffff)" fontSize="10" fontWeight="600">Interested in this role.</text>
        </motion.g>

        <motion.g className="msg-typing" variants={itemVariants}>
          <motion.circle cx="310" cy="144" r="3" fill="var(--color-text)" animate={{ opacity: [0.6, 1, 0.6], y: [0, -4, 0] }} transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }} />
          <motion.circle cx="320" cy="144" r="3" fill="var(--color-text)" animate={{ opacity: [0.6, 1, 0.6], y: [0, -4, 0] }} transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror', delay: 0.2 }} />
          <motion.circle cx="330" cy="144" r="3" fill="var(--color-text)" animate={{ opacity: [0.6, 1, 0.6], y: [0, -4, 0] }} transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror', delay: 0.4 }} />
        </motion.g>

        <motion.g className="msg-employer" variants={itemVariants}>
          <rect x="60" y="170" width="190" height="40" rx="10" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="80" y="194" textAnchor="start" fill="var(--color-text)" fontSize="10" fontWeight="500">Thanks! We&apos;d like to continue.</text>
        </motion.g>

        <motion.g className="msg-status" variants={itemVariants}>
          <rect x="70" y="222" width="140" height="12" rx="6" fill="var(--color-success-soft, #ecfdf5)" />
          <text x="140" y="232" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Conversation continued</text>
        </motion.g>
      </motion.svg>
    </div>
  );
};
