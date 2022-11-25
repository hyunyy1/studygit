// // MySql 연동
const mysql = require('mysql');
const conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '123456',
    database : 'mysql'
})

conn.connect();
console.log('mysql 접속 성공');

// conn.query('select * from todo', function(err, rows, fields) {
//     if(err) throw err;

//     // console.log(rows);
// });



// // mongodb
// mongodb+srv://hyunyy1:<password>@cluster0.woen1x6.mongodb.net/?retryWrites=true&w=majority


const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));    // 미들웨어

const mongoClient = require('mongodb').MongoClient;    // mongodb
app.set('view engine', 'ejs');



// 쿠키
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// 세션
const session = require('express-session');
// const FileStore = require('session-file-store')(session);

const MySQLStore = require('express-mysql-session')(session);

// # session file store
// app.use(session({
//     secret : '1111',
//     resave : false,    // 다시 저장 X
//     saveUninitialized : true,
//     store : new FileStore()
// }));


// # session mysql store
app.use(session({
    secret : '1111',
    resave : false,    // 다시 저장 X
    saveUninitialized : true,
    store : new MySQLStore({
        host : 'localhost',
        port : 3306,
        user : 'root',
        password : '123456',
        database : 'mysql'
    })
}));


// md5
let md5 = require('md5');


// sha256
let sha256 = require('sha256');


// hasher
var bkpw = require('pbkdf2-password');
var hasher = bkpw();




var db;
mongoClient.connect('mongodb+srv://hyunyy1:tlsk90@cluster0.woen1x6.mongodb.net/?retryWrites=true&w=majority', function(err, client) {
    if(err) {
        return console.log(err);    
}

db = client.db('TodoApp');


app.listen(8080, function() {
    console.log('listening on 8080');
});
})



// 우리가 하고 싶은 것은 "xxx로 접속하면 xxx를 해주세요"
// 누군가가 /webtoon 방문하면 웹툰 관련 안내문을 띄어주자.
// 라우터 -> get, post 방식
// get 방식(기본) : url로 접속


app.get('/webtoon', function(req, res){
    res.send('웹툰을 서비스 해주는 페이지입니다.');
})

app.get('/game', function(req, res){
    res.send('게임을 서비스 해주는 페이지입니다~!');
})

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
})

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html');
})

//   /add 경로로 post 요청
app.post('/add', (req, res) => {
    console.log(req.body.title);
    console.log(req.body.date);

    let sql = `
    insert into todo (title, curdate) values (
        "${req.body.title}",
        "${req.body.date}"
    )`;

conn.query(sql, function(err, rows, fields){
        if(err) {
            console.log(err);
        } else {
            res.redirect('/list');
        }
    })
});


// app.listen(8080, function() {
//     console.log('listening on 8080');
// });



// /list get 요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML 보여주세요.
app.get('/list', function(req, res){
    let sql = "select * from todo";
    let list = '';

    conn.query(sql, function(err, rows, fields) {
        if(err) {
            console.log(err);
        } else {
            // for(let i = 0; i < rows.length; i++) {
            //     list += rows[i].title + " : " + rows[i].curdate + "<br/>";
            // }
            // res.send(list);
            console.log(rows);
            res.render("list_mysql.ejs", {posts : rows})
        }
    })

    });



app.delete('/delete', function(req, res){
    console.log(req.body)
    req.body._id = parseInt(req.body._id);
    //req.body에 담겨온 개시물 번호를 가진 글을 db에서 찾아 삭제해주세요.
    db.collection('post').deleteOne(req.body, function() {
        console.log('삭제 성공');

    });

})



// 쿠키

// app.get('/count', function(req, res) {
//     if(req.cookies.count) {
//         var count = parseInt(req.cookies.count);
//     } else {
//         var count = 0;
       
//     }
//     count = count + 1;
//     res.cookie('count', count);
//     res.send('count : ' + count);
// })


// 세션
app.get('/count', function(req, res) {
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send('count : ' + req.session.count);
})


app.get('/temp', function(req, res) {
    res.send('result : ' + req.session.userid);
})



// 로그인 라우터
app.get('/login', (req, res) => {
    res.render('login.ejs');
});


let salt = "fsldjl210def";


// app.post('/login', (req, res) => {
//     let userid = req.body.id;
//     let userpw = req.body.pw;

//     console.log(userid);
//     console.log(userpw);

//     let sql = "select * from login";
//     conn.query(sql, function(err, rows, fields) {
//         if(err) {
//             return console.log(err);
//         } 

//         for(let i = 0; i < rows.length; i++) {
            
//             if (rows[i].userid == userid) {
//                 console.log(sha256(rows[i].userpw + salt));
//                 console.log(sha256(userpw + salt));


//                 if (sha256(rows[i].userpw + salt) == sha256(userpw + salt)) {
//                     req.session.userid = userid;

//                     res.send('로그인 되었습니다.');
//                 } else {
//                     res.send('비밀번호가 틀렸습니다.');
//                 }
//             } 
//         }
//     })

// });


app.post('/login', (req, res) => {
    let userid = req.body.id;
    let userpw = req.body.pw;

    console.log(userid);
    console.log(userpw);

    let sql = "select * from login";
    conn.query(sql, function(err, rows, fields) {
        if(err) {
            return console.log(err);
        } 

        for(let i = 0; i < rows.length; i++) {
            
            if (rows[i].userid == userid) {

                return hasher({password : userpw, salt : rows[i].mobile}, function(err, pass, salt, hash) {
                    console.log(pass);
                    console.log(salt);
                    console.log(hash);

                    if (hash === rows[i].userpw) {
                        req.session.userid = userid;

                        res.send('로그인 되었습니다.');
                    } else {
                        res.send('비밀번호가 틀렸습니다.');
                    }
                })
            } 
        }
    })

});



app.get("/logout", (req, res) => {
    delete req.session.userid;
    res.redirect("/");
})




// 회원가입 라우터
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});


app.post('/signup', (req, res) => {
    console.log(req.body.id);
    console.log(req.body.pw);
    console.log(req.body.mobile);
    console.log(req.body.country);

    hasher({password : req.body.pw}, function(err, pass, salt, hash) {
        console.log(pass);
        console.log(salt);
        console.log(hash);

        let sql = `
        insert into login (userid, userpw, mobile, country) values (
            "${req.body.id}",
            "${hash}",
            "${salt}",
            "${req.body.country}"
        )`;
    
        conn.query(sql, function(err, rows, fields){
            if(err) {
                console.log(err);
            } else {
                res.redirect('/login');
            }
          })
        })
    });

