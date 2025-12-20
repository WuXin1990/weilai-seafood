
Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    // AI 复购推荐数据：根据上一次购买自动匹配搭配方案
    upsellData: {
      decision: '管家私藏 · 伴餐珍馐',
      reason: '顶级海鲜的最佳拍档，提鲜解腻。',
      items: [
        { name: '五年陈酿海鲜姜醋', price: 68, quantity: 1, id: 'vinegar-01' },
        { name: '手作解腻乌龙茗茶', price: 128, quantity: 1, id: 'tea-01' }
      ],
      totalPrice: 196,
      ctaText: '顺便带走',
      trustTips: '随主单发出 · 免额外邮费'
    }
  },

  goHome() {
    wx.vibrateShort({ type: 'light' });
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  contactSupport() {
    wx.vibrateShort({ type: 'light' });
    // 调起微信原生客服聊天或拨打电话
    wx.showActionSheet({
      itemList: ['在线联络管家', '拨打 VIP 专线'],
      success: (res) => {
        if (res.tapIndex === 1) {
          wx.makePhoneCall({ phoneNumber: '400-888-6666' });
        }
      }
    });
  },

  handleQuickBuy(e) {
    const items = e.detail.items;
    wx.showToast({
      title: '已加入待支付',
      icon: 'none'
    });
    // 实际逻辑应为：静默加入购物车并直接调起一次轻量支付
    console.log('引导复购商品:', items);
  }
})
