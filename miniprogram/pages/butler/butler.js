
Page({
  data: {
    currentState: 'INIT',
    messages: [],
    inputValue: '',
    isLoading: false,
    lastMessageId: ''
  },

  onLoad() {
    this.addMessage('model', '尊客，欢迎空降魏来海鲜。为了给您今日配货，请问几位用餐？');
  },

  // 状态机逻辑处理
  async handleFlow(text) {
    this.addMessage('user', text);
    this.setData({ isLoading: true });

    // 模拟 AI 逻辑延迟
    setTimeout(() => {
      let response = '';
      let nextState = this.data.currentState;
      let card = null;

      switch(this.data.currentState) {
        case 'INIT':
          response = '收到。请问今日场景：是自己品鉴、高端送礼还是商务宴请？';
          nextState = 'SCENE';
          break;
        case 'SCENE':
          response = '明白了。对于预算或口味（如是否忌口）您有什么特别嘱托吗？';
          nextState = 'KEY_PARAM';
          break;
        case 'KEY_PARAM':
          response = '已经为您拍板最佳方案。请看今日魏来为您选定的组合：';
          nextState = 'DECISION';
          card = {
            decision: '“魏来”直播间特供 · 至尊黑金蟹宴',
            reason: '阿拉斯加帝王蟹配澳洲鲍鱼，商务宴请顶级规格。',
            items: [
              { name: '阿拉斯加帝王蟹', price: 1288, quantity: 1 },
              { name: '澳洲黑边鲍鱼', price: 1580, quantity: 2 }
            ],
            totalPrice: 4448,
            ctaText: '趁鲜下单',
            trustTips: '顺丰冷链 · 不活包赔'
          };
          break;
      }

      this.addMessage('model', response, card);
      this.setData({ 
        currentState: nextState,
        isLoading: false 
      });
    }, 1000);
  },

  addMessage(role, text, card = null) {
    const messages = this.data.messages;
    messages.push({ role, text, recommendationCard: card });
    this.setData({ 
      messages,
      lastMessageId: `msg-${messages.length - 1}`
    });
  },

  onInputConfirm(e) {
    const val = e.detail.value || this.data.inputValue;
    if (!val) return;
    this.setData({ inputValue: '' });
    this.handleFlow(val);
  },

  sendText(e) {
    const val = e.currentTarget.dataset.val;
    this.handleFlow(val);
  }
})
