var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var mysql = require('mysql');
var sqlite3 = require('sqlite3').verbose();
var dbSqlite3 = new sqlite3.Database(':memory:');
var mongo = require('mongodb');
var session = require('express-session');

router.use(session({ secret: 'my-secret', cookie: { maxAge: 60000 } }));

// var db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'db_nodejs'
// });

var db = mysql.createPool({
    // connectionLimit:1000,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_nodejs',
    debag: false
});

router.get('/testConnect', function(req, res, next) {
    try {
        db.connect();
        res.send('connect db success');
        db.end();
    } catch (err) {
        console.log('error');
    }
});
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'My website' });
});

router.get('/page1', function(req, res, next) {
    res.render('page1');
});

router.get('/page2', function(req, res, next) {
    res.render('page2');
});

router.get('/page3', function(req, res, next) {
    res.render('page3');
});

router.get('/sayhello', function(req, res, next) {
    // res.render('hello');
    res.send("Hello by Nodemon edit success11s");
});

router.get('/testsayhello', function(req, res, next) {
    res.render('sayhello', { name: req.query.name });
});

router.get('/multiparam', function(req, res, next) {
    var param = {
        fname: req.query.fname,
        lname: req.query.lname
    };
    res.render('multiparam', param);
});

router.get('/myform', function(req, res, next) {
    res.render('myform');
});

router.post('/formoutput', function(req, res, next) {
    var param = {
        name: req.body.name,
        tel: req.body.tel
    };
    res.render('formoutput', param);
});

router.get('/showArray', function(req, res, next) {
    var arr = ['kob', 'tavon', 'joy', 'poy', 'hope'];
    res.render('showArray', { arr: arr });
});

router.get('/showArrayObject', function(req, res, next) {
    var arr = [
        { barcode: 1001, name: 'Java basic' },
        { barcode: 1002, name: 'Node basic' },
        { barcode: 1003, name: 'Angular basic' }
    ];
    res.render('showArrayObject', { arr: arr });
});

router.get('/connectjs', function(req, res, next) {
    res.render('connectjs');
});

router.get('/connectcss', function(req, res, next) {
    res.render('connectcss');
});

router.get('/manyclass', function(req, res, next) {
    res.render('manyclass');
});

router.get('/connectid', function(req, res, next) {
    res.render('connectid');
});

router.get('/embedcss', function(req, res, next) {
    res.render('embedcss');
});

router.get('/ifelse', function(req, res, next) {
    res.render('ifelse', { x: 10 });
});

router.get('/startRedirect', function(req, res, next) {
    res.render('startRedirect');
});

router.get('/myRedirect', function(req, res, next) {
    res.render('/endRedirect');
});

router.get('/endRedirect', function(req, res, next) {
    res.render('endRedirect');
});

router.get('/redirectAndSendParam', function(req, res, next) {
    res.render('redirectAndSendParam');
});

router.get('/redirectToNewPage', function(req, res, next) {
    var param = { name: 'Tavon' };
    var url = require('url');
    var config = {
        pathname: '/showParam',
        query: param
    };
    res.redirect(url.format(config));
});

router.get('/showParam', function(req, res, next) {
    res.render('showParam', { name: req.query.name });
});


router.get('/startSend', function(req, res, next) {
    res.render('startSend');
});

router.post('/testSend', function(req, res, next) {
    var data = req.body.data;

    if (data.length > 0) {
        res.send('pass');
    } else {
        res.send('fail');
    }
});

router.get('/sendJson', function(req, res, next) {
    var data = [
        { name: 'Tavon', age: 32 },
        { name: 'Hope', age: 27 },
        { name: 'Poy', age: 26 },
        { name: 'Mali', age: 25 },
    ];
    res.send(data);
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    if (username == 'admin' && password == '1234') {
        res.send('Login pass');
    } else {
        res.send('login fail');
    }
});

var methodA = function(req, res, next) {
    console.log('Method A');
    next();
}

// router.use(methodA);

router.get('/callMethod', methodA, function(req, res, next) {
    res.send('call method a success');
});

var methodB = function(req, res, next) {
    req.query.x = 1;
    next();
}

router.get('/callMethod2', methodB, function(req, res, next) {
    var x = req.query.x;
    res.send("x = " + x);
});

router.get('/formForUpload', function(req, res, next) {
    res.render('formForUpload');
});

router.use(fileUpload());
router.post('/formForUpload', function(req, res, next) {
    var myFile = req.files.myFile;
    var path = __dirname.replace("\\routes", '');

    path = path + '/public/images/' + myFile.name;

    myFile.mv(path, function(err) {
        res.send('upload success');
    });
});

// router.get('/selectData', function(req, res, next) {
//     try {
//         db.connect();
//         db.query('select * from book', function(err, rows) {
//             res.render('selectData', { books: rows });
//         });
//         db.end();
//     } catch (err) {
//         console.log(err);
//     }
// });

router.get('/selectData', function(req, res, next) {
    try {

        db.query('select * from book', function(err, rows) {
            res.render('selectData', { books: rows });
        });

    } catch (err) {
        console.log(err);
    }
});

router.get('/deleteData', function(req, res, next) {
    try {

        db.query('delete from book where id = ?', req.query.id, function(err, rows) {
            res.redirect('/selectData');
        });

    } catch (err) {
        console.log(err);
    }
});

router.get('/editData', function(req, res, next) {
    try {

        db.query('select * from book where id= ?', req.query.id, function(err, rows) {
            res.render('editData', { book: rows[0] });
        });

    } catch (err) {
        console.log(err);
    }
});

router.post('/editData', function(req, res, next) {
    try {
        var param = req.body;
        var id = req.query.id;

        db.query('update book set ? where id = ?', [param, id], function(err, rows) {
            res.redirect('/selectData');
        });

    } catch (err) {
        console.log(err);
    }
});

router.get('/newRecord', function(req, res, next) {
    res.render('newRecord');
});

router.post('/newRecord', function(req, res, next) {
    try {

        db.query('insert into book set ? ', req.body, function(err, rows) {
            res.redirect('/selectData');
        });

    } catch (err) {
        console.log(err);
    }
});

router.get('/connectSqlite', function(req, res, next) {
    dbSqlite3.serialize(function() {
        var sql = "select count(*) as total from sqlite_master where type= 'table'";
        dbSqlite3.each(sql, function(err, row) {
            console.log('total =' + row.total);
        });

    });
    dbSqlite3.close();
})

router.get('/createDatabase', function(req, res, next) {
    var dbSqlite3 = new sqlite3.Database('my_database.db', function(err) {
        if (err) {
            console.log(err);
        }
        res.send('create database success');
    });
})

router.get('/createTable', function(req, res, next) {
    var db = new sqlite3.Database('my_database.db');
    db.serialize(function() {
        var sql = "CREATE TABLE IF NOT EXISTS book(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255))";
        db.run(sql);

        res.send('create success');
    });
    db.close();
});

router.get('/insertData', function(req, res, next) {
    var db = new sqlite3.Database('my_database.db');

    db.serialize(function() {
        var sql = "insert into book(name) values(?)";
        var stmt = db.prepare(sql);
        stmt.run('Level1');
        stmt.finalize();

        res.send("Insert sqllite success");
    });
    db.close();
});

router.get('/insertMany', function(req, res, next) {
    var db = new sqlite3.Database('my_database.db');

    db.serialize(function() {
        var sql = "insert into book(name) values(?)";
        var stmt = db.prepare(sql);

        for (var i = 0; i < 100; i++) {
            stmt.run('book record ' + i);
        }
        stmt.finalize();
        res.send('insert 100 record success');
    });
    db.close();
});

router.get('/showDataFromSqlite', function(req, res, next) {
    var db = new sqlite3.Database('my_database.db');

    db.serialize(function() {
        var sql = "select * from book";
        db.all(sql, [], function(err, rows) {
            if (err) {
                console.log(err);
            }
            res.render('showDataFromSqlite', { books: rows })
        });
    });
    db.close();
});

router.get('/deleteFromSqlite', function(req, res, next) {
    var db = new sqlite3.Database('my_database.db');

    db.serialize(function() {
        var sql = "delete from book where id= ?";
        var stmt = db.prepare(sql);
        stmt.run(req.query.id)
        stmt.finalize();

        res.redirect('/showDataFromSqlite');
    });
    db.close();
});

router.get('/editFromSqlite', function(req, res, next) {
    var db = new sqlite3.Database('my_database.db');

    db.serialize(function() {
        var sql = 'select * from book where id =?';

        db.each(sql, req.query.id, function(err, rows) {
            if (err) {
                console.log(err);
            }
            res.render('editFromSqlite', { book: rows });
        });
    });
    db.close();
});

router.post('/editFromSqlite', function(req, res, next) {
    var db = new sqlite3.Database('my_database.db');

    db.serialize(function() {
        var sql = 'update book set name = ? where id =?';

        db.run(sql, [req.body.name, req.query.id], function(err, rows) {
            if (err) {
                console.log(err);
            }
            res.redirect('/showDataFromSqlite');

        });
    });
    db.close();
});

router.get('/connectMongoDb', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) {
            console.log(err);
        }
        res.send('DB Create');

        db.close();
    });
});

router.get('/createCollection', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        db.createCollection('book', function(err, rows) {
            if (err) console.log(err);

            res.send('create collection success');
            db.close();
        });
    });
});

router.get('/insertToCollection', function(req, res, next) {
    res.render('insertToCollection');
});

router.post('/insertToCollection', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        db.collection('book').insertOne(req.body, function(err, rows) {
            if (err) console.log(err);

            res.send('insert data success');
            db.close();
        });
    });
});


router.get('/insertManyToCollection', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var data = [
            { _id: 1, name: 'Tavon' },
            { _id: 2, name: 'Hope' },
            { _id: 3, name: 'Joy' },
        ]

        db.collection('book').insertMany(data, function(err, rows) {
            if (err) console.log(err);

            res.send('insert many data success');
            db.close();
        });
    });
});


router.get('/showDataFromMongo', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);



        db.collection('book').find().toArray(function(err, result) {
            if (err) console.log(err);

            res.render('showDataFromMongo', { books: result });
            db.close();
        });
    });
});

router.get('/deleteMongo', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var condition = { _id: Number(req.query._id) };

        db.collection('book', function(err, obj) {
            if (err) console.log(err);

            obj.deleteOne(condition, function(err, result) {
                res.redirect('/showDataFromMongo');
            });

        });
        db.close();
    });
});

router.get('/editFromMongo', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var condition = { _id: Number(req.query._id) };

        db.collection('book').findOne(condition, function(err, result) {
            if (err) console.log(err);

            res.render('editFromMongo', { book: result });
            db.close();

        });
    });
});

router.post('/editFromMongo', function(req, res, next) {
    var mongo = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/mydb";

    mongo.connect(url, function(err, db) {
        if (err) console.log(err);

        var condition = { _id: Number(req.query._id) };

        db.collection('book').findOne(condition, function(err, oldData) {
            if (err) console.log(err);

            var newData = {
                _id: Number(req.query._id),
                name: req.body.name
            };
            db.collection('book').updateOne(oldData, newData, function(err, result) {
                if (err) console.log(err);

                res.redirect('/showDataFromMongo');
                db.close();
            });
        });
    });
});

router.get('/createCookie', function(req, res, next) {
    var maxAge = 1000 * 60 * 60;
    res.cookie('name', 'kob', {
        expires: new Date(Date.now() + maxAge),
        httpOnly: true
    });
    res.send('Create cookie success');
});

router.get('/showCookie', function(req, res, next) {
    res.send(req.cookies.name);
});

router.get('/createSession', function(req, res, next) {
    req.session.name = 'kob';
    res.send('create session succes');
});

router.get('/showSession', function(req, res, next) {
    res.send(req.session.name);
});

router.get('/createExcel', function(req, res, next) {
    var xl = require('excel4node');
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Sheet 1');

    ws.cell(1, 1).number(100);
    ws.cell(1, 2).number(150);
    ws.cell(1, 3).string('my text');

    wb.write('MyExcel.xlsx', res);
});

router.get('/writeFile', function(req, res, next) {
    var fs = require('fs');

    fs.writeFile('myFile.txt', 'data in file', function(err) {
        if (err) console.log(err);
        res.send('write file success');
    });
});

router.get('/readFile', function(req, res, next) {
    var fs = require('fs');

    fs.readFile('myFile.txt', function(err, data) {
        res.send(data);
    });
});

router.get('/book/all', function(req, res, next) {
    var books = [
        { id: 1001, name: 'Java' },
        { id: 1002, name: 'Nodejs' },
        { id: 1003, name: 'PHP' },
    ]
    res.send(books);
});

router.get('/video', function(req, res, next) {
    res.render('video');
});

module.exports = router;