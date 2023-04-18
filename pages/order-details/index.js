// pages/order-details/index.js
import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderStatus: [{
      status: '1',
      name: '待签约',
    }, {
      status: '2',
      name: '待派车',
    }, {
      status: '3',
      name: '行程中',
    }, {
      status: '4',
      name: '待结算',
    }, {
      status: '5',
      name: '已完成',
    }, {
      status: '6',
      name: '已取消',
    },],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      orderId: options.id,
      deviceInfo: app.globalData.deviceInfo
    }, ()=> {
      this.getDetail();
    });
  },

  backPre() {
    //参数传回上一页
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面

    if (prevPage) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.redirectTo({
        url: '../order/index',
      });
    };
  },

  getDetail() {
    let postData = {
      orderId: this.data.orderId
    };
    server.postRequest('mobile/employee/orderDetail', postData, app, res => {
      console.log(res);
      res.data.statusText = this.analysisStatus(res.data.orderStatus);
      this.setData({
        list: res.data,
        initData: true
      });
    });
  },

  /**
 * 根据订单状态码规则计算当前订单状态
 */
  analysisStatus(sta) {
    console.log(sta);
    let CONTENT
    this.data.orderStatus.forEach(item => {
      if (item.status == sta) CONTENT = item.name
    })
    return CONTENT
  },

  enterPage(e) {
    let id = this.data.orderId;
    wx.navigateTo({
      url: '../detail/index?id='+ id,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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