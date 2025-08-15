import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRoom(roomId) {
  const [members, setMembers] = useState([])      // [{id, name, vote, role}]
  const [revealed, setRevealed] = useState(false)
  const [settings, setSettings] = useState({ deck: 'FIB' })
  const [me, setMe] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('pp_user') || 'null')
    if (stored) return stored
    // first tab joining a room becomes host; others are members.
    // naive: look for ?host=1 in URL for forcing host, else default member until presence sync.
    const user = { id: crypto.randomUUID(), name: `Guest-${Math.floor(Math.random()*1000)}`, role: 'member' }
    localStorage.setItem('pp_user', JSON.stringify(user))
    return user
  })
  const channelRef = useRef(null)

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: me.id } }
    })
    channelRef.current = channel

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const list = Object.values(state).flat()
      // Filter out current user from members list to avoid duplication
      const otherMembers = list.filter(m => m.id !== me.id)
      setMembers(otherMembers)
      // Elect host = first lexicographic user id (deterministic, no server)
      const sorted = [...list].sort((a,b) => (a.id < b.id ? -1 : 1))
      const hostId = sorted[0]?.id
      if (hostId && me.id === hostId && me.role !== 'host') {
        // upgrade to host - preserve current name and vote
        const currentMe = list.find(m => m.id === me.id) || me
        track({ ...currentMe, role: 'host' })
      }
    })

    channel.on('broadcast', { event: 'REVEAL' }, () => setRevealed(true))
    channel.on('broadcast', { event: 'RESET' }, () => {
      setRevealed(false)
      vote(null)
    })
    channel.on('broadcast', { event: 'SETTINGS' }, ({ payload }) => {
      setSettings((s) => ({ ...s, ...payload }))
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        track({ ...me, vote: null })
      }
    })

    return () => { channel.unsubscribe() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, me.id])

  const track = (payload) => {
    const ch = channelRef.current
    if (!ch) return
    ch.track(payload)
    // Optimistic local update for "me"
    if (payload.id === me.id) {
      setMe(payload)
      localStorage.setItem('pp_user', JSON.stringify({ id: payload.id, name: payload.name, role: payload.role }))
    }
  }

  const vote = (value) => {
    const ch = channelRef.current
    if (!ch) return
    ch.track({ ...me, vote: value })
  }

  const setName = (newName) => {
    const ch = channelRef.current
    if (!ch) return
    const updatedMe = { ...me, name: newName }
    setMe(updatedMe)
    ch.track(updatedMe)
    // Update local storage
    localStorage.setItem('pp_user', JSON.stringify({ id: updatedMe.id, name: updatedMe.name, role: updatedMe.role }))
  }

  const reveal = () => channelRef.current?.send({ type: 'broadcast', event: 'REVEAL', payload: {} })
  const reset  = () => channelRef.current?.send({ type: 'broadcast', event: 'RESET',  payload: {} })
  const broadcastSettings = (partial) => channelRef.current?.send({ type: 'broadcast', event: 'SETTINGS', payload: partial })

  return { me, members, revealed, vote, reveal, reset, broadcastSettings, settings, setName }
}
