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
      <Image
        src="/images/kinder-chef-logo.png"
        alt="Kinder Chef Logo"
        width={sizes[size].width}
        height={sizes[size].height}
        className="rounded-full object-contain"
        priority
      />
    </div>
  )
}
