import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { stageForLevel } from '../lib/greenieStages'

// 화분 성장 단계별 형태 정의 (레퍼런스 일러스트 좌표 기준, viewBox 0 0 200 260)
const STAGE_GEOMETRY = {
  seed: { headR: 0, leafTiers: [], flower: null },
  sprout: {
    stemPath: 'M100,380 Q102,368 100,352', stemWidth: 5,
    headCx: 100, headCy: 325, headR: 28, leafTiers: [], flower: null,
  },
  leaves: {
    stemPath: 'M100,380 Q103,345 100,318', stemWidth: 5.5,
    headCx: 100, headCy: 296, headR: 34,
    leafTiers: [
      { cx: 70, cy: 345, rx: 22, ry: 11, rotate: -30, fill: '#3F9142' },
      { cx: 130, cy: 345, rx: 22, ry: 11, rotate: 30, fill: '#3F9142' },
    ],
    flower: null,
  },
  growth: {
    stemPath: 'M100,380 Q105,335 100,290', stemWidth: 6,
    headCx: 100, headCy: 252, headR: 42,
    leafTiers: [
      { cx: 68, cy: 345, rx: 25, ry: 13, rotate: -32, fill: '#3F9142' },
      { cx: 132, cy: 345, rx: 25, ry: 13, rotate: 32, fill: '#3F9142' },
      { cx: 74, cy: 308, rx: 21, ry: 11, rotate: -40, fill: '#4CA246' },
      { cx: 126, cy: 308, rx: 21, ry: 11, rotate: 40, fill: '#4CA246' },
    ],
    flower: 'bud',
  },
  bloom: {
    stemPath: 'M100,380 Q105,335 100,290', stemWidth: 6,
    headCx: 100, headCy: 252, headR: 42,
    leafTiers: [
      { cx: 68, cy: 345, rx: 25, ry: 13, rotate: -32, fill: '#3F9142' },
      { cx: 132, cy: 345, rx: 25, ry: 13, rotate: 32, fill: '#3F9142' },
      { cx: 74, cy: 308, rx: 21, ry: 11, rotate: -40, fill: '#4CA246' },
      { cx: 126, cy: 308, rx: 21, ry: 11, rotate: 40, fill: '#4CA246' },
      { cx: 80, cy: 275, rx: 17, ry: 9, rotate: -46, fill: '#58AE49' },
      { cx: 120, cy: 275, rx: 17, ry: 9, rotate: 46, fill: '#58AE49' },
    ],
    flower: 'full',
  },
}

function Face({ cx, cy, r, eyesClosed, expression }) {
  const s = r / 42
  const eyeR = 5 * s
  const eyeOffsetX = 15 * s
  const eyeCy = cy - 7 * s
  const hlR = 1.8 * s
  const blushRx = 7.5 * s
  const blushRy = 4.5 * s
  const blushOffsetX = 28 * s
  const blushCy = cy + 6 * s
  const mouthHalfW = 14 * s
  const mouthDip = 12 * s
  const mouthY = cy + 10 * s

  return (
    <>
      <ellipse cx={cx - blushOffsetX} cy={blushCy} rx={blushRx} ry={blushRy} fill="#F6C9D6" opacity={expression === 'happy' ? 1 : 0.7} />
      <ellipse cx={cx + blushOffsetX} cy={blushCy} rx={blushRx} ry={blushRy} fill="#F6C9D6" opacity={expression === 'happy' ? 1 : 0.7} />
      {eyesClosed ? (
        <>
          <path d={`M${cx - eyeOffsetX - eyeR},${eyeCy} Q${cx - eyeOffsetX},${eyeCy + eyeR} ${cx - eyeOffsetX + eyeR},${eyeCy}`} stroke="#2F3B2A" strokeWidth={2 * s} fill="none" strokeLinecap="round" />
          <path d={`M${cx + eyeOffsetX - eyeR},${eyeCy} Q${cx + eyeOffsetX},${eyeCy + eyeR} ${cx + eyeOffsetX + eyeR},${eyeCy}`} stroke="#2F3B2A" strokeWidth={2 * s} fill="none" strokeLinecap="round" />
        </>
      ) : expression === 'sleepy' ? (
        <>
          <path d={`M${cx - eyeOffsetX - eyeR},${eyeCy + eyeR * 0.3} Q${cx - eyeOffsetX},${eyeCy - eyeR * 0.5} ${cx - eyeOffsetX + eyeR},${eyeCy + eyeR * 0.3}`} stroke="#2F3B2A" strokeWidth={2 * s} fill="none" strokeLinecap="round" />
          <path d={`M${cx + eyeOffsetX - eyeR},${eyeCy + eyeR * 0.3} Q${cx + eyeOffsetX},${eyeCy - eyeR * 0.5} ${cx + eyeOffsetX + eyeR},${eyeCy + eyeR * 0.3}`} stroke="#2F3B2A" strokeWidth={2 * s} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={cx - eyeOffsetX} cy={eyeCy} r={eyeR} fill="#2F3B2A" />
          <circle cx={cx - eyeOffsetX + hlR} cy={eyeCy - hlR * 1.6} r={hlR} fill="#fff" />
          <circle cx={cx + eyeOffsetX} cy={eyeCy} r={eyeR} fill="#2F3B2A" />
          <circle cx={cx + eyeOffsetX + hlR} cy={eyeCy - hlR * 1.6} r={hlR} fill="#fff" />
        </>
      )}
      <path
        d={expression === 'sleepy'
          ? `M${cx - mouthHalfW * 0.6},${mouthY + mouthDip * 0.4} Q${cx},${mouthY} ${cx + mouthHalfW * 0.6},${mouthY + mouthDip * 0.4}`
          : `M${cx - mouthHalfW},${mouthY} Q${cx},${mouthY + mouthDip} ${cx + mouthHalfW},${mouthY}`}
        stroke="#2F3B2A"
        strokeWidth={2 * s}
        fill="none"
        strokeLinecap="round"
      />
    </>
  )
}

function Flower({ type, cx, cy }) {
  if (!type) return null
  if (type === 'bud') {
    return (
      <>
        <ellipse cx={cx} cy={cy + 6} rx={5} ry={7} fill="#8FBF4E" />
        <circle cx={cx} cy={cy} r={7} fill="#F2A6C4" />
      </>
    )
  }
  return (
    <g transform={`translate(${cx},${cy})`}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse key={angle} cx="0" cy="-17" rx="14" ry="19" fill="#F2A6C4" transform={`rotate(${angle})`} />
      ))}
      <circle cx="0" cy="0" r="12" fill="#F4B942" />
    </g>
  )
}

let dropletSeq = 0
let sparkleSeq = 0

export default function GreenieCharacter({
  level = 1,
  mood = 'normal',
  hat,
  accessory,
  size = 150,
  interactive = false,
  onTap,
  levelUpSignal = 0,
}) {
  const wrapRef = useRef(null)
  const bodyControls = useAnimation()
  const glowControls = useAnimation()
  const comboRef = useRef(0)
  const comboTimerRef = useRef(null)
  const prevLevelUpRef = useRef(levelUpSignal)

  const [blinking, setBlinking] = useState(false)
  const [expression, setExpression] = useState('idle')
  const [droplets, setDroplets] = useState([])
  const [sparkles, setSparkles] = useState([])
  const [hearts, setHearts] = useState([])

  const stage = stageForLevel(level).key
  const geo = STAGE_GEOMETRY[stage]
  const thirsty = mood === 'thirsty'
  const vibrant = mood === 'vibrant'

  // 3~6초마다 눈 깜빡임 (목마름 상태에서는 이미 눈이 감겨있으니 생략)
  useEffect(() => {
    if (thirsty) return undefined
    let cancelled = false
    const schedule = () => {
      const delay = 3000 + Math.random() * 3000
      setTimeout(() => {
        if (cancelled) return
        setBlinking(true)
        setTimeout(() => setBlinking(false), 150)
        schedule()
      }, delay)
    }
    schedule()
    return () => { cancelled = true }
  }, [thirsty])

  // 레벨업 이펙트
  useEffect(() => {
    if (levelUpSignal === prevLevelUpRef.current) return
    prevLevelUpRef.current = levelUpSignal
    glowControls.start({ scale: [0, 2.2], opacity: [0.55, 0], transition: { duration: 0.9, ease: 'easeOut' } })
    bodyControls.start({ scale: [1, 1.25, 0.92, 1.04, 1], transition: { duration: 0.7, ease: 'easeInOut' } })
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: `heart-${Date.now()}-${i}`,
      x: 30 + Math.random() * 40,
      emoji: i % 2 === 0 ? '💚' : '✨',
      delay: i * 0.08,
    }))
    setHearts((prev) => [...prev, ...newHearts])
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.includes(h)))
    }, 1400)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelUpSignal])

  const spawnSparkles = () => {
    const burst = Array.from({ length: 4 }).map(() => ({
      id: `sp-${sparkleSeq++}`,
      angle: Math.random() * 360,
    }))
    setSparkles((prev) => [...prev, ...burst])
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !burst.includes(s)))
    }, 500)
  }

  const handlePointerDown = (e) => {
    if (!interactive) return
    const rect = wrapRef.current?.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? rect.top
    const x = rect ? clientX - rect.left : size / 2
    const y = rect ? clientY - rect.top : 0

    const id = `dr-${dropletSeq++}`
    setDroplets((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setDroplets((prev) => prev.filter((d) => d.id !== id))
    }, 260)

    const now = Date.now()
    const chained = now - (comboTimerRef.current?.lastTap || 0) < 900
    const next = chained ? comboRef.current + 1 : 1
    comboRef.current = next
    clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => { comboRef.current = 0 }, 900)
    if (comboTimerRef.current) comboTimerRef.current.lastTap = now

    setTimeout(() => {
      const intensity = 1 + Math.min(next, 10) * 0.03
      setExpression('happy')
      spawnSparkles()
      bodyControls.start({
        scaleY: [1, 0.86 * intensity, 1.06, 1],
        scaleX: [1, 1.1 * intensity, 0.97, 1],
        transition: { duration: 0.28, ease: 'easeOut' },
      })
      setTimeout(() => setExpression('idle'), 420)
    }, 120)

    onTap?.()
  }

  const baseExpression = thirsty ? 'sleepy' : 'idle'
  const currentExpression = expression === 'happy' ? 'happy' : baseExpression
  const eyesClosed = blinking && currentExpression !== 'sleepy'

  return (
    <div
      ref={wrapRef}
      className="greenie-character"
      style={{ width: size, height: size * 1.2, cursor: interactive ? 'pointer' : 'default' }}
      onPointerDown={handlePointerDown}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? '그린이에게 물주기' : undefined}
    >
      <motion.svg viewBox="0 0 200 445" width="100%" height="100%">
        <ellipse cx="100" cy="438" rx="46" ry="7" fill="rgba(0,0,0,0.08)" />

        {/* 화분 */}
        <path d="M50,380 L150,380 L135,435 L65,435 Z" fill="#C97B4A" stroke="#A8623A" strokeWidth="2" />
        <ellipse cx="100" cy="380" rx="46" ry="9" fill="#6B4226" />

        {stage === 'seed' ? (
          <ellipse cx="100" cy="367" rx="22" ry="26" fill="#E8D5A8" stroke="#C9AD75" strokeWidth="2" />
        ) : (
          <motion.g
            animate={bodyControls}
            initial={{ scale: 1 }}
            style={{ originX: 0.5, originY: 1 }}
          >
            <motion.g
              animate={{ rotate: thirsty ? -11 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ originX: '100px', originY: '380px' }}
            >
              <path d={geo.stemPath} fill="none" stroke="#6B8E4E" strokeWidth={geo.stemWidth} strokeLinecap="round" />

              {geo.leafTiers.map((leaf, i) => (
                <motion.ellipse
                  key={i}
                  cx={leaf.cx} cy={leaf.cy} rx={leaf.rx} ry={leaf.ry}
                  fill={leaf.fill}
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                  animate={{ rotate: [leaf.rotate - 2, leaf.rotate + 2, leaf.rotate - 2] }}
                  transition={{ duration: 2.8 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ originX: `${leaf.cx}px`, originY: `${leaf.cy}px` }}
                />
              ))}

              <Flower type={geo.flower} cx={geo.headCx} cy={geo.headCy - 57} />

              <circle cx={geo.headCx} cy={geo.headCy} r={geo.headR} fill="#4CA246" />
              <Face cx={geo.headCx} cy={geo.headCy} r={geo.headR} eyesClosed={eyesClosed} expression={currentExpression} />

              {thirsty && (
                <motion.path
                  d={`M${geo.headCx + geo.headR - 4},${geo.headCy - geo.headR + 6} q4,7 0,12 a4,4 0 1 1 -4,-4 q0,-4 4,-8`}
                  fill="#7EC8E3"
                  animate={{ opacity: [0.9, 0.5, 0.9], y: [0, 3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}

              {vibrant && (
                <>
                  <motion.text x={geo.headCx - geo.headR - 14} y={geo.headCy - geo.headR} fontSize="14" fill="#F4B942" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }}>✦</motion.text>
                  <motion.text x={geo.headCx + geo.headR + 4} y={geo.headCy - geo.headR - 6} fontSize="10" fill="#9ED686" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }}>✦</motion.text>
                </>
              )}
            </motion.g>
          </motion.g>
        )}

        <motion.circle
          cx="100" cy="252" r="40" fill="var(--gt-sage, #4CA246)"
          initial={{ scale: 0, opacity: 0 }}
          animate={glowControls}
        />
      </motion.svg>

      {hat && <span className="greenie-character-hat" style={{ fontSize: size * 0.3 }}>{hat}</span>}
      {accessory && <span className="greenie-character-accessory" style={{ fontSize: size * 0.24 }}>{accessory}</span>}

      <AnimatePresence>
        {droplets.map((d) => (
          <motion.span
            key={d.id}
            className="greenie-droplet"
            style={{ left: d.x, top: d.y }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: 36 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: 'easeIn' }}
          >💧</motion.span>
        ))}
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="greenie-sparkle"
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
            animate={{
              opacity: 0,
              scale: 1,
              x: Math.cos((s.angle * Math.PI) / 180) * 36,
              y: Math.sin((s.angle * Math.PI) / 180) * 36,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >✨</motion.span>
        ))}
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            className="greenie-heart"
            style={{ left: `${h.x}%` }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -70 }}
            transition={{ duration: 1.3, delay: h.delay, ease: 'easeOut' }}
          >{h.emoji}</motion.span>
        ))}
      </AnimatePresence>

      {level >= 1000 && <span className="greenie-crown">👑</span>}
    </div>
  )
}
