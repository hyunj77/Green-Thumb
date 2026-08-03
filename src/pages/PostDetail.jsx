import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, Heart, MessageCircle, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BackHeader from '../components/BackHeader'
import GradeBadge from '../components/GradeBadge'
import { fetchPostById, deletePost, updateDealStatus, CATEGORY_LABEL, DEAL_STATUS_LABEL, formatDealPrice, isMarketCategory } from '../lib/posts'
import { fetchComments, createComment, deleteComment } from '../lib/comments'
import { fetchReactionCounts, addReaction, removeReaction } from '../lib/reactions'
import { fetchMyBookmarkedPostIds, addBookmark, removeBookmark } from '../lib/bookmarks'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [reactions, setReactions] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetchPostById(id),
      fetchComments(id),
      fetchReactionCounts(id),
      user ? fetchMyBookmarkedPostIds(user.id) : Promise.resolve({ data: [] }),
    ]).then(([postRes, commentsRes, reactionsRes, bookmarksRes]) => {
      setPost(postRes.data)
      setComments(commentsRes.data || [])
      setReactions(reactionsRes.data || [])
      setBookmarked((bookmarksRes.data || []).includes(Number(id)))
      setLoading(false)
    })
  }

  useEffect(load, [id, user])

  const toggleBookmark = async () => {
    if (!user) return navigate('/login')
    if (bookmarked) {
      await removeBookmark({ postId: id, userId: user.id })
    } else {
      await addBookmark({ postId: id, userId: user.id })
    }
    setBookmarked((v) => !v)
  }

  const countOf = (type) => reactions.filter((r) => r.reaction_type === type).length
  const myReaction = (type) => user && reactions.some((r) => r.reaction_type === type && r.user_id === user.id)

  const toggleReaction = async (type) => {
    if (!user) return navigate('/login')
    if (myReaction(type)) {
      await removeReaction({ postId: id, userId: user.id, reactionType: type })
    } else {
      await addReaction({ postId: id, userId: user.id, reactionType: type })
    }
    const { data } = await fetchReactionCounts(id)
    setReactions(data || [])
  }

  const handleDeletePost = async () => {
    if (!confirm('게시물을 삭제할까요?')) return
    await deletePost(id)
    navigate('/')
  }

  const handleSetDealStatus = async (status) => {
    const { data } = await updateDealStatus(id, status)
    if (data) setPost((prev) => ({ ...prev, deal_status: data.deal_status }))
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const { data } = await createComment({ postId: id, authorId: user.id, content: commentText })
    if (data) setComments((prev) => [...prev, data])
    setCommentText('')
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  if (loading) {
    return (
      <div style={{ padding: '0 20px 40px', maxWidth: 720, margin: '0 auto' }}>
        <BackHeader title="게시글" />
        <p className="muted">불러오는 중...</p>
      </div>
    )
  }
  if (!post) {
    return (
      <div style={{ padding: '0 20px 40px', maxWidth: 720, margin: '0 auto' }}>
        <BackHeader title="게시글" />
        <p className="muted">게시물을 찾을 수 없어요.</p>
      </div>
    )
  }

  const isOwner = user && user.id === post.author_id

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: 720, margin: '0 auto' }}>
      <BackHeader title={CATEGORY_LABEL[post.category] || post.category} />
      <div className="card" style={{ padding: '28px 32px' }}>
        <span className="badge">{CATEGORY_LABEL[post.category] || post.category}</span>
        {isMarketCategory(post.category) && (
          <span className="badge" style={{ marginLeft: 6, background: 'var(--accent)', color: '#fff' }}>
            {formatDealPrice(post.category, post.price)}
          </span>
        )}
        {isMarketCategory(post.category) && post.deal_status !== 'available' && (
          <span className="badge" style={{ marginLeft: 6 }}>{DEAL_STATUS_LABEL[post.deal_status]}</span>
        )}
        <h2 style={{ marginTop: 12 }}>{post.title}</h2>
        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>{post.author?.username || '알 수 없음'}</span>
          <GradeBadge score={post.author?.garden_score} />
          <span>· {new Date(post.created_at).toLocaleString('ko-KR')}</span>
          {post.plant?.name && <span>· 🌿 {post.plant.name} ({post.plant.species || '품종 미상'})</span>}
        </div>

        {post.image_url && <img src={post.image_url} alt="" style={{ width: '100%', borderRadius: 16, margin: '16px 0' }} />}
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{post.content}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className={myReaction('like') ? '' : 'secondary'} onClick={() => toggleReaction('like')}>
            <Heart size={16} fill={myReaction('like') ? 'currentColor' : 'none'} /> 좋아요 {countOf('like')}
          </button>
          <button className={bookmarked ? '' : 'secondary'} onClick={toggleBookmark}>
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? '저장됨' : '저장하기'}
          </button>
          {!isOwner && user && isMarketCategory(post.category) && (
            <Link to={`/messages?with=${post.author_id}`}>
              <button className="secondary"><MessageCircle size={14} /> 판매자에게 메시지</button>
            </Link>
          )}
        </div>

        {isOwner && isMarketCategory(post.category) && (
          <div style={{ display: 'flex', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
            {Object.entries(DEAL_STATUS_LABEL).map(([status, label]) => (
              <button
                key={status}
                className={post.deal_status === status ? '' : 'secondary'}
                style={{ padding: '8px 12px', fontSize: 13 }}
                onClick={() => handleSetDealStatus(status)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isOwner && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Link to={`/posts/${id}/edit`}><button className="secondary">수정</button></Link>
            <button className="secondary" onClick={handleDeletePost}>삭제</button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '24px 32px', marginTop: 16 }}>
        <h3>댓글 {comments.length}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ color: 'var(--text-h)' }}>{c.author?.username || '알 수 없음'}</strong>
                  <GradeBadge score={c.author?.garden_score} />
                </span>
                {user && user.id === c.author?.id && (
                  <button className="secondary" style={{ padding: '2px 10px' }} onClick={() => handleDeleteComment(c.id)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <p style={{ margin: '4px 0 0' }}>{c.content}</p>
              <span className="muted">{new Date(c.created_at).toLocaleString('ko-KR')}</span>
            </div>
          ))}
          {comments.length === 0 && <p className="muted">첫 댓글을 남겨보세요.</p>}
        </div>

        {user ? (
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="댓글을 입력하세요" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button type="submit">등록</button>
          </form>
        ) : (
          <p className="muted">댓글을 남기려면 <Link to="/login">로그인</Link>이 필요해요.</p>
        )}
      </div>
    </div>
  )
}
