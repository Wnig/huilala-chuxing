// pages/tips/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      id: options.id,
      deviceInfo: app.globalData.deviceInfo
    });
  },

  backPre() {
    wx.redirectTo({
      url: '../index/index',
    });
  },

  enterPage() {
    wx.redirectTo({
      url: '../order-details/index?id='+ this.data.id,
    });
  },

  preventEvent() { },

  /**
 * 咨询弹层打开
 */
  showPopup() {
    this.setData({ customerService: true })
    this.animation.backgroundColor('rgba(0,0,0,0.6)').step()
    this.animation2.translateY(0).step()
    this.setData({
      popupFade: this.animation.export(),
      popSlide: this.animation2.export()
    })
  },

  /**
 * 咨询弹层关闭
 */
  closePopup() {
    this.animation.backgroundColor('rgba(0,0,0,0)').step()
    this.animation2.translateY('100%').step()
    this.setData({
      popupFade: this.animation.export(),
      popSlide: this.animation2.export()
    })
    setTimeout(() => {
      this.setData({ customerService: false })
    }, 300)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    this.animation2 = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})