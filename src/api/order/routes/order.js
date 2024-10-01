module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/create',
      handler: 'order.createOrder',
      config: {
        policies: [],
      },
    },
  ],
};

