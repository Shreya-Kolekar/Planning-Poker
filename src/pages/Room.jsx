import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoom } from '../room/useRoom'

const FIB = [0,1,2,3,5,8,13,20,40,100,'?']
const TSHIRT = ['XS','S','M','L','XL','?']

export default function Room() {
  const { roomId } = useParams()
  const nav = useNavigate()
  const { me, members, revealed, vote, reveal, reset, broadcastSettings, settings, setName } = useRoom(roomId)
  const [deck, setDeck] = React.useState('FIB')
  const [editingName, setEditingName] = React.useState(false)
  const [tempName, setTempName] = React.useState(me.name)

  React.useEffect(() => {
    // sync deck via broadcast settings if host changes it
    if (settings?.deck && settings.deck !== deck) setDeck(settings.deck)
  }, [settings, deck])

  React.useEffect(() => {
    setTempName(me.name)
  }, [me.name])

  const deckValues = deck === 'FIB' ? FIB : TSHIRT

  const isHost = me.role === 'host'

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href)
  }

  const changeDeck = (next) => {
    setDeck(next)
    broadcastSettings({ deck: next })
  }

  const handleNameSave = () => {
    if (tempName.trim()) {
      setName(tempName.trim())
      setEditingName(false)
    }
  }

  const handleNameCancel = () => {
    setTempName(me.name)
    setEditingName(false)
  }

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-500" onClick={() => nav('/')}>← Home</button>
          <h1 className="text-xl font-bold">Room {roomId}</h1>
        </div>
        <div className="flex items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave()
                  if (e.key === 'Escape') handleNameCancel()
                }}
                className="px-2 py-1 text-sm border rounded"
                placeholder="Enter your name"
                autoFocus
              />
              <button 
                onClick={handleNameSave}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button 
                onClick={handleNameCancel}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                You: <button 
                  onClick={() => setEditingName(true)}
                  className="hover:underline font-medium"
                >
                  {me.name}
                </button>
                {isHost ? ' (host)' : ''}
              </span>
            </div>
          )}
          <button className="px-3 py-2 rounded-lg border" onClick={copy}>Copy link</button>
          <button
            className="px-3 py-2 rounded-lg border"
            onClick={revealed ? reset : reveal}
            disabled={!isHost && !revealed && true}
            title={!isHost && !revealed ? 'Only host can reveal' : ''}
          >
            {revealed ? 'Reset' : 'Reveal'}
          </button>
        </div>
      </header>

      {/* Members */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Current user card */}
        <div className="rounded-xl border p-3 text-center bg-white border-blue-400">
          <div className={`font-medium truncate ${revealed ? 'text-sm' : 'text-xs opacity-70'}`}>
            {me.name}
          </div>
          <div className="mt-2 text-3xl font-semibold">
            {revealed ? (me.vote ?? '—') : '—'}
          </div>
          {revealed && me.vote != null && (
            <div className="text-xs text-gray-500 mt-1">
              voted {me.vote}
            </div>
          )}
        </div>
        
        {/* Other members */}
        {members.map((m) => (
          <div key={m.id} className="rounded-xl border p-3 text-center bg-white">
            <div className={`font-medium truncate ${revealed ? 'text-sm' : 'text-xs opacity-70'}`}>
              {m.name}
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {revealed ? (m.vote ?? '—') : (m.vote == null ? '—' : '•')}
            </div>
            {revealed && m.vote != null && (
              <div className="text-xs text-gray-500 mt-1">
                voted {m.vote}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deck + Settings */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {deckValues.map((v) => (
            <button
              key={v}
              className="px-4 py-3 rounded-xl border hover:scale-105 transition bg-white"
              onClick={() => vote(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Deck:</span>
          <select
            className="border rounded-lg px-2 py-2 bg-white"
            value={deck}
            onChange={(e) => changeDeck(e.target.value)}
            disabled={!isHost}
            title={!isHost ? 'Only host can change deck' : ''}
          >
            <option value="FIB">Fibonacci</option>
            <option value="TSHIRT">T‑Shirt</option>
          </select>
        </div>
      </div>

      <footer className="pt-8 text-center text-xs text-gray-500">
        <div className="mb-2">
          💡 Click your name to edit it • Built with Supabase Realtime • No login • Share the link to invite
        </div>
      </footer>
    </div>
  )
}
