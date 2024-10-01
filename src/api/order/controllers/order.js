const paypal = require('@paypal/checkout-server-sdk');

// PayPal 环境设置
let environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET)
let client = new paypal.core.PayPalHttpClient(environment);

module.exports = {
    async createOrder(ctx) {

        console.log('cart information is passing now...')
        const { cartItems, totalAmount } = ctx.request.body;
        console.log('Received cart items:', cartItems);
        console.log('Received total amount:', totalAmount);

        if (!cartItems || cartItems.length === 0 || !totalAmount) {
            return ctx.badRequest('Invalid cart data');
        }



        let shippingAmount = parseFloat(totalAmount) >= 50 ? 0 : 5;

        const totalItemAmount = cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        const taxAmount = 0;
        const handlingAmount = 0;
        const discountAmount = 0;
        const insuranceAmount = 0;
        const shippingDiscountAmount = 0;


        // 创建 PayPal 订单
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");



        // PayPal 请求体
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'AUD',
                    value: parseFloat(totalAmount + shippingAmount).toFixed(2),  // 订单总金额
                    breakdown: {
                        item_total: {
                            currency_code: 'AUD',
                            value: totalItemAmount.toFixed(2),  // 商品总金额
                        },
                        shipping: {
                            currency_code: 'AUD',
                            value: shippingAmount.toFixed(2),  // 运费
                        },
                        tax_total: {
                            currency_code: 'AUD',
                            value: taxAmount.toFixed(2),  // 税费
                        },
                        handling: {
                            currency_code: 'AUD',
                            value: handlingAmount.toFixed(2),  // 处理费
                        },
                        discount: {
                            currency_code: 'AUD',
                            value: discountAmount.toFixed(2),  // 折扣
                        },
                        insurance: {
                            currency_code: 'AUD',
                            value: insuranceAmount.toFixed(2),  // 保险费
                        },
                        shipping_discount: {
                            currency_code: 'AUD',
                            value: shippingDiscountAmount.toFixed(2),  // 运费折扣
                        }
                    }
                },
                items: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit_amount: {
                        currency_code: 'AUD',
                        value: parseFloat(item.price).toFixed(2),  // 商品单价
                    }
                })),
            }],

        });


        try {
            const order = await client.execute(request);
            return ctx.send({ id: order.result.id });  // 返回创建的订单 ID
        } catch (err) {
            console.error('Error creating PayPal order:', err);
            return ctx.badRequest('Error creating PayPal order');
        }
    },
};

