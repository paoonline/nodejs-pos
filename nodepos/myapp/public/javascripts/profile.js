var app = new Vue({
    el: '#appProfile',
    data: {
        user: {}
    },
    methods: {
        save: function() {
            Vue.http.post('/profile', app.user).then(res => {
                if (res.body.message == 'success') {
                    alertify.success('ระบบบันทึกข้อมูลเรียบร้อยแล้ว');

                }
            }, err => {});
        },
        loadInfo: function() {
            Vue.http.post('/userInfo').then(res => {
                if (res.body != null) {
                    app.user = res.body;
                    console.log(app.user);
                }
            }, err => {});
        }

    }
});

app.loadInfo();