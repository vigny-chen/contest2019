import OrderRepresentation from './output/order-representation';
export default class OrderApp {

  checkout(orderCommand) {
    // TODO: 请完成需求指定的功能
    //1.根据客户购买的贵金属计算金额
    let orderCommandJSON = JSON.parse(orderCommand);
    const items = [
      {productNo: '001001', productName: '世园会五十国钱币册', price: 998.00 },
      {productNo: '001002', productName: '2019北京世园会纪念银章大全40g', price: 1380.00 },
      {productNo: '003001', productName: '招财进宝', price: 1580.00 },
      {productNo: '003002', productName: '水晶之恋', price: 980.00 },
      {productNo: '002002', productName: '中国经典钱币套装', price: 998.00 },
      {productNo: '002001', productName: '守扩之羽比翼双飞4.8g', price: 1080.00 },
      {productNo: '002003', productName: '中国银象棋12g', price: 698.00},
    ];
    let orderCommandItems = orderCommandJSON.items;
    let amount = 0; //合计总额
    let menuData = [];
    for (let i= 0; i < orderCommandItems.length; i++) {
      let sigleProduct = {};
      for (let j= 0; j < items.length; j++) {
        if ( orderCommandItems[i].product === items[j].productNo) {
          sigleProduct = items[j];
          let sigleProductTotalPrice = items[j].price * orderCommandItems[i].amount;
          amount += sigleProductTotalPrice;
          sigleProduct['sigleProductTotalPrice'] = sigleProductTotalPrice;
          sigleProduct['amount'] = orderCommandItems[i].amount;
        }
      }
      menuData.push(sigleProduct);
    }
    console.log('-----------------------');
    console.log(menuData);
    console.log(amount);
    // 2.客户可以使用账户余额购买贵金属，按客户等级计算积分，如果达到升级积分，则提升客户等级。
    // 3.客户支付时，可以使用打折券，对参与打折的商品享受折扣。
    // 4.根据促销规则，计算优惠金额。
    // 5.打印销售凭证。
    return (new OrderRepresentation({})).toString();
  }
}
