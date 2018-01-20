var app = new Vue({
    el: '#appReport',
    data: {
        showIncome: true,
        showStock: false,
        billSaleDetails: [],
        billImportProducts: []
    },
    methods: {
        startPage: function() {
            $(".tab-control").tabcontrol();
            app.reportIncome();
        },
        reportIncome: function() {
            app.showIncome = true;
            app.showStock = false;
            app.loadBillSaleDetails();
        },
        reportStock: function() {
            app.showIncome = false;
            app.showStock = true;
            app.loadStockData();
        },
        loadBillSaleDetails: function() {
            Vue.http.get('/reportIncome').then(res => {
                app.billSaleDetails = res.body;
            }, err => {});
        },
        loadStockData: function() {
            Vue.http.get('/reportStock').then(res => {
                app.billImportProducts = res.body;
            }, err => {});
        }
    }
});