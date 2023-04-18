// pages/choiceCar/index.js
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
        vehicleModelName: '全部',
        vehicleModelId: '',
      },
    ],
    mf: '0', // 顶部菜单导航选中下标 默认为0
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    textVal: 0,
    carInfo: [{
      name: '商务车5座',
      weigthNum: 4,
      packgeNum: 4,
      price: 450,
    }, {
      name: '商务车6座',
      weigthNum: 5,
      packgeNum: 6,
      price: 690,
    }, {
      name: '商务车7座',
      weigthNum: 8,
      packgeNum: 7,
      price: 850,
    }],
    feeDetailArr: [],
    totalPassenger: 0, //总人数
    totalVehicle: 0, //总车辆
    orderPrice: 0, //总价格
    orderCostPrice: 0,
    luggageNum: 0, //总行李数
    orderDetail: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      deviceInfo: app.globalData.deviceInfo,
      obj: JSON.parse(options.obj),
      carInfo: JSON.parse(options.carinfo),
      vehicleUseId: options.vehicleuseid
    });
    console.log(this.data.obj);
    let carInfo = this.data.carInfo;
    this.data.carInfo.forEach((item) => {
      item.textVal = 0;
    });
    this.getTabData();
    this.setData({
      carInfo: carInfo,
      allCarInfo: carInfo,
    }, () => {
      this.setData({
        initData: true
      });
    });
    console.log(this.data.carInfo);
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

  changeCount: function (e) {
    let id = e.currentTarget.dataset.id;
    // 代表点击的类型
    let _type = e.currentTarget.dataset.type;
    //当前索引
    let _index = e.currentTarget.dataset.index;
    // 当前商品数据
    let _textVal = this.data.carInfo[_index].textVal;

    let orderDetail = this.data.orderDetail;

    // 判断数量是加还是减 sub为减 add为加 当点击为减的时候需判断是否大于1 不大于则不减少
    if (_type == 'sub' && this.data.carInfo[_index].textVal > 0) {
      let _num = this.data.carInfo[_index].textVal;
      _num--;
      _textVal = _num;
      let carInfo = this.data.carInfo;
      let allCarInfo = this.data.allCarInfo;
      for (let i = 0; i < this.data.carInfo.length; i++) {
        if (_index == i) {
          carInfo[i].textVal = _textVal;
        };
      };

      for (let i = 0; i < this.data.allCarInfo.length; i++) {
        if (id == allCarInfo[i].id) {
          allCarInfo[i].textVal = _textVal;
          this.setData({
            totalPassenger: this.data.totalPassenger - this.data.allCarInfo[i].maxPersonNum, //总人数
            totalVehicle: this.data.totalVehicle - 1, //总车辆
            orderPrice: this.data.allCarInfo[i].priceStatus != 'noPrice' ? (this.data.orderPrice - Number(this.data.allCarInfo[i].price)) : this.data.orderPrice, //总价格
            orderCostPrice: this.data.allCarInfo[i].priceStatus != 'noPrice' ? (this.data.orderCostPrice - Number(this.data.allCarInfo[i].costPrice)) : this.data.orderCostPrice,
            luggageNum: this.data.luggageNum - this.data.allCarInfo[i].maxLuggageNum, //总行李数
          });
        };
      };

      //删除
      for (let j = 0; j < orderDetail.length; j++) {
        if (id == orderDetail[j].objId) {
          orderDetail.splice(j, 1);
          break;
        };
      };

      this.setData({
        carInfo: carInfo,
        allCarInfo: allCarInfo,
        orderDetail: orderDetail
      });
    } else if (_type == 'add') {
      let _num = _textVal;
      _num++;
      _textVal = _num;
      let carInfo = this.data.carInfo;
      let allCarInfo = this.data.allCarInfo;

      for (let i = 0; i < this.data.carInfo.length; i++) {
        if (_index == i) {
          carInfo[i].textVal = _textVal;
        };
      };

      for (let i = 0; i < this.data.allCarInfo.length; i++) {
        if (id == allCarInfo[i].id) {
          allCarInfo[i].textVal = _textVal;
          this.setData({
            totalPassenger: this.data.totalPassenger + this.data.allCarInfo[i].maxPersonNum, //总人数
            totalVehicle: this.data.totalVehicle + 1, //总车辆
            orderPrice: this.data.allCarInfo[i].priceStatus != 'noPrice' ? (this.data.orderPrice + Number(this.data.allCarInfo[i].price)) : this.data.orderPrice, //总价格
            orderCostPrice: this.data.allCarInfo[i].priceStatus != 'noPrice' ? (this.data.orderCostPrice + Number(this.data.allCarInfo[i].costPrice)) : this.data.orderCostPrice,
            luggageNum: this.data.luggageNum + this.data.allCarInfo[i].maxLuggageNum, //总行李数
          });
        };
      };

      //添加
      for (let i = 0; i < this.data.carInfo.length; i++) {
        if (_index == i) {
          orderDetail.push({
            objId: this.data.carInfo[i].id,
            orderTourPriceId: this.data.carInfo[i].orderTourPriceId,
            vehicleModelId: this.data.carInfo[i].id,
            tourPrice: this.data.carInfo[i].price,
            costPrice: this.data.carInfo[i].costPrice,
            num: 1,
            outAddress: this.data.obj.departure,
            arriveAddress: this.data.obj.destination,
            passengerId: '',
            flightNo: this.data.obj.carNum,
            name: this.data.carInfo[i].name,
            outLon: this.data.obj.oLng,
            outLat: this.data.obj.oLat,
            arriveLon: this.data.obj.iLng,
            arriveLat: this.data.obj.iLat,
            remarks: this.data.obj.remarks
          });
        };
      };

      this.setData({
        carInfo: carInfo,
        allCarInfo: allCarInfo,
        orderDetail: orderDetail,
      });
    };
  },

  nextPage() {
    let arriveTime = this.data.obj.orderType == 4 ? this.data.obj.endTimes[0].dates + ' ' + this.data.obj.endTimes[1].hour + ':' + this.data.obj.endTimes[2].min + ':00' : '';
    let obj = {
      employeeId: app.globalData.employeeInfo.id,
      outTime: this.data.obj.startTimes[0].dates + ' ' + this.data.obj.startTimes[1].hour + ':' + this.data.obj.startTimes[2].min + ':00',
      arriveTime: arriveTime,
      outAddress: this.data.obj.departure,
      arriveAddress: this.data.obj.destination,
      orderType: this.data.obj.orderType,
      totalPassenger: this.data.totalPassenger, //核载人数
      luggageNum: this.data.luggageNum, //总行李箱
      totalVehicle: this.data.totalVehicle, //总车辆
      orderPrice: this.data.orderPrice, //总价
      orderCostPrice: this.data.orderCostPrice,
      remarks: '', //备注
      oLng: this.data.obj.oLng,
      oLat: this.data.obj.oLat,
      iLng: this.data.obj.iLng,
      iLat: this.data.obj.iLat,
      passengerId: '',
      flightNo: this.data.obj.carNum,
      orderDetail: this.data.orderDetail,
      allCarInfo: this.data.allCarInfo,
    };

    if (this.data.totalVehicle) {
      wx.navigateTo({
        url: '../writeInfo/index?obj=' + JSON.stringify(obj),
      })
    } else {
      $Toast({ content: '请选择车辆', duration: 1.5 })
    };
  },

  getTabData() {
    let postData = {
      vehicleUseId: this.data.vehicleUseId
    };
    server.postRequest('mobile/order/getVehicleModel', postData, app, res => {
      console.log(res);
      console.log(this.data.menu);
      let menu = [{
        vehicleModelName: '全部',
        vehicleModelId: '',
      }];

      for (let i = 0; i < res.data.length; i++) {
        menu.push({
          vehicleModelName: res.data[i].vehicleModelName,
          vehicleModelId: res.data[i].vehicleModelId,
        });
      };

      this.setData({
        menu: menu
      });
      console.log(this.data.menu);
    });
  },

  /**
* 订单顶部菜单导航点击事件
*/
  select: function (event) {
    let mf = event.currentTarget.dataset.index;
    let id = event.currentTarget.dataset.id;
    this.menuHighLight(mf);

    let carInfo = [];
    if (mf != 0) {
      this.data.allCarInfo.forEach((item, i) => {
        if (id == item.parentId) {
          carInfo.push(item);
        };
      });

    } else {
      for (let i = 0; i < this.data.allCarInfo.length; i++) {
        carInfo[i] = this.data.allCarInfo[i];
      };
    };

    this.setData({
      carInfo: carInfo
    });
    console.log(this.data.carInfo);

    // let postData = {
    //   oLng: this.data.obj.oLng,
    //   oLat: this.data.obj.oLat,
    //   iLng: this.data.obj.iLng,
    //   iLat: this.data.obj.iLat,
    //   useTime: this.data.obj.useTime,
    //   employeeId: app.globalData.employeeInfo.id,
    //   orderType: this.data.obj.orderType,
    //   mealsOrNot: this.data.obj.mealsOrNot,
    //   vehicleModelId: id
    // };
    // console.log(postData);
    // server.postRequest('mobile/order/selectTripByModels', postData, app, res => {
    //   console.log(res);

    //   res.data.forEach((item) => {
    //     item.textVal = 0;
    //   });

    //   this.setData({
    //     carInfo: res.data
    //   });
    // });
  },

  /**
 * 菜单导航选中高亮
 */
  menuHighLight: function (index) {
    this.setData({ mf: index })
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
* 计费标准弹层打开
*/
  showFeePopup() {
    this.setData({ feeRule: true })
    this.animation.backgroundColor('rgba(0,0,0,0.6)').step()
    this.animation2.translateY(0).step()
    this.setData({
      popupFade: this.animation.export(),
      popSlide: this.animation2.export()
    })
  },

  /**
 * 计费标准弹层关闭
 */
  closeFeePopup() {
    this.animation.backgroundColor('rgba(0,0,0,0)').step()
    this.animation2.translateY('100%').step()
    this.setData({
      popupFade: this.animation.export(),
      popSlide: this.animation2.export()
    })
    setTimeout(() => {
      this.setData({ feeRule: false })
    }, 300)
  },

  // 费用明细
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

  //打开
  openMasks(e) {
    console.log(e);
    let id = e.currentTarget.dataset.id;
    let imgInfo = [];
    for (let i = 0; i < this.data.allCarInfo.length; i++) {
      if (id == this.data.allCarInfo[i].id) {
        imgInfo = this.data.allCarInfo[i];
      };
    };
    this.setData({
      isMasks: true,
      imgInfo: imgInfo
    });
  },

  //关闭
  closeMasks() {
    this.setData({
      isMasks: false
    });
  },

  returnMask() {
    return;
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