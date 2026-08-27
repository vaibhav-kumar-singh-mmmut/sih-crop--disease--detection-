import React, { useEffect, useState } from 'react'
import DashboardShell from '../../components/DashboardShell'
import { getExpertQueue, getExpertStats, validateReport } from '../../services/api'

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

export default function ExpertDashboard() {
  const [queue, setQueue] = useState([])
  const [stats, setStats] = useState({ pending_count: 0, validated_count: 0, retrain_count: 0 })
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [correctedDisease, setCorrectedDisease] = useState("")
  const [expertNotes, setExpertNotes] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const queueRes = await getExpertQueue()
      const statsRes = await getExpertStats()
      setQueue(queueRes.data)
      setStats(statsRes.data)
    } catch (err) {
      setErrorMsg("Failed to load queue from API. Ensure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenReview = (report) => {
    setSelectedReport(report)
    setCorrectedDisease(report.disease_detected || DISEASE_OPTIONS[0])
    setExpertNotes("")
    setSuccessMsg(null)
  }

  const handleCloseReview = () => {
    setSelectedReport(null)
    setCorrectedDisease("")
    setExpertNotes("")
  }

  const handleValidate = async (confirmAI = false) => {
    if (!selectedReport) return
    setSubmitLoading(true)
    setErrorMsg(null)

    const payload = {
      corrected_disease: confirmAI ? selectedReport.disease_detected || "Healthy" : correctedDisease,
      expert_notes: confirmAI ? "Confirmed AI prediction." : expertNotes,
    }

    try {
      await validateReport(selectedReport.id, payload)
      setSuccessMsg(`Report ${selectedReport.id.substring(0, 8)} validated successfully!`)
      handleCloseReview()
      await loadData() // refresh queue and stats
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Validation failed. Try again.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const NAV = [
    { icon: '🔬', label: 'Validation Queue', active: true },
    { icon: '📊', label: 'Overview Stats', active: false },
  ]

  const STATS_CARDS = [
    { label: 'Pending Review', value: stats.pending_count, sub: 'Needs verification', color: 'var(--color-warning)' },
    { label: 'Validated Total', value: stats.validated_count, sub: 'Reviewed cases', color: 'var(--color-success)' },
    { label: 'Retraining Dataset', value: stats.retrain_count, sub: 'Expert corrected', color: 'var(--color-info)' },
  ]

  return (
    <DashboardShell
      title="KVK / Lab Expert Dashboard"
      icon="🔬"
      badge="KVK EXPERT"
      navItems={NAV}
      statCards={STATS_CARDS}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {errorMsg && (
          <div className="glass-card" style={{ padding: 16, borderColor: 'var(--color-error)', color: '#ef4444' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="glass-card" style={{ padding: 16, borderColor: 'var(--color-success)', color: '#4ade80' }}>
            {successMsg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ color: 'var(--color-success)', fontSize: '1.2rem' }}>Loading Expert Queue...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            
            {/* ── Left side: Queue table/list ── */}
            <div className="glass-card" style={{ flex: 2, minWidth: 400, padding: 24 }}>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 20 }}>Verification Queue ({queue.length})</h3>
              
              {queue.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  🎉 No pending validations! The queue is clean.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}>
                        <th style={{ padding: 12 }}>Image</th>
                        <th style={{ padding: 12 }}>Scan Details</th>
                        <th style={{ padding: 12 }}>AI Prediction</th>
                        <th style={{ padding: 12 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((report) => (
                        <tr key={report.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: 12 }}>
                            <img
                              src={`http://localhost:8000${report.image_path}`}
                              alt="Scan"
                              style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                          </td>
                          <td style={{ padding: 12, verticalAlign: 'middle' }}>
                            <div style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                              Report: {report.id.substring(0, 8)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                              📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                            </div>
                            {report.is_suspicious && (
                              <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', marginTop: 4 }}>
                                ⚠️ Geotag Warning
                              </div>
                            )}
                          </td>
                          <td style={{ padding: 12 }}>
                            <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                              {report.disease_detected || "Pending Analysis"}
                            </div>
                            {report.confidence && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                Conf: {Math.round(report.confidence * 100)}%
                              </div>
                            )}
                          </td>
                          <td style={{ padding: 12 }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleOpenReview(report)}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Right side: Review Details card ── */}
            {selectedReport && (
              <div className="glass-card" style={{ flex: 1.2, minWidth: 320, padding: 24, height: 'fit-content' }}>
                <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 16 }}>Validate Scan</h3>
                
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <img
                    src={`http://localhost:8000${selectedReport.image_path}`}
                    alt="Active Scan"
                    style={{ width: '100%', maxHeight: 200, borderRadius: 12, objectFit: 'contain', backgroundColor: '#050a07' }}
                  />
                  {selectedReport.is_suspicious && (
                    <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 8, marginTop: 10, textAlign: 'left' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>⚠️ Audit Flag:</span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{selectedReport.suspicion_reason}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Correct Diagnostic Label
                    </label>
                    <select
                      className="input"
                      value={correctedDisease}
                      onChange={(e) => setCorrectedDisease(e.target.value)}
                      style={{ width: '100%', padding: 10, background: '#0e1611', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {DISEASE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt.replace(/___/g, ': ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Expert Observations &amp; Notes
                    </label>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Write notes about crop disease, foliage density or fungicide suggestions..."
                      value={expertNotes}
                      onChange={(e) => setExpertNotes(e.target.value)}
                      style={{ width: '100%', padding: 10, background: '#0e1611', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: 12 }}
                      onClick={() => handleValidate(false)}
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Submitting..." : "Submit Override"}
                    </button>
                    <button
                      className="btn"
                      style={{ flex: 1, padding: 12, backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80', borderColor: 'rgba(74,222,128,0.2)' }}
                      onClick={() => handleValidate(true)}
                      disabled={submitLoading}
                    >
                      Confirm AI
                    </button>
                  </div>

                  <button
                    className="btn"
                    style={{ padding: 10, border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}
                    onClick={handleCloseReview}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </DashboardShell>
  )
}
