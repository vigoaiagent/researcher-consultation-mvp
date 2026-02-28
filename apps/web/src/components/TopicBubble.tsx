import type { TopicPoolEntry } from '@rcm/shared'

interface Props {
  topic: TopicPoolEntry
  onClick: (topic: TopicPoolEntry) => void
  isSelected?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  BTC: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
  ETH: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
  DeFi: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  NFT: 'from-pink-500/20 to-pink-600/5 border-pink-500/30',
  Layer2: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30',
  Macro: 'from-green-500/20 to-green-600/5 border-green-500/30',
  Gold: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
  Perp: 'from-red-500/20 to-red-600/5 border-red-500/30',
}

export default function TopicBubble({ topic, onClick, isSelected }: Props) {
  const colorClass = CATEGORY_COLORS[topic.category] || 'from-genesis-gold/20 to-genesis-gold/5 border-genesis-gold/30'

  return (
    <button
      onClick={() => onClick(topic)}
      className={`
        group relative px-5 py-3 rounded-2xl border
        bg-gradient-to-br ${colorClass}
        hover:scale-105 active:scale-95
        transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-genesis-gold ring-offset-1 ring-offset-genesis-black' : ''}
      `}
    >
      <p className="text-sm font-medium text-white leading-snug text-left">
        {topic.topic}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-400">
          by {topic.researcherName}
        </span>
        <span className="text-xs text-genesis-gold/60">
          {topic.category}
        </span>
      </div>
    </button>
  )
}
