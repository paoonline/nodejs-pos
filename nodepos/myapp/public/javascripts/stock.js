var app = new Vue({
    el: '#appStock',
    data: {
        products: [],
        billImports: [],
        barcode: null
    },
    methods: {
        findByBarcode: function() {
            if (app.barcode != null) {
                var param = {
                    barcode: app.barcode
                };

                Vue.http.post('/findByBarcode', param).then(res => {
                    if (res.body != null) {
                        app.chooseProduct(res.body);
                    }
                }, err => {});
            }
        },
        browse: function() {
            Vue.http.get('/products').then(res => {
                app.products = res.body;
                showMetroCharm('#charmProduct');
            }, err => {});
        },
        chooseProduct: function(p) {
            Vue.http.post('/saveProductToStock', p).then(res => {
                if (res.body.message == 'success') {
                    app.loadData();
                    hideMetroCharm('#charmProduct');
                }
            }, err => {});
        },
        loadData: function() {
            Vue.http.get('/importToStocks').then(res => {
                app.billImports = res.body;
            }, err => {});
        },
        removeItem: function(item) {
            Vue.http.post('/removeBillImport', item).then(res => {
                if (res.body.message == 'success') {
                    app.loadData();
                }
            }, err => {});
        }
    }
});
app.loadData();