import { useRef } from 'react'
import { BRAND } from '@rcm/shared'
import { Download, Share2 } from 'lucide-react'

interface Props {
  consultationNumber: string
  userBadge: string | null
  topicText: string
  researcherName: string
  duration: number
  ratingScore: number | null
  onClose: () => void
}

export default function SharePoster({
  consultationNumber,
  userBadge,
  topicText,
  researcherName,
  duration,
  ratingScore,
  onClose,
}: Props) {
  const posterRef = useRef<HTMLDivElement>(null)

  const handleSaveImage = async () => {
    // Use native screenshot hint — user can take a screenshot
    // For production, integrate html2canvas: pnpm add html2canvas
    try {
      await navigator.clipboard.writeText(
        `Genesis Advisory Black Card #${consultationNumber}\nTopic: ${topicText}\nAnalyst: ${researcherName}\nDuration: ${mins}:${String(secs).padStart(2, '0')}`
      )
      alert('Consultation details copied to clipboard! Take a screenshot to save the poster.')
    } catch {
      alert('Take a screenshot to save this poster.')
    }
  }

  const handleShareX = () => {
    const text = encodeURIComponent(
      `Just completed an exclusive 1-on-1 session with a SODEX Chief Analyst via ${BRAND.FULL}! #SODEX #GenesisAdvisory`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const mins = Math.floor(duration / 60)
  const secs = duration % 60

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        {/* Poster */}
        <div
          ref={posterRef}
          className="w-80 bg-gradient-to-b from-genesis-charcoal to-genesis-black rounded-2xl border border-genesis-gold/30 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-genesis-gold/20 to-genesis-gold/5 px-6 py-4 border-b border-genesis-gold/20">
            <p className="text-genesis-gold font-bold text-sm tracking-wide">{BRAND.FULL}</p>
            <p className="text-genesis-gold/60 text-xs mt-0.5">Genesis Advisory Black Card</p>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Consultation No.</p>
              <p className="text-genesis-gold font-mono text-lg font-bold">#{consultationNumber}</p>
            </div>

            {userBadge && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Badge</p>
                <p className="text-white text-sm">{userBadge}</p>
              </div>
            )}

            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Topic</p>
              <p className="text-white text-sm leading-relaxed">{topicText}</p>
            </div>

            <div className="flex gap-6">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Analyst</p>
                <p className="text-white text-sm">{researcherName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Duration</p>
                <p className="text-white text-sm">{mins}:{String(secs).padStart(2, '0')}</p>
              </div>
              {ratingScore && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Rating</p>
                  <p className="text-genesis-gold text-sm">{'★'.repeat(ratingScore)}{'☆'.repeat(5 - ratingScore)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-genesis-slate/50">
            <p className="text-gray-600 text-xs text-center">Exclusive 1-on-1 Research Advisory by SODEX</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveImage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-genesis-charcoal border border-genesis-slate text-white text-sm hover:bg-genesis-slate transition-colors"
          >
            <Download size={16} />
            Save Image
          </button>
          <button
            onClick={handleShareX}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-genesis-gold text-black text-sm font-medium hover:bg-genesis-gold-light transition-colors"
          >
            <Share2 size={16} />
            Share on X
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors mt-1"
        >
          Close
        </button>
      </div>
    </div>
  )
}
