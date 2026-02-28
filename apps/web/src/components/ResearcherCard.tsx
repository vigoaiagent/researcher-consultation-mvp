import type { ResearcherCard as ResearcherCardType } from '@rcm/shared'
import { formatRating } from '@rcm/shared'
import { Star, ChevronRight } from 'lucide-react'

interface Props {
  researcher: ResearcherCardType
  onCall: (researcher: ResearcherCardType) => void
}

const STATUS_DOT: Record<string, string> = {
  ONLINE: 'bg-green-400',
  BUSY: 'bg-yellow-400',
  OFFLINE: 'bg-gray-500',
}

export default function ResearcherCard({ researcher, onCall }: Props) {
  const isOnline = researcher.status === 'ONLINE'

  return (
    <button
      onClick={() => onCall(researcher)}
      className="flex-shrink-0 w-64 p-4 rounded-2xl bg-genesis-charcoal border border-genesis-slate hover:border-genesis-gold/30 transition-all text-left cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-genesis-slate flex items-center justify-center text-lg font-bold text-genesis-gold">
              {researcher.avatarUrl ? (
                <img src={researcher.avatarUrl} alt={researcher.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                researcher.name[0]
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-genesis-charcoal ${STATUS_DOT[researcher.status]}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{researcher.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={12} className="text-genesis-gold fill-genesis-gold" />
              <span className="text-xs text-genesis-gold-light">{formatRating(researcher.ratingScore)}</span>
              <span className="text-xs text-gray-500 ml-1">{researcher.serviceCount} calls</span>
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-500 mt-1" />
      </div>

      {researcher.bio && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{researcher.bio}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {researcher.specialties.slice(0, 3).map((s) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-genesis-slate text-gray-300">
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className={`text-xs px-2.5 py-1 rounded-full ${
          isOnline ? 'bg-green-400/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {isOnline ? 'Available' : researcher.status}
        </div>
        {researcher.quickQuestions.length > 0 && (
          <p className="text-xs text-gray-500 truncate max-w-32">
            {researcher.quickQuestions[0]}
          </p>
        )}
      </div>
    </button>
  )
}
