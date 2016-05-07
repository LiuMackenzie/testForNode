/**
 * Created by Mackenzie on 2016/5/7.
 */
/**
 * Created by Mackenzie on 2016/5/4.
 */

var express = require('express');
var path =  require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var moment = require('moment');
var fs= require('fs');
var mongoose = require('mongoose');
var uuid  = require('node-uuid');
//waterLine实现，添加依赖包。
var _ = require('lodash'),
    app = express(),
    methodOverride = require('method-override');
var Waterline = require('waterline');
var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');
//MySQL_Waterline 适配器引入
var adapters = {
    mongo: mongoAdapter,
    mysql: mysqlAdapter,
    default: 'mongo'
};
//MySQL_Waterline 连接
var connections = {
    mongo: {
        adapter: 'mongo',
        url: 'mongodb://localhost:27017/mynode'
    },
    mysql: {
        adapter: 'mysql',
        host: 'localhost',
        user: 'mynode',
        password: '123456',
        database: 'mynode'
    }
};

var checkLogin = require('./checkLogin.js');
//引入模型

var User = Waterline.Collection.extend({
    identity: 'user',
    //修改mongodb即可修改类型
    connection: 'mysql',
    schema: true,
    attributes: {
        username: {
            type: 'string',
            // 校验器
            required: true
        },
        password: {
            type: 'string',
            // 校验器
            required: true
        },
        email: {
            type: 'string'


        },
        createTime: {
            type: 'date'
        }
    }

});
var Note = Waterline.Collection.extend({
    identity: 'note',
    //修改mongodb即可修改类型
    //autoPK:false,
    connection: 'mysql',
    schema: true,
    attributes: {
        uuid: {
            type: 'string',
            // 校验器
            required: true
        },
        title: {
            type: 'string',
            // 校验器
            required: true
        },
        author: {
            type: 'string',
            // 校验器
            required: true
        },
        tag:  {
            type: 'string'

        },
        content: {
            type: 'string'
        },
        createTime: {
            type: 'date'
        }

    }
});

//添加代码段
var orm = new Waterline();

// 加载数据集合
orm.loadCollection(User);
orm.loadCollection(Note);

var config = {
    adapters: adapters,
    connections: connections
}

// Start Waterline passing adapters in
orm.initialize(config, function(err, models) {
    if(err) throw err;

    app.models = models.collections;

    app.connections = models.connections;

    // Start Server
    app.listen(3000);

    console.log("To see saved users, visit http://localhost:3000");
});


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(session({
    secret:'1234',
    name:'mynote',
    cookie:{maxAge:1000 * 60 * 20},
    resave:false,
    saveUninitialized:true
}));

app.use('/static',function (req, res, next) {
    console.log('--------开始读取文件--------');

    var fs= require('fs');
    fs.readFile('itxxz.txt','utf-8',function(err,data){
        if(err){
            console.log(data);
        }else{
            console.log(data);
        }
    })

    console.log('--------读取结束--------');
    next();
});
app.get('/static',function(req,res){
    res.send('index____test');
});


app.get('/',function(req,res){
    if(req.session.user!=null){
        res.send(200,'请先退出当前登录！');
    }else{
        console.log('登录');

        res.render('login',{
            user:req.session.user,
            title:'登录'});
    }
});

app.get('/register',function(req,res){
    if(req.session.user!=null){
        res.send(200,'请先退出当前登录！');
    }else{
        console.log('注册');
        res.render('register', {
            user:req.session.user,
            title:'注册'
        });
    }
});
app.get('/registerTest/:_username',function(req,res){
    //res.send(200,'请先退出当前登录！');
    console.log('注册test');
    //req.params._id
    var username = req.params._username;
    console.log("username---"+username);
    app.models.user.findOne({username:username},function(err,user){

        if(err){
            console.log(err);
            return res.redirect('/register');
        }
        if(user=='NO'){
            console.log('该用户已存在！'+user.username);
            //res.send('该用户已存在！<a href="">返回注册页面！</a>');
            res.send('false')
        }else{
            console.log('该用户已存在NO！');
            res.send('true');
        }

    });
});
app.post('/register',function(req,res){
    var username = req.body.username,
        password =  req.body.password,
        passwordRepeat= req.body.passwordRepeat;

    if(username.trim().length  == 0){
        console.log('用户名不能为空！');
        return res.redirect('/register');
    }
    if(password.trim().length  == 0||passwordRepeat.trim().length  == 0){
        console.log('密码不能为空！');
        return res.redirect('/register');
    }
    if(password!=passwordRepeat){
        console.log('两次密码不一致！');
        return res.redirect('/register');
    }

    app.models.user.findOne({username:username},function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/register');
        }
        if(user=='NO'){
            console.log('该用户已存在！');
            //res.send('该用户已存在！<a href="">返回注册页面！</a>');
            return res.redirect('/register');
        }
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');


        app.models.user.create({username: username,password:md5password}, function(err, user){
            console.log('create user ', err, user);
            //return res.redirect('/register');
        });
        console.log('注册成功！');
        return res.redirect('/');
        //newUser.save(function(err,doc){
        //    if(err){
        //        console.log(err);
        //        return res.redirect('/register');
        //    }
        //    console.log('注册成功！');
        //    return res.redirect('/');

    });

})

app.get('/login',function(req, res){
    if(req.session.user!=null){
        res.send(200,'请先退出当前登录！');
    }else{
        console.log('登录');

        res.render('login',{
            user:req.session.user,
            title:'登录'});
    }
});
app.post('/login',function(req, res){
    var username = req.body.username,
        password =  req.body.password;
    //app.models.users.create({first_name: 'ly'}, function(err, users){
    //    console.log('after user.create, err, user:', err, users);
    //});
    app.models.user.findOne({username:username},function(err,user){
        if(err){
            console.log("this is test ");
            console.log(err);
            return res.redirect('/login');
        }
        if(!user){
            console.log('登录失败!');
            return res.redirect('/login');
        }

        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');
        if(user.password!=md5password){
            console.log('密码不匹配！');
            return res.redirect('/login');

        }
        console.log('登录成功！');
        user.password = null;
        delete user.password;
        req.session.user = user;
        return res.redirect('/list');

    });

});

app.get('/quit',function(req,res){
    req.session.user=null;
    console.log('退出');
    return res.redirect('/login');
});
app.get('/post',function(req,res){
    console.log('发布！');
    res.render('post',{
        user:req.session.user,
        title:'发布'
    })
});
app.post('/post',function(req,res){
    //app.models.note.create({
    //    title:req.body.title,
    //    author:req.session.user.username,
    //    tag:req.body.tag,
    //    content:req.body.content }, function(err, note){
    //    console.log('文章发表成功！');
    //    console.log(err);
    //    //return res.redirect('/post');
    //});
    console.log("testtttttttt"+ req.body.title);
    app.models.note.create({   uuid:uuid.v1(),
        title:req.body.title,
        author:req.session.user.username,
        tag:req.body.tag,
        content:req.body.content }, function(err, note){
        console.log('create note ', err, note);
        //return res.redirect('/register');
    });

    return res.redirect('/list');



});

app.get('/list',function(req,res){
    var count=0;
    var page={limit:2,num:1};
    if(req.query.p){
        page['num']=req.query.p<1?1:req.query.p;
    }
    console.log(" page ------"+page['num']);

    var username=req.session.user.username;
    console.log(username);
    console.log("page:"+page['num']+",rows:"+page['limit']);


    //计算分页后，一共有多少页，每页笔记的数目（最后一页）
    //把他们放到回调函数中---------
    var resultsPerPage=page['limit']||10;
    var pageCount = 0;
    app.models.note.count({}, function(err, count) {
        if (err) {
            console.log(err);
        } else {
            pageCount = Math.ceil(count / resultsPerPage);
            console.log(" pageCount ------"+pageCount);
            page['pageCount']=pageCount;
        }
    });
    //把他们放到回调函数中---------
    //取出每页具体的笔记list
    app.models.note.find({author:req.session.user.username}).skip((page['num']-1)*page['limit']).limit(page['limit']).exec(
        function(err,allNotes){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            res.render('list',{
                title:'列表页',
                user:req.session.user,
                notes:allNotes,
                page:page
            })
        });

});
app.get('/test',function(req,res){
    app.models.note.create({title: "title",author:"author"}, function(err, note){
        console.log('create note ', err, note);
    });

});

app.get('/detail/:_id',function(req,res){
    console.log('查看笔记');
    app.models.note.findOne({uuid:req.params._id}).exec(function(err,art){
        if(err){
            console.log(err);
            return res.redirect('/');
        }
        if(art){
            res.render('detail',{
                title:'笔记详情',
                user:req.session.user,
                art:art,
                moment:moment
            });
        }
    });
});

