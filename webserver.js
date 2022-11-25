// // MySql
// const mysql = require('mysql');
// const conn = mysql.createConnection({
//     host : 'localhost',
//     user : 'root',
//     password : '123456',
//     database : 'mysql'
// })

// conn.connect();

// conn.query('select * from todo', function(err, rows, fields) {
//     if(err) throw err;

//     // console.log(rows);
// });



// // mongodb
// mongodb+srv://hyunyy1:<password>@cluster0.woen1x6.mongodb.net/?retryWrites=true&w=majority


const express = require('express');
const app = express();

// # socket 세팅 # //
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);

require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));    // app.use : 전역 미들웨어

const mongoClient = require('mongodb').MongoClient;    // mongodb
app.set('view engine', 'ejs');



// 쿠키
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// 패스포트
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


// 세션
const session = require('express-session');
app.use(session({
    secret : '1111',
    resave : false,    // 다시 저장 X
    saveUninitialized : true
}));


// 패스포트 미들웨어 설정
app.use(passport.initialize());
app.use(passport.session());


// 라우트 미들웨어 설정
app.use('/webtoon', require('./routes/webtoon.js'));
app.use('/shop', require('./routes/shop.js'));
// app.use('/', require('./routes/list.js'));



var db;
mongoClient.connect(
    process.env.DB_URL,
    function(err, client) {
        if(err) return console.log(err);    

        db = client.db('TodoApp');
        app.db = db;
    }
);


http.listen(process.env.PORT, function() {
    console.log('listening on 8080');
    });



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
// app.post('/add', (req, res) => {
//     // console.log(req.body.title);
//     // console.log(req.body.date);

//     db.collection('counter').findOne({name:'postcnt'}, function(err, result) {
//             if(err) return console.log(err);
//             console.log(result.totalPost);
//             var totalCount = result.totalPost;

//             db.collection('post').insertOne({_id : totalCount + 1, todo : req.body.title, date : req.body.date}, function(err, result) {
//             console.log('저장완료');

//             // DB에 저장된 post 라는 컬렉션의 데이터를 꺼내자.
//             db.collection('counter').updateOne({name : 'postcnt'}, { $inc :{totalPost : 1}}, function(err, result) {
//              if(err) return console.log(err);
//             })
//         });
//     })

    // DB
    // conn.query(`insert into todo (title, curdate) 
    //             values("${req.body.title}","${req.body.date}")`,function(err, rows, fields){
    //     if(err) throw err;
    // });

//     res.send('전송 완료');
// })


// app.listen(8080, function() {
//     console.log('listening on 8080');
// });

// /list get 요청으로 접속하면
// 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML 보여주세요.
app.get('/list', function(req, res){
    // conn.query('select * from todo', function(err, rows, fields) {
    //     if(err) throw err;

    //     res.send(rows);
    // });


    // mongodb
    
    db.collection('post').find().toArray(function(err, result) {
        console.log(result);
        res.render('list.ejs', {posts : result});
    });
});





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
    res.send('result : ' + req.session.count);
})



// 로그인 라우터
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// app.post('/login', (req, res) => {
//     let userid = req.body.id;
//     let userpw = req.body.pw;

//     console.log(userid);
//     console.log(userpw);

//     db.collection('login').findOne({id : userid}, function(err, result) {
//         if(err) return console.log(err);
//         if(!result) {
//             res.send("존재하지 않는 아이디입니다.");
//         } else {
//             console.log(result);
//             if (result.pw == userpw) {
//                 // res.send('로그인 되었습니다.');
//                 res.redirect('/');
//             } else {
//                 res.redirect('/login');
//             }
//         }             
//     })

// });




// 패스포트를 이용한 로그인 인증 방식

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
    }), (req, res) => {
    res.redirect('/');
});

passport.use(new LocalStrategy({
    usernameField : 'id', 
    passwordField : 'pw',
    session : true,
    passReqToCallback : false,
}, function(inputid, inputpw, done) {
    console.log(inputid);
    console.log(inputpw);

    db.collection('login').findOne({id : inputid}, function(err, result) {
        if(err) return done(err);
        if(!result) {
            return done(null, false, {message : '존재하지 않는 아이디입니다.'});
        }
        if(result.pw == inputpw) {
            return done(null, result);
        } else {
            return done(null, false, {message : '비번이 틀렸어요.'});
        }
    })
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(userid, done) {
    db.collection('login').findOne({id : userid}, function(err, result) {
        done(null, result);
        console.log(result);
    })
    
});


app.get('/fail', (req, res) => {
    res.send("로그인 해주세요.");
});



// 회원가입 라우터
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});


app.post('/signup', (req, res) => {
    db.collection('login').insertOne({
        id : req.body.id, 
        pw : req.body.pw,
        mobile : req.body.mobile,
        country : req.body.country
        },
        function(err, result) {
            if(err) return console.log(err);
            console.log('저장완료');
            console.log(result);
            res.redirect('/login');
        }
      );
    });


// 미들웨어 : 요청과 응답 사이에 있음.          
app.get('/mypage', islogin, (req, res) => {
        res.render("mypage.ejs", {사용자 : req.user});
    });


function islogin(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.send("로그인 해주세요.");
    }
}


app.get('/search', (req, res) => {
   console.log(req.query.value);

// 일반적인 순차검색
//    db.collection('post').find({todo : req.query.value}).toArray((err, result) => {
//     console.log(result);
//     res.render('search.ejs', {posts : result});
//    })


// 바이너리 검색

    db.collection('post').find({$text : {$search : req.query.value}}).toArray((err, result) => {
        console.log(result);
        res.render('search.ejs', {posts : result});
    })
});


// writer 추가
app.post('/add', (req, res) => {
    // console.log(req.body.title);
    // console.log(req.body.date);

    db.collection('counter').findOne({name:'postcnt'}, function(err, result) {
            if(err) return console.log(err);
            console.log(result.totalPost);

            var totalCount = result.totalPost;

            db.collection('post').insertOne({_id : totalCount + 1, writer : req.user._id, todo : req.body.title, date : req.body.date},
                 function(err, result) {
                    console.log('저장완료')});

            // DB에 저장된 post 라는 컬렉션의 데이터를 꺼내자.
            db.collection('counter').updateOne({name : 'postcnt'}, { $inc :{totalPost : 1}}, function(err, result) {
             if(err) return console.log(err);
            })
        });
    });


 // 삭제   
app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);

    var deleteData = {_id : req.body._id, writer : req.user._id}

    //req.body에 담겨온 개시물 번호를 가진 글을 db에서 찾아 삭제해주세요.
    db.collection('post').deleteOne(deleteData, function(err, result) {
        if (err) return console.log(err);
        console.log('삭제 성공');
        res.status(200).send({ message : "성공했습니다." });    
        });
    
    });
    


// multer 설정 - 이미지 업로드
let multer = require('multer');
let storage = multer.diskStorage({
    destination : function(req, res, cb) {
        cb(null, './public/image')
    },
    filename : function(req, res, cb) {
        cb(null, res.originalname);
    }
});

let upload = multer({storage : storage})


app.get('/upload', function(req, res) {
    res.render('upload.ejs');
})


app.post('/upload', upload.single('profile'), function(req, res) {
    res.send('업로드 완료');
})


// 시멘틱 url

app.get('/image/:imgname', function(req, res) {
    res.sendFile(__dirname + '/public/image/' + req.params.imgname);
})


// socket
app.get('/socket', function(req, res){
    res.render('socket.ejs');
})


io.on('connection', function(socket) {          
    console.log('유저 접속됨');

    socket.on('joinroom', function(data) {
        console.log(data);
        socket.join('room1');
    })

    socket.on('room1-send', function(data) {
        io.to('room1').emit('broadcast', data);     // room1에 조인한 사람들에게만 송신
    })


    socket.on('user-send', function(data) {     // on() : 수신
        console.log(data);
        // io.emit('broadcast', data);             // emit() : 송신,  broadcast : 다수에게
        io.to(socket.id).emit('broadcast', data);   // 일대일 통신 (개별적으로)
    })
})


// 