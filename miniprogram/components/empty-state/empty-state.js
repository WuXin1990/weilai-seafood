Component({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的属性为纯数据字段
  },
  
  properties: {
    // 状态标题，例如：暂无订单
    title: {
      type: String,
      value: '暂无数据'
    },
    // 辅助描述，例如：您还没有相关的交易记录
    description: {
      type: String,
      value: '目前这里空空如也'
    },
    // 图标链接（支持本地或远程 URL）
    icon: {
      type: String,
      value: ''
    },
    // 按钮文案，如果不传则不显示按钮
    btnText: {
      type: String,
      value: ''
    }
  },

  data: {
    // 内部私有状态
  },

  methods: {
    /**
     * 按钮点击处理
     */
    onAction() {
      // 增加触感反馈
      if (wx.vibrateShort) {
        wx.vibrateShort({ type: 'light' });
      }
      
      // 触发父组件自定义事件
      this.triggerEvent('action', {
        title: this.data.title
      });
    }
  }
})