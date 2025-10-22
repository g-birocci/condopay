import { useEffect, useState } from 'react'
import API from '../lib/api'

export default function Residents() {
  const [residents, setResidents] = useState([])

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token')
      const res = await API.get('/residents', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setResidents(res.data)
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Residents</h2>
      <div className="space-y-2">
        {residents.map((r) => (
          <div
            key={r._id}
            className="p-3 bg-white rounded shadow flex justify-between"
          >
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-gray-500">Unit {r.unit}</div>
            </div>
            <div
              className={`px-3 py-1 rounded ${
                r.status === 'Paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {r.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}