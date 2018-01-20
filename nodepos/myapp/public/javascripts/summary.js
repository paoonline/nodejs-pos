var app = new Vue({
    el: '#appSummary',
    data: {
        yearItem: [],
        monthItem: [
            { i: 1, value: 'มกราคม' },
            { i: 2, value: 'กุมภาพันธ์' },
            { i: 3, value: 'มีนาคม' },
            { i: 4, value: 'เมษายน' },
            { i: 5, value: 'พฤษภาคม' },
            { i: 6, value: 'มิถุนายน' },
            { i: 7, value: 'กรกฏาคม' },
            { i: 8, value: 'สิงหาคม' },
            { i: 9, value: 'กันยายน' },
            { i: 10, value: 'ตุลาคม' },
            { i: 11, value: 'พฤศจิกายน' },
            { i: 12, value: 'ธันวาคม' }
        ],
        items: [],
        y: null,
        m: null
    },
    methods: {
        startPage: function() {
            var d = new Date();
            var y = d.getFullYear();
            var m = d.getMonth() + 1;
            var beforeYear = y - 10;

            app.y = y;
            app.m = m;

            for (var i = y; i >= beforeYear; i--) {
                app.yearItem.push(i);
            }
        },
        search: function() {
            var params = {
                y: app.y,
                m: app.m
            };
            Vue.http.post('/summary', params).then(res => {
                app.items = res.body
            }, err => {});
        }
    }
});

app.startPage();