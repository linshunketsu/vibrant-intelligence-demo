import { motion, HTMLMotionProps, Transition } from 'framer-motion';

// Check for reduced motion preference
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Base transition config that respects reduced motion
const createTransition = (override?: Transition): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return override || { duration: 0.25, ease: [0.4, 0, 0.2, 1] };
};

// Fade In Animation
interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
  from?: 'opacity' | 'below' | 'above';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.25,
  from = 'opacity',
  ...props
}) => {
  const initial = {
    opacity: 0,
    ...(from === 'below' && { y: 10 }),
    ...(from === 'above' && { y: -10 }),
  };

  const animate = {
    opacity: 1,
    y: 0,
  };

  const exit = {
    opacity: 0,
    ...(from === 'below' && { y: -10 }),
    ...(from === 'above' && { y: 10 }),
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={createTransition({ duration, delay })}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Slide In Animation
interface SlideInProps extends HTMLMotionProps<'div'> {
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.3,
  ...props
}) => {
  const offsets = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: 20 },
    down: { x: 0, y: -20 },
  };

  const initial = {
    opacity: 0,
    ...offsets[direction],
  };

  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  const exit = {
    opacity: 0,
    ...offsets[direction],
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={createTransition({ duration, delay, ease: [0.4, 0, 0.2, 1] })}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Scale In Animation
interface ScaleInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
  from?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 0.2,
  from = 0.95,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: from }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: from }}
      transition={createTransition({
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      })}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Stagger Container for Lists
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  children?: React.ReactNode;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.05,
  ...props
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Stagger Item (use with StaggerContainer)
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  from?: 'opacity' | 'below' | 'left' | 'right';
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  from = 'below',
  ...props
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      ...(from === 'below' && { y: 10 }),
      ...(from === 'left' && { x: -10 }),
      ...(from === 'right' && { x: 10 }),
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div variants={variants} {...props}>
      {children}
    </motion.div>
  );
};

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  return (
    <motion.div
      key={window.location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={createTransition({ duration: 0.2 })}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Modal Backdrop Animation
export const ModalBackdrop: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}> = ({ children, isOpen, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={createTransition({ duration: 0.2 })}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
};

// Modal Content Animation
export const ModalContent: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      onClick={(e) => e.stopPropagation()}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Hover Scale (for cards, buttons)
interface HoverScaleProps extends HTMLMotionProps<'div'> {
  scale?: number;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.02,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: prefersReducedMotion() ? 1 : scale }}
      whileTap={{ scale: prefersReducedMotion() ? 1 : 0.98 }}
      transition={createTransition({ duration: 0.15 })}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Presence wrapper for exit animations
import { AnimatePresence } from 'framer-motion';
export { AnimatePresence };
