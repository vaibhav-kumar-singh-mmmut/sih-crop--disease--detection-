import React from 'react'
import DashboardShell from '../../components/DashboardShell'
import OfficerDashboardContent from '../../components/OfficerDashboardContent'

const NAV = [
  { icon: '📊', label: 'Overview & Maps',   active: true  },
  { icon: '✅', label: 'Subsidy Approvals', active: false },
  { icon: '⚙️', label: 'Settings',          active: false },
]

export default function BDODashboard() {
  return (
    <DashboardShell
      title="BDO Block Dashboard"
      icon="🏛️"
      badge="BDO"
      navItems={NAV}
    >
      <OfficerDashboardContent />
    </DashboardShell>
  )
}
