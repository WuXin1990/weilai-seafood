
Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    recommendData: {
      decision: '魏来直播间特供 · 至尊黑金蟹宴',
      reason: '阿拉斯加帝王蟹配澳洲鲍鱼，商务宴请顶级规格。',
      items: [
        { name: '阿拉斯加帝王蟹', price: 1288, quantity: 1, id: 'king-crab-01' },
        { name: '澳洲野生黑边鲍鱼', price: 1580, quantity: 2, id: 'abalone-01' }
      ],
      totalPrice: 4448
    }
  },

  onLoad(options) {
    // 逻辑：从全局状态或上级页面接收 AI 推荐数据
    // const eventChannel = this.getOpenerEventChannel();
    // eventChannel.on('acceptRecommendData', (data) => {
    //   this.setData({ recommendData: data });
    // });
  },

  onBack() {
    wx.navigateBack();
  },

  // 立即支付逻辑
  async onPay() {
    wx.vibrateShort({ type: 'medium' });
    wx.showLoading({ title: '安全支付中...', mask: true });

    try {
      // 模拟调用微信支付接口
      // const res = await wx.requestPayment({...});
      
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({ title: '支付成功', icon: 'success' });
        // 跳转成功页或订单详情
        // wx.redirectTo({ url: '/pages/order/success' });
      }, 1500);
    } catch (e) {
      wx.hideLoading();
      wx.showModal({ title: '支付中断', content: '订单已保留在待支付中', showCancel: false });
    }
  },

  // 微调逻辑：弹出修改面板或返回对话
  onAdjust() {
    wx.showActionSheet({
      itemList: ['修改商品数量', '更换规格', '重新咨询 AI 管家'],
      success: (res) => {
        if (res.tapIndex === 2) {
          wx.navigateBack(); // 返回对话继续调优
        } else {
          wx.showToast({ title: '请在下个版本体验手动微调', icon: 'none' });
        }
      }
    });
  }
})
