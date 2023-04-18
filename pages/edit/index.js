// pages/deit/index.js
const { $Toast } = require('../../components/base/index');
import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    phone: '',
    company: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let data = options.item ? JSON.parse(options.item) : '';
    this.setData({
      adminId: data ? '' : app.globalData.employeeInfo.id,
      employeeId: data ? data.id : '',
      username: data ? (data.name || data.contactsName) : '',
      phone: data ? (data.wechatPhone || data.contactsPhone) : '',
      company: data ? (data.department || data.workplace) : '',
      isPassenger: options.type == 'ck' ? true : false,
      isEdit: options.types == 'edit' ? true: false, 
      deviceInfo: app.globalData.deviceInfo,
      type: options.type == 'ck' ? '' : data.status, 
    });
  },

  backPre() {
    wx.navigateBack({
      delta: 1
    });
  },

  //输入文本
  inputVal(e) {
    let types = e.currentTarget.dataset.type;
    switch (types) {
      case 'username': this.setData({ username: e.detail.value });
        break;
      case 'phone': this.setData({ phone: e.detail.value });
        break;
      case 'company': this.setData({ company: e.detail.value });
        break;
    };
  },

  submit(e) {
    if (this.data.username == '') {
      $Toast({
        content: '姓名不能为空',
        duration: 1.5
      })
    } else if(this.data.phone == '') {
      $Toast({
        content: '手机号不能为空',
        duration: 1.5
      })
    } else {
      let regPhone = /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57]|19[89])[0-9]{8}$/;
      if (!regPhone.test(this.data.phone)) {
        $Toast({
          content: '请输入正确手机号',
          duration: 1.5
        })
      } else {
        if (this.data.isPassenger) {
          this.getPassenger();
        } else {
          this.getMangeData();
        };
      };
    };
  },

  //管理账号
  getMangeData() {
    let postData = {
      adminId: this.data.adminId,
      employeeId: this.data.employeeId,
      name: this.data.username,
      phone: this.data.phone,
      department: this.data.company,
      type: this.data.isEdit ? 2 : 1, //1：添加，2：修改，3：启用, 4:禁用
    }
    console.log(postData);
    server.postRequest('mobile/employee/managedEmployee', postData, app, res => {
      console.log(res);
      if (res.status) {
        if (res.data.status == '100000') {
          $Toast({ content: '操作成功！', duration: 1.5 })

          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        } else {
          $Toast({ content: res.data.msg, duration: 1.5 })
        }
      } else {
        $Toast({ content: res.msg, duration: 1.5 })
      };
    })
  },

  //管理乘客
  getPassenger() {
    let postData = {      
      employeeId: this.data.adminId,
      passengerId: this.data.employeeId,
      contactsName: this.data.username,
      contactsPhone: this.data.phone,
      workplace: this.data.company,
      type: this.data.isEdit ? 2 : 1, //1：添加，2：修改，3：删除
    }
    console.log(postData);
    server.postRequest('mobile/employee/myPassenger', postData, app, res => {
      console.log(res);
      if (res.status) {
        if (res.data.status == '100000') {
          $Toast({ content: '操作成功！', duration: 1.5 })

          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        } else {
          $Toast({ content: res.data.msg, duration: 1.5 })
        }
      } else {
        $Toast({ content: res.msg, duration: 1.5 })
      };
    })
  },

  isDelete(e) {
    let content = this.data.isPassenger ? '确定删除该乘客吗？' : (this.data.type == '1' ? '确定禁用该账号吗？' : '确定启用该账号吗？');
    wx.showModal({
      title: '提示',
      content: content,
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#FD9105',
      cancelColor: '#666666',
      success: (res)=> {
        if (res.confirm) {
          console.log('用户点击确定')
          if (this.data.isPassenger) {
            this.deletePassenger();
          } else {
            this.deleteManage();
          };
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    }) 
  },

  deleteManage() {
    let postData = {
      adminId: this.data.adminId,
      employeeId: this.data.employeeId,
      name: this.data.username,
      phone: this.data.phone,
      department: this.data.company,
      type: this.data.type == '1' ? 4 : 3, //1：添加，2：修改，3：启用, 4:禁用
    }
    console.log(postData);
    server.postRequest('mobile/employee/managedEmployee', postData, app, res2 => {
      console.log(res2);
      if (res2.status) {
        $Toast({ content: '操作成功！', duration: 1.5 })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 2000);
      } else {
        $Toast({ content: res2.msg, duration: 1.5 })
      };
    })
  },

  deletePassenger() {
    let postData = {
      employeeId: this.data.adminId,
      passengerId: this.data.employeeId,
      contactsName: this.data.username,
      contactsPhone: this.data.phone,
      workplace: this.data.company,
      type: 3, //1：添加，2：修改，3：删除
    }
    console.log(postData);
    server.postRequest('mobile/employee/myPassenger', postData, app, res2 => {
      console.log(res2);
      if (res2.status) {
        $Toast({ content: '操作成功！', duration: 1.5 })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 2000);
      } else {
        $Toast({ content: res2.msg, duration: 1.5 })
      };
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