/**
 * Created by Mackenzie on 2016/3/29.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:String,
    password:String,
    email:String,
    createTime:{
        type:Date,
        degault:Date.now
    }
})

var noteSchema = new Schema({
    title:String,
    author:String,
    tag:String,
    content:String,
    createTime:{
        type:Date,
        default:Date.now
    }
});

//代码片段


exports.Note = mongoose.model('Note',noteSchema);
exports.User = mongoose.model('User',userSchema);
