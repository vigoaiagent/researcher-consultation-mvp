import { Phone } from 'lucide-react'

interface Props {
  label?: string
}

export default function RippleAnimation({ label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Ripple circles */}
        <div className="absolute inset-0 rounded-full border-2 border-genesis-gold/30 animate-ripple" />
        <div className="absolute inset-0 rounded-full border-2 border-genesis-gold/20 animate-ripple [animation-delay:0.5s]" />
        <div className="absolute inset-0 rounded-full border-2 border-genesis-gold/10 animate-ripple [animation-delay:1s]" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-genesis-gold/20 flex items-center justify-center animate-pulse-slow">
            <Phone size={28} className="text-genesis-gold" />
          </div>
        </div>
      </div>

      {label && (
        <p className="mt-6 text-sm text-gray-400 animate-pulse">{label}</p>
      )}
    </div>
  )
}
