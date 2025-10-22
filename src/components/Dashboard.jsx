import { useEffect, useState } from 'react'
import API from '../lib/api'

export default function Dashboard() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token')
      const res = await API.get('/report/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setReport(res.data)
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      {!report ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow">
            Total Collected: ${report.totalCollected}
          </div>
          <div className="p-4 bg-white rounded shadow">
            Payments: {report.paymentsCount}
          </div>
        </div>
      )}
    </div>
  )
}