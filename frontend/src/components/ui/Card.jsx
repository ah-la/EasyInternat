import { motion } from 'framer-motion'
import { cn } from '../../lib/cn.js'

export default function Card({ children, className, hover = false, ...props }) {
  const Component = hover ? motion.div : 'div'

  return (
    <Component
      whileHover={hover ? { y: -4 } : undefined}
      transition={hover ? { duration: 0.18, ease: 'easeOut' } : undefined}
      className={cn('card', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
