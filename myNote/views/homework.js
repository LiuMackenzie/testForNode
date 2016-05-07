/**
 * Created by Mackenzie on 2016/4/8.
 */
var express = require('express');
var path = require('path');
var fs = require('fs');
var parseUrl = require('url').parse;

var app = express();

app.set('view engine','ejs');
app.set('views',__dirname);

app.use(function(req,res,next){
    var info = parseUrl(req.url,true);
    //req.pathname = info.pathname;
    var reslist=info.pathname.split('/');
    req.pathname=reslist[1];
    if(req.pathname === 'public'){
        if(reslist[2] ==''){
            console.log('null---');
        }
        next();
    }else{
        res.send('无权访问该路径！')
    }
    //req.query = info.query;
    //next();
})

app.use('*',function(req,res,next){
console.log('-req.baseUrl---'+req.baseUrl);

});
app.use(function(req,res,next){
    console.log(req.pathname);
    if(req.pathname === 'public'){
        next();
    }else{
        res.send('无权访问该路径！')
    }
});

function serveStatic(root){
    return function(req,res,next){
        var reslist=req.baseUrl.split('/');
        //console.log('-req.baseUrl---'+reslist[0]);
        var file = req.originalUrl.slice(req.baseUrl.length+1);
        file  = path.resolve(root,file);
        var stream =  fs.createReadStream(file);
        stream.pipe(res);

    }
}

app.use('/public/*',serveStatic(__dirname + '/public'));

function getNewsList(){
    var list = [];
    for(var i=0;i<5;i++){
        list.push(getNewsById(i+1));
    }
    return list;
}

function getNewsById(id){
    return{
      id:id,
      title:'第'+id+'篇新闻标题',
      content:'第'+id+'篇新闻内容'
    };
}

app.get('/',function(req,res){
    res.render('index2.ejs',{
        list:getNewsList()
    });
});

app.get('/news/:id',function(req,res){
    res.render('news2.ejs',{
        news:getNewsById(req.params.id)
    });
});

app.listen(3001);