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
    store: new FileStore({ secret: 'NodePOS' }),
    resave: false,
    saveUninitialized: false
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

router.get('/products', checkLogin, function(req, res, next) {

    mongo.connect(url, function(err, db) {
        db.collection('product').find().toArray(function(err, result) {
            if (err) console.log(err);
            res.send(result);
        });
    });
});

router.post('/createBillSale', checkLogin, function(req, res, next) {

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);
        var con = { status: 'open' };
        db.collection('billSale').findOne(con, function(err, billSale) {
            if (err) console.log(err);
            if (billSale == null) {

                var newBillSale = {
                    created_at: new Date(),
                    status: 'open'
                }
                db.collection('billSale').insertOne(newBillSale, function(err) {
                    if (err) console.log(err);
                });
            }
            res.send({ message: 'success' });
        });
    });
});

router.post('/chooseProduct', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = { status: 'open' };

        db.collection('billSale').findOne(con, function(err, billSale) {
            if (err) console.log(err);

            if (billSale != null) {
                var product_id = new ObjectId(req.body._id);

                var con = {
                    product_id: product_id,
                    bill_sale_id: billSale._id
                };

                db.collection('billSaleDetail').findOne(con, function(err, billSaleDetail) {
                    if (err) console.log(err);

                    var obj = {};

                    if (billSaleDetail == null) {
                        obj = {
                            qty: 1,
                            product_id: product_id,
                            bill_sale_id: billSale._id,
                            price: req.body.price
                        };

                        db.collection('billSaleDetail').insertOne(obj, function(err) {
                            if (err) console.log(err);
                        });
                    } else {

                        var qty = (billSaleDetail.qty + 1);
                        obj = {
                            qty: qty,
                            product_id: product_id,
                            bill_sale_id: billSale._id,
                            price: req.body.price
                        };
                        db.collection('billSaleDetail').updateOne(billSaleDetail, obj, function(err) {
                            if (err) console.log(err);
                        });
                    }
                    res.send({ message: 'success' });
                });
            }
        });
    });
});

router.get('/billSaleDetails', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var con = { status: 'open' };

        db.collection('billSale').findOne(con, function(err, billSale) {
            if (err) console.log(err);

            if (billSale != null) {
                var con = { bill_sale_id: billSale._id };

                db.collection('billSaleDetail').find(con).toArray(function(err, result) {
                    if (err) console.log(err);

                    if (result != null) {
                        var arr = [];

                        db.collection('product').find().toArray(function(err, products) {

                            for (var i = 0; i < result.length; i++) {
                                var product_id = result[i].product_id.toString();

                                var findProduct = products.find(p => p._id == product_id);

                                if (findProduct != null) {
                                    var row = {
                                        _id: result[i]._id,
                                        qty: result[i].qty,
                                        price: findProduct.price,
                                        name: findProduct.name,
                                        barcode: findProduct.barcode,
                                        total: result[i].qty * findProduct.price,
                                    };
                                    arr.push(row);
                                }
                            }

                            res.send(arr);
                        });
                    } else {
                        res.send({});
                    }
                });
            } else {
                res.send({});
            }
        });
    });
});

router.get('/sale', checkLogin, function(req, res, next) {
    var content = {
        block: 'sale'
    }

    res.layout('layout_home', {}, { content: content });
});

router.get('/resetSale', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = { status: 'open' };

        db.collection('billSale').findOne(con, function(err, billSale) {
            if (err) console.log(err);

            var con = { bill_sale_id: billSale._id };
            db.collection('billSaleDetail').deleteMany(con, function(err) {
                if (err) console.log(err);

                db.collection('billSale').deleteOne(billSale, function(err) {
                    if (err) console.log(err);

                    res.send({ message: 'success' });
                });
            });
        });
    });
});

router.post('/removeSaleDetail', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var con = { _id: new ObjectId(req.body._id) };

        db.collection('billSaleDetail').deleteOne(con, function(err) {
            if (err) console.log(err);

            res.send({ message: 'success' });
        });
    });
});

router.post('/findByBarcode', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var con = { barcode: req.body.barcode };

        db.collection('product').findOne(con, function(err, result) {
            if (err) console.log(err);

            if (result != null) {
                res.send(result);
            } else {
                res.send({ message: 'not found' });
            }
        });
    });
});

router.post('/endSale', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = { status: 'open' };

        db.collection('billSale').findOne(con, function(err, billSale) {

            if (err) console.log(err);

            if (billSale != null) {
                var newBillSale = {
                    status: 'close',
                    created_at: new Date(),
                    inputMoney: req.body.input,
                    returnMoney: req.body.returnMoney,
                    reduceMoney: req.body.reduce,
                    totalPrice: req.body.total
                };

                db.collection('billSale').update(billSale, newBillSale, function(err) {
                    if (err) console.log(err);

                    res.send({ message: 'success' });
                });
            } else {
                res.send({});
            }
        });
    });
});

router.get('/billSales', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var con = { status: 'close' };
        var sort = { _id: -1 };

        db.collection('billSale')
            .find(con)
            .sort(sort)
            .toArray(function(err, result) {
                if (err) console.log(err);

                res.send(result);

            });
    });
});

router.get('orgInfo', checkLogin, function(req, res, next) {

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        db.collection('org').findOne(function(err, result) {
            if (err) console.log(err);
            res.send(result);

        });
    });
});

router.post('/billSaleInfo', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var con = {
            _id: new ObjectId(req.body._id)
        };

        db.collection('billSale').findOne(con, function(err, billSale) {
            if (err) console.log(err);

            if (billSale != null) {
                var con = {
                    bill_sale_id: billSale._id
                }

                db.collection('billSaleDetail').find(con).toArray(function(err, result) {
                    if (err) console.log(err);

                    if (result != null) {
                        db.collection('product').find().toArray(function(err, products) {
                            if (err) console.log(err);

                            var arr = [];

                            for (var i = 0; i < result.length; i++) {
                                var productId = result[i].product_id.toString();

                                var product = products.find(p => p._id.toString() == productId);

                                if (product != null) {
                                    var row = {
                                        barcode: product.barcode,
                                        name: product.name,
                                        price: result[i].price,
                                        qty: result[i].qty
                                    };

                                    arr.push(row);

                                }
                            }

                            var output = {
                                billSale: billSale,
                                items: arr
                            };

                            res.send(output);
                        });
                    } else {
                        res.send({});
                    }
                });
            } else {
                res.send({});
            }
        });
    });
});

router.post('/lastBillInfo', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var order = {
            _id: -1
        };

        var con = {
            status: 'close'
        };

        db.collection('billSale').find(con).sort(order).limit(1).toArray(function(err, result) {
            if (err) console.log(err);

            if (result != null) {
                var billSale = result[0];

                var con = {
                    bill_sale_id: billSale._id
                }

                db.collection('billSaleDetail').find(con).toArray(function(err, result) {
                    if (err) console.log(err);

                    if (result != null) {
                        db.collection('product').find().toArray(function(err, products) {
                            if (err) console.log(err);

                            var arr = [];


                            for (var i = 0; i < result.length; i++) {
                                var productId = result[i].product_id.toString();

                                var product = products.find(p => p._id.toString() == productId);

                                if (product != null) {

                                    var row = {
                                        barcode: product.barcode,
                                        name: product.name,
                                        price: result[i].price,
                                        qty: result[i].qty
                                    };

                                    arr.push(row);
                                }
                            }


                            var output = {
                                billSale: billSale,
                                items: arr
                            };

                            res.send(output);
                        });
                    } else {
                        res.send({});
                    }
                });
            } else {
                res.send({});
            }
        });
    });
});

router.get('/stock', checkLogin, function(req, res, next) {
    var content = {
        block: 'stock'
    }

    res.layout('layout_home', {}, { content: content });
});



router.post('/saveProductToStock', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var data = {
            qty: 1,
            price: req.body.price,
            product_id: new ObjectId(req.body._id),
            created_at: new Date()
        };

        db.collection('billImport').insertOne(data, function(err) {
            res.send({ message: 'success' });
        });
    });
});

router.get('/importToStocks', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {

        if (err) console.log(err);

        db.collection('billImport').find().toArray(function(err, result) {
            if (err) console.log(err);

            if (result != null) {
                db.collection('product').find().toArray(function(err, products) {
                    var arr = [];

                    for (var i = 0; i < result.length; i++) {
                        var productId = result[i].product_id.toString();
                        var product = products.find(p => p._id.toString() == productId);

                        if (product != null) {
                            var row = {
                                _id: result[i]._id,
                                qty: result[i].qty,
                                barcode: product.barcode,
                                price: product.price,
                                name: product.name
                            };
                            arr.push(row);
                        }
                    }
                    res.send(arr);
                });
            } else {
                res.send({});
            }

        });
    });
});

router.post('/removeBillImport', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var con = {
            _id: new ObjectId(req.body._id)
        };

        db.collection('billImport').deleteOne(con, function(err) {
            if (err) console.log(err);

            res.send({ message: 'success' });
        });
    });
});

router.get('/report', checkLogin, function(req, res, next) {
    var content = {
        block: 'report'
    }
    res.layout('layout_home', {}, { content: content });
});

router.get('/reportIncome', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var order = { _id: -1 };

        db.collection('billSaleDetail').find().sort(order).toArray(function(err, result) {
            if (err) console.log(err);

            if (result != null) {
                var arr = [];

                result.forEach(function(billSaleDetail) {
                    var con = {
                        _id: billSaleDetail.bill_sale_id,
                        status: 'close'
                    };

                    db.collection('billSale').findOne(con, function(err, billSale) {
                        if (err) console.log(err);

                        if (billSale != null) {
                            var con = { _id: billSaleDetail.product_id }
                            db.collection('product').findOne(con, function(err, product) {
                                if (err) console.log(err);

                                if (product != null) {
                                    var row = {
                                        created_at: billSale.created_at,
                                        barcode: product.barcode,
                                        name: product.name,
                                        price: billSaleDetail.price,
                                        qty: billSaleDetail.qty,
                                        oldPrice: product.old_price

                                    };

                                    arr.push(row);
                                }
                            });
                        } else {
                            res.send({});
                        }
                    })
                });

                setTimeout(function() {
                    res.send(arr);
                }, 10);
            } else {
                res.send({});
            }
        });
    });
});

router.get('/reportStock', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        db.collection('product').find().toArray(function(err, product) {
            if (err) console.log(err);

            if (product != null) {
                var arr = [];

                product.forEach(function(p) {
                    var con = { product_id: p._id };
                    var qty = 0;

                    db.collection('billImport').find(con).toArray(function(err, billImport) {
                        if (err) console.log(err);

                        if (billImport != null) {
                            billImport.forEach(function(bi) {
                                qty += bi.qty;
                            });
                        }
                        db.collection('billSaleDetail').find(con).toArray(function(err, billSaleDetail) {
                            if (err) console.log(err);

                            if (billSaleDetail != null) {
                                billSaleDetail.forEach(function(bsd) {
                                    qty -= bsd.qty;
                                });
                            }

                            var row = {
                                barcode: p.barcode,
                                name: p.name,
                                qty: qty,
                                oldPrice: p.old_price,
                                price: p.price

                            };
                            arr.push(row);
                        });
                    });
                });
                setTimeout(function() {
                    res.send(arr);
                }, 10)
            }
        });
    });
});

router.get('/summary', checkLogin, function(req, res, next) {
    var content = {
        block: 'summary'
    }

    res.layout('layout_home', {}, { content: content });
});

router.post('/summary', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var con = {
            status: 'close'
        };

        db.collection('billSale').find(con).toArray(function(err, billSale) {
            if (err) console.log(err);

            if (billSale != null) {
                var arr = [];
                var totalDayInMonths = daysInMonth(req.body.m, req.body.y);

                if (totalDayInMonths > 0) {
                    for (var i = 0; i < totalDayInMonths; i++) {
                        arr[i] = 0;

                        billSale.forEach(function(billSale) {
                            var y = req.body.y;
                            var billYear = billSale.created_at.getFullYear();
                            var m = req.body.m;
                            var billMonth = billSale.created_at.getMonth() + 1;
                            var billDay = billSale.created_at.getDate() - 1

                            if (billYear == y && billMonth == m && billDay == i) {
                                var con = { bill_sale_id: billSale._id };
                                db.collection('billSaleDetail').find(con).toArray(function(err, result) {
                                    if (err) console.log(err);

                                    if (result != null) {
                                        result.forEach(function(item) {

                                            var totalPerRow = (item.qty * item.price);
                                            arr[billDay] += totalPerRow
                                        });
                                    }
                                });
                            }
                        });
                    }
                    setTimeout(function() {
                        res.send(arr);
                    }, 100);
                }
            }
        });
    });
});

router.get('/profile', checkLogin, function(req, res, next) {
    var content = {
        block: 'profile',
        data: {
            user_id: req.session.user_id
        }

    }
    res.layout('layout_home', {}, { content: content });
});

router.post('/userInfo', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var user_id = req.session.user_id;

        var con = {
            _id: new ObjectId(user_id)
        };
        db.collection('user').findOne(con, function(err, result) {
            if (err) console.log(err);

            if (result) {
                res.send(result);
            } else {
                res.send({});
            }
        });
    });
});

router.post('/profile', checkLogin, function(req, res, next) {
    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var user_id = req.session.user_id;

        var con = {
            _id: new ObjectId(user_id)
        };

        var data = {
            name: req.body.name,
            usr: req.body.usr,
            pwd: req.body.pwd,
            confirm_pwd: req.body.pwd,
            level: req.body.level
        };
        db.collection('users').findOneAndUpdate(con, data, function(err, result) {
            if (err) console.log(err);
            res.send({ message: 'success' });
        });

    });
});

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function checkLogin(req, res, next) {
    if (req.session.user_id == undefined) {
        res.redirect('/');
    } else {
        next();
    }
}

module.exports = router;