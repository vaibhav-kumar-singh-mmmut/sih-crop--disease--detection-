/**
 * app/(tabs)/_layout.tsx — Farmer/Pradhan home tab bar.
 * 4 tabs: Home, Scan Crop, My Reports, Weather Alert, Ask Expert.
 * Tab labels are translated to the user's selected language.
 */
import React from 'react'
import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { useLanguage } from '../../context/LanguageContext'
import QueueStatusBanner from '../../components/QueueStatusBanner'

interface TabIconProps {
  emoji:   string
  focused: boolean
}

function TabIcon({ emoji, focused }: TabIconProps) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  )
}

export default function TabsLayout() {
  const { t } = useLanguage()

  return (
    <View style={{ flex: 1 }}>
      <QueueStatusBanner />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d1a14',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 6,
        },
        tabBarActiveTintColor:   '#4ade80',
        tabBarInactiveTintColor: 'rgba(240,253,244,0.35)',
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '700',
          marginTop:  -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('welcome'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('scanCrop'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📸" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('myReports'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: t('weatherAlert'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌦️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ask-expert"
        options={{
          title: t('askExpert'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔬" focused={focused} />,
        }}
      />
    </Tabs>
    </View>
  )
}
