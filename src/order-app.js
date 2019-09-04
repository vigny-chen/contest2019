import OrderRepresentation from './output/order-representation';
import OrderItem from './output/order-item';
import DiscountItem from './output/discount-item';
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
        test1: '1111',
        price: '998.00',
        test:'0000',
        PreferentialPolicy: []
      },
      {
        productNo: '001002',
        productName: '2019北京世园会纪念银章大全40g',
        price: '1380.00',
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
        price: '1580.00',
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
        price: '980.00',
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
        price: '998.00',
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
        price: '1080.00',
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
        price: '698.00',
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
    let amount = 0; // 合计总额
    let realAmount = 0; // 实际支付金额
    let menuData = [];
    let newIntegral = 0; // 新增积分
    let lastIntegral = 0; // 最后积分
    let lastRank = 1;
    let orderItems = []; // 订单数据
    let discountItems = []; // 优惠数据
    // singleProductTotalPrice
    for (let i = 0; i < orderCommandItems.length; i++) {
      let singleProduct = {};
      for (let j = 0; j < items.length; j++) {
        if (orderCommandItems[i].product === items[j].productNo) {
          singleProduct = items[j];
          let singleProductTotalPrice = items[j].price * orderCommandItems[i].amount;
          amount += singleProductTotalPrice;
          singleProduct['singleProductTotalPrice'] = singleProductTotalPrice;
          singleProduct['amount'] = orderCommandItems[i].amount;
          orderItems.push( // 订单数据
            new OrderItem({
              productNo: singleProduct.productNo,
              productName: singleProduct.productName,
              price: Number(singleProduct.price),
              amount: singleProduct.amount,
              subTotal: singleProduct.singleProductTotalPrice
            })
          );
        }
      }
      menuData.push(singleProduct);
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
        if (disdiscountAmount > 0) {
          discountItems.push(
            new DiscountItem({
              productNo: singleProduct.productNo,
              productName: singleProduct.productName,
              discount: -disdiscountAmount
            })
          );
        }
      }
      
    }
    realAmount = amount - discountAmt; // 算出实际支付金额
    // 折扣
    function computerDiscountAmt (discountsItem, singleProduct) {
      let singleDiscountAmt = 0;
      let canDiscount = userDiscount.filter(function(item) {
        return (+item) === discountsItem.discount;
      })[0];
      canDiscount && (singleDiscountAmt += singleProduct.singleProductTotalPrice - singleProduct.singleProductTotalPrice * canDiscount);
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
      let singleProductTotalPrice = singleProduct.singleProductTotalPrice; // 一种商品总价
      let minPrice = discountsItem.minPrice; // 满足金额
      let cutDownPrice = discountsItem.cutDown; // 满减金额
      if (singleProductTotalPrice >= minPrice) {
        return cutDownPrice;
      } else {
        return 0;
      }
    }

    // 2.客户可以使用账户余额购买贵金属，按客户等级计算积分，如果达到升级积分，则提升客户等级。
    let rankToScoreMultiple= { // 等级对应倍数
      '1': {multiple: 1, rankNamae: '普卡'},
      '2': {multiple: 1.5, rankNamae: '金卡'},
      '3': {multiple: 1.8, rankNamae: '白金卡'},
      '4': {multiple: 2, rankNamae: '钻石卡'}
    };
    let usersData = JSON.parse(fs.readFileSync('test/resources/users.json').toString());
    let loginUserData = usersData.filter(function (user) {
      return user.memberId === orderCommandJSON.memberId;
    })[0];
    computerRunkAndIntegral(loginUserData);

    // 客户可以使用账户余额购买贵金属，按客户等级计算积分，如果达到升级积分，则提升客户等级。
    function computerRunkAndIntegral(userData) {
      newIntegral = rankToScoreMultiple[userData.Rank].multiple * realAmount;
      lastIntegral = parseFloat(newIntegral) + parseFloat(userData.Integral);
      judgeUserRank ();
    }
    // 根据付款后积分判断等级
    function judgeUserRank () {
      if (lastIntegral >= 100000) {
        lastRank = '4';
      } else if (lastIntegral >= 50000) {
        lastRank = '3';
      } else if (lastIntegral >= 10000) {
        lastRank = '2';
      } else {
        lastRank = '1';
      }
    }
    let resultData = {
      orderId: orderCommandJSON.orderId, // 订单号
      createTime: new Date(orderCommandJSON.createTime), // 订单创建时间
      memberNo: loginUserData.memberId, // 会员编号
      memberName: loginUserData.UserName,// 会员姓名
      oldMemberType: loginUserData.Rank,// 原会员等级
      newMemberType: rankToScoreMultiple[lastRank].rankNamae,// 新会员等级。当新老等级不一致时，视为升级
      memberPointsIncreased: newIntegral, // 本次消费会员新增的积分
      memberPoints: lastIntegral, // 会员最新的积分( = 老积分 + memberPointsIncreased)
      orderItems: orderItems,// 订单明细
      totalPrice: amount,// 订单总金额
      discounts: discountItems, // 优惠明细
      totalDiscountPrice: discountAmt, // 优惠总金额
      receivables: realAmount, // 应收金额
      payments: [{
        type: '余额支付',
        amount: realAmount
      }], // 付款记录
      discountCards: orderCommandJSON.discountCards// 付款使用的打折券
    };
    return (new OrderRepresentation(resultData)).toString();
  }
}
