export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/onboarding/index',
    'pages/scan/index',
    'pages/timeline/index',
    'pages/medication/index',
    'pages/medication/add',
    'pages/medication/box-scan',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f8f5f0',
    navigationBarTitleText: '此间有序',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f8f5f0',
  },
  tabBar: {
    color: '#ababab',
    selectedColor: '#5b9a7d',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页', iconPath: 'assets/icons/home.png', selectedIconPath: 'assets/icons/home-active.png' },
      { pagePath: 'pages/timeline/index', text: '时间线', iconPath: 'assets/icons/clock.png', selectedIconPath: 'assets/icons/clock-active.png' },
      { pagePath: 'pages/scan/index', text: '识别', iconPath: 'assets/icons/camera.png', selectedIconPath: 'assets/icons/camera-active.png' },
      { pagePath: 'pages/medication/index', text: '用药', iconPath: 'assets/icons/pill.png', selectedIconPath: 'assets/icons/pill-active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'assets/icons/user.png', selectedIconPath: 'assets/icons/user-active.png' },
    ],
  },
  cloud: true,
})
