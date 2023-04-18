// pages/passenger/index.js
import { Server } from '../../utils/request.js'
let server = new Server()
const { $Toast } = require('../../components/base/index');
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
    passengerId: '',
    isSel: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      ind: options.ind,
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
    data.passengerList.forEach((item, i)=> {
      if(this.data.ind != '') {
        if(this.data.ind == i) {
          item.isSelected = true;
        } else {
          item.isSelected = false;
        };
      } else {
        item.isSelected = false;
      };
    });
    let employeeList = data.passengerList;
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
    this.data.employeeList.forEach((item, i) => {
      // if (i == 0) {
      //   item.isSelected = true;
      // } else {
      //   item.isSelected = false;
      // };
      if (this.data.ind != '') {
        if (this.data.ind == i) {
          item.isSelected = true;
        } else {
          item.isSelected = false;
        };
      } else {
        item.isSelected = false;
      };
    });
    let employeeList = this.data.employeeList

    employeeList = employeeList.concat(data.passengerList)
    this.setData({
      employeeList: employeeList,
      hasMore: data.totalPage > this.data.pageNum + 1 ? true : false,
      pageNum: this.data.pageNum += 1
    })
    this.isLoading = false
  },

  load() {
    this.getPassenger();
  },

  //获取管理乘客列表
  getPassenger() {
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
    let isPassenger = 'ck';
    let url = '';
    if (types == 'edit') {
      let item = JSON.stringify(e.currentTarget.dataset.item);
      url = '&item=' + item;
    };

    wx.navigateTo({
      url: '../edit/index?type=' + isPassenger + '&types=' + types + url,
    })
  },

  //选择乘客
  selectUser(e) {
    let id = e.currentTarget.dataset.id;
    let ind = e.currentTarget.dataset.index;

    let employeeList = this.data.employeeList;

    for (let i = 0; i < employeeList.length; i++) {
      if(i == ind) {
        employeeList[i].isSelected = true;
      } else {
        employeeList[i].isSelected = false;
      };
    };
    
    this.setData({
      employeeList: employeeList,
      passengerId: id,
      ind: ind,
      isSel: true,
    });
    console.log(this.data.employeeList);
  },

  //确定
  choiceUser(e) {
    if(this.data.isSel) {
      //参数传回上一页
      let pages = getCurrentPages();//当前页面
      let prevPage = pages[pages.length - 2];//上一页面

      if (prevPage) {
        prevPage.setData({//直接给上一页面赋值
          passengerId: this.data.passengerId,
          name: this.data.employeeList[this.data.ind].contactsName,
          wechatPhone: this.data.employeeList[this.data.ind].contactsPhone,
          department: this.data.employeeList[this.data.ind].workplace,
          isHasInfo: true,
          passengerIndex: this.data.ind
        });

        wx.navigateBack({
          delta: 1
        });
      };
    } else {
      $Toast({ content: '请选择乘客', duration: 1.5 })
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

      this.getPassengerMore();
    }
  },
})