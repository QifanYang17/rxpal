import { useState } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useStore } from '../../utils/store'
import { useT } from '../../utils/i18n'
import './index.scss'

export default function Profile() {
  const {
    profile, reminders, family, lang,
    toggleReminder, skipReminder, updateSleepTime, updateFontSize, updateAvatar, setLang,
  } = useStore()
  const { t } = useT()

  const fontOpts = [
    { value: 'normal' as const, label: t('profile.fontNormal'), cls: 'font-normal' },
    { value: 'large' as const, label: t('profile.fontLarge'), cls: 'font-large' },
    { value: 'xlarge' as const, label: t('profile.fontXlarge'), cls: 'font-xlarge' },
  ]

  const avatarOpts = [
    { emoji: '👴', label: t('ob.avatar.grandpa') },
    { emoji: '👵', label: t('ob.avatar.grandma') },
    { emoji: '👨', label: t('ob.avatar.male') },
    { emoji: '👩', label: t('ob.avatar.female') },
  ]

  const [expanded, setExpanded] = useState({ reminders: true, family: true, settings: false })
  const [showInvite, setShowInvite] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const toggle = (k: keyof typeof expanded) => setExpanded(p => ({ ...p, [k]: !p[k] }))
  const sorted = [...reminders].sort((a, b) => a.time.localeCompare(b.time))

  const handleCopyCode = () => {
    Taro.setClipboardData({ data: '839271' })
  }

  return (
    <View className='profile'>
      {/* User Card */}
      <View className='user-card'>
        <View className='user-card-deco1' />
        <View className='user-card-deco2' />
        <View className='user-info'>
          <View className='user-avatar' onClick={() => setShowAvatarPicker(true)}>
            <Text>{profile.avatar}</Text>
            <View className='avatar-edit-badge'><Text>✏️</Text></View>
          </View>
          <View>
            <Text className='user-name'>{profile.name}</Text>
            <Text className='user-age'>{t('date.age', { n: profile.age })}</Text>
          </View>
        </View>
        <View className='user-stats'>
          <View className='user-stat'>
            <Text className='user-stat-val'>{sorted.filter(r => r.done).length}</Text>
            <Text className='user-stat-label'>{t('profile.todayDone')}</Text>
          </View>
          <View className='user-stat'>
            <Text className='user-stat-val'>{sorted.filter(r => !r.done && !r.skipped).length}</Text>
            <Text className='user-stat-label'>{t('profile.todayPending')}</Text>
          </View>
          <View className='user-stat'>
            <Text className='user-stat-val'>{family.filter(f => f.bound).length}</Text>
            <Text className='user-stat-label'>{t('profile.familyBound')}</Text>
          </View>
        </View>
      </View>

      {/* Sleep Reminder */}
      <View className='sleep-card'>
        <View className='sleep-card-left'>
          <Text className='sleep-card-emoji'>🌙</Text>
          <View className='sleep-card-info'>
            <Text className='sleep-card-title'>{t('profile.sleepReminder')}</Text>
            <Text className='sleep-card-desc'>{t('profile.sleepDesc')}</Text>
          </View>
        </View>
        <Picker
          mode='time'
          value={profile.sleepReminderTime}
          onChange={(e) => updateSleepTime(e.detail.value)}
        >
          <View className='sleep-card-time'>
            <Text className='sleep-card-time-value'>{profile.sleepReminderTime}</Text>
            <Text className='sleep-card-time-arrow'>▶</Text>
          </View>
        </Picker>
      </View>

      <View className='sections'>
        {/* Reminders */}
        <View className='section'>
          <View className='section-header' onClick={() => toggle('reminders')}>
            <View className='section-header-left'>
              <View className='section-icon-wrap'><Text>🔔</Text></View>
              <Text className='section-title'>{t('profile.reminders')}</Text>
            </View>
            <Text className='section-toggle'>{expanded.reminders ? '▲' : '▼'}</Text>
          </View>
          {expanded.reminders && (
            <View className='section-body'>
              {sorted.length === 0 ? (
                <View style={{ textAlign: 'center', padding: '48rpx 0' }}>
                  <Text style={{ fontSize: '56rpx' }}>🔔</Text>
                  <Text style={{ fontSize: '28rpx', color: '#7a7a7a', display: 'block', marginTop: '12rpx' }}>{t('profile.noReminders')}</Text>
                </View>
              ) : (
                <View className='reminder-list'>
                  {sorted.map(r => (
                    <View key={r.id} className={`rem-item ${r.done ? 'rem-item-done' : r.skipped ? 'rem-item-skipped' : ''}`}>
                      <View
                        className={`rem-check ${r.done ? 'rem-check-done' : ''}`}
                        onClick={() => toggleReminder(r.id)}
                      >
                        {r.done && <Text>✓</Text>}
                      </View>
                      <View className={`rem-icon ${r.type === 'sleep' ? 'rem-icon-sleep' : 'rem-icon-med'}`}>
                        <Text>{r.type === 'sleep' ? '🌙' : '🔔'}</Text>
                      </View>
                      <View className='rem-info'>
                        <View style={{ display: 'flex', alignItems: 'center' }}>
                          <Text className='rem-time'>{r.time}</Text>
                          <Text className={`rem-title ${r.done ? 'rem-title-done' : ''}`}>{r.title}</Text>
                        </View>
                        {r.subtitle && <Text className='rem-subtitle'>{r.subtitle}</Text>}
                        {r.skipped && <Text className='rem-skipped-text'>{t('profile.skipped')}</Text>}
                      </View>
                      {!r.done && (
                        <View
                          className={`rem-skip ${r.skipped ? 'rem-skip-active' : ''}`}
                          onClick={() => skipReminder(r.id)}
                        >
                          <Text>⏭</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Family */}
        <View className='section'>
          <View className='section-header' onClick={() => toggle('family')}>
            <View className='section-header-left'>
              <View className='section-icon-wrap'><Text>👥</Text></View>
              <Text className='section-title'>{t('profile.family')}</Text>
            </View>
            <Text className='section-toggle'>{expanded.family ? '▲' : '▼'}</Text>
          </View>
          {expanded.family && (
            <View className='section-body'>
              <View className='family-list'>
                {family.map(m => {
                  const recent = m.lastSeen && (Date.now() - new Date(m.lastSeen).getTime() < 3600000)
                  return (
                    <View key={m.id} className='fam-card'>
                      <View className='fam-avatar-wrap'>
                        <View className='fam-avatar'><Text>{m.avatar}</Text></View>
                        {recent && <View className='fam-online' />}
                      </View>
                      <View className='fam-info'>
                        <View className='fam-name-row'>
                          <Text className='fam-name'>{m.name}</Text>
                          <Text className='fam-relation'>{m.relation}</Text>
                        </View>
                        {m.lastSeen && <Text className='fam-seen'>{t('profile.lastSeen', { time: m.lastSeen })}</Text>}
                      </View>
                      <View className='fam-view'><Text>{t('profile.view')}</Text></View>
                    </View>
                  )
                })}
              </View>
              <View className='invite-btn' onClick={() => setShowInvite(true)}>
                <Text>👤+</Text>
                <Text>{t('profile.inviteFamily')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings */}
        <View className='section'>
          <View className='section-header' onClick={() => toggle('settings')}>
            <View className='section-header-left'>
              <View className='section-icon-wrap'><Text>⚙️</Text></View>
              <Text className='section-title'>{t('profile.settings')}</Text>
            </View>
            <Text className='section-toggle'>{expanded.settings ? '▲' : '▼'}</Text>
          </View>
          {expanded.settings && (
            <View className='section-body'>
              <View className='settings'>
                {/* Font size */}
                <View>
                  <View className='setting-label'>
                    <Text>{t('profile.fontSize')}</Text>
                  </View>
                  <View className='font-options'>
                    {fontOpts.map(o => (
                      <View
                        key={o.value}
                        className={`font-btn ${o.cls} ${profile.fontSize === o.value ? 'font-btn-active' : ''}`}
                        onClick={() => updateFontSize(o.value)}
                      >
                        <Text>{o.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Language */}
                <View>
                  <View className='setting-label'>
                    <Text>{t('profile.language')}</Text>
                  </View>
                  <View className='font-options'>
                    <View
                      className={`font-btn ${lang === 'zh' ? 'font-btn-active' : ''}`}
                      onClick={() => setLang('zh')}
                    >
                      <Text>中文</Text>
                    </View>
                    <View
                      className={`font-btn ${lang === 'en' ? 'font-btn-active' : ''}`}
                      onClick={() => setLang('en')}
                    >
                      <Text>English</Text>
                    </View>
                  </View>
                </View>

                {/* Tutorial */}
                <View
                  className='export-btn'
                  onClick={() => {
                    Taro.setStorageSync('show_tutorial', 'true')
                    Taro.switchTab({ url: '/pages/home/index' })
                  }}
                >
                  <Text>{t('profile.viewTutorial')}</Text>
                </View>

                {/* Export */}
                <View className='export-btn'>
                  <Text>{t('profile.exportData')}</Text>
                </View>
              </View>

              <View className='version'>
                <Text className='version-text'>{t('profile.version')}</Text>
                <Text className='version-text' style={{ display: 'block', marginTop: '4rpx' }}>{t('app.tagline')}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <View className='modal-mask'>
          <View className='modal-bg' onClick={() => setShowAvatarPicker(false)} />
          <View className='modal'>
            <View className='modal-close' onClick={() => setShowAvatarPicker(false)}>
              <Text>✕</Text>
            </View>
            <Text className='modal-title'>{t('profile.selectAvatar')}</Text>
            <Text className='modal-desc'>{t('profile.selectAvatarDesc')}</Text>
            <View className='avatar-grid'>
              {avatarOpts.map((a) => (
                <View
                  key={a.emoji}
                  className={`avatar-option ${profile.avatar === a.emoji ? 'avatar-option-active' : ''}`}
                  onClick={() => { updateAvatar(a.emoji); setShowAvatarPicker(false) }}
                >
                  <Text className='avatar-option-emoji'>{a.emoji}</Text>
                  <Text className='avatar-option-label'>{a.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <View className='modal-mask'>
          <View className='modal-bg' onClick={() => setShowInvite(false)} />
          <View className='modal'>
            <View className='modal-close' onClick={() => setShowInvite(false)}>
              <Text>✕</Text>
            </View>
            <View className='modal-icon'><Text>👤+</Text></View>
            <Text className='modal-title'>{t('profile.inviteTitle')}</Text>
            <Text className='modal-desc'>{t('profile.inviteDesc')}</Text>
            <View className='modal-code-box'>
              <Text className='modal-code-label'>{t('profile.inviteCode')}</Text>
              <Text className='modal-code'>839271</Text>
            </View>
            <View className='modal-copy-btn' onClick={handleCopyCode}>
              <Text>{t('profile.copyCode')}</Text>
            </View>
            <Text className='modal-hint'>{t('profile.inviteExpiry')}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
