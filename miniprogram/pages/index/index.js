
Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    isLiveSyncing: true,
    recommendProducts: [
      { id: 'SKU123', name: '阿拉斯加帝王蟹', price: 1288, tags: ['直播爆款', '鲜活'] },
      { id: 'SKU124', name: '澳洲野生黑边鲍', price: 899, tags: ['滋补', '特大号'] },
      { id: 'SKU125', name: '极地紫海胆', price: 588, tags: ['刺身', '空运'] },
      { id: 'SKU126', name: '蓝鳍金枪鱼', price: 1580, tags: ['大腹', '霜降'] }
    ]
  },

  onLoad: function (options) {
    // 自动触发一次震动反馈，提升仪式感
    wx.vibrateShort({ type: 'light' });
  },

  // 进入 AI 1v1 管家服务
  startAiButler() {
    wx.vibrateShort({ type: 'medium' });
    wx.navigateTo({
      url: '/pages/butler/butler'
    });
  },

  onShareAppMessage: function () {
    return {
      title: '魏来海鲜：直播间家人们的私人海鲜管家',
      path: '/pages/index/index',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=600'
    }
  }
})
