import React, { useState, useEffect } from 'react'
import api, { getOfficerReports, getOfficerStats } from '../services/api'

const DISEASE_OPTIONS = [
  "Tomato___Early_blight",
  "Tomato___Late_blight",
  "Tomato___Tomato_mosaic_virus",
  "Potato___Early_blight",
  "Potato___Late_blight",
  "Apple___Apple_scab",
  "Apple___Black_rot",
  "Rice___Brown_spot",
  "Wheat___Yellow_rust",
  "Healthy",
]

const STATUS_OPTIONS = [
  { value: "PENDING_ML", label: "Pending AI Analysis" },
  { value: "PENDING_EXPERT", label: "Pending Expert Review" },
  { value: "RESOLVED", label: "Resolved / Validated" },
]

export default function OfficerDashboardContent() {
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    total_incidents: 0,
    resolved_percentage: 100,
    active_outbreaks: 0,
    flagged_suspicious: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedDisease, setSelectedDisease] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Map state
  const [hoveredPin, setHoveredPin] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        disease: selectedDisease || undefined,
        status_filter: selectedStatus || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }
      const reportsRes = await getOfficerReports(params)
      const statsRes = await getOfficerStats(params)
      setReports(reportsRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error("Failed to load officer dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedDisease, selectedStatus, startDate, endDate])

  const handleExport = async () => {
    try {
      const response = await api.get('/officer/export', {
        params: {
          disease: selectedDisease || undefined,
          status_filter: selectedStatus || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report_logs_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert("Failed to export logs. Ensure backend server is responsive.")
    }
  }

  // Map plotting logic: convert GPS lat/lng to fit within a 600x320 SVG viewport
  const getMapPoints = () => {
    if (reports.length === 0) return []

    // Find bounding box or use fallback Indian region bounds
    let minLat = 8.0, maxLat = 37.0
    let minLng = 68.0, maxLng = 97.0

    // Zoom into dynamic points if available to make map details clear
    const latitudes = reports.map(r => r.latitude)
    const longitudes = reports.map(r => r.longitude)
    
    if (reports.length > 0) {
      minLat = Math.min(...latitudes) - 0.05
      maxLat = Math.max(...latitudes) + 0.05
      minLng = Math.min(...longitudes) - 0.05
      maxLng = Math.max(...longitudes) + 0.05
    }

    const latRange = maxLat - minLat || 0.1
    const lngRange = maxLng - minLng || 0.1

    return reports.map((r) => {
      // Map coordinates: Longitude -> X (0 to 600), Latitude -> Y (320 to 0)
      const x = ((r.longitude - minLng) / lngRange) * 560 + 20
      const y = 300 - ((r.latitude - minLat) / latRange) * 280

      let color = '#34d399' // Green (resolved)
      if (r.status === 'PENDING_EXPERT') color = '#c084fc' // Purple (expert)
      if (r.status === 'PENDING_ML') color = '#fbbf24' // Yellow (pending ML)
      if (r.is_suspicious) color = '#f87171' // Red (suspicious)

      return { ...r, x, y, color }
    })
  }

  const mapPoints = getMapPoints()

  const STATS_ITEMS = [
    { label: 'Total Incidents', value: stats.total_incidents, sub: 'All logged cases', color: '#4ade80' },
    { label: 'Resolved Rate', value: `${stats.resolved_percentage}%`, sub: 'Target: >90%', color: '#60a5fa' },
    { label: 'Active Outbreaks', value: stats.active_outbreaks, sub: 'Needs action', color: 'var(--color-warning)' },
    { label: 'Flagged Geotags', value: stats.flagged_suspicious, valueColor: '#f87171', sub: 'Audit queues', color: '#ef4444' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {STATS_ITEMS.map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', backgroundColor: card.color }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{card.label}</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: card.valueColor || 'var(--color-text-primary)' }}>{card.value}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Search Filters ── */}
      <div className="glass-card" style={{ padding: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Disease</label>
          <select value={selectedDisease} onChange={(e) => setSelectedDisease(e.target.value)} className="input" style={{ width: '100%' }}>
            <option value="">All Diseases</option>
            {DISEASE_OPTIONS.map(d => <option key={d} value={d}>{d.replace(/___/g, ': ')}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Status</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="input" style={{ width: '100%' }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 130 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" style={{ width: '100%' }} />
        </div>

        <div style={{ flex: 1, minWidth: 130 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" style={{ width: '100%' }} />
        </div>

        <button onClick={handleExport} className="btn" style={{ height: 42, padding: '0 20px', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📥</span> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        
        {/* ── Outbreak Hotspot Map ── */}
        <div className="glass-card" style={{ flex: 1.4, minWidth: 350, padding: 24 }}>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 6 }}>Outbreak Hotspot Map</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Geospatial representation of active crop disease concentrations. Hover over pins for details.
          </p>

          <div style={{ position: 'relative', width: '100%', height: 320, backgroundColor: '#050a07', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            {/* Grid Overlay */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Heat Spot Radiuses */}
              {mapPoints.map((pt) => (
                <circle
                  key={`heat-${pt.id}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.is_suspicious ? 35 : 22}
                  fill={pt.color}
                  opacity={0.12}
                />
              ))}

              {/* Pins */}
              {mapPoints.map((pt) => (
                <circle
                  key={`pin-${pt.id}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPin?.id === pt.id ? 8 : 5}
                  fill={pt.color}
                  stroke="#fff"
                  strokeWidth={hoveredPin?.id === pt.id ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                  onMouseEnter={() => setHoveredPin(pt)}
                  onMouseLeave={() => setHoveredPin(null)}
                />
              ))}
            </svg>

            {/* Empty queue overlay */}
            {mapPoints.length === 0 && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                📍 No coordinate points plotted
              </div>
            )}

            {/* Hover Tooltip Overlay */}
            {hoveredPin && (
              <div style={{ position: 'absolute', top: hoveredPin.y > 150 ? hoveredPin.y - 120 : hoveredPin.y + 15, left: hoveredPin.x > 300 ? hoveredPin.x - 220 : hoveredPin.x + 15, width: 200, padding: 12, background: 'rgba(13,26,20,0.95)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, color: '#fff', fontSize: '0.8rem', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4, marginBottom: 4 }}>
                  Report: {hoveredPin.id.substring(0, 8)}
                </div>
                <div>Disease: {hoveredPin.disease_detected || "Pending"}</div>
                {hoveredPin.confidence && <div>Conf: {Math.round(hoveredPin.confidence * 100)}%</div>}
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: 4 }}>
                  📍 {hoveredPin.latitude.toFixed(4)}, {hoveredPin.longitude.toFixed(4)}
                </div>
                <div style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4, background: hoveredPin.color + '22', color: hoveredPin.color, fontSize: '0.7rem', fontWeight: 'bold', marginTop: 6 }}>
                  {hoveredPin.status}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Submissions Logs Table ── */}
        <div className="glass-card" style={{ flex: 1.6, minWidth: 400, padding: 24 }}>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 20 }}>Incident Log Logs</h3>
          
          <div style={{ overflowX: 'auto', maxHeight: 310 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: 10 }}>ID</th>
                  <th style={{ padding: 10 }}>Diagnosis</th>
                  <th style={{ padding: 10 }}>Location</th>
                  <th style={{ padding: 10 }}>Status</th>
                  <th style={{ padding: 10 }}>Flags</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: 10, color: 'var(--color-text-secondary)' }}>{r.id.substring(0, 8)}</td>
                    <td style={{ padding: 10, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {r.disease_detected || "Pending ML"}
                    </td>
                    <td style={{ padding: 10 }}>{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</td>
                    <td style={{ padding: 10 }}>
                      <span style={{ color: r.status === 'RESOLVED' ? '#4ade80' : '#fbbf24' }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: 10 }}>
                      {r.is_suspicious ? (
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Audit</span>
                      ) : (
                        <span style={{ color: '#4ade80' }}>✓</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No submissions found matching selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
