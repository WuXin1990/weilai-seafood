
Component({
  properties: {
    data: {
      type: Object,
      value: {
        decision: '为您定下的帝王蟹至尊宴',
        reason: '适配6人商务宴请，面子十足。',
        items: [],
        totalPrice: 0,
        ctaText: '就买这个',
        trustTips: '顺丰冷链 · 不活包赔'
      }
    }
  },
  methods: {
    handleOrder() {
      wx.vibrateShort({ type: 'medium' });
      // 触发外部事件，将商品组合加入购物车并跳转确认页
      this.triggerEvent('order', { items: this.data.data.items });
      wx.navigateTo({
        url: '/pages/order/confirm' // 假设的确认下单页
      });
    }
  }
})
