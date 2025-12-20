Page({
  data: {
    activeTab: 0,
    categories: ['精选推荐', '活鲜水产', '尊爵蟹类', '高端刺身'],
    products: [
      {
        id: '1',
        name: '阿拉斯加帝王蟹 (3.5kg+)',
        price: '2,580',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=600&auto=format&fit=crop',
        isLive: true
      },
      {
        id: '2',
        name: '日本蓝鳍金枪鱼大腹 500g',
        price: '1,280',
        image: 'https://images.unsplash.com/photo-1501595091296-3a9f4fe68241?q=80&w=600&auto=format&fit=crop',
        isLive: false
      },
      {
        id: '3',
        name: '澳洲黑边野生鲍鱼 2只装',
        price: '899',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop',
        isLive: false
      },
      {
        id: '4',
        name: '新西兰长寿鱼 鲜冻直供',
        price: '198',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop',
        isLive: true
      }
    ]
  },

  onLoad() {
    // 页面初始化
  },

  // 切换分类
  switchTab(e) {
    const { index } = e.currentTarget.dataset;
    if (this.data.activeTab !== index) {
      this.setData({
        activeTab: index
      });
      // 此处可增加重新加载对应类目商品数据的逻辑
      wx.vibrateShort({ type: 'light' });
    }
  },

  // 进入详情页（假设详情页是原生页面）
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
})