/**
 * 腾讯云语音合成工具类
 * 文档：https://cloud.tencent.com/document/product/1073/37995
 * 
 * 使用方式：
 * 1. 通过云函数调用（推荐，安全）
 * 2. 通过自建后端服务调用
 */

class TTSUtil {
  constructor() {
    this.innerAudioContext = null;
    this.useCloudFunction = true; // 是否使用云函数
  }

  /**
   * 语音合成播放
   * @param {String} text - 要合成的文本
   * @param {Object} options - 配置选项
   * @param {Number} options.voiceType - 音色类型，0-女声亲和风格，1-男声成熟风格，默认0
   * @param {Number} options.speed - 语速，-2到2，默认0（正常速度）
   * @param {Number} options.volume - 音量，0到10，默认5
   * @param {String} options.codec - 音频格式，mp3/wav/pcm，默认mp3
   * @param {Number} options.sampleRate - 采样率，16000/8000，默认16000
   * @param {Function} options.success - 成功回调
   * @param {Function} options.fail - 失败回调
   */
  speak(text, options = {}) {
    if (!text) {
      console.error('TTS: 文本不能为空');
      return;
    }

    const {
      voiceType = 0,
      speed = 0,
      volume = 5,
      codec = 'mp3',
      sampleRate = 16000,
      success,
      fail
    } = options;

    // 停止之前的播放
    this.stop();

    // 显示加载提示
    wx.showLoading({
      title: '正在合成语音...',
      mask: true
    });

    // 调用云函数或后端服务
    const apiPromise = this.useCloudFunction 
      ? this.callCloudFunction(text, { voiceType, speed, volume, codec, sampleRate })
      : this.callBackendAPI(text, { voiceType, speed, volume, codec, sampleRate });

    apiPromise
      .then((audioUrl) => {
        wx.hideLoading();
        this.playAudio(audioUrl, success, fail);
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('TTS合成失败', error);
        fail && fail(error);
        
        wx.showToast({
          title: error.message || '语音合成失败',
          icon: 'none',
          duration: 2000
        });
      });
  }

  /**
   * 通过云函数调用腾讯云 TTS API（推荐方式）
   * @param {String} text - 要合成的文本
   * @param {Object} params - 合成参数
   * @returns {Promise<String>} 返回音频URL
   */
  callCloudFunction(text, params) {
    return new Promise((resolve, reject) => {
      // 检查云开发是否初始化
      if (!wx.cloud) {
        reject(new Error('请先初始化云开发'));
        return;
      }

      wx.cloud.callFunction({
        name: 'tencentTTS', // 云函数名称
        data: {
          action: 'textToSpeech',
          text: text,
          voiceType: params.voiceType,
          speed: params.speed,
          volume: params.volume,
          codec: params.codec,
          sampleRate: params.sampleRate
        },
        success: (res) => {
          console.log('云函数调用成功', res);
          if (res.result && res.result.success) {
            // 返回音频文件的临时URL或云存储URL
            resolve(res.result.audioUrl);
          } else {
            reject(new Error(res.result.message || '云函数返回数据格式错误'));
          }
        },
        fail: (error) => {
          console.error('云函数调用失败', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 通过自建后端服务调用腾讯云 TTS API
   * @param {String} text - 要合成的文本
   * @param {Object} params - 合成参数
   * @returns {Promise<String>} 返回音频URL
   */
  callBackendAPI(text, params) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://your-backend-domain.com/api/tts', // 替换为你的后端服务地址
        method: 'POST',
        data: {
          text: text,
          voiceType: params.voiceType,
          speed: params.speed,
          volume: params.volume,
          codec: params.codec,
          sampleRate: params.sampleRate
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data.audioUrl);
          } else {
            reject(new Error(res.data.message || 'API 调用失败'));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 播放音频
   * @param {String} audioUrl - 音频URL
   * @param {Function} success - 成功回调
   * @param {Function} fail - 失败回调
   */
  playAudio(audioUrl, success, fail) {
    // 创建音频上下文
    this.innerAudioContext = wx.createInnerAudioContext();
    
    // 设置音频源
    this.innerAudioContext.src = audioUrl;
    
    // 自动播放
    this.innerAudioContext.autoplay = true;
    
    // 播放开始回调
    this.innerAudioContext.onPlay(() => {
      console.log('TTS开始播放');
      success && success();
    });
    
    // 播放完成回调
    this.innerAudioContext.onEnded(() => {
      console.log('TTS播放完成');
      this.stop();
    });
    
    // 播放错误回调
    this.innerAudioContext.onError((error) => {
      console.error('TTS播放失败', error);
      this.stop();
      fail && fail(error);
    });
  }

  /**
   * 停止播放
   */
  stop() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
      this.innerAudioContext.destroy();
      this.innerAudioContext = null;
    }
  }

  /**
   * 暂停播放
   */
  pause() {
    if (this.innerAudioContext) {
      this.innerAudioContext.pause();
    }
  }

  /**
   * 继续播放
   */
  resume() {
    if (this.innerAudioContext) {
      this.innerAudioContext.play();
    }
  }

  /**
   * 检查是否正在播放
   */
  isPlaying() {
    return this.innerAudioContext && !this.innerAudioContext.paused;
  }

  /**
   * 设置使用云函数还是后端API
   * @param {Boolean} useCloud - true使用云函数，false使用后端API
   */
  setUseCloudFunction(useCloud) {
    this.useCloudFunction = useCloud;
  }
}

// 创建单例
const ttsUtil = new TTSUtil();

module.exports = ttsUtil;
