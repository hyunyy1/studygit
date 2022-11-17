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
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));    // 미들웨어

const mongoClient = require('mongodb').MongoClient;    // mongodb
app.set('view engine', 'ejs');

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
    // console.log(req.body.title);
    // console.log(req.body.date);

    db.collection('counter').findOne({name:'postcnt'}, function(err, result) {
            if(err) return console.log(err);
            console.log(result.totalPost);
            var totalCount = result.totalPost;

            db.collection('post').insertOne({_id : totalCount + 1, todo : req.body.title, date : req.body.date}, function(err, result) {
            console.log('저장완료');

            // DB에 저장된 post 라는 컬렉션의 데이터를 꺼내자.
            db.collection('counter').updateOne({name : 'postcnt'}, { $inc :{totalPost : 1}}, function(err, result) {
             if(err) return console.log(err);
            })
        });
    })

    // DB
    // conn.query(`insert into todo (title, curdate) 
    //             values("${req.body.title}","${req.body.date}")`,function(err, rows, fields){
    //     if(err) throw err;
    // });

    res.send('전송 완료');
})


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


})


app.delete('/delete', function(req, res){
    console.log(req.body)
    req.body._id = parseInt(req.body._id);
    //req.body에 담겨온 개시물 번호를 가진 글을 db에서 찾아 삭제해주세요.
    db.collection('post').deleteOne(req.body, function() {
        console.log('삭제 성공');

    });

})