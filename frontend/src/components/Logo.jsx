export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/assets/easyinternat-logo-transparent.png"
        alt="EasyInternat"
        className={compact ? 'h-24 w-72 object-contain object-left' : 'h-12 w-44 object-contain object-left sm:h-14 sm:w-56'}
      />
    </div>
  )
}
