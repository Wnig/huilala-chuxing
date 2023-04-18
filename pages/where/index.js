// pages/choiceCar/index.js
import { Server } from '../../utils/request.js'
let server = new Server()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: [{
      id: 0,
      name: '酒店',
      color: '',
    }, {
      id: 1,
      name: '机场',
      color: 'blue',
    },{
      id: 2,
      name: '火车站',
      color: 'yellow',
    }, {
      id: 3,
      name: '汽车站',
      color: 'green',
    }, {
      id: 4,
      name: '码头',
      color: 'pink',
    }],
    searchText: '',
    pages: 1,
    rows: 10,
    type: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      types: options.type,
      deviceInfo: app.globalData.deviceInfo,
      type: options.type == 'dep' ?  '1': '2',
    });
    this.getData();
  },

  backPre() {
    wx.navigateBack({
      delta: 1
    });
  },

  //输入事件
  onInput(e) {
    console.log(e);
    this.setData({
      searchText: e.detail.value
    });
  },

  //搜索
  onConfirm(e) {
    this.setData({
      pages: 1,
    });
    this.getData();
  },

  getData() {
    let postData = {
      businessId: app.globalData.employeeInfo.businessId,
      type: this.data.type,
      name: this.data.searchText,
      pages: this.data.pages,
      rows: this.data.rows,
    };
    console.log(postData);
    server.postRequest('mobile/order/getAddress', postData, app, res => {
      console.log(res);
      this._initDataCallback(res);
    });
  },

  /**
* 初始化数据回调函数
*/
  _initDataCallback(res) {
    console.log('列表数据', res)
    let list = res.data;

    this.setData({
      list: list,
      initData: true,
      hasMore: res.pageBean.totalPage > this.data.pages + 1 ? true : false,
      pages: this.data.pages += 1
    })
  },

  /**
   * 加载更多数据
   */
  getMoreCallback(res) {
    let list = this.data.list

    list = list.concat(res.data);
    this.setData({
      list: list,
      hasMore: res.pageBean.totalPage> this.data.pages + 1 ? true : false,
      pages: this.data.pages += 1
    })
    this.isLoading = false
  },

  selAddress(e) {
    console.log(e);
    let ind = e.currentTarget.dataset.index;
    //参数传回上一页
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面

    if (prevPage) {
      if (this.data.types == 'dep')  {
        prevPage.setData({//直接给上一页面赋值
          departures: this.data.list[ind].name,
          departures_lat: this.data.list[ind].lat,
          departures_lon: this.data.list[ind].lon
        });
      } else {
        prevPage.setData({//直接给上一页面赋值
          destinations: this.data.list[ind].name,
          destinations_lat: this.data.list[ind].lat,
          destinations_lon: this.data.list[ind].lon
        });
      };

      wx.navigateBack({
        delta: 1
      });
    };
  },

  /**
 * 上拉加载
 */
  onScrollBottom() {
    console.log('上拉加载:::');
    if (this.data.hasMore && !this.isLoading) {
      this.isLoading = true;

      let postData = {
        businessId: app.globalData.employeeInfo.businessId,
        type: this.data.type,
        name: this.data.searchText,
        pages: this.data.pages,
        rows: this.data.rows,
      };
      server.postRequest('mobile/order/getAddress', postData, app, res => {
        console.log(res);
        this.getMoreCallback(res);
      });
    }
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