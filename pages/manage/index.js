// pages/passenger/index.js
import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    employeeList: [],
    initData: true,
    pageNum: 0,
    pageSize: 10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isPassenger: options.type == 'ck' ? true : false,
      deviceInfo: app.globalData.deviceInfo
    });
  },

  backPre() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
* 初始化数据回调函数
*/
  _initDataCallback(data) {
    console.log('列表数据', data)
    let employeeList = this.data.isPassenger? data.passengerList : data.employeeList;

    this.setData({
      employeeList: employeeList,
      initData: true,
      hasMore: data.totalPage > this.data.pageNum + 1 ? true : false,
      pageNum: this.data.pageNum += 1
    })
  },

  /**
   * 加载更多数据
   */
  getMoreCallback(data) {
    let employeeList = this.data.employeeList

    employeeList = this.data.isPassenger ? employeeList.concat(data.passengerList) : employeeList.concat(data.employeeList)
    this.setData({
      employeeList: employeeList,
      hasMore: data.totalPage > this.data.pageNum + 1 ? true : false,
      pageNum: this.data.pageNum += 1
    })
    this.isLoading = false
  },

  load() {
    if (this.data.isPassenger) {
      this.getPassenger();
    } else {
      this.getMangeData();
    };
  },

  //获取管理账号列表
  getMangeData() {
    let postData = {
      adminId: app.globalData.employeeInfo.id,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    console.log(postData);
    server.postRequest('mobile/employee/employeeInfo', postData, app, res => {
      console.log(res);
      this._initDataCallback(res.data)
    });
  },

  //获取管理乘客列表
  getPassenger(){
    let postData = {
      employeeId: app.globalData.employeeInfo.id,
      // passengerId:,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    console.log(postData);
    server.postRequest('mobile/employee/passengerInfo', postData, app, res => {
      console.log(res);
      this._initDataCallback(res.data)
    });
  },

  //获取管理账号列表
  getMangeDataMore() {
    let postData = {
      adminId: app.globalData.employeeInfo.id,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    console.log(postData);
    server.postRequest('mobile/employee/employeeInfo', postData, app, res => {
      console.log(res);
      this.getMoreCallback(res.data)
    });
  },

  //获取管理乘客列表
  getPassengerMore() {
    let postData = {
      employeeId: app.globalData.employeeInfo.id,
      // passengerId:,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    };
    console.log(postData);
    server.postRequest('mobile/employee/passengerInfo', postData, app, res => {
      console.log(res);
      this.getMoreCallback(res.data)
    });
  },

  enterPage(e) {
    console.log(e);
    let types = e.currentTarget.dataset.types;
    let isPassenger = this.data.isPassenger ? 'ck': 'zh';
    let url = '';
    if (types == 'edit') {
      let item = JSON.stringify(e.currentTarget.dataset.item);
      url = '&item=' + item;
    };
    
    wx.navigateTo({
      url: '../edit/index?type=' + isPassenger + '&types=' + types + url,
    })
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
    this.setData({
      employeeList: [],
      pageNum: 0,
    });
    this.load();
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
    if (this.data.hasMore && !this.isLoading) {
      this.isLoading = true

      if (this.data.isPassenger) {
        this.getPassengerMore();
      } else {
        this.getMangeDataMore();
      };
    }
  },
})