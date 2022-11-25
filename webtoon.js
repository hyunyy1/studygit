var router = require('express').Router();

router.use(islogin);  // 전역 미들웨어 (전체 라우터에 다 적용)

// router.use('/drama', islogin);   // /drama 라우터에만 적용 

router.get('/drama', (req, res) => {
    res.send('웹툰의 드라마 페이지입니다.');
});

router.get('/action', (req, res) => {
    res.send('웹툰의 액션 페이지입니다.');
});


// 로그인 해야지만 접근 가능하게 (미들웨어)

function islogin(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.send("로그인 해주세요.");
    }
}


module.exports = router;   // 외부로 배출
