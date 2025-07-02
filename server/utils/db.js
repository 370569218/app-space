/*
 * @Author: Your Name you@example.com
 * @Date: 2025-07-01 09:24:59
 * @LastEditors: Your Name you@example.com
 * @LastEditTime: 2025-07-02 19:28:05
 * @FilePath: \app-space\server\utils\db.js
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
const mongoose = require('mongoose')
const Fawn = require("fawn");
import config from '../config';

let dbUrl = `mongodb://${config.dbHost}:${config.dbPort}`;
// if (config.dbUser) {
//     dbUrl = `mongodb://${config.dbUser}:${config.dbPass}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
// }

console.log(dbUrl)
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
        user: config.dbUser,
        pass: config.dbPass,
        dbName: config.dbName,
        authSource: config.dbName, // 指定认证数据库
        retryWrites: true,useUnifiedTopology: true
    }, (err) => {
    if (err) {
        console.log('Mongoose connection error: ' + err.message)
    } else {
        console.log('数据库连接成功')
    }
});

mongoose.connection
    .on('disconnected', function () {
        console.log('Mongoose connection disconnected')
    })
Fawn.init(mongoose);

module.exports = mongoose
