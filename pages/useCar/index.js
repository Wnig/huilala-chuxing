// pages/useCar/index.js
import { Server } from '../../utils/request.js'
let server = new Server()
const { $Toast } = require('../../components/base/index');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menu: [  // 顶部菜单列表与各类型订单数量
      {
        name: '单程'
      },
      {
        name: '接送机(站)'
      },
      {
        name: '包天'
      }
    ],
    is_first_action: true, //判断是否第一次点
    mf: '0', // 顶部菜单导航选中下标 默认为0
    isPick: true, //接机
    isErr: 0, //报错弹层-出发地
    isErrs: 0, //报错弹层-目的地
    departure: '',
    departures: '',
    destination: '',
    destinations: '',
    departures_lon: '',
    departures_lat: '',
    destinations_lon: '',
    destinations_lat: '',
    remark: '',
    carNum: '',
    startTime: '',
    endTime: '',
    startTimes: '',
    endTimes: '',
    multiArray: [],
    multiArrays: [],
    multiIndex: [0, 0, 0],
    multiIndexs: [0, 0, 0],
    mulitDate: [],
    mulitHour: [],
    mulitMin: [],
    plantime: 30,
    isStart: false,
    isEnd: false,
    isLocation: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      deviceInfo: app.globalData.deviceInfo,
      vehicleUseId: options.vehicleuseid,
    });

    wx.getLocation({
      success: res => {
        console.log(res);
        this.setData({
          nowLon: res.longitude,
          nowLat: res.latitude,
          isLocation: true
        });
      },
      fail: res => {
        console.log(res);
        this.setData({
          isLocation: false
        });
      }
    });

    this.getData();
    this.tabData();
  },

  backPre() {
    wx.navigateBack({
      delta: 1
    });
  },

  callService(e) {
    wx.makePhoneCall({
      phoneNumber: app.globalData.consumerHotline
    });
  },

  openSetting(e) {
    console.log(e);
    let authSetting = e.detail.authSetting['scope.userLocation'];
    if (authSetting) {
      this.setData({
        isLocation: true
      });
    } else {
      this.setData({
        isLocation: false
      });
    };
  },

  alertTips() {
    console.log(233);
    $Toast({ content: '请先选择出发时间', duration: 1.5 })
  },

  getData() {
    var now = new Date(),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate(),
      h = now.getHours(),  //获取当前小时数(0-23)
      m = now.getMinutes();

    let hourArr = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
    let minArr = ['00', '10', '20', '30', '40', '50'];

    //获取30天内日期
    for (let i = 0; i < this.data.plantime; i++) {
      if (h < '22') {
        if (h == '21' && m > '50') {
          var timetamp = new Date().getTime();
          var plantamp = (i + 1) * 1000 * 60 * 60 * 24 + timetamp;
          var plantime = new Date(plantamp);
          this.data.mulitDate.push({
            time: this.getdate(plantime) + ' ' + this.getWeek(plantime),
            date: this.getdate(plantime),
            dates: this.getdates(plantime),
          });
        } else {
          var timetamp = new Date().getTime();
          var plantamp = i * 1000 * 60 * 60 * 24 + timetamp;
          var plantime = new Date(plantamp);
          this.data.mulitDate.push({
            time: this.getdate(plantime) + ' ' + this.getWeek(plantime),
            date: this.getdate(plantime),
            dates: this.getdates(plantime),
          });
        };
      } else {
        // if (m < '50') {
        //   var timetamp = new Date().getTime();
        //   var plantamp = i * 1000 * 60 * 60 * 24 + timetamp;
        //   var plantime = new Date(plantamp);
        //   this.data.mulitDate.push({
        //     time: this.getdate(plantime) + ' ' + this.getWeek(plantime),
        //     date: this.getdate(plantime),
        //     dates: this.getdates(plantime),
        //   });
        // } else {
        var timetamp = new Date().getTime();
        var plantamp = (i + 1) * 1000 * 60 * 60 * 24 + timetamp;
        var plantime = new Date(plantamp);
        this.data.mulitDate.push({
          time: this.getdate(plantime) + ' ' + this.getWeek(plantime),
          date: this.getdate(plantime),
          dates: this.getdates(plantime),
        });
      };
      // };
    };

    console.log('日期:::', this.data.mulitDate);

    if (h < '22') {
      //获取小时   
      if (h == '21' && m > '50') {
        for (let i = 0; i < hourArr.length; i++) {
          this.data.mulitHour.push({
            time: hourArr[i] + '点',
            hour: hourArr[i]
          });
        };
      } else {
        for (let i = 0; i < hourArr.length; i++) {
          for (let j = 0; j < minArr.length; j++) {
            if (h == hourArr[i] && m <= minArr[j]) {
              this.data.mulitHour.push({
                time: hourArr[i] + '点',
                hour: hourArr[i]
              });
              break;
            } else if (h < hourArr[i]) {
              this.data.mulitHour.push({
                time: hourArr[i] + '点',
                hour: hourArr[i]
              });
              break;
            };
          };
        };
      };
    } else {
      // if (m < '50') {
      //   //获取小时    
      //   for (let i = 0; i < hourArr.length; i++) {
      //     for (let j = 0; j < minArr.length; j++) {
      //       if (h == hourArr[i] && m <= minArr[j]) {
      //         this.data.mulitHour.push({
      //           time: hourArr[i] + '点',
      //           hour: hourArr[i]
      //         });
      //         break;
      //       } else if (h < hourArr[i]) {
      //         this.data.mulitHour.push({
      //           time: hourArr[i] + '点',
      //           hour: hourArr[i]
      //         });
      //         break;
      //       };
      //     };
      //   };
      // } else {
      for (let i = 0; i < hourArr.length; i++) {
        this.data.mulitHour.push({
          time: hourArr[i] + '点',
          hour: hourArr[i]
        });
      };
      // };
    };

    if (h < '22' && h >= '06') {
      //获取分钟
      for (let j = 0; j < minArr.length; j++) {
        if (j == minArr.length - 1) {
          if (m > minArr[j]) {
            for (let i = 0; i < minArr.length; i++) {
              this.data.mulitMin.push({
                time: minArr[i] + '分',
                min: minArr[i]
              });
            };
          } else if (m <= minArr[j]) {
            this.data.mulitMin.push({
              time: minArr[j] + '分',
              min: minArr[j]
            });
          };
        } else if (m <= minArr[j]) {
          this.data.mulitMin.push({
            time: minArr[j] + '分',
            min: minArr[j]
          });
        };
      };
    } else {
      //获取分钟
      for (let j = 0; j < minArr.length; j++) {
        this.data.mulitMin.push({
          time: minArr[j] + '分',
          min: minArr[j]
        });
      };
    };


    console.log('小时:::', this.data.mulitHour);
    console.log('分钟:::', this.data.mulitMin);
    console.log(y + '年' + m + '月' + d + '日 ' + h + '点' + m + '分');

    let multiArray = [];
    multiArray[0] = this.data.mulitDate;
    multiArray[1] = this.data.mulitHour;
    multiArray[2] = this.data.mulitMin;

    this.setData({
      multiArray: multiArray,
      multiArrays: multiArray
    });

    console.log(this.data.multiArray);
    console.log(this.data.multiArrays);
  },

  getdate(time) {
    var now = new Date(time),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate();

    return m + '月' + d + '日';
  },

  getdates(time) {
    var now = new Date(time),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate();

    return y + '-' + (m > 9 ? m : '0' + m) + '-' + (d > 9 ? d : '0' + d);
  },

  getWeek(time) {
    var weekArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var now = new Date(time),
      week = weekArr[now.getDay()];
    return week;
  },

  //开始时间
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value,
      isStart: true,
    });

    console.log(this.data.multiArray[0][this.data.multiIndex[0]]);
    console.log(this.data.multiArray[1][this.data.multiIndex[1]]);
    console.log(this.data.multiArray[2][this.data.multiIndex[2]]);

    this.setData({
      startTime: this.data.multiArray[0][this.data.multiIndex[0]].time + ' ' + this.data.multiArray[1][this.data.multiIndex[1]].hour + ':' + this.data.multiArray[2][this.data.multiIndex[2]].min,
      startTimes: [this.data.multiArray[0][this.data.multiIndex[0]], this.data.multiArray[1][this.data.multiIndex[1]], this.data.multiArray[2][this.data.multiIndex[2]]],
    });
    console.log(this.data.startTime);
    console.log(this.data.startTimes);
  },

  //开始时间
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = this.data.mulitHour;
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[1] = this.data.mulitHour;
                break;
            };

            break;
          default:
            let hourArr = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
            let minArr = ['00', '10', '20', '30', '40', '50'];
            let multiHour = [];
            let multiMin = [];
            for (let i = 0; i < hourArr.length; i++) {
              multiHour.push({
                time: hourArr[i] + '点',
                hour: hourArr[i],
              });
            };
            data.multiArray[1] = multiHour;

            for (let i = 0; i < minArr.length; i++) {
              multiMin.push({
                time: minArr[i] + '分',
                min: minArr[i],
              });
            };
            data.multiArray[2] = multiMin;
            break;
        };

        break;
      case 1:
        switch (data.multiIndex[0]) {
          default:
            switch (data.multiIndex[0]) {
              case 0:
                switch (data.multiIndex[1]) {
                  case 0:
                    data.multiArray[2] = this.data.mulitMin;
                    break;

                  default:
                    let minArr = ['00', '10', '20', '30', '40', '50'];
                    let multiMin = [];

                    for (let i = 0; i < minArr.length; i++) {
                      multiMin.push({
                        time: minArr[i] + '分',
                        min: minArr[i],
                      });
                    };
                    data.multiArray[2] = multiMin;

                    break;
                }
                break;
              case 1:
                let hourArr = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
                let multiHour = [];
                for (let i = 0; i < hourArr.length; i++) {
                  multiHour.push({
                    time: hourArr[i] + '点',
                    hour: hourArr[i],
                  });
                };
                data.multiArray[1] = multiHour;

                break;
            }
            break;
        }
        break;

        // data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
    }
    this.setData(data);
  },

  //结束时间
  bindMultiPickerChanges: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndexs: e.detail.value,
      isEnd: true,
    });

    console.log(this.data.multiArrays[0][this.data.multiIndexs[0]]);
    console.log(this.data.multiArrays[1][this.data.multiIndexs[1]]);
    console.log(this.data.multiArrays[2][this.data.multiIndexs[2]]);

    this.setData({
      endTime: this.data.multiArrays[0][this.data.multiIndexs[0]].time + ' ' + this.data.multiArrays[1][this.data.multiIndexs[1]].hour + ':' + this.data.multiArrays[2][this.data.multiIndexs[2]].min,
      endTimes: [this.data.multiArrays[0][this.data.multiIndexs[0]], this.data.multiArrays[1][this.data.multiIndexs[1]], this.data.multiArrays[2][this.data.multiIndexs[2]]],
    });

    console.log(this.data.endTime);
    console.log(this.data.endTimes);
  },

  //结束时间
  bindMultiPickerColumnChanges: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var datas = {
      multiArrays: this.data.multiArrays,
      multiIndexs: this.data.multiIndexs
    };
    datas.multiIndexs[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (datas.multiIndexs[0]) {
          case 0:
            datas.multiArrays[1] = this.data.mulitHour;
            switch (datas.multiIndexs[1]) {
              case 0:
                datas.multiArrays[1] = this.data.mulitHour;
                break;
            };

            break;
          default:
            let hourArr = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
            let minArr = ['00', '10', '20', '30', '40', '50'];
            let multiHour = [];
            let multiMin = [];
            for (let i = 0; i < hourArr.length; i++) {
              multiHour.push({
                time: hourArr[i] + '点',
                hour: hourArr[i],
              });
            };
            datas.multiArrays[1] = multiHour;

            for (let i = 0; i < minArr.length; i++) {
              multiMin.push({
                time: minArr[i] + '分',
                min: minArr[i],
              });
            };
            datas.multiArrays[2] = multiMin;
            break;
        };

        break;
      case 1:
        switch (datas.multiIndexs[0]) {
          default:
            switch (datas.multiIndexs[0]) {
              case 0:
                switch (datas.multiIndexs[1]) {
                  case 0:
                    datas.multiArrays[2] = this.data.mulitMin;
                    break;

                  default:
                    let minArr = ['00', '10', '20', '30', '40', '50'];
                    let multiMin = [];

                    for (let i = 0; i < minArr.length; i++) {
                      multiMin.push({
                        time: minArr[i] + '分',
                        min: minArr[i],
                      });
                    };
                    datas.multiArrays[2] = multiMin;

                    break;
                }
                break;
              case 1:
                let hourArr = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
                let multiHour = [];
                for (let i = 0; i < hourArr.length; i++) {
                  multiHour.push({
                    time: hourArr[i] + '点',
                    hour: hourArr[i],
                  });
                };
                datas.multiArrays[1] = multiHour;

                break;
            }
            break;
        }
        break;

        // data.multiIndex[1] = 0;
        datas.multiIndexs[2] = 0;
        break;
    }
    this.setData(datas);
  },

  //行程tab数据显示
  tabData() {
    server.postRequest('mobile/order/getOrderType', {}, app, res => {
      console.log(res);
      this.setData({
        menus: res.data,
        useTime: res.data[0].useTime,
        orderType: res.data[0].orderType,
      });
    });
  },

  /**
* 订单顶部菜单导航点击事件
*/
  select: function (event) {
    let mf = event.currentTarget.dataset.index;
    if (mf != 1) {
      this.setData({
        useTime: event.currentTarget.dataset.time,
        orderType: event.currentTarget.dataset.type,
      });
    } else {
      this.setData({
        useTime: 4,
        orderType: 2,
      });
    };
    this.menuHighLight(mf);
  },

  /**
 * 菜单导航选中高亮
 */
  menuHighLight: function (index) {
    this.setData({ mf: index })
  },

  //接送机切换
  tabChange(e) {
    console.log(e);
    let type = e.currentTarget.dataset.type;
    this.setData({
      isPick: !this.data.isPick,
      useTime: e.currentTarget.dataset.time,
      orderType: type,
      departures: this.data.destinations,
      destinations: this.data.departures,
      departures_lon: this.data.destinations_lon,
      departures_lat: this.data.destinations_lat,
      destinations_lon: this.data.departures_lon,
      destinations_lat: this.data.departures_lat,
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

  //出发地
  departure(e) {
    console.log(e);
    if (this.data.isLocation) {
      if (this.data.mf != '1') {
        wx.chooseLocation({
          success: res => {
            console.log(res);
            this.setData({
              departure: res.address,
              departure_lat: res.latitude,
              departure_lon: res.longitude
            });
            let postData = {
              lng: res.longitude,
              lat: res.latitude,
              addressType: 'c',
              province: '厦门市',
            };
            console.log(postData);
            server.postRequest('mobile/order/judgeLocation', postData, app, res2 => {
              console.log(res2);
              this.setData({
                isErr: res2.data == 'success' ? 0 : 1,
              });
            });
          }
        });
      } else {
        let types = 'dep';
        wx.navigateTo({
          url: '../where/index?type=' + types,
        })
      };
    };
  },

  //目的地
  destination(e) {
    console.log(e);
    if (this.data.isLocation) {
      if (this.data.mf != '1') {
        wx.chooseLocation({
          success: res => {
            console.log(res);
            this.setData({
              destination: res.address,
              destination_lat: res.latitude,
              destination_lon: res.longitude
            });

            let postData = {
              lng: res.longitude,
              lat: res.latitude,
              addressType: 'p',
              province: '福建省',
            };
            console.log(postData);
            server.postRequest('mobile/order/judgeLocation', postData, app, res2 => {
              console.log(res2);
              this.setData({
                isErrs: res2.data == 'success' ? 0 : 1,
              });
            });
          }
        });
      } else {
        let types = 'des';
        wx.navigateTo({
          url: '../where/index?type=' + types,
        })
      };
    };
  },

  //航班号
  inputVal(e) {
    console.log(e);
    let type = e.target.dataset.type;
    if (type == "carnum") {
      this.setData({
        carNum: e.detail.value
      });
    };
    if (type == "remark") {
      this.setData({
        remark: e.detail.value
      });
    };
  },

  nextPage() {
    if (this.data.departure == '' && this.data.mf != '1') {
      $Toast({ content: '请选择出发地', duration: 1.5 })
    } else if (this.data.destination == '' && this.data.mf != '1') {
      $Toast({ content: '请选择目的地', duration: 1.5 })
    } else if (this.data.departures == '' && this.data.mf == '1') {
      $Toast({ content: '请选择出发地', duration: 1.5 })
    } else if (this.data.destinations == '' && this.data.mf == '1') {
      $Toast({ content: '请选择目的地', duration: 1.5 })
    } else if (this.data.departure_lat == this.data.destination_lat && this.data.departure_lon == this.data.destination_lon && this.data.mf != '1') {
      $Toast({ content: '出发地和目的地不能相同', duration: 1.5 })
    } else if (!this.data.isStart) {
      $Toast({ content: '请选择出发时间', duration: 1.5 })
    } else {
      if (this.data.mf == '0' || this.data.mf == '2') {
        if (!this.data.isErr && !this.data.isErrs) {
          if (this.data.mf == '2') {
            // let startTime = this.data.startTimes[0].dates;
            // let endTime = this.data.endTimes[0].dates;
            if (!this.data.isEnd) {
              $Toast({ content: '请选择返回时间', duration: 1.5 })
            } else if (new Date(this.data.startTimes[0].dates).getTime() > new Date(this.data.endTimes[0].dates).getTime()) {
              $Toast({ content: '出发时间不能大于当前时间', duration: 1.5 })
            } else if (new Date(this.data.startTimes[0].dates).getTime() == new Date(this.data.endTimes[0].dates).getTime()) {
              if (this.data.startTimes[1].hour == this.data.endTimes[1].hour) {
                if (this.data.startTimes[2].min == this.data.endTimes[2].min) {
                  $Toast({ content: '出发时间不能等于当前时间', duration: 1.5 })
                } else if (this.data.startTimes[2].min > this.data.endTimes[2].min) {
                  $Toast({ content: '出发时间不能大于当前时间', duration: 1.5 })
                } else {
                  if (this.data.is_first_action) {
                    this.setData({ is_first_action: false });
                    this.nextData();
                  };
                };
              } else if (this.data.startTimes[1].hour > this.data.endTimes[1].hour) {
                $Toast({ content: '出发时间不能大于当前时间', duration: 1.5 })
              } else {
                if (this.data.is_first_action) {
                  this.setData({ is_first_action: false });
                  this.nextData();
                };
              };
            } else {
              if (this.data.is_first_action) {
                this.setData({ is_first_action: false });
                this.nextData();
              };
            };
          } else {
            if (this.data.is_first_action) {
              this.setData({ is_first_action: false });
              this.nextData();
            };
          };
        };
      } else if (this.data.mf == '1') {
        if (this.data.carNum == '') {
          $Toast({ content: '请输入航班号/动车号', duration: 1.5 })
        } else {
          if (this.data.is_first_action) {
            this.setData({ is_first_action: false });
            this.nextData();
          };
        };
      };
    }
  },

  nextData() {
    let postData = {
      oLng: this.data.mf != 1 ? this.data.departure_lon : this.data.departures_lon,
      oLat: this.data.mf != 1 ? this.data.departure_lat : this.data.departures_lat,
      iLng: this.data.mf != 1 ? this.data.destination_lon : this.data.destinations_lon,
      iLat: this.data.mf != 1 ? this.data.destination_lat : this.data.destinations_lat,
      useTime: this.data.useTime,
      employeeId: app.globalData.employeeInfo.id,
      orderType: this.data.orderType,
      mealsOrNot: this.data.orderType == 4 ? 1 : 2,
    };

    let obj = {
      oLng: this.data.mf != 1 ? this.data.departure_lon : this.data.departures_lon,
      oLat: this.data.mf != 1 ? this.data.departure_lat : this.data.departures_lat,
      iLng: this.data.mf != 1 ? this.data.destination_lon : this.data.destinations_lon,
      iLat: this.data.mf != 1 ? this.data.destination_lat : this.data.destinations_lat,
      useTime: this.data.useTime,
      employeeId: app.globalData.employeeInfo.id,
      orderType: this.data.orderType,
      mealsOrNot: this.data.orderType == 4 ? 1 : 2,
      carNum: this.data.carNum,
      departure: this.data.mf != 1 ? this.data.departure : this.data.departures,
      destination: this.data.mf != 1 ? this.data.destination : this.data.destinations,
      startTimes: this.data.startTimes,
      endTimes: this.data.endTimes,
      remarks: this.data.remark
    };

    console.log(postData);
    console.log(obj);
    server.postRequest('mobile/order/selectTrip', postData, app, res2 => {
      console.log(res2);
      let carinfo = res2.data;
      this.setData({ is_first_action: true });
      wx.navigateTo({
        url: '../choiceCar/index?obj=' + JSON.stringify(obj) + '&carinfo=' + JSON.stringify(carinfo) + '&vehicleuseid=' + this.data.vehicleUseId,
      })
    });
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
})