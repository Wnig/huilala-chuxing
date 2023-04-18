// pages/writeInfo/index.js
import { Server } from '../../utils/request.js'
let server = new Server()
const { $Toast } = require('../../components/base/index');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_first_action: true, //判断是否第一次点
    isHasInfo: false,
    remark: '',
    passengerId: '',
    passengerIndex: '',
    orderCostPrice: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      obj: JSON.parse(options.obj),
      deviceInfo: app.globalData.deviceInfo
    }, () => {
      this.setData({
        orderDetail: this.data.obj.orderDetail,
        allCarInfo: this.data.obj.allCarInfo
      });
    });
    console.log(this.data.obj);
  },

  backPre() {
    wx.navigateBack({
      delta: 1
    });
  },

  //打开
  openMask() {
    this.setData({
      isMask: true
    });
  },

  //关闭
  closeMask() {
    this.setData({
      isMask: false
    });
  },

  //进入选择乘客
  enterPage() {
    wx.navigateTo({
      url: '../choiceUser/index?ind=' + this.data.passengerIndex,
    });
  },

  inputVal(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  submit() {
    if (this.data.is_first_action) {
      this.setData({ is_first_action: false });
      this.data.orderDetail.forEach((item) => {
        item.passengerId = this.data.passengerId
      });

      console.log(this.data.orderDetail);
      console.log(this.data.passengerId);
      if (this.data.passengerId != '') {
        let postData = {
          employeeId: app.globalData.employeeInfo.id,
          outTime: this.data.obj.outTime,
          arriveTime: this.data.obj.arriveTime,
          outAddress: this.data.obj.outAddress,
          arriveAddress: this.data.obj.arriveAddress,
          orderType: this.data.obj.orderType,
          totalPassenger: this.data.obj.totalPassenger,
          totalVehicle: this.data.obj.totalVehicle,
          orderPrice: this.data.obj.orderPrice,
          orderCostPrice: this.data.obj.orderCostPrice,
          remarks: this.data.remark,
          oLng: this.data.obj.oLng,
          oLat: this.data.obj.oLat,
          iLng: this.data.obj.iLng,
          iLat: this.data.obj.iLat,
          passengerId: this.data.passengerId,
          orderDetail: JSON.stringify(this.data.orderDetail),
        };
        console.log(postData);
        server.postRequest('mobile/order/saveOrderInfo', postData, app, res => {
          console.log(res);
          if (res.status) {
            wx.reLaunch({
              url: '../tips/index?id=' + res.data,
            });
          };
        });
      } else {
        $Toast({ content: '请选择乘客', duration: 1.5 })
      };
    };
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
})