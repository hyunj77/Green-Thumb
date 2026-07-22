import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import greenieImg from '../assets/greenie-character.png'
import faceWink from '../assets/face-wink.png'
import faceCurious from '../assets/face-curious.png'
import faceSurprised from '../assets/face-surprised.png'
import faceCalm from '../assets/face-calm.png'
import faceSparkle from '../assets/face-sparkle.png'

const FACE_IMAGES = {
  idle: greenieImg,
  wink: faceWink,
  curious: faceCurious,
  surprised: faceSurprised,
  calm: faceCalm,
  sparkle: faceSparkle,
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
  const faceOverrideTimerRef = useRef(null)
  const prevLevelUpRef = useRef(levelUpSignal)

  const [mood, setMood] = useState('idle')
  const [faceOverride, setFaceOverride] = useState(null)
  const [droplets, setDroplets] = useState([])
  const [sparkles, setSparkles] = useState([])
  const [hearts, setHearts] = useState([])

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

  const flashFace = (face, duration) => {
    clearTimeout(faceOverrideTimerRef.current)
    setFaceOverride(face)
    faceOverrideTimerRef.current = setTimeout(() => setFaceOverride(null), duration)
  }

  // 레벨업 이펙트
  useEffect(() => {
    if (levelUpSignal === prevLevelUpRef.current) return
    prevLevelUpRef.current = levelUpSignal
    glowControls.start({ scale: [0, 2.3], opacity: [0.55, 0], transition: { duration: 0.9, ease: 'easeOut' } })
    bodyControls.start({ scale: [1, 1.28, 0.92, 1.05, 1], transition: { duration: 0.7, ease: 'easeInOut' } })
    flashFace('surprised', 750)
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: `heart-${Date.now()}-${i}`,
      x: 26 + Math.random() * 48,
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
      spawnSparkles()
      flashFace('sparkle', 420)
      bodyControls.start({
        scaleY: [1, 0.82 * intensity, 1.08, 1],
        scaleX: [1, 1.12 * intensity, 0.96, 1],
        rotate: [0, next % 2 === 0 ? -6 : 6, 0],
        transition: { duration: 0.28, ease: 'easeOut' },
      })
      if (next % 10 === 0) {
        flashFace('sparkle', 700)
        bodyControls.start({
          rotate: [0, 360],
          transition: { duration: 0.6, ease: 'easeInOut' },
        }).then(() => bodyControls.set({ rotate: 0 }))
      }
    }, 60)

    onTap?.()
  }

  const moodFace = mood === 'sleepy' ? 'calm' : mood === 'sad' ? 'curious' : mood === 'bored' ? 'wink' : 'idle'
  const activeFace = faceOverride || moodFace

  const swayAnim = mood === 'bored'
    ? { rotate: [-5, 5, -5], x: [-3, 3, -3] }
    : mood === 'sad'
      ? { rotate: [-2, 2, -2], y: [0, 4, 0] }
      : mood === 'sleepy'
        ? { rotate: [-2, 2, -2] }
        : { rotate: [-2.5, 2.5, -2.5], y: [0, -6, 0] }
  const swayDuration = mood === 'bored' ? 1.8 : mood === 'sad' ? 3 : mood === 'sleepy' ? 4.2 : 2.4

  return (
    <div
      ref={wrapRef}
      className="greenie-character"
      style={{ width: size, height: size * 1.1, cursor: interactive ? 'pointer' : 'default' }}
      onPointerDown={handlePointerDown}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? '그린이에게 물주기' : undefined}
    >
      <motion.div
        className="greenie-glow"
        initial={{ scale: 0, opacity: 0 }}
        animate={glowControls}
      />

      <motion.div
        animate={bodyControls}
        initial={{ scale: 1 }}
        style={{ originX: 0.5, originY: 0.85, width: '100%', height: '100%' }}
      >
        <motion.div
          animate={{ scale: [1, 1.045, 1], ...swayAnim }}
          transition={{ duration: swayDuration, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: 0.5, originY: 1, width: '100%', height: '100%', position: 'relative', filter: mood === 'sleepy' ? 'brightness(0.94)' : 'none' }}
        >
          <AnimatePresence>
            <motion.img
              key={activeFace}
              src={FACE_IMAGES[activeFace]}
              alt="그린이"
              className="greenie-character-img"
              draggable={false}
              style={{ position: 'absolute', inset: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            />
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {mood === 'sleepy' && (
        <motion.span
          className="greenie-zzz"
          animate={{ y: [0, -14, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >Zzz</motion.span>
      )}

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
