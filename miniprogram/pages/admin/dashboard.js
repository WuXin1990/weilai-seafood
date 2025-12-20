Page({
  data: {
    // 模拟近 7 日销售趋势
    trendData: [
      { day: '05.15', height: 80 },
      { day: '05.16', height: 120 },
      { day: '05.17', height: 100 },
      { day: '05.18', height: 180 },
      { day: '05.19', height: 140 },
      { day: '05.20', height: 200 },
      { day: '今日', height: 160 }
    ]
  },

  onLoad() {
    // 权限校验逻辑可置于此处
  },

  navToOrders() {
    wx.navigateTo({
      url: '/pages/admin/orders'
    });
  },

  navToStock() {
    wx.navigateTo({
      url: '/pages/admin/inventory'
    });
  }
})