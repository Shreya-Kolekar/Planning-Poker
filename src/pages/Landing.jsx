import React from 'react'
import { useNavigate } from 'react-router-dom'
import { newRoomId } from '../utils/id'

export default function Landing() {
  const nav = useNavigate()
  const [code, setCode] = React.useState('')

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Planning Poker</h1>
        <p className="text-sm text-center text-gray-500">Lightweight realtime estimation rooms</p>

        <button
          onClick={() => nav(`/r/${newRoomId()}`)}
          className="w-full px-4 py-3 rounded-xl border bg-black text-white hover:opacity-90 transition"
        >
          Create Room
        </button>

        <div className="flex items-center gap-2">
          <input
            placeholder="Enter room code (e.g., ABC123)"
            className="flex-1 px-3 py-2 border rounded-xl"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))}
            onKeyDown={(e) => { if (e.key === 'Enter' && code) nav(`/r/${code}`) }}
          />
          <button
            disabled={!code}
            onClick={() => nav(`/r/${code}`)}
            className="px-4 py-2 rounded-xl border disabled:opacity-50"
          >
            Join
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Free, no login. Powered by Supabase Realtime.
        </div>
      </div>
    </div>
  )
}
