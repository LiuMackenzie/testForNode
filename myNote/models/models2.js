/**
 * Created by Mackenzie on 2016/5/4.
 */

var Waterline = require('waterline');


var noteWaterline = Waterline.Collection.extend({
    identity:'note',
    connection:'mysql',
    schema:true,
    attributes:{
        title:{
            type:"string",
            require:true
        },
        author:{
            type:"string",
            require:true
        },
        tag:{
            type:"string",
            require:true
        },
        content:{
            type:"string",
            require:true
        },
        createTime: {
            type: 'date'
        }
    }
})
var user = Waterline.Collection.extend({
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
            type: 'string',
            // 校验器
            required: true
        },
        createTime: {
            type: 'date'
        }
    }

});


//代码片段


exports.Note = noteWaterline;
exports.User =userWaterline;
