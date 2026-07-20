import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, Droplets, Sun, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchPostById, deletePost, CATEGORY_LABEL } from '../lib/posts'
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

  if (loading) return <p className="muted" style={{ padding: 20 }}>불러오는 중...</p>
  if (!post) return <p className="muted" style={{ padding: 20 }}>게시물을 찾을 수 없어요.</p>

  const isOwner = user && user.id === post.author_id

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: 720, margin: '0 auto' }}>
      <div className="card" style={{ padding: '28px 32px' }}>
        <span className="badge">{CATEGORY_LABEL[post.category] || post.category}</span>
        <h2 style={{ marginTop: 12 }}>{post.title}</h2>
        <div className="muted">
          {post.author?.username || '알 수 없음'} · {new Date(post.created_at).toLocaleString('ko-KR')}
          {post.plant?.name && <span> · 🌿 {post.plant.name} ({post.plant.species || '품종 미상'})</span>}
        </div>

        {post.image_url && <img src={post.image_url} alt="" style={{ width: '100%', borderRadius: 16, margin: '16px 0' }} />}
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{post.content}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className={myReaction('watering') ? '' : 'secondary'} onClick={() => toggleReaction('watering')}>
            <Droplets size={16} /> 물주기 {countOf('watering')}
          </button>
          <button className={myReaction('sunlight') ? '' : 'secondary'} onClick={() => toggleReaction('sunlight')}>
            <Sun size={16} /> 햇빛 쬐어주기 {countOf('sunlight')}
          </button>
          <button className={bookmarked ? '' : 'secondary'} onClick={toggleBookmark}>
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? '저장됨' : '저장하기'}
          </button>
        </div>

        {isOwner && (
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
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
                <strong style={{ color: 'var(--text-h)' }}>{c.author?.username || '알 수 없음'}</strong>
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
