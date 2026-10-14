const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"password",
    database : "traceback"
});

db.connect((err)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log("mySQL Connected");
});

module.exports= db;