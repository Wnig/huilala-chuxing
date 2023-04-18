// pages/reg/index.js
const { $Toast } = require('../../components/base/index');
import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSelected: false,
    username: '',
    phone: '',
    company: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      phone: options.phone ? options.phone: '',
      wPhone: options.phone ? options.phone : '',
      encryptedData: options.ed ? options.ed : '',
      iv: options.iv ? options.iv : '',
      deviceInfo: app.globalData.deviceInfo
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
      case 'username': this.setData({username: e.detail.value});
        break;
      case 'phone': this.setData({ phone: e.detail.value });
        break;
      case 'company': this.setData({ company: e.detail.value });
        break;
    };

    if (this.data.username != '' && this.data.phone != '' && this.data.company != '' && this.data.isSelected) {
      this.setData({ isFinished: true });
    } else {
      this.setData({ isFinished: false });
    };
  },

  //协议
  rule(e) {
    this.setData({isSelected: !this.data.isSelected});

    if (this.data.username != '' && this.data.phone != '' && this.data.company != '' && this.data.isSelected) {
      this.setData({ isFinished: true });
    } else {
      this.setData({ isFinished: false });
    };
  },

  //完成
  submit(e) {
    if (this.data.username == '' || this.data.phone == '' || this.data.company == '' || !this.data.isSelected) {
      return;
    } else {
      this.setData({ isFinished: true});
      let regPhone = /^[1][3,4,5,7,8,9][0-9]{9}$/;
      if (!regPhone.test(this.data.phone)) {
        $Toast({ content: '请输入正确手机号',duration: 1.5})
      } else {
        wx.login({
          success: res => {
            console.log(res);
            let postData = {
              contactName: this.data.username,
              contactPhone: this.data.phone,
              enterpriseName: this.data.company,
              wechatPhone: this.data.wPhone,
              appid: app.globalData.appId,
              code: res.code,
              encryptedData: this.data.encryptedData,
              iv: this.data.iv,
            }
            console.log(postData);
            server.postRequest('mobile/employee/register', postData, app, res2 => {
              console.log(res2);
              if (res2.status) {
                if (res2.data.status == '100000') {
                  app.globalData.id = res2.data.id;
                  app.globalData.employeeInfo.id = res2.data.id;
                  wx.navigateTo({
                    url: '../index/index?role=' + res2.data.role,
                  });
                  // this.setData({
                  //   isLogin: true
                  // });
                  // app.globalData.employeeInfo = res2.data.employeeInfo;
                  console.log(':::', app.globalData.employeeInfo.id);
                  console.log('::::', app.globalData.employeeInfo);
                  this.initData();
                } else {
                  $Toast({ content: res2.data.msg, duration: 1.5 })
                };
              } else {
                $Toast({ content: res2.msg, duration: 1.5 })
              };
            });
          }
        })

      };
    };
  },

  initData() {
    wx.login({
      success: res => {
        console.log(res);
        let postData = {
          appid: app.globalData.appId,
          code: res.code,
          needUser: 'employeeId',
          // employeeId: app.globalData.employeeInfo.id
        }
        console.log('登录注册::', postData);
        server.postRequest('mobile/employee/initPage', postData, app, res2 => {
          console.log(res2);
          if (res2.status) {
            this.setData({
              isLogin: res2.data.jumpPage ? true : false,
              initData: true,
            });

            if (res2.data.employeeInfo) {
              app.globalData.employeeInfo.enterpriseId = res2.data.enterpriseId;
              app.globalData.employeeInfo = res2.data.employeeInfo;
              app.globalData.employeeInfo.enterpriseName = res2.data.enterpriseName;
              app.globalData.employeeInfo.phone = res2.data.phone;
              app.globalData.employeeInfo.logoUrl = res2.data.logoUrl;
              console.log('globalData:::', app.globalData);
              this.setData({
                role: res2.data.employeeInfo.role,
                name: res2.data.enterpriseName,
                wechatPhone: res2.data.phone,
                logoUrl: res2.data.logoUrl
              });
              console.log('globalData:::', app.globalData);
            };
          } else {
            $Toast({ content: res2.msg, duration: 1.5 })
          };
        })
      },
      fail: function (res) {
        console.log('获取code失败')
      },
      complete: function (res) { },
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
})