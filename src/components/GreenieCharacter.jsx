import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'

const MOUTH_PATHS = {
  idle: 'M78,148 Q100,164 122,148',
  happy: 'M76,146 Q100,178 124,146 Q100,162 76,146 Z',
  sad: 'M80,156 Q100,146 120,156',
  sleepy: 'M88,152 L112,152',
}

let dropletSeq = 0
let sparkleSeq = 0

export default function GreenieCharacter({
  level = 1,
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
  const lastTapRef = useRef(Date.now())
  const comboRef = useRef(0)
  const comboTimerRef = useRef(null)
  const prevLevelUpRef = useRef(levelUpSignal)

  const [blinking, setBlinking] = useState(false)
  const [mood, setMood] = useState('idle')
  const [expression, setExpression] = useState('idle')
  const [droplets, setDroplets] = useState([])
  const [sparkles, setSparkles] = useState([])
  const [hearts, setHearts] = useState([])

  // 3~6초마다 눈 깜빡임
  useEffect(() => {
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
  }, [])

  // 방치 시간에 따른 기분 변화 (10초 심심, 20초 시무룩, 30초 졸림) — 상호작용 가능한 내 그린이만 해당
  useEffect(() => {
    if (!interactive) return undefined
    const timer = setInterval(() => {
      const elapsed = (Date.now() - lastTapRef.current) / 1000
      if (elapsed >= 30) setMood('sleepy')
      else if (elapsed >= 20) setMood('sad')
      else if (elapsed >= 10) setMood('bored')
      else setMood('idle')
    }, 1000)
    return () => clearInterval(timer)
  }, [interactive])

  // 레벨업 이펙트
  useEffect(() => {
    if (levelUpSignal === prevLevelUpRef.current) return
    prevLevelUpRef.current = levelUpSignal
    glowControls.start({ scale: [0, 2.2], opacity: [0.55, 0], transition: { duration: 0.9, ease: 'easeOut' } })
    bodyControls.start({ scale: [1, 1.3, 0.9, 1.05, 1], transition: { duration: 0.7, ease: 'easeInOut' } })
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

    // 연속 터치 콤보 (900ms 안에 다시 터치하면 이어짐)
    const now = Date.now()
    const chained = now - lastTapRef.current < 900
    lastTapRef.current = now
    setMood('idle')
    const next = chained ? comboRef.current + 1 : 1
    comboRef.current = next
    clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => { comboRef.current = 0 }, 900)

    setTimeout(() => {
      const intensity = 1 + Math.min(next, 10) * 0.03
      setExpression('happy')
      spawnSparkles()
      bodyControls.start({
        scaleY: [1, 0.82 * intensity, 1.08, 1],
        scaleX: [1, 1.12 * intensity, 0.96, 1],
        transition: { duration: 0.28, ease: 'easeOut' },
      })
      setTimeout(() => setExpression('idle'), 420)

      if (next % 10 === 0) {
        bodyControls.start({
          rotate: [0, 360],
          transition: { duration: 0.6, ease: 'easeInOut' },
        }).then(() => bodyControls.set({ rotate: 0 }))
      }
    }, 180)

    onTap?.()
  }

  const currentExpression = mood === 'sleepy' ? 'sleepy' : mood === 'sad' ? 'sad' : expression
  const eyesClosed = blinking || currentExpression === 'sleepy'
  const leafRotate = mood === 'sleepy' ? [8, 14, 8] : mood === 'sad' ? [-1, 1, -1] : [-4, 4, -4]
  const leafDuration = mood === 'sleepy' ? 4.5 : 2.6

  return (
    <div
      ref={wrapRef}
      className="greenie-character"
      style={{ width: size, height: size * 1.31, cursor: interactive ? 'pointer' : 'default' }}
      onPointerDown={handlePointerDown}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? '그린이에게 물주기' : undefined}
    >
      <motion.svg viewBox="0 -32 200 262" width="100%" height="100%">
        <defs>
          <radialGradient id="greenie-body-grad" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#E3F5C4" />
            <stop offset="100%" stopColor="#93CE6A" />
          </radialGradient>
          <linearGradient id="greenie-leaf-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9AD154" />
            <stop offset="100%" stopColor="#6FA83A" />
          </linearGradient>
          <linearGradient id="greenie-leaf-side-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8AC24A" />
            <stop offset="100%" stopColor="#5F9A34" />
          </linearGradient>
          <linearGradient id="greenie-stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7CBD4E" />
            <stop offset="100%" stopColor="#5A9636" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="212" rx="48" ry="8" fill="rgba(0,0,0,0.08)" />

        <motion.g
          animate={mood === 'bored' ? { x: [-4, 4, -4] } : { x: 0 }}
          transition={{ duration: 2.4, repeat: mood === 'bored' ? Infinity : 0, ease: 'easeInOut' }}
        >
          <motion.g
            animate={bodyControls}
            initial={{ scale: 1 }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            {/* 팔 (몸통에 바짝 붙은 작은 팔) */}
            <motion.ellipse
              cx="36" cy="150" rx="8" ry="13" fill="url(#greenie-body-grad)" stroke="#a9d488" strokeWidth="1"
              animate={{ rotate: expression === 'happy' ? [0, -18, 10, 0] : 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ originX: 0.5, originY: 0 }}
            />
            <motion.ellipse
              cx="164" cy="150" rx="8" ry="13" fill="url(#greenie-body-grad)" stroke="#a9d488" strokeWidth="1"
              animate={{ rotate: expression === 'happy' ? [0, 18, -10, 0] : 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ originX: 0.5, originY: 0 }}
            />
            {/* 발 (작고 가까이 붙은 발) */}
            <motion.ellipse
              cx="83" cy="202" rx="13" ry="7" fill="#BFE89C"
              animate={{ rotate: expression === 'happy' ? [0, -10, 6, 0] : 0, y: expression === 'happy' ? [0, -4, 0] : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ originX: 0.5, originY: 0 }}
            />
            <motion.ellipse
              cx="117" cy="202" rx="13" ry="7" fill="#BFE89C"
              animate={{ rotate: expression === 'happy' ? [0, 10, -6, 0] : 0, y: expression === 'happy' ? [0, -4, 0] : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ originX: 0.5, originY: 0 }}
            />

            <motion.g
              animate={{ scaleY: [1, 1.02, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: 0.5, originY: 1 }}
            >
              {/* 옆 잎 (작은 떡잎) */}
              <motion.g
                animate={{ rotate: leafRotate.map((r) => r * 0.6) }}
                transition={{ duration: leafDuration, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: 0.25, originY: 0.85 }}
              >
                <path
                  d="M144,80 C162,72 172,56 168,40 C152,44 138,58 134,74 C134,80 139,83 144,80 Z"
                  fill="url(#greenie-leaf-side-grad)"
                />
              </motion.g>

              {/* 몸통 (깔끔한 동글동글 타원) */}
              <ellipse cx="100" cy="126" rx="70" ry="82" fill="url(#greenie-body-grad)" stroke="#a9d488" strokeWidth="1.5" />

              {/* 줄기 */}
              <path d="M93,28 C93,42 93,50 93,50 L107,50 C107,50 107,42 107,28 Z" fill="url(#greenie-stem-grad)" />

              {/* 새싹 (두 갈래, 넉넉한 크기) */}
              <motion.g
                animate={{ rotate: leafRotate }}
                transition={{ duration: leafDuration, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originX: 0.5, originY: 1 }}
              >
                <path
                  d="M100,24 C80,2 60,-12 40,-24 C38,4 52,26 100,24 Z"
                  fill="url(#greenie-leaf-grad)"
                />
                <path
                  d="M100,24 C120,2 140,-12 160,-24 C162,4 148,26 100,24 Z"
                  fill="url(#greenie-leaf-grad)"
                />
              </motion.g>

              {/* 볼 */}
              <motion.ellipse
                cx="66" cy="142" rx="15" ry="9" fill="#FF9B85"
                animate={{ opacity: currentExpression === 'happy' ? 1 : 0.82 }}
              />
              <motion.ellipse
                cx="134" cy="142" rx="15" ry="9" fill="#FF9B85"
                animate={{ opacity: currentExpression === 'happy' ? 1 : 0.82 }}
              />

              {/* 눈 (동글동글, 반짝이는 하이라이트 2개) */}
              <g>
                {eyesClosed ? (
                  <>
                    <path d="M63,116 Q75,126 87,116" stroke="#2b2b2b" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M113,116 Q125,126 137,116" stroke="#2b2b2b" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </>
                ) : currentExpression === 'sad' ? (
                  <>
                    <ellipse cx="75" cy="118" rx="10" ry="12" fill="#2b2b2b" />
                    <circle cx="79" cy="113" r="3" fill="#fff" />
                    <ellipse cx="125" cy="118" rx="10" ry="12" fill="#2b2b2b" />
                    <circle cx="129" cy="113" r="3" fill="#fff" />
                  </>
                ) : (
                  <>
                    <circle cx="75" cy="113" r="12.5" fill="#2b2b2b" />
                    <circle cx="79.5" cy="108" r="4" fill="#fff" />
                    <circle cx="71.5" cy="118" r="1.8" fill="#fff" opacity="0.8" />
                    <circle cx="125" cy="113" r="12.5" fill="#2b2b2b" />
                    <circle cx="129.5" cy="108" r="4" fill="#fff" />
                    <circle cx="121.5" cy="118" r="1.8" fill="#fff" opacity="0.8" />
                  </>
                )}
              </g>

              {/* 입 */}
              <AnimatePresence mode="wait">
                <motion.path
                  key={currentExpression}
                  d={MOUTH_PATHS[currentExpression] || MOUTH_PATHS.idle}
                  stroke="#2b2b2b"
                  strokeWidth="3.5"
                  fill={currentExpression === 'happy' ? '#c0453f' : 'none'}
                  strokeLinecap="round"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              </AnimatePresence>

              {mood === 'sleepy' && (
                <motion.text
                  x="155" y="65" fontSize="20" fill="#93a190"
                  animate={{ y: [65, 48, 65], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >Zzz</motion.text>
              )}
            </motion.g>
          </motion.g>
        </motion.g>

        <motion.circle
          cx="100" cy="128" r="40" fill="var(--green)"
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
