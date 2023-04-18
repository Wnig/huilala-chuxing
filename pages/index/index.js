//index.js
const { $Toast } = require('../../components/base/index');
import { Server } from '../../utils/request.js'
let server = new Server()
//获取应用实例
const app = getApp()

Page({
  data: {
    isFinish: false,
    isMask: false,
    myMenu: [{
      id: '0',
      name: '我的订单',
      url: '../order/index',
    }, {
      id: '1',
      name: '账号管理',
      url: '../manage/index?type=zh',
    }, {
      id: '2',
      name: '我的乘客',
      url: '../manage/index?type=ck'
    },
    // {
    //  id: '3',
    //   name: '推荐有奖',
    //   url: ''
    // },
    {
      id: '4',
      name: '官方客服',
      url: ''
    }, {
      id: '5',
      name: '邀请注册',
      url: ''
    }],
    indicatorDots: true,
    interval: 3000,
    duration: 400,
    circular: true,
    current: 1,
    nowData: '',
    week: '',
    isDriver: false,
    employeeTodayTrip: {},
    //订单行程状态（0:订单待派车、1:待出行、2:行程中、3:待评价、4:已完成、5:已取消、6:已退款）
    orderStatus: [{
      status: '1',
      name: '待出行',
    }, {
      status: '2',
      name: '行程中',
    }, {
      status: '3',
      name: '待评价',
    }, {
      status: '4',
      name: '已完成',
    }, {
      status: '5',
      name: '已退款',
    },],
  },

  onLoad: function (options) {
    console.log(options);
    this.setData({
      deviceInfo: app.globalData.deviceInfo,
      isLogin: app.globalData.isLogin != '' ? true : false
    }, () => {
      this.setData({
        isLogin: app.globalData.isLogin,
        initData: app.globalData.initData,
      });
    });
    // wx.getLocation({
    //   success: res => {
    //     console.log(res);
    //     this.setData({
    //       nowLon: res.longitude,
    //       nowLat: res.latitude,
    //     });
    //   }
    // });
  },

  //初始化-判断是否已经登录
  initData() {
    wx.login({
      success: res => {
        console.log(res);
        let postData = {
          appid: app.globalData.appId,
          code: res.code,
          needUser: 'employeeId',
        }
        console.log(postData);
        server.postRequest('mobile/employee/initPage', postData, app, res2 => {
          console.log(res2);
          if (res2.status) {
            this.setData({
              isLogin: (res2.data.jumpPage && res2.data.employeeInfo.status != '0') ? true : false,
              initData: true,
            });

            if (res2.data.jumpPage) {
              app.globalData.employeeInfo.enterpriseId = res2.data.enterpriseId;
              app.globalData.employeeInfo = res2.data.employeeInfo;
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

  setTime() {
    this.getOrderData();
    this.time = setInterval(() => {
      console.log('3:::');
      this.getOrderData();
    }, 30 * 1000 * 60);
  },

  //获取首页订单数据
  getOrderData() {
    let postData = {
      needUser: 'employeeId',
    }
    console.log(postData);
    server.postRequest('mobile/employee/todayTripByEmployee', postData, app, res => {
      console.log(res);
      if (res.data.employeeTodayTrip != '') {
        res.data.employeeTodayTrip.statusText = this.analysisStatus(res.data.employeeTodayTrip.tripStatus);
      };

      this.setData({
        employeeTodayTrip: res.data.employeeTodayTrip,
        vehicleNum: res.data.vehicleNum,
        vehicleUseId: res.data.vehicleUseId,
      });

      console.log(this.data.employeeTodayTrip);
    })
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

  //获取今天的日期时间
  getDate() {
    var l = ["日", "一", "二", "三", "四", "五", "六"];
    var d = new Date().getDay();

    this.setData({
      nowData: this.getdate(),
      week: "星期" + l[d]
    });
  },

  getdate() {
    var now = new Date(),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate();
    return m + "月" + d + "日";
  },

  openMask(e) {
    this.setData({
      isMask: true
    });
  },

  closeMask(e) {
    this.setData({
      isMask: false
    });
  },

  bindMask(e) {
    return;
  },

  enterSearch(e) {
    wx.navigateTo({
      url: '../search/index',
    })
  },

  enterPage(e) {
    console.log(e);
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url,
    })
  },

  enterPage2(e) {
    console.log(e);
    let url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url,
      });
    } else {
      this.closeMask();
      this.showPopup();
    };
  },

  //进入详情页
  enterPage3(e) {
    let id = e.currentTarget.dataset.id;
    let obj = e.currentTarget.dataset.obj;
    let evals = e.currentTarget.dataset.eval;
    wx.navigateTo({
      url: '../orderDetail/index?id=' + id + '&obj=' + JSON.stringify(obj) + '&eval=' + evals,
    });
  },

  callDriver(e) {
    let item = e.currentTarget.dataset.item;
    if (item.tripStatus == '1' || item.tripStatus == '2') {
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.phone
      });
    } else if (item.tripStatus == '3') {
      //行程完成后两小时之后不能打电话
      let updateTime = item.updateDate;
      var now = new Date().getTime();
      var timetamp = new Date(updateTime).getTime();
      var plantamp = 1000 * 60 * 60 * 2 + timetamp;

      if (plantamp > now) {
        wx.makePhoneCall({
          phoneNumber: e.currentTarget.dataset.phone
        });
      };
    };
  },

  callService(e) {
    wx.makePhoneCall({
      phoneNumber: app.globalData.consumerHotline
    });
  },

  isEndOrder(e) {
    wx.showModal({
      title: '提示',
      content: '确定结束该行程吗？',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#FD9105',
      cancelColor: '#666666',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //业务正在拓展中
  waiting() {
    $Toast({
      content: '业务正在拓展中...',
      duration: 1.5
    })
  },

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
              $Toast({ content: '授权成功', duration: 1.5 })
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
* 咨询弹层打开
*/
  showMyLeft() {
    this.setData({ myMask: true })
    this.animation3.backgroundColor('rgba(0,0,0,0.6)').step()
    this.animation4.translateX('0%').step()
    this.setData({
      popupLeftFade: this.animation3.export(),
      popLeftSlide: this.animation4.export()
    })
  },

  /**
 * 咨询弹层关闭
 */
  closeMyLeft() {
    this.animation3.backgroundColor('rgba(0,0,0,0)').step()
    this.animation4.translateX('-100%').step()
    this.setData({
      popupLeftFade: this.animation3.export(),
      popLeftSlide: this.animation4.export()
    })
    setTimeout(() => {
      this.setData({ myMask: false })
    }, 300)
  },

  onReady: function () {
    this.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    this.animation2 = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    this.animation3 = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    this.animation4 = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
  },

  onShow() {
    this.initData();
    this.getDate();
    this.setTime();
  },

  /**
* 页面相关事件处理函数--监听用户下拉动作
*/
  onPullDownRefresh: function () {
    this.initData();
    this.getOrderData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onShareAppMessage: function (e) {
    console.log(e);
    wx.hideShareMenu();
    if (e.from == "button") {
      if (e.target.dataset.types) {
        return {
          from: 'button',
          title: '会拉拉出行',
          path: 'pages/index/index',
          imageUrl: ''
        }
      } else {
        let id = e.target.dataset.id;
        let obj = e.target.dataset.obj;
        let evals = e.target.dataset.eval;

        return {
          from: 'button',
          title: '会拉拉出行',
          path: 'pages/orderDetail/index?id=' + id + '&obj=' + JSON.stringify(obj) + '&eval=' + evals + '&share=yes',
          imageUrl: ''
        }
      };
    }

  }
})
