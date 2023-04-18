import { Server } from '../../utils/request.js'
let server = new Server()
const { $Toast } = require('../../components/base/index');
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSearch: true, // 是否在搜索页面 或者有搜索结果
    deleteBtn: true, // 输入框内的删除按钮是否显示
    searchText: '', // 输入内容
    pageNum: 0,
    pageSize: 10,
    noResult: false,
    showSearchBtn: false,
    isEdit: false,//是否输入过数据
    isLoad: false, //判断数据是否加载完成
    isSear: false,
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
      name: '已取消',
    }, {
      status: '6',
      name: '已退款',
    },],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('搜索:::::', options);
    this.setData({
      deviceInfo: app.globalData.deviceInfo
    });
    this.searchHistory();
  },

  backPre() {
    wx.navigateBack({
      delta: 1
    });
  },

  //搜索记录
  searchHistory() {
    let postData = {
      needUser: 'seekerId',
      flag: '1', //"1" 搜索记录， "2"删除记录
    }
    server.postRequest('mobile/employee/findOrDeleteSearchRecord', postData, app, res => {
      console.log(res);
      this.setData({
        searchHistoryList: res.data.searchHistoryList
      });
    });
  },

  //搜索提示列表
  getSearchList() {
    let postData = {
      needUser: 'employeeId',
      content: this.data.searchText,
    }
    server.postRequest('mobile/order/smartShow', postData, app, res => {
      console.log(res);
      this.setData({
        searchList: res.data
      });
      // console.log(this.data.searchList);
    });
  },

  //选择搜索列表的某条字段
  selSearchItem(e) {
    this.setData({ searchText: e.currentTarget.dataset.item, deleteBtn: true, isSearch: '1', pageNum: 0, showSearchBtn: false, loadType: 0, isSear: false, });
    this._getSearch();
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

  //进入详情页
  enterPage(e) {
    let id = e.currentTarget.dataset.id;
    let obj = e.currentTarget.dataset.obj;
    let evals = e.currentTarget.dataset.eval;
    wx.navigateTo({
      url: '../orderDetail/index?id=' + id + '&obj=' + JSON.stringify(obj) + '&eval=' + evals,
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
    this.setData({
      pageNum: 0
    });
    this._getSearch();
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
   * input框点击搜索
   */
  onConfirm(e) {
    this.setData({ pageNum: 0, isSear: true, showSearchBtn: true, isEdit: true, loadType: 0, isShowMenu: true })
    this._getSearch();
  },

  /**
* 初始化数据回调函数
*/
  _initDataCallback(data) {
    console.log('列表数据', data)
    for (let i = 0; i < data.orderDetailList.length; i++) {
      data.orderDetailList[i].statusText = this.analysisStatus(data.orderDetailList[i].tripStatus);
    };
    let orderDetailList = data.orderDetailList;

    this.setData({
      orderDetailList: orderDetailList,
      initData: true,
      hasMore: data.totalPage > this.data.pageNum + 1 ? true : false,
      pageNum: this.data.pageNum += 1
    })
  },

  /**
   * 加载更多数据
   */
  getMoreCallback(data) {
    for (let i = 0; i < this.data.orderDetailList.length; i++) {
      this.data.orderDetailList[i].statusText = this.analysisStatus(this.data.orderDetailList[i].tripStatus);
    };
    let orderDetailList = this.data.orderDetailList

    orderDetailList = orderDetailList.concat(data.orderDetailList);
    this.setData({
      orderDetailList: orderDetailList,
      hasMore: data.totalPage > this.data.pageNum + 1 ? true : false,
      pageNum: this.data.pageNum += 1
    })
    this.isLoading = false
  },

  /**
   * 根据关键字搜索数据
   */
  _getSearch() {
    let postData = {
      needUser: 'employeeId',
      // orderDetailStatus: ,
      isSearch: '1', //true:搜索行程列表，false:普通行程列表
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      content: this.data.searchText
    };

    console.log('搜索订单::::', postData);
    server.postRequest('mobile/order/findOrderDetail', postData, app, res => {
      console.log(res);
      this._initDataCallback(res.data);
    });
  },

  /**
   * 点击历史搜索记录
   */
  clickHistory(e) {
    let key = e.currentTarget.dataset.key
    this.setData({ searchText: key, deleteBtn: true, isSearch: '1', pageNum: 0, showSearchBtn: false, loadType: 0 });
    this._getSearch();
  },

  /**
   * 输入框输入事件
   */
  onInput(e) {
    let text = e.detail.value
    text ? this.setData({ searchText: e.detail.value, deleteBtn: true, isSear: true, isSearch: '1', isShowMenu: false, }) : this.setData({ searchText: e.detail.value, deleteBtn: false })

    this.getSearchList();
  },

  /**
   * 输入框聚焦事件
   */
  onFocus() {
    this.searchHistory();
    this.setData({ isSearch: true, searchRes: [], noResult: false, showSearchBtn: true, isShowMenu: true })
  },

  /**
   * 清除用户输入框内容
   */
  deleteSearchText() {
    this.setData({ searchText: '', deleteBtn: false, isSear: false })
    this.onFocus()
  },

  /**
   * 用户点击取消返回上一级页面
   */
  backLast() {
    if (this.data.isEdit) {
      this.setData({ searchText: '', isSearch: true })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },

  /**
   * 清空搜索记录
   */
  clearHistory() {
    if (this.data.searchHistoryList.length) {
      let _this = this;
      wx.showModal({
        title: '提示',
        content: '确定删除历史记录？',
        success: (res) => {
          if (res.confirm) {
            let postData = {
              needUser: 'seekerId',
              flag: '2', //"1" 搜索记录， "2"删除记录
            }
            console.log(postData);
            server.postRequest('mobile/employee/findOrDeleteSearchRecord', postData, app, res2 => {
              console.log(res2);
              this.deleteSearchRecord(res2);
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })

    }
  },

  deleteSearchRecord(res) {
    $Toast({ content: res.data.success, duration: 1.5 })
    this.setData({ searchHistoryList: [] });
  },


  /**
   * 点击历史搜索记录
   */
  clickHistory(e) {
    let key = e.currentTarget.dataset.key
    this.setData({ searchText: key, deleteBtn: true, pageNum: 0, hasMore: true, showSearchBtn: false, loadType: 0 });
    this._getSearch();
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


  /**
   * 上拉加载
   */
  onScrollBottom() {
    console.log('上拉加载:::');
    if (this.data.hasMore && !this.isLoading) {
      this.isLoading = true

      let postData = {
        needUser: 'employeeId',
        // orderDetailStatus: ,
        isSearch: '1', //true:搜索行程列表，false:普通行程列表
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        content: this.data.searchText
      };
      server.postRequest('mobile/order/findOrderDetail', postData, app, res => {
        console.log(res);
        this.getMoreCallback(res.data)
      });
    }
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
      imageUrl: ''
    }
  }
})