import React from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardShell from '../../components/DashboardShell'
import OfficerDashboardContent from '../../components/OfficerDashboardContent'

const NAV = [
  { icon: '🗺️', label: 'Hotspot Map',   active: true  },
  { icon: '⛺', label: 'Schedule Camp', active: false },
]

export default function OfficerDashboard() {
  const { role } = useAuth()
  const isHort = role === 'HORTICULTURE_OFFICER'

  return (
    <DashboardShell
      title={isHort ? 'Horticulture Officer Dashboard' : 'Agriculture Officer Dashboard'}
      icon={isHort ? '🍎' : '🌾'}
      badge={isHort ? 'HORT. OFFICER' : 'AGRI. OFFICER'}
      navItems={NAV}
    >
      <OfficerDashboardContent />
    </DashboardShell>
  )
}
