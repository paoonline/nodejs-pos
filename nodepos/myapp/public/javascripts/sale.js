var app = new Vue({
    el: '#appSale',
    data: {
        billSales: [],
        barcode: null,
        totalPrice: 0,
        products: [],
        billSaleDetails: [],
        inputMoney: 0,
        returnMoney: 0,
        reduceMoney: 0,
        org: {},
        billSaleForPrint: {
            billSale: {},
            items: []
        },
        sumQty: 0,
        sumPrice: 0
    },
    methods: {
        loadBillSales: function() {
            Vue.http.get('/billSales').then(res => {
                app.billSales = res.body;
            }, err => {});

            showMetroCharm('#charmBillSales');
        },
        resetSale: function() {
            Vue.http.get('/resetSale').then(res => {
                if (res.body.message == 'success') {
                    app.billSaleDetails = [];
                    app.totalPrice = 0;
                }
            }, err => {
                console.log(err);
            });
        },
        dialogEndSale: function() {
            showMetroCharm('#charmEndSale');
        },
        printLastBill: function() {
            Vue.http.post('/lastBillInfo').then(res => {
                if (res.body != null) {
                    app.billSaleForPrint = res.body;
                    app.printYourBill(res.body);
                }
            }, err => {});
        },
        findByBarcode: function() {
            if (app.barcode != null) {
                var params = {
                    barcode: app.barcode
                };

                Vue.http.post('/findByBarcode', params).then(res => {
                    if (res.body.message == null) {
                        app.chooseProduct(res.body);
                    } else {
                        alert("ไม่พบสินค้า");
                    }
                }, err => {});
            }
        },
        dialogProduct: function() {
            Vue.http.get('/products').then(res => {
                app.products = res.body;
                showMetroCharm('#charmProduct');
            }, err => {});
        },
        chooseProduct: function(p) {
            Vue.http.post('/createBillSale').then(res => {
                if (res.body.message == 'success') {
                    Vue.http.post('/chooseProduct', p).then(res => {
                        app.loadBillSaleDetails();
                        hideMetroCharm('#charmProduct');
                    }, err => {
                        console.log(err);
                    });
                }
            }, err => {});
        },
        loadBillSaleDetails: function() {
            Vue.http.get('/billSaleDetails').then(res => {
                app.billSaleDetails = res.body;

                for (var i = 0; i < res.body.length; i++) {
                    var qty = Number(res.body[i].qty);
                    var price = Number(res.body[i].price);

                    var sumPerRow = (qty * price);

                    app.totalPrice += Number(sumPerRow);
                }
            }, err => {});
        },
        removeSaleDetail: function(item) {
            Vue.http.post('/removeSaleDetail', item).then(res => {
                if (res.body.message == 'success') {
                    app.loadBillSaleDetails();
                }
            }, err => {});
        },
        computePrice: function() {
            var input = Number(app.inputMoney);
            var total = Number(app.totalPrice);
            var reduce = Number(app.reduceMoney);

            app.returnMoney = (input - total) + reduce;
        },
        endSale: function() {
            var params = {
                total: app.totalPrice,
                input: app.inputMoney,
                reduce: app.reduceMoney,
                returnMoney: app.returnMoney
            };

            Vue.http.post('/endSale', params).then(res => {
                if (res.body.message == 'success') {
                    app.totalPrice = 0;
                    app.inputMoney = 0;
                    app.reduceMoney = 0;
                    app.returnMoney = 0;
                    app.barcode = null;
                    app.billSaleDetails = [];

                    hideMetroCharm('#charmEndSale');
                }
            }, err => {});
        },
        printBill: function(item) {
            Vue.http.post('/billSaleInfo', item).then(res => {
                if (res.body != null) {
                    app.printYourBill(res.body);
                }
            }, err => {});
        },
        printYourBill: function(billSale) {
            app.billSaleForPrint = billSale;

            for (var i = 0; i < billSale.items.length; i++) {
                var qty = Number(billSale.items[i].qty);
                var price = Number(billSale.items[i].price);

                app.sumQty += qty;
                app.sumPrice += (qty * price);
            }

            setTimeout(app.showBill, 100);
        },
        showBill: function() {
            $('#billSale').show();
            printJS('billSale', 'html');
            $('#billSale').hide();
        },
        loadOrg: function() {
            Vue.http.get('/orgInfo').then(res => {
                app.org = res.body;
            }, err => {});
        }
    }
});

app.loadBillSaleDetails();
app.loadOrg();