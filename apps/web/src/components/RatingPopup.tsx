import { useState } from 'react'
import { Star } from 'lucide-react'
import { RATING_QUICK_TAGS, type RatingQuickTag } from '@rcm/shared'

interface Props {
  onSubmit: (score: number, tags?: string[]) => void
  onSkip: () => void
  researcherName?: string
  duration?: number
}

export default function RatingPopup({ onSubmit, onSkip, researcherName, duration }: Props) {
  const [score, setScore] = useState(0)
  const [hovering, setHovering] = useState(0)
  const [selectedTags, setSelectedTags] = useState<RatingQuickTag[]>([])

  const toggleTag = (tag: RatingQuickTag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-genesis-charcoal rounded-2xl p-8 w-96 text-center border border-genesis-slate">
        <h3 className="text-lg font-bold text-white mb-1">Rate This Call</h3>
        {researcherName && (
          <p className="text-sm text-genesis-gold-light mb-1">with {researcherName}</p>
        )}
        {duration !== undefined && (
          <p className="text-xs text-gray-500 mb-4">
            Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
          </p>
        )}
        <p className="text-sm text-gray-400 mb-5">How was your consultation experience?</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setScore(i)}
              onMouseEnter={() => setHovering(i)}
              onMouseLeave={() => setHovering(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={`transition-colors ${
                  i <= (hovering || score)
                    ? 'text-genesis-gold fill-genesis-gold'
                    : 'text-genesis-slate'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Quick Tags */}
        {score > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-5 animate-fade-in">
            {RATING_QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-genesis-gold/20 border-genesis-gold/40 text-genesis-gold'
                    : 'bg-genesis-slate/50 border-genesis-slate text-gray-400 hover:border-genesis-gold/20'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-xl border border-genesis-slate text-gray-400 text-sm hover:bg-genesis-slate transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => score > 0 && onSubmit(score, selectedTags)}
            disabled={score === 0}
            className={`
              flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${score > 0
                ? 'bg-genesis-gold text-black hover:bg-genesis-gold-light'
                : 'bg-genesis-slate text-gray-500 cursor-not-allowed'}
            `}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
