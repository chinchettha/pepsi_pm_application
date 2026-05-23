import { describe, expect, it } from 'vitest'
import { publicSettingsResponseSchema } from './settings.js'

describe('settings schemas', () => {
  it('parses public settings response', () => {
    const parsed = publicSettingsResponseSchema.parse({
      appName: 'PM Pepsi',
      footerText: '© Test',
      primaryColor: '#004C97',
      accentColor: '#E31837',
      successColor: '#34C759',
      warningColor: '#FF9F0A',
      dangerColor: '#E31837',
      infoColor: '#0A84FF',
      themeMode: 'system',
      logoMime: null,
      hasLogo: false,
      hasFavicon: false,
      hasLoginBackground: false,
      maintenance: { enabled: false, message: '' },
      navShellMode: 'sidebar',
      featureIndexeddbOffline: false,
      featureDashboardCharts: false,
      fontFamily: 'sarabun',
      fontSizePreset: 'comfortable',
      fontSizeBasePx: null,
      fontColor: null,
      fontHeadingColor: null,
      fontMutedColor: null,
      logoNavHeightPx: 32,
      logoLoginHeightPx: 56,
      faviconSizePx: 32,
    })
    expect(parsed.appName).toBe('PM Pepsi')
  })
})
