import { Camera, Mail, MessageCircleHeart, Rss, Video } from 'lucide-react'

const SNS_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/greenthumb.official', Icon: Camera },
  { label: 'YouTube', href: 'https://youtube.com/@greenthumb.official', Icon: Video },
  { label: 'Blog', href: 'https://blog.naver.com/greenthumb', Icon: Rss },
]

export default function ContactCard() {
  return (
    <section className="contact-card">
      <div className="contact-card-head">
        <span className="contact-sprout" aria-hidden="true">🌱</span>
        <div>
          <h3>문의하기</h3>
          <p className="muted">궁금한 점이나 제휴 문의는 언제든 편하게 남겨주세요</p>
        </div>
      </div>

      <div className="contact-row">
        <Mail size={18} />
        <div>
          <div className="contact-row-label">이메일</div>
          <a href="mailto:hello@greenthumb.app">hello@greenthumb.app</a>
        </div>
      </div>

      <div className="contact-row">
        <MessageCircleHeart size={18} />
        <div>
          <div className="contact-row-label">고객센터 / 제휴 문의</div>
          <span className="muted">평일 10:00 ~ 18:00 (주말·공휴일 휴무)</span>
        </div>
      </div>

      <div className="sns-row">
        {SNS_LINKS.map(({ label, href, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="sns-icon-btn" aria-label={label}>
            <Icon size={18} />
          </a>
        ))}
      </div>
    </section>
  )
}
