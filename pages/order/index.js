// pages/order/index.js
const { $Toast } = require('../../components/base/index');
import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_first_action: true, //判断是否第一次点
    menu: [  // 顶部菜单列表与各类型订单数量
      {
        status: '',
        num: 0,
        name: '全部'
      },
      {
        status: '1',
        num: 0,
        name: '待签约'
      },
      {
        status: '2',
        num: 0,
        name: '待派车'
      },
      {
        status: '3',
        num: 0,
        name: '行程中'
      },
      {
        status: '4',
        num: 0,
        name: '待结算'
      }
    ],
    mf: '0', // 顶部菜单导航选中下标 默认为0
    pageNum: 0,
    pageSize: 5,
    status: '',
    orderStatus: [{
      status: '1',
      name: '待签约',
    }, {
      status: '2',
      name: '待派车',
    }, {
      status: '3',
      name: '行程中',
    }, {
      status: '4',
      name: '待结算',
    }, {
      status: '5',
      name: '已完成',
    }, {
      status: '6',
      name: '已取消',
    },],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      deviceInfo: app.globalData.deviceInfo
    });
    this.getOrderList();
  },

  backPre() {
    //参数传回上一页
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面

    if (prevPage) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.redirectTo({
        url: '../index/index',
      });
    };
  },

  getOrderList() {
    //role: 1-管理员 2-员工
    let postData = {}
    if (app.globalData.employeeInfo.role == '1') {
      postData = {
        enterpriseId: app.globalData.employeeInfo.enterpriseId,
        orderStatus: this.data.status,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
      };
    } else {
      postData = {
        needUser: 'employeeId',
        enterpriseId: app.globalData.employeeInfo.enterpriseId,
        orderStatus: this.data.status,
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
      };
    };

    console.log(postData);
    server.postRequest('mobile/employee/findMyOrder', postData, app, res => {
      console.log(res);
      this._initDataCallback(res.data);
    });
  },

  callService(e) {
    wx.makePhoneCall({
      phoneNumber: app.globalData.consumerHotline
    });
  },

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
* 初始化数据回调函数
*/
  _initDataCallback(data) {
    console.log('列表数据', data)
    for (let i = 0; i < data.orderList.length; i++) {
      data.orderList[i].statusText = this.analysisStatus(data.orderList[i].orderStatus);
    };
    let orderList = data.orderList;

    this.setData({
      orderList: orderList,
      initData: true,
      hasMore: data.totalPage > this.data.pageNum + 1 ? true : false,
      pageNum: this.data.pageNum += 1
    })
  },

  /**
   * 加载更多数据
   */
  getMoreCallback(data) {
    for (let i = 0; i < data.orderList.length; i++) {
      data.orderList[i].statusText = this.analysisStatus(data.orderList[i].orderStatus);
    };
    let orderList = this.data.orderList

    orderList = orderList.concat(data.orderList);
    this.setData({
      orderList: orderList,
      hasMore: data.totalPage > this.data.pageNum + 1 ? true : false,
      pageNum: this.data.pageNum += 1
    })
    this.isLoading = false
  },

  /**
 * 订单顶部菜单导航点击事件
 */
  select: function (event) {
    let mf = event.currentTarget.dataset.index;
    let status = event.currentTarget.dataset.item.status;
    this.setData({ status: status, pageNum: 0 });
    this.menuHighLight(mf);
    this.getOrderList();
  },

  /**
 * 菜单导航选中高亮
 */
  menuHighLight: function (index) {
    this.setData({ mf: index })
  },

  //进入详情
  enterPage(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../order-details/index?id=' + id,
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

  //取消订单
  cancelOrder(e) {
    if (this.data.is_first_action) {
      this.setData({ is_first_action: false });
      wx.showModal({
        title: '提示',
        content: '是否取消订单',
        confirmText: '确定',
        cancelText: '取消',
        confirmColor: '#FD9105',
        cancelColor: '#666666',
        success: (res) => {
          this.setData({ is_first_action: true });
          if (res.confirm) {
            console.log('用户点击确定')
            let id = e.currentTarget.dataset.id;
            let postData = {
              employeeFlag: '1',
              orderId: id,
            };
            server.postRequest('mobile/employee/employeeUpdateStatus', postData, app, res2 => {
              console.log(res2);
              if (res2.status) {
                if (res2.data.status == "100000") {
                  $Toast({
                    content: res2.data.msg,
                    duration: 1.5
                  });
                  this.setData({ pageNum: 0 });
                  this.getOrderList();
                } else {
                  $Toast({
                    content: res2.data.msg,
                    duration: 1.5
                  });
                };
              } else {
                $Toast({
                  content: res2.msg,
                  duration: 1.5
                })
              };
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          };
        }
      });
    };
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
    console.log('上拉加载:::');
    if (this.data.hasMore && !this.isLoading) {
      this.isLoading = true

      //role: 1-管理员 2-员工
      let postData = {}
      if (app.globalData.employeeInfo.role == '1') {
        postData = {
          enterpriseId: app.globalData.employeeInfo.enterpriseId,
          orderStatus: this.data.status,
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize,
        };
      } else {
        postData = {
          needUser: 'employeeId',
          enterpriseId: app.globalData.employeeInfo.enterpriseId,
          orderStatus: this.data.status,
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize,
        };
      };
      console.log(postData);
      server.postRequest('mobile/employee/findMyOrder', postData, app, res => {
        console.log(res);
        this.getMoreCallback(res.data);
      });
    }
  },
})