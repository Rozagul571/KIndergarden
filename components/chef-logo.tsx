import Image from "next/image"

interface ChefLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ChefLogo({ className = "", size = "md" }: ChefLogoProps) {
  const sizes = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 120, height: 120 },
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className="rounded-full overflow-hidden bg-amber-100 flex items-center justify-center"
        style={{ width: sizes[size].width, height: sizes[size].height }}
      >
        <Image
          src="/images/kinder-chef-logo.png"
          alt="KinderChef Logo"
          width={sizes[size].width}
          height={sizes[size].height}
          className="object-contain"
          priority
          unoptimized
        />
      </div>
    </div>
  )
}
