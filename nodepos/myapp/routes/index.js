var express = require('express');
var router = express.Router();
var ejs_layout = require('ejs-layouts');

var mongo = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/db_nodepos';
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var ObjectId = require('mongodb').ObjectId;

router.use(ejs_layout.express);

router.use(session({
    secret: 'NodePOS',
    store: new FileStore({ secret: 'nodePos' }),
    resave: true,
    saveUninitialized: true
}));

/* GET home page. */
router.get('/', function(req, res, next) {
    res.layout('layout', {}, { content: { block: 'index' } });
});

router.post('/login', function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var con = {
            usr: req.body.usr,
            pwd: req.body.pwd
        };
        // var db = db.db("db_nodepos");
        db.collection('users').findOne(con, function(err, result) {
            if (err) console.log(err);

            if (result != null) {
                req.session.user_id = result._id;
                res.redirect('/home');
            } else {
                res.redirect('/');
            }
        });
    });
});

router.get('/home', checkLogin, function(req, res, next) {
    res.layout('layout_home', {}, { content: { block: 'home' } });
});

router.get('/org', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        // var db = db.db("db_nodepos");
        db.collection('org').find().toArray(function(err, result) {
            var data = {};

            if (result[0] != undefined) {
                // first object
                data = { org: result[0] }
            } else {
                // empty object
                var org = {
                    name: null,
                    tel: null,
                    tax: null,
                    address: null
                }
                data = { org: org }
            }

            var content = { block: 'org', data: data }
            res.layout('layout_home', {}, { content: content });
        });
    });
});

router.post('/org', checkLogin, function(req, res, next) {

    mongo.connect(url, function(err, db) {
        // var db = db.db("db_nodepos");
        db.collection('org', function(err, col) {
            col.find().toArray(function(err, result) {
                if (result[0] == undefined) {
                    col.updateOne(result[0], req.body, function(err) {});
                } else {

                    col.updateOne(result[0], req.body, function(err) {});
                }
                console.log(result[0]);
                res.redirect('org');
            });
        });
    });
});

router.get('/logout', checkLogin, function(req, res, next) {
    req.session.destroy(function() {
        res.redirect('/');
    });
});

router.get('/product', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        db.collection('product').find().toArray(function(err, result) {
            var data = {
                products: result,
                n: 1
            };
            var content = {
                block: 'product',
                data: data
            };
            res.layout('layout_home', {}, { content: content });
        });
    });
});

router.get('/product_form', checkLogin, function(req, res, next) {
    var product = {
        barcode: null,
        name: null,
        price: null,
        old_price: null
    };

    var content = {
        block: 'product_form',
        data: { product: product }
    }
    res.layout('layout_home', {}, { content: content });
});

router.post('/product_form', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        db.collection('product').insertOne(req.body, function(err) {
            if (err) console.log(err);
            res.redirect('/product');
        });
    });
});

router.get('/product_edit', checkLogin, function(req, res, next) {
    if (req.query.id != undefined) {
        mongo.connect(url, function(err, db) {
            var con = {
                _id: new ObjectId(req.query.id)
            }
            db.collection('product').findOne(con, function(err, result) {
                if (err) console.log(err);

                if (result != undefined) {
                    var content = {
                        block: 'product_form',
                        data: { product: result }
                    };
                    res.layout('layout_home', {}, { content: content });
                }
            });
        });
    }
});

router.post('/product_edit', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        db.collection('product', function(err, col) {
            var con = { _id: new ObjectId(req.query.id) };

            col.findOne(con, function(err, oldData) {
                if (oldData != undefined) {
                    col.updateOne(oldData, req.body, function(err) {
                        if (err) console.log(err);
                        res.redirect('/product');
                    });
                }
            });
        });
    });
});

router.get('/product_delete', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = { _id: new ObjectId(req.query.id) };

        db.collection('product').findOne(con, function(err, oldData) {
            if (err) console(err);
            db.collection('product').deleteOne(oldData, function(err) {
                if (err) console(err);
                res.redirect('/product');
            });
        });
    });
});

router.get('/user', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        db.collection('users').find().toArray(function(err, result) {
            var content = {
                block: 'user',
                data: { users: result, n: 1 }
            }
            res.layout('layout_home', {}, { content: content });
        });
    });
});

router.get('/userForm', checkLogin, function(req, res, next) {
    var user = {
        name: null,
        usr: null,
        pwd: null,
        level: 'user'
    };

    var content = {
        block: 'userForm',
        data: { user: user, checked: null }
    }
    res.layout('layout_home', {}, { content: content });
});

router.post('/userForm', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        if (req.body.pwd == req.body.confirm_pwd) {
            if (req.body.level == undefined) {
                req.body.level = 'user';
            }
            db.collection('users').insertOne(req.body, function(err) {
                if (err) console.log(err);
                res.redirect('/user');
            });
        } else {
            res.send('password กับการยืนยันไม่ตรงกัน')
        }
    });
});

router.get('/userDelete', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = {
            _id: new ObjectId(req.query.id)
        }
        db.collection('users').findOne(con, function(err, oldData) {
            db.collection('users').deleteOne(oldData, function(err) {
                if (err) console.log(error)
                res.redirect('/user');
            });
        });
    });
});

router.get('/userEdit', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = { _id: new ObjectId(req.query.id) };

        db.collection('users').findOne(con, function(err, result) {

            var checked = null;
            if (result.level == 'admin') {
                checked = 'checked';
            }
            var content = {
                block: 'userForm',
                data: { user: result, checked: checked }
            }
            res.layout('layout_home', {}, { content: content });
        });
    });
});

// router.post('/userEdit', checkLogin, function(req, res, next) {
//     mongo.connect(url, function(err, db) {
//         var con = { _id: new ObjectId(req.query.id) };

//         db.collection('users').findOne(con, function(err, oldData) {
//             if (err) console.log(err);

//             if (req.body.pwd == req.body.confirm_pwd) {
//                 if (req.body.level == undefined) {
//                     req.body.level = 'user';
//                 }
//                 db.collection('users').updateOne(oldData, req.body, function(err) {
//                     if (err) console.log(err);
//                     res.redirect('user');
//                 });

//             } else {
//                 res.send('password กับการยืนยันไม่ตรงกัน');
//             }
//         });
//     });
// });

router.post('/userEdit', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = { _id: new ObjectId(req.query.id) };

        if (req.body.pwd == req.body.confirm_pwd) {
            if (req.body.level == undefined) {
                req.body.level = 'user';
            }
            db.collection('users').updateOne(con, req.body, function(err) {
                if (err) console.log(err);
                res.redirect('user');
            });
        } else {
            res.send('password กับการยืนยันไม่ตรงกัน');
        }

    });
});

function checkLogin(req, res, next) {
    if (req.session.user_id == undefined) {
        res.redirect('/');
    } else {
        next();
    }
}

module.exports = router;