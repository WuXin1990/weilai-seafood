// Export the configuration object directly as defineAppConfig is not available in the current @tarojs/taro module version.
// This is the standard way to define Taro application configuration across different versions.
export default {
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#01040a',
    navigationBarTitleText: '魏来海鲜',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom'
  }
}
