
Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    orderId: '',
    totalPrice: '0.00',
    mainItemName: '',
    totalQuantity: 0
  },

  onLoad(options) {
    // 模拟从确认页传递过来的数据
    // 在实际开发中，应通过全局 Store 或上一页的 EventChannel 获取
    const mockOrder = {
      orderId: 'WL' + Date.now().toString().slice(-8),
      totalPrice: options.totalPrice || '4,448.00',
      mainItemName: options.mainItemName || '阿拉斯加帝王蟹',
      totalQuantity: options.totalQuantity || 3
    };

    this.setData(mockOrder);
  },

  onBack() {
    wx.navigateBack();
  },

  // 核心支付逻辑
  async onConfirmPay() {
    wx.vibrateShort({ type: 'medium' });
    
    wx.showLoading({
      title: '正在调起微信支付',
      mask: true
    });

    // 1. 模拟网络请求后端支付参数
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 2. 模拟微信原生支付弹窗
    // 在生产环境使用 wx.requestPayment
    wx.showModal({
      title: '魏来海鲜安全支付',
      content: `确认支付 ¥${this.data.totalPrice}？`,
      confirmText: '指纹支付',
      confirmColor: '#C5A059',
      success: (res) => {
        if (res.confirm) {
          this.handlePaymentSuccess();
        } else {
          wx.hideLoading();
        }
      }
    });
  },

  handlePaymentSuccess() {
    wx.showLoading({ title: '确认支付结果' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.vibrateLong();
      
      // 支付成功后的视觉反馈
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      });

      // 延迟跳转至订单详情或成功页
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index?from=pay_success'
        });
      }, 1500);
    }, 1000);
  }
})
