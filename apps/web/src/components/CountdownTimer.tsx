import { formatDuration } from '@rcm/shared'

interface Props {
  remainingSeconds: number
  isLast30s: boolean
}

export default function CountdownTimer({ remainingSeconds, isLast30s }: Props) {
  return (
    <div className={`
      text-center transition-colors duration-300
      ${isLast30s ? 'text-red-500' : 'text-white'}
    `}>
      <div className={`
        text-5xl font-bold font-mono tracking-wider
        ${isLast30s ? 'animate-pulse' : ''}
      `}>
        {formatDuration(remainingSeconds)}
      </div>
      {isLast30s && (
        <p className="text-sm text-red-400 mt-2 animate-pulse">
          Call ending soon
        </p>
      )}
    </div>
  )
}
