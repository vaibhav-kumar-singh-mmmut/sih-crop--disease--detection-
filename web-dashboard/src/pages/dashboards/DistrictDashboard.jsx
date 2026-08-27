import React from 'react'
import DashboardShell from '../../components/DashboardShell'
import OfficerDashboardContent from '../../components/OfficerDashboardContent'

const NAV = [
  { icon: '🗺️', label: 'District Overview', active: true  },
  { icon: '📈', label: 'Trend Analysis',    active: false },
]

export default function DistrictDashboard() {
  return (
    <DashboardShell
      title="District / State Dashboard"
      icon="🗺️"
      badge="DISTRICT OFFICIAL"
      navItems={NAV}
    >
      <OfficerDashboardContent />
    </DashboardShell>
  )
}
