const { $Toast } = require('../../components/base/index');
import restUrl from '../../config/requestUrl.js'
import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()

Component({
  properties: {
    item: {
      type: Object,
      value: {},
    },
    mode: {
      type: String,
      value: '',
    },
  },
  data: {
    phone: '',
    isGet: false,
  },
  methods: {    
    getPhoneNumber(e) {
      console.log(e);
      if (e.detail.errMsg == "getPhoneNumber:ok") {
        wx.login({
          success: res => {
              this.setData({
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
              });
              let postData = {
                appid: app.globalData.appId,
                code: res.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
              }
              console.log(postData);
              server.postRequest('mobile/employee/authorizePhone', postData, app, res2 => {
                console.log(res2);
                if (res2.status) {
                  this.setData({
                    phone: res2.data,
                    isGet: true
                  });
                  $Toast({content: '授权成功',duration: 1.5})
                  this.login();
                } else {
                  $Toast({ content: res2.msg, duration: 1.5 })
                };
              })          
          }
        })
      };
    },

    login() {
      wx.login({
        success: res => {
          console.log(res);
          let postData = {
            phone: this.data.phone,
            appid: app.globalData.appId,
            code: res.code,
            encryptedData: this.data.encryptedData,
            iv: this.data.iv,
          }
          console.log(postData);
          server.postRequest('mobile/employee/login', postData, app, res2 => {
            console.log(res2);
            if (res2.data.status == "100002") {
              wx.navigateTo({
                url: '../reg/index?phone=' + this.data.phone + '&ed=' + this.data.encryptedData + '&iv=' + this.data.iv,
              });
            } else if (res2.data.status == "100000") {
              console.log('登录成功:::');
              this.setData({
                isLogin: true
              });
              app.globalData.isLogin = true;
              app.globalData.employeeInfo.id = res2.data.id;
              this.initData();
            };
          })  
        }
      });  
    },

    initData() {
      wx.login({
        success: res => {
          console.log(res);
          let postData = {
            appid: app.globalData.appId,
            code: res.code,
            needUser: 'employeeId',
          }
          console.log('登录注册::', postData);
          server.postRequest('mobile/employee/initPage', postData, app, res2 => {
            console.log(res2);
            if (res2.status) {
              this.setData({
                isLogin: res2.data.jumpPage ? true : false,
                initData: true,
              });
              app.globalData.isLogin = res2.data.jumpPage ? true : false;
              console.log('isLogin:' , this.data.isLogin);
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
  },
});
