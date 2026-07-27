import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { stageForLevel } from '../lib/greenieStages'

// 화분 성장 단계별 형태 정의 (8단계, viewBox 0 0 200 445 기준)
const STAGE_GEOMETRY = {
  seed: { headR: 0, leafTiers: [], flower: null, viewTop: 305 },
  sprout: {
    // 떡잎 2장 · 눈만 생김
    stemPath: 'M100,380 Q102,368 100,352', stemWidth: 5,
    headCx: 100, headCy: 325, headR: 26,
    leafTiers: [
      { cx: 82, cy: 340, rx: 12, ry: 7, rotate: -20, fill: '#5FAE55' },
      { cx: 118, cy: 340, rx: 12, ry: 7, rotate: 20, fill: '#5FAE55' },
    ],
    flower: null,
    viewTop: 255,
  },
  'sprout-leaf': {
    // 어린잎 · 잎 4장 · 웃는 표정
    stemPath: 'M100,380 Q103,350 100,322', stemWidth: 5.5,
    headCx: 100, headCy: 298, headR: 32,
    leafTiers: [
      { cx: 68, cy: 345, rx: 23, ry: 12, rotate: -30, fill: '#3F9142' },
      { cx: 132, cy: 345, rx: 23, ry: 12, rotate: 30, fill: '#3F9142' },
      { cx: 74, cy: 315, rx: 19, ry: 10, rotate: -38, fill: '#4CA246' },
      { cx: 126, cy: 315, rx: 19, ry: 10, rotate: 38, fill: '#4CA246' },
    ],
    flower: null,
    viewTop: 220,
  },
  growth: {
    // 성장기 · 키가 커짐 · 잎 증가 · 볼터치(Face에서 상시 표시)
    stemPath: 'M100,380 Q106,340 100,296', stemWidth: 6.5,
    headCx: 100, headCy: 270, headR: 38,
    leafTiers: [
      { cx: 62, cy: 345, rx: 27, ry: 14, rotate: -34, fill: '#3F9142' },
      { cx: 138, cy: 345, rx: 27, ry: 14, rotate: 34, fill: '#3F9142' },
      { cx: 68, cy: 308, rx: 23, ry: 12, rotate: -40, fill: '#4CA246' },
      { cx: 132, cy: 308, rx: 23, ry: 12, rotate: 40, fill: '#4CA246' },
      { cx: 76, cy: 278, rx: 18, ry: 9, rotate: -46, fill: '#58AE49' },
      { cx: 124, cy: 278, rx: 18, ry: 9, rotate: 46, fill: '#58AE49' },
    ],
    flower: null,
    viewTop: 185,
  },
  bud: {
    // 꽃봉오리 생성 · 반짝임 효과
    stemPath: 'M100,380 Q108,332 100,270', stemWidth: 7,
    headCx: 100, headCy: 245, headR: 40,
    leafTiers: [
      { cx: 58, cy: 342, rx: 28, ry: 15, rotate: -36, fill: '#3F9142' },
      { cx: 142, cy: 342, rx: 28, ry: 15, rotate: 36, fill: '#3F9142' },
      { cx: 64, cy: 302, rx: 24, ry: 13, rotate: -42, fill: '#4CA246' },
      { cx: 136, cy: 302, rx: 24, ry: 13, rotate: 42, fill: '#4CA246' },
      { cx: 72, cy: 266, rx: 19, ry: 10, rotate: -48, fill: '#58AE49' },
      { cx: 128, cy: 266, rx: 19, ry: 10, rotate: 48, fill: '#58AE49' },
    ],
    flower: 'bud',
    flowerCy: 190,
    decor: 'sparkle',
    viewTop: 130,
  },
  bloom: {
    // 개화 · 활짝 핀 꽃
    stemPath: 'M100,380 Q108,330 100,266', stemWidth: 7.5,
    headCx: 100, headCy: 225, headR: 43,
    leafTiers: [
      { cx: 55, cy: 340, rx: 29, ry: 16, rotate: -36, fill: '#3F9142' },
      { cx: 145, cy: 340, rx: 29, ry: 16, rotate: 36, fill: '#3F9142' },
      { cx: 60, cy: 298, rx: 25, ry: 13, rotate: -42, fill: '#4CA246' },
      { cx: 140, cy: 298, rx: 25, ry: 13, rotate: 42, fill: '#4CA246' },
      { cx: 68, cy: 258, rx: 20, ry: 11, rotate: -48, fill: '#58AE49' },
      { cx: 132, cy: 258, rx: 20, ry: 11, rotate: 48, fill: '#58AE49' },
    ],
    flower: 'full',
    flowerCy: 165,
    viewTop: 100,
  },
  fruit: {
    // 꽃이 지고 열매가 열림 · 나비 등장 · 은은한 배경 효과
    stemPath: 'M100,380 Q110,325 100,250', stemWidth: 8,
    headCx: 100, headCy: 205, headR: 46,
    leafTiers: [
      { cx: 52, cy: 338, rx: 30, ry: 16, rotate: -36, fill: '#3F9142' },
      { cx: 148, cy: 338, rx: 30, ry: 16, rotate: 36, fill: '#3F9142' },
      { cx: 56, cy: 296, rx: 26, ry: 14, rotate: -42, fill: '#4CA246' },
      { cx: 144, cy: 296, rx: 26, ry: 14, rotate: 42, fill: '#4CA246' },
      { cx: 64, cy: 254, rx: 21, ry: 11, rotate: -48, fill: '#58AE49' },
      { cx: 136, cy: 254, rx: 21, ry: 11, rotate: 48, fill: '#58AE49' },
      { cx: 78, cy: 218, rx: 15, ry: 8, rotate: -52, fill: '#6EBE58' },
      { cx: 122, cy: 218, rx: 15, ry: 8, rotate: 52, fill: '#6EBE58' },
    ],
    fruits: [
      { cx: 52, cy: 338 }, { cx: 148, cy: 338 },
      { cx: 64, cy: 254 }, { cx: 136, cy: 254 },
    ],
    flower: null,
    decor: 'butterfly',
    bgGlow: true,
    viewTop: 90,
  },
  tree: {
    // 그린 트리 · 완전한 모습 · 잎 풍성 · 꽃 + 열매 · 반짝이는 이펙트
    stemPath: 'M100,380 Q112,320 100,230', stemWidth: 10, stemColor: '#8B6B3D',
    headCx: 100, headCy: 185, headR: 52,
    leafTiers: [
      { cx: 46, cy: 330, rx: 32, ry: 17, rotate: -34, fill: '#3F9142' },
      { cx: 154, cy: 330, rx: 32, ry: 17, rotate: 34, fill: '#3F9142' },
      { cx: 50, cy: 284, rx: 28, ry: 15, rotate: -40, fill: '#4CA246' },
      { cx: 150, cy: 284, rx: 28, ry: 15, rotate: 40, fill: '#4CA246' },
      { cx: 58, cy: 238, rx: 24, ry: 13, rotate: -46, fill: '#58AE49' },
      { cx: 142, cy: 238, rx: 24, ry: 13, rotate: 46, fill: '#58AE49' },
      { cx: 70, cy: 196, rx: 19, ry: 10, rotate: -50, fill: '#6EBE58' },
      { cx: 130, cy: 196, rx: 19, ry: 10, rotate: 50, fill: '#6EBE58' },
    ],
    fruits: [
      { cx: 46, cy: 330 }, { cx: 154, cy: 330 },
      { cx: 58, cy: 238 }, { cx: 142, cy: 238 },
    ],
    flower: 'full',
    flowerCy: 120,
    decor: 'sparkle',
    bgGlow: true,
    viewTop: 60,
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

function Fruit({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#E0533D" />
      <circle cx={cx - 2} cy={cy - 2} r={1.8} fill="#F5A98F" />
      <path d={`M${cx},${cy - 6} q2,-3 4,-3`} stroke="#4CA246" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Butterfly({ cx, cy }) {
  return (
    <motion.g
      animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ originX: `${cx}px`, originY: `${cy}px` }}
    >
      <motion.g
        animate={{ scaleX: [1, 0.55, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
      >
        <ellipse cx={cx - 4} cy={cy - 2} rx={5} ry={4} fill="#F4B942" />
        <ellipse cx={cx + 4} cy={cy - 2} rx={5} ry={4} fill="#F4B942" />
        <ellipse cx={cx - 4} cy={cy + 3} rx={3.5} ry={3} fill="#F2A6C4" />
        <ellipse cx={cx + 4} cy={cy + 3} rx={3.5} ry={3} fill="#F2A6C4" />
      </motion.g>
      <ellipse cx={cx} cy={cy} rx={1.3} ry={4} fill="#5A4632" />
    </motion.g>
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
  const lastTapAtRef = useRef(0)
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

  // 단계별로 실제 그려지는 높이만큼만 프레임을 잘라서, 성장 초반 단계에서도
  // 여백이 크게 남지 않고 카드가 내용에 맞게 컴팩트해지도록 한다
  const viewTop = geo.viewTop ?? 90
  const viewBoxHeight = 445 - viewTop
  const wrapHeight = size * (viewBoxHeight / 200)

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
    const chained = now - lastTapAtRef.current < 900
    lastTapAtRef.current = now
    const next = chained ? comboRef.current + 1 : 1
    comboRef.current = next
    clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => { comboRef.current = 0 }, 900)

    // 탭할 때마다 눈에 띄게 통통 튀도록 즉시 반응한다 (지연 없음)
    const intensity = 1 + Math.min(next, 10) * 0.04
    setExpression('happy')
    spawnSparkles()
    bodyControls.stop()
    bodyControls.start({
      y: [0, -14 * intensity, 4, 0],
      scaleY: [1, 0.78, 1.12, 0.97, 1],
      scaleX: [1, 1.18 * intensity, 0.92, 1.02, 1],
      rotate: [0, chained ? (comboRef.current % 2 === 0 ? -6 : 6) : 0, 0],
      transition: { duration: 0.45, ease: 'easeOut' },
    })
    setTimeout(() => setExpression('idle'), 420)

    onTap?.()
  }

  const baseExpression = thirsty ? 'sleepy' : 'idle'
  const currentExpression = expression === 'happy' ? 'happy' : baseExpression
  const eyesClosed = blinking && currentExpression !== 'sleepy'

  return (
    <div
      ref={wrapRef}
      className="greenie-character"
      style={{ width: size, height: wrapHeight, cursor: interactive ? 'pointer' : 'default' }}
      onPointerDown={handlePointerDown}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? '그린이에게 물주기' : undefined}
    >
      <motion.svg viewBox={`0 ${viewTop} 200 ${viewBoxHeight}`} width="100%" height="100%">
        <ellipse cx="100" cy="438" rx="46" ry="7" fill="rgba(0,0,0,0.08)" />

        {/* 화분 */}
        <path d="M50,380 L150,380 L135,435 L65,435 Z" fill="#C97B4A" stroke="#A8623A" strokeWidth="2" />
        <ellipse cx="100" cy="380" rx="46" ry="9" fill="#6B4226" />

        {stage === 'seed' ? (
          <motion.g
            animate={bodyControls}
            initial={{ scale: 1 }}
            style={{ originX: '100px', originY: '380px' }}
          >
            <ellipse cx="100" cy="367" rx="22" ry="26" fill="#E8D5A8" stroke="#C9AD75" strokeWidth="2" />
          </motion.g>
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
              {geo.bgGlow && (
                <circle cx={geo.headCx} cy={geo.headCy} r={geo.headR * 1.7} fill="#BFE7A8" opacity={0.16} />
              )}

              <path d={geo.stemPath} fill="none" stroke={geo.stemColor || '#6B8E4E'} strokeWidth={geo.stemWidth} strokeLinecap="round" />

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

              {geo.fruits?.map((f, i) => <Fruit key={i} cx={f.cx} cy={f.cy} />)}

              <Flower type={geo.flower} cx={geo.headCx} cy={geo.flowerCy ?? geo.headCy - 57} />

              <circle cx={geo.headCx} cy={geo.headCy} r={geo.headR} fill="#4CA246" />
              <Face cx={geo.headCx} cy={geo.headCy} r={geo.headR} eyesClosed={eyesClosed} expression={currentExpression} />

              {geo.decor === 'sparkle' && (
                <>
                  <motion.text x={geo.headCx - geo.headR - 10} y={geo.headCy - geo.headR + 4} fontSize="13" fill="#F4B942" animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.8, repeat: Infinity }}>✦</motion.text>
                  <motion.text x={geo.headCx + geo.headR - 2} y={geo.headCy - geo.headR - 8} fontSize="9" fill="#9ED686" animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}>✦</motion.text>
                </>
              )}

              {geo.decor === 'butterfly' && <Butterfly cx={geo.headCx + geo.headR + 6} cy={geo.headCy - geo.headR + 2} />}

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
                  <motion.text x={geo.headCx - geo.headR - 16} y={geo.headCy + 8} fontSize="14" fill="#F4B942" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }}>✦</motion.text>
                  <motion.text x={geo.headCx + geo.headR + 6} y={geo.headCy + 14} fontSize="10" fill="#9ED686" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }}>✦</motion.text>
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
