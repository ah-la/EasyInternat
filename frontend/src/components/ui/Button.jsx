import { cn } from '../../lib/cn.js'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft',
  secondary: 'bg-white text-primary border border-border hover:bg-cyan-soft',
  ghost: 'text-primary hover:bg-cyan-soft',
  danger: 'bg-danger text-white hover:bg-red-700'
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base'
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-4 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
