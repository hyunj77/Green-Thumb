import { supabase } from './supabase'

// 초록 엄지 응원 도장: 방문한 프로필에 글 없이 바로 누르는 응원 표시.
export async function fetchStampInfo(targetUserId, visitorId) {
  const { count } = await supabase
    .from('profile_stamps')
    .select('id', { count: 'exact', head: true })
    .eq('target_user_id', targetUserId)

  let stampedByMe = false
  if (visitorId) {
    const { data } = await supabase
      .from('profile_stamps')
      .select('id')
      .eq('target_user_id', targetUserId)
      .eq('visitor_id', visitorId)
      .maybeSingle()
    stampedByMe = !!data
  }
  return { count: count || 0, stampedByMe }
}

export async function toggleStamp(targetUserId, visitorId, currentlyStamped) {
  if (currentlyStamped) {
    await supabase.from('profile_stamps').delete().eq('target_user_id', targetUserId).eq('visitor_id', visitorId)
    return false
  }
  await supabase.from('profile_stamps').insert({ target_user_id: targetUserId, visitor_id: visitorId })
  return true
}
