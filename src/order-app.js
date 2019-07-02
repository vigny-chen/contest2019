import OrderRepresentation from './output/order-representation';
var fs = require('fs');
export default class OrderApp {
  checkout(orderCommand) {
    // TODO: 请完成需求指定的功能
    //1.根据客户购买的贵金属计算金额
    let orderCommandJSON = JSON.parse(orderCommand);

    // 优惠政策 PreferentialPolicy 0.无优惠  1.折扣 2.第N件半价 3.满送 4.满减

    const items = [
      {
        productNo: '001001',
        productName: '世园会五十国钱币册',
        price: 998.00,
        PreferentialPolicy: []
      },
      {
        productNo: '001002',
        productName: '2019北京世园会纪念银章大全40g',
        price: 1380.00,
        PreferentialPolicy: [
          {
            type: 1,
            discount: 0.9
          }
        ]
      },
      {
        productNo: '003001',
        productName: '招财进宝',
        price: 1580.00,
        PreferentialPolicy: [
          {
            type: 1,
            discount: 0.95
          }
        ]
      },
      {
        productNo: '003002',
        productName: '水晶之恋',
        price: 980.00,
        PreferentialPolicy: [
          {
            type: 2,
            halfPriceNum: 3
          },
          {
            type: 3,
            presentNum: 3
          }
        ]
      },
      {
        productNo: '002002',
        productName: '中国经典钱币套装',
        price: 998.00,
        PreferentialPolicy: [
          {
            type: 4,
            minPrice: 2000,
            cutDown: 30
          },
          {
            type: 4,
            minPrice: 1000,
            cutDown: 10
          }
        ]
      },
      {
        productNo: '002001',
        productName: '守扩之羽比翼双飞4.8g',
        price: 1080.00,
        PreferentialPolicy: [
          {
            type: 1,
            discount: 0.95
          },
          {
            type: 2,
            halfPriceNum: 3
          },
          {
            type: 3,
            presentNum: 3
          }
        ]
      },
      {
        productNo: '002003',
        productName: '中国银象棋12g',
        price: 698.00,
        PreferentialPolicy: [
          {
            type: 1,
            discount: 0.9
          },
          {
            type: 4,
            minPrice: 3000,
            cutDown: 350
          },
          {
            type: 4,
            minPrice: 2000,
            cutDown: 30
          },
          {
            type: 4,
            minPrice: 1000,
            cutDown: 10
          }
        ]
      },
    ];

    let orderCommandItems = orderCommandJSON.items; // 用户订单
    let amount = 0; //合计总额
    let menuData = [];
    for (let i = 0; i < orderCommandItems.length; i++) {
      let sigleProduct = {};
      for (let j = 0; j < items.length; j++) {
        if (orderCommandItems[i].product === items[j].productNo) {
          sigleProduct = items[j];
          let sigleProductTotalPrice = items[j].price * orderCommandItems[i].amount;
          amount += sigleProductTotalPrice;
          sigleProduct['sigleProductTotalPrice'] = sigleProductTotalPrice;
          sigleProduct['amount'] = orderCommandItems[i].amount;
        }
      }
      menuData.push(sigleProduct);
    }

    // 3.客户支付时，可以使用打折券，对参与打折的商品享受折扣。
      // 1. 获取用户使用的折扣券
    let userDiscount = []; // 用户折扣券数组
    orderCommandJSON.discountCards.forEach((item) => {
      let value = '0.'+item.replace(/[^0-9]/g, '');
      userDiscount.push(value);
    });

    // 计算优惠
    let discountAmt = 0; // 优惠合计
    for (let i = 0; i < menuData.length; i++) {
      const singleProduct = menuData[i];
      let PreferentialPolicy = singleProduct.PreferentialPolicy;
      let singleProductforAllDiscounts = [];
      for (let j = 0; j < PreferentialPolicy.length; j++) {
        const discountsItem = PreferentialPolicy[j];
        switch (discountsItem.type) {
          case 1: // 折扣
            singleProductforAllDiscounts.push(computerDiscountAmt(discountsItem, singleProduct));
            break;
          case 2: // 第N件半价
            singleProductforAllDiscounts.push(computerHalfPrice(discountsItem, singleProduct));
            break;
          case 3: // 满送
            singleProductforAllDiscounts.push(computerPresentNum(discountsItem, singleProduct));
            break;
          case 4: // 满减
            singleProductforAllDiscounts.push(computerFullReduction(discountsItem, singleProduct));
            break;
          default:
            break;
        }
      }
      // 取最大优惠金额
      if (singleProductforAllDiscounts.length > 0) {
        let disdiscountAmount = Math.max(...singleProductforAllDiscounts);
        discountAmt += disdiscountAmount;
        menuData[i]['disdiscountAmount'] = disdiscountAmount;
      }
      singleProductforAllDiscounts.length > 0 && (discountAmt += Math.max(...singleProductforAllDiscounts));
    }
    // console.log('__________________________')
    // console.log(discountAmt);
    // 折扣
    function computerDiscountAmt (discountsItem, singleProduct) {
      let singleDiscountAmt = 0;
      let canDiscount = userDiscount.filter(function(item) {
        return (+item) === discountsItem.discount;
      })[0];
      canDiscount && (singleDiscountAmt += singleProduct.sigleProductTotalPrice - singleProduct.sigleProductTotalPrice * canDiscount);
      console.log('折扣：' + singleDiscountAmt)
      return singleDiscountAmt;
    }
    // 第N件半价
    function computerHalfPrice (discountsItem, singleProduct) {
      let totalNum = singleProduct.amount; // 单件商品总数
      let halfPriceNum = discountsItem.halfPriceNum; // 第几件半价
      if (totalNum >= halfPriceNum) {
        return parseFloat(singleProduct.price) / 2;
      } else {
        return 0;
      }
    }
    // 满送
    function computerPresentNum (discountsItem, singleProduct) {
      let totalNum = singleProduct.amount; // 单件商品总数
      let presentNum = discountsItem.presentNum; // 第几个满送
      if (totalNum - 1 >= presentNum) {
        return parseFloat(singleProduct.price);
      } else {
        return 0;
      }
    }
    // 满减
    function computerFullReduction (discountsItem, singleProduct) {
      let sigleProductTotalPrice = singleProduct.sigleProductTotalPrice; // 一种商品总价
      let minPrice = discountsItem.minPrice; // 满足金额
      let cutDownPrice = discountsItem.cutDown; // 满减金额
      if (sigleProductTotalPrice >= minPrice) {
        return cutDownPrice;
      } else {
        return 0;
      }
    }

    // 2.客户可以使用账户余额购买贵金属，按客户等级计算积分，如果达到升级积分，则提升客户等级。
    fs.readFile('test/resources/users.json', function (err, data) {
      if (err) {
        return err;
      }
      let usersData = JSON.parse(data.toString());
      let loginUserData = usersData.filter(function (user) {
        return user.memberId === orderCommandJSON.memberId;
      })[0];
      // computerRunkAndIntegral(loginUserData);
    });

    // 客户可以使用账户余额购买贵金属，按客户等级计算积分，如果达到升级积分，则提升客户等级。
    // computerRunkAndIntegral(userData) {

    // }
    // 4.根据促销规则，计算优惠金额。
    // 5.打印销售凭证。
    return (new OrderRepresentation({})).toString();
  }
}
