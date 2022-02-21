var express = require('express');
var app = express();
var db_config = require(__dirname + '/config/database.js');
var conn = db_config.init();
var bodyParser = require('body-parser');
var textcolor; 
var backcolor; 


db_config.connect(conn);

app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.get('/', function (req, res) {
    res.send('ROOT');
});

app.get('/list', function (req, res) {
    var sql = "SELECT ID, TITLE, DATE_FORMAT(TARGETDATE, '%Y-%m-%d') AS TARGETDATE, DATE_FORMAT(FDATE, '%Y-%m-%d') AS FDATE, FINISHCHECK FROM todoList";   
    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('list.ejs', {list : rows});
    });
});

//태그 목록
app.get('/tagList', function (req, res) {
    var sql = 'SELECT * FROM tag';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('tagList.ejs', {list2 : rows});
    });
});

app.get('/write', function (req, res) {
    res.render('write.ejs');
});

//추가
app.post('/writeAf', function (req, res) {
    var body = req.body;
    console.log(body);

    //태그추가
    var textcolor = (parseInt(Math.random()*0xffffff)).toString(16);
    var backcolor = (parseInt(Math.random()*0xffffff)).toString(16);

    var sql2 = 'INSERT INTO tag VALUES(NULL, ?, ?, ?, NOW())';
    var params = [body.tname, textcolor, backcolor]; 
    console.log(sql2);
    conn.query(sql2, params, function(err) {
        if(err) console.log('query is not excuted. tag add fail...\n' + err);
        // else res.redirect('/list');
    });
    //TAGID 받은 후, todoList테이블 insert 
    var sql3 = "SELECT TAGID FROM tag WHERE TNAME=?" ;
    console.log(sql3);
    conn.query(sql3, [body.tname], function(err, results, fields){
        if (err) throw err;
        
        console.log("tagId: " + results[0].TAGID);
        
        var sql = "INSERT INTO todoList VALUES(NULL, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)";
        var params = [body.title, body.content, body.tname, body.udate, body.targetdate, body.fdate, body.finishcheck, results[0].TAGID ];
        console.log(sql);
        conn.query(sql, params, function(err) {
            if(err) console.log('query is not excuted. insert fail...\n' + err);
            else res.redirect('/list');
        });

    });


});

//삭제
app.get('/deleteAf/:id', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'DELETE FROM todoList WHERE ID=?';
    console.log(sql);
    conn.query(sql, [req.params.id], function(err) {
        if(err) console.log('query is not excuted. delete fail...\n' + err);
        else res.redirect('/list');
    });
});

//수정
app.get('/updateAf/:id', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = "SELECT ID, TITLE, CONTENT, TAG, DATE_FORMAT(TARGETDATE, '%Y-%m-%d') AS TARGETDATE, date_format(FDATE, '%Y-%m-%d') AS FDATE, FINISHCHECK FROM todoList WHERE ID=?";
   
    console.log(sql);
    conn.query(sql, [req.params.id], function(err, results, fields){
        if (err) throw err;
        console.log(results);
        res.render('update',{tlist : results}); 
    });

});

app.post('/update/:id', function (req, res) {
    var body = req.body;
    console.log(body);

   //태그추가
    var textcolor = (parseInt(Math.random()*0xffffff)).toString(16);
    var backcolor = (parseInt(Math.random()*0xffffff)).toString(16);
     //태그추가
     var sql2 = 'INSERT INTO tag VALUES(NULL, ?, ?, ?, NOW())';
     var params = [body.tname, textcolor, backcolor]; 
     console.log(sql2);
     conn.query(sql2, params, function(err) {
         if(err) console.log('query is not excuted. tag add fail...\n' + err);
         // else res.redirect('/list');
     });

     //TAGID 받은 후, todoList테이블 insert 
     var sql3 = "SELECT TAGID FROM tag WHERE TNAME=?" ;
     console.log(sql3);
     conn.query(sql3, [body.tname], function(err, results, fields){
         if (err) throw err;
         
         console.log("tagId: " + results[0].TAGID);

        var sql = "UPDATE todoList SET TITLE=?, CONTENT=?, TAG=?, UDATE=NOW(), TARGETDATE=?, FDATE=?, FINISHCHECK=?, TAGID=? WHERE ID=?";
        var params = [req.body.title, req.body.content, req.body.tname, req.body.targetdate, req.body.fdate, req.body.finishcheck, results[0].TAGID, req.params.id];
        console.log(sql);
        conn.query(sql, params, function(err) {
            if(err) console.log('query is not excuted. update fail...\n' + err);
            else res.redirect('/list');
        });
    });
});

//게시글 상세 보기
app.get('/detailAf/:id', function (req, res) {
    var body = req.body;
    console.log(body);

    //tag, todolist 조인 
    var sql =  "SELECT ID, TITLE, CONTENT, TAG, DATE_FORMAT(WDATE, '%Y-%m-%d') AS WDATE, DATE_FORMAT(UDATE, '%Y-%m-%d') AS UDATE, DATE_FORMAT(TARGETDATE, '%Y-%m-%d') AS TARGETDATE, date_format(FDATE, '%Y-%m-%d') AS FDATE, FINISHCHECK, TEXTCOLOR, BACKCOLOR FROM todoList t1, tag t2 WHERE t1.TAGID = t2.TAGID AND ID=?"
    console.log(sql);
    conn.query(sql, [req.params.id], function(err, results, fields){
        if (err) throw err;
        console.log(results);
        res.render('detail',{tlist : results}); 
    });

});

//태그삭제
app.get('/tagDeleteAf/:id', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'DELETE FROM tag WHERE TAGID=?';
    console.log(sql);
    conn.query(sql, [req.params.id], function(err) {
        if(err) console.log('query is not excuted. delete fail...\n' + err);
        else res.redirect('/tagList');
    });
});


app.listen(4000, () => console.log('Server is running on port 4000...'));