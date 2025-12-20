
import { View, Text, Image, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {

  useLoad(() => {
    console.log('Page loaded.')
  })

  const handleStartChat = () => {
    Taro.vibrateShort({ type: 'medium' })
    Taro.showToast({ title: '正在连接私人管家...', icon: 'none' })
  }

  const goStore = () => {
    Taro.navigateTo({ url: '/pages/store/index' })
  }

  return (
    <View className='container'>
      {/* 顶部直播状态 */}
      <View className='header' style={{ paddingTop: Taro.getSystemInfoSync().statusBarHeight + 'px' }}>
        <View className='live-tag'>
          <View className='dot'></View>
          <Text className='live-text'>LIVE · 正在直播</Text>
        </View>
        <View className='user-icon'>
           <Text className='icon-text'>VIP</Text>
        </View>
      </View>

      {/* 品牌核心区 */}
      <View className='hero-section'>
        <View className='logo-wrap'>
          <Image 
            className='main-img' 
            src='https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=600' 
            mode='aspectFill'
          />
        </View>
        <View className='brand-content'>
          <View className='title-row'>
            <Text className='title-main'>魏来</Text>
            <Text className='title-sub'>海鲜</Text>
          </View>
          <Text className='slogan'>从 直 播 间 到 您 的 舌 尖</Text>
          <Text className='tagline'>深 海 极 鲜 · 私 域 专 供</Text>
        </View>
      </View>

      {/* 底部交互卡片 */}
      <View className='footer-card'>
        <View className='card-header'>
          <Text className='card-title'>粉丝专席</Text>
          <Text className='card-stat'>今日已配货 128 份</Text>
        </View>

        <Button className='ai-btn' onClick={handleStartChat}>
          <Text className='btn-text'>咨询直播间专属管家</Text>
        </Button>

        <View className='btn-group'>
          <View className='sub-btn' onClick={goStore}>
            <Text className='sub-btn-text'>直达鱼市</Text>
          </View>
          <View className='sub-btn'>
            <Text className='sub-btn-text'>食味日志</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
