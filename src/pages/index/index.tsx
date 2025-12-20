import React from 'react'
import { View as TaroView, Text as TaroText, Image as TaroImage, Button as TaroButton } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'

const View = TaroView as any
const Text = TaroText as any
const Image = TaroImage as any
const Button = TaroButton as any

export default function Index() {

  useLoad(() => {
    Taro.vibrateShort({ type: 'light' })
  })

  const handleStartChat = () => {
    Taro.vibrateShort({ type: 'medium' })
    Taro.showModal({
      title: '魏来海鲜管家',
      content: '尊客，正在为您连线直播间 1对1 专属管家。',
      confirmColor: '#C5A059',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '正在呼叫管家', icon: 'loading' })
        }
      }
    })
  }

  return (
    <View className='container'>
      <View className='header' style={{ paddingTop: (Taro.getSystemInfoSync().statusBarHeight || 0) + 'px' }}>
        <View className='live-tag'>
          <View className='dot'></View>
          <Text className='live-text'>LIVE · 同步直播</Text>
        </View>
        <View className='user-icon'>
           <Text className='icon-text'>WL</Text>
        </View>
      </View>

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
            <Text className='title-sub'>Seafood</Text>
          </View>
          <Text className='slogan'>Beyond the Ocean, Above the Rest</Text>
          <Text className='tagline'>直 播 间 官 方 选 品 店</Text>
        </View>
      </View>

      <View className='footer-card'>
        <View className='card-header'>
          <Text className='card-title'>直播间家人们专属</Text>
          <Text className='card-stat'>在线管家: 2名</Text>
        </View>

        <Button className='ai-btn' onClick={handleStartChat}>
          <Text className='btn-text'>1对1 私人管家咨询</Text>
        </Button>

        <View className='btn-group'>
          <View className='sub-btn'>
            <Text className='sub-btn-text'>逛鱼市</Text>
          </View>
          <View className='sub-btn'>
            <Text className='sub-btn-text'>品鉴录</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
