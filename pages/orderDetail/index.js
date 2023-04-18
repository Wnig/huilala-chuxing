// pages/orderDetail/index.js
// 引入SDK核心类
var QQMapWX = require('../../sdk/qqmap-wx-jssdk.js');

// 实例化API核心类
var map = new QQMapWX({
  key: 'XYUBZ-WOHH6-H3CSA-MDFDH-FWHHF-TLBKG' // 必填
});

import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    scale: 13,
    polyline: [],
    showLocation: true,
    nowLen: 0, //当前文字长度
    textareaValue: '',
    evaluateArr: [{
      name: '车内整洁',
    }, {
      name: '活地图认路准',
    }, {
      name: '驾驶平稳',
    }, {
      name: '态度好服务棒'
    }],
    isEva: false, //是否已评价
    isEvaluate: false, //评价是否填写完整
    label: [],
    point: [],
    nowLon: '',
    nowLat: '',
    lastLon: '',
    lastLat: '',
    nextLon: '',
    nextLat: '',
    pointArr: [],
    distance: [],
    markers: [],
    isUp: false,
    isStart: false,
    rotate: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    //参数传回上一页
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面  

    this.setData({
      isPre: prevPage ? true : false,
      isShare: options.share ? true : false,
      eval: options.eval,
      obj: JSON.parse(options.obj),
      deviceInfo: app.globalData.deviceInfo
    }, () => {
      this.setData({
        initData: true
      });
    });

    console.log(this.data.obj);

    this.data.markers = [{
      iconPath: "/images/start.png",
      id: 0,
      latitude: (this.data.obj.tripStatus != '1' && this.data.obj.tripStatus != '2') ? this.data.obj.actualOutLat : this.data.obj.outLat,
      longitude: (this.data.obj.tripStatus != '1' && this.data.obj.tripStatus != '2') ? this.data.obj.actualOutLon : this.data.obj.outLon,
      width: 34,
      height: 34,
    }, {
      iconPath: "/images/end.png",
      id: 1,
      latitude: (this.data.obj.tripStatus != '1' && this.data.obj.tripStatus != '2') ? this.data.obj.actualArriveLat : this.data.obj.arriveLat,
      longitude: (this.data.obj.tripStatus != '1' && this.data.obj.tripStatus != '2') ? this.data.obj.actualArriveLon : this.data.obj.arriveLon,
      width: 34,
      height: 34
    },];

    this.setData({
      markers: this.data.markers
    });

    console.log('markers:::', this.data.markers);
    this.setData({
      isUp: (this.data.obj.tripStatus != '1' && this.data.tripStatus != '2') ? true : false,
    });

    console.log(this.data.obj);
    if (this.data.eval == 'yes') {
      if (this.data.obj.tripStatus == '3') {
        this.setData({
          isMask: true,
          isMasks: false
        });
      };
      if (this.data.obj.tripStatus == '4') {
        this.setData({
          isMask: false,
          isMasks: true
        });
      };
    } else {
      this.setData({
        isMask: false,
        isMasks: false
      });
    };
    this.setData({
      isEva: this.data.obj.tripStatus != '3' ? true : false
    });
    if (this.data.obj.tripStatus == '1') {
      this.setData({
        scale: 14,
        nowLon: this.data.obj.outLon,
        nowLat: this.data.obj.outLat,
      });
      this.route();
    };
    if (this.data.obj.tripStatus == '2') {
      this.setData({
        scale: 15,
        nowLon: this.data.obj.outLon,
        nowLat: this.data.obj.outLat,
        showLocation: false
      });
      this.connectRoute();
    };
    if (this.data.obj.tripStatus == '3') {
      this.setData({
        scale: 14,
        nowLon: this.data.obj.actualOutLon,
        nowLat: this.data.obj.actualOutLat,
      });
      // this.getDriverRoute();
      this.route();
      this.getEvalLabel();
    };
    if (this.data.obj.tripStatus == '4') {
      this.setData({
        scale: 14,
        nowLon: this.data.obj.actualOutLon,
        nowLat: this.data.obj.actualOutLat,
      });
      // this.getDriverRoute();
      this.route();
      this.getEvalData();
    };

  },

  backPre() {
    this.socketRefresh = true
    // 退出页面关掉socket连接并销毁音频播放控制器
    wx.navigateBack({
      delta: 1
    }, () => {
      wx.closeSocket()
    });
  },

  moveToLocation: function () {
    this.mapCtx.moveToLocation();
  },

  //计算两点之间的角度
  calcAngle(px1, py1, px2, py2) {
    //两点的x、y值
    var x = px2 - px1;
    var y = py2 - py1;
    var hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    //斜边长度
    var cos = x / hypotenuse;
    var radian = Math.acos(cos);
    //求出弧度
    var angle = 180 / (Math.PI / radian);
    //用弧度算出角度
    if (y < 0) {
      angle = -angle;
    } else if ((y == 0) && (x < 0)) {
      angle = 180;
    }
    return angle;
  },

  //计算距离
  //公式计算（经纬度）
  distance: function (la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;
    console.log("计算结果", s)
    this.setData({
      distance: s
    })
  },

  //获取评价标签
  getEvalLabel() {
    let postData = {
      flag: '1', //乘客评价司机
    };
    server.postRequest('mobile/order/evaluateLabel', postData, app, res => {
      console.log(res.data);
      res.data.forEach((item) => {
        item.isSelect = false;
      });
      this.setData({
        evaluateArr: res.data
      });
    });
  },

  //显示已评价信息
  getEvalData() {
    let postData = {
      orderDetailId: this.data.obj.id,
      evaluateUserId: this.data.obj.employeeId, //（评价人id）
      evaluatedUserId: this.data.obj.driverId, //（被评价人id）
    };

    server.postRequest('mobile/order/evaluateInfo', postData, app, res => {
      console.log(res.data);
      this.setData({
        evalObj: res.data
      });
    });
  },

  /**
* socket连接路线
*/
  connectRoute() {
    wx.showLoading({
      title: '正在连接..',
    })
    wx.connectSocket({
      url: 'ws://abc.smartmapdt.com/huizhan/mobile/websocket/' + this.data.obj.id,
      success: res => {
        console.log('socket连接', res)
      }
    })
  },

  //显示隐藏详情
  isUpDown() {
    this.setData({
      isUp: !this.data.isUp
    });
  },

  //路线规划
  route() {
    //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
    wx.request({
      url: 'https://apis.map.qq.com/ws/direction/v1/driving/?from=' + this.data.markers[0].latitude + ',' + this.data.markers[0].longitude + '&to=' + this.data.markers[1].latitude + ',' + this.data.markers[1].longitude + '&heading=175&output=json&callback=cb&key=XYUBZ-WOHH6-H3CSA-MDFDH-FWHHF-TLBKG',
      success: (res) => {
        console.log(res);
        let coors = res.data.result.routes[0].polyline
        for (var i = 2; i < coors.length; i++) {
          coors[i] = coors[i - 2] + coors[i] / 1000000
        }
        // console.log(coors)
        //划线
        var b = [];
        for (var i = 0; i < coors.length; i = i + 2) {
          b[i / 2] = {
            latitude: coors[i],
            longitude: coors[i + 1]
          };
          // console.log(b[i / 2])
        }
        this.setData({
          b: b,
          polyline: [{
            points: b,
            color: "#BBBBBB",
            width: 5,
            dottedLine: false
          }],
        })
      }
    })
  },

  //司机路线显示
  getDriverRoute() {
    let pointArr = [];
    let lastLon = '';
    let lastLat = '';
    let nextLon = '';
    let nextLat = '';
    this.data.obj.lonLatList.forEach((item, i) => {
      item.latitude = item.lat;
      item.longitude = item.lon;
      if (i == 0) {
        lastLon = item.lon;
        lastLat = item.lat;
        nextLon = item.lon;
        nextLat = item.lat;
        pointArr.push({
          latitude: item.lat,
          longitude: item.lon
        });
      } else {
        if (lastLon != nextLon && lastLat != nextLat) {
          lastLon = nextLon;
          lastLat = nextLat;
          nextLon = item.lon;
          nextLat = item.lat;
          pointArr.push({
            latitude: item.lat,
            longitude: item.lon
          });
        };
      };
    });
    console.log(pointArr);
    this.setData({
      polyline: [{
        points: pointArr,
        color: '#39C67D',
        width: 4,
        dottedLine: false
      }],
    })
  },

  preventEvent() { },

  maskcon() {
    return;
  },

  openMask() {
    if (this.data.isEva) {
      this.setData({
        isMask: false,
        isMasks: true
      });
    } else {
      this.setData({
        isMask: true,
        isMasks: false
      });
    };
  },

  closeMask() {
    this.setData({
      isMask: false,
      isMasks: false
    });
  },

  cancelOrder() {
    wx.showModal({
      title: '提示',
      content: '确定取消该行程吗？',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#FD9105',
      cancelColor: '#666666',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          let postData = {
            employeeFlag: '2',
            orderDetailId: this.data.obj.id,
          }
          server.postRequest('mobile/employee/employeeUpdateStatus', postData, app, res2 => {
            console.log(res2);
            if (res2.status) {
              if (res2.data.status == "100000") {
                this.setData({
                  ['obj.tripStatus']: '5',
                  ['obj.statusText']: '已取消'
                });
                this.tipsAlert(res2.data.msg);
              } else {
                this.tipsAlert(res2.data.msg);
              };
            } else {
              this.tipsAlert(res2.msg);
            };
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 弹窗提示
  tipsAlert(str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 2000
    });
  },

  //五星评价
  evaStarClick(e) {
    this.setData({
      userEvaStar: e.currentTarget.dataset.index
    });

    for (let i = 0; i < this.data.evaluateArr.length; i++) {
      if (this.data.evaluateArr[i].isSelect) {
        this.setData({
          isEvaluate: this.data.userEvaStar ? true : false,
        });
        break;
      } else {
        this.setData({
          isEvaluate: false,
        });
      };
    };
  },

  //多选标签
  selLabel(e) {
    console.log(e);
    let ind = e.currentTarget.dataset.index;

    let evaluateArr = this.data.evaluateArr;
    for (let i = 0; i < evaluateArr.length; i++) {
      if (i == ind) {
        evaluateArr[i].isSelect = !evaluateArr[i].isSelect;
      };
    };

    this.setData({
      evaluateArr: evaluateArr
    }, () => {
      for (let i = 0; i < this.data.evaluateArr.length; i++) {
        if (this.data.evaluateArr[i].isSelect) {
          this.setData({
            isEvaluate: this.data.userEvaStar ? true : false,
          });
          break;
        } else {
          this.setData({
            isEvaluate: false,
          });
        };
      };
    });
  },

  //评价
  evaluate() {
    if (this.data.isEvaluate) {
      //评价标签转字符串
      for (let i = 0; i < this.data.evaluateArr.length; i++) {
        if (this.data.evaluateArr[i].isSelect) {
          this.data.label[i] = this.data.evaluateArr[i].value;
        } else {
          this.data.label[i] = '';
        };
      };

      for (let i = 0; i < this.data.label.length; i++) {
        if (this.data.label[i] == "" || typeof (this.data.label[i]) == "undefined") {
          this.data.label.splice(i, 1);
          i = i - 1;
        };
      };

      let postData = {
        orderDetailId: this.data.obj.id,
        evaluateUserId: this.data.obj.employeeId, //（评价人id）
        evaluatedUserId: this.data.obj.driverId, //（被评价人id）
        content: this.data.textareaValue,
        score: this.data.userEvaStar,
        label: this.data.label.join(','), //（label存的格式为  车内整洁, 驾驶平稳, 态度好服务棒）
        type: '1', // 类型：2司机对乘客评价，1乘客对司机评价  
      };
      console.log(postData);
      server.postRequest('mobile/order/evaluate', postData, app, res => {
        console.log('评价:::', res);
        if (res.status) {
          if (res.data.status == '100000') {
            this.setData({
              isSuccess: true,
              ['obj.tripStatus']: '4',
              ['obj.statusText']: '已完成'
            });
            this.getEvalData();
            setTimeout(() => {
              this.setData({
                isSuccess: false,
                isEva: true,
              });
              this.closeMask();
            }, 1000);
          };
        };
      });
    };
  },

  //获取文本内容及内容长度
  textCon(e) {
    let len = e.detail.value.length;

    this.setData({
      textareaValue: e.detail.value,
      nowLen: len
    });
  },

  callDriver(e) {
    let item = this.data.obj;
    if (item.tripStatus == '1' || item.tripStatus == '2') {
      wx.makePhoneCall({
        phoneNumber: this.data.obj.driverPhone
      });
    } else if (item.tripStatus == '3') {
      //行程完成后两小时之后不能打电话
      let updateTime = item.updateDate;
      var now = new Date().getTime();
      var timetamp = new Date(updateTime).getTime();
      var plantamp = 1000 * 60 * 60 * 2 + timetamp;

      if (plantamp > now) {
        wx.makePhoneCall({
          phoneNumber: this.data.obj.driverPhone
        });
      };
    };
  },


  //绘制路线
  drawline() {
    this.setData({
      polyline: [{
        points: this.data.b,
        color: "#BBBBBB",
        width: 5,
        dottedLine: false
      }, {
        points: this.data.point,
        color: '#39C67D',
        width: 2,
        dottedLine: false
      }]
    });
  },

  /**
* 根据订单状态码规则计算当前订单状态
*/
  analysisStatus(sta) {
    let CONTENT
    this.data.orderStatus.forEach(item => {
      if (item.status == sta) CONTENT = item.name
    })
    return CONTENT
  },

  /**
 * 发送消息通用函数
 */
  sendMessage(data, cb) {
    console.log(data);
    wx.sendSocketMessage({
      data: JSON.stringify(data),
      success: res => {
        console.log('发送消息回调', res)
        if (cb) {
          cb()
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 监听socket的连接
    wx.onSocketOpen(() => {
      console.log('WebSocket 已连接！')
      wx.hideLoading();
      this.setData({ isConnect: true })
      let message = {
        "routeId": this.data.obj.id,
        "openSource": "2",
        "latLng": []
      };
      this.sendMessage(message);
      wx.onSocketMessage(res => {
        console.log(res);
        res = JSON.parse(res.data)
        console.log('liveRoom收到服务器内容：', res)

        for (let i = 0; i < res.length; i++) {
          if (res.length == 1) {
            // if (this.data.isStart) {
            //   this.setData({
            //     lastLat: this.data.nextLat,
            //     lastLon: this.data.nextLon,
            //     nextLat: res[i].lat,
            //     nextLon: res[i].lng,
            //   });
            // } else {
            //   this.setData({
            //     lastLat: res[i].lat,
            //     lastLon: res[i].lng,
            //     nextLat: res[i].lat,
            //     nextLon: res[i].lng,
            //     isStart: true,
            //   });
            // };

            // this.distance(res[i].lat, res[i].lng, this.data.obj.actualArriveLat, this.data.obj.actualArriveLon);
            // this.setData({
            //   rotate: (this.calcAngle(this.data.lastLat, this.data.lastLon, res[i].lat, res[i].lng))
            // });
            this.data.markers[2] = {
              iconPath: "/images/che@3x.png",
              id: 2,
              latitude: res[i].lat,
              longitude: res[i].lon,
              width: 25,
              height: 48,
              rotate: 0,
              zIndex: 9999,
              // callout: {
              //   name: '起点',
              //   title: '这是起点啊',
              //   content: '距离终点: ' + this.data.distance.toFixed(2) +'km',
              //   color: '#000',
              //   bgColor: '#fff',
              //   padding: 15,
              //   borderRadius: 100,
              //   fontSize: 14,
              //   display: "ALWAYS",
              // }
            };
            this.setData({
              ['markers[2]']: this.data.markers[2]
            });
            console.log(this.data.markers);
          } else if (res.length > 1) {
            if (i == res.length - 1) {
              // if (this.data.isStart) {
              //   this.setData({
              //     lastLat: this.data.nextLat,
              //     lastLon: this.data.nextLon,
              //     nextLat: res[i].lat,
              //     nextLon: res[i].lng,
              //   });
              // } else {
              //   this.setData({
              //     lastLat: res[i].lat,
              //     lastLon: res[i].lng,
              //     nextLat: res[i].lat,
              //     nextLon: res[i].lng,
              //     isStart: true,
              //   });
              // };
              // this.distance(res[i].lat, res[i].lng, this.data.obj.actualArriveLat, this.data.obj.actualArriveLon);
              // this.setData({
              //   rotate: (this.calcAngle(this.data.lastLat, this.data.lastLon, res[i].lat, res[i].lng))
              // });
              this.data.markers[2] = {
                iconPath: "/images/che@3x.png",
                id: 2,
                latitude: res[i].lat,
                longitude: res[i].lon,
                width: 25,
                height: 48,
                rotate: 0,
                zIndex: 9999,
                // callout: {
                //   name: '起点',
                //   title: '这是起点啊',
                //   content: '距离终点:'+ this.data.distance.toFixed(2) +'km',
                //   color: '#000',
                //   bgColor: '#fff',
                //   padding: 15,
                //   borderRadius: 100,
                //   fontSize: 14,
                //   display: "ALWAYS",
                // }
              };
              this.setData({
                ['markers[2]']: this.data.markers[2]
              });
              console.log(this.data.markers);
            };
          };
          // this.data.point.push({
          //   latitude: res[i].lat, 
          //   longitude: res[i].lng
          // });
        };

        // this.drawline();
      })
    })
    //   监听socket的关闭
    wx.onSocketClose(() => {
      this.setData({ isConnect: false })
      console.log('WebSocket 已关闭！')
    })

    // 监听socket错误
    wx.onSocketError(() => {
      //   wx.hideLoading()
      console.log('WebSocket连接打开失败，请检查！')
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.mapCtx = wx.createMapContext('mymap');
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
    wx.closeSocket()
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

  onShareAppMessage: function (e) {
    console.log(e);
    wx.hideShareMenu();

    let id = e.target.dataset.id;
    let obj = e.target.dataset.obj;
    let evals = e.target.dataset.eval;

    return {
      from: 'button',
      title: '会拉拉出行',
      path: 'pages/orderDetail/index?id=' + id + '&obj=' + JSON.stringify(obj) + '&eval=' + evals + '&share=yes',
      imageUrl: 'https://abc.smartmapdt.com/photoServer/huizhan/shareBackground.png'
    }
  }

})