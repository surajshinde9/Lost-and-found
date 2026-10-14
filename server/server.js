const upload = require("./upload");
const cloudinary = require("./cloudinary");
const streamifier = require("streamifier");

const cors = require("cors");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "traceback_secret_key";

console.log("start server");
const express = require("express");
const db = require("./db");
const app = express();
app.use(cors());
app.use(express.json());



app.get("/",(req,res)=>{
    res.send("TraceBack API Running");

});
app.listen(5000,()=>{
    console.log("server started");
});

// getting infor from db

app.get("/api/items",verifyToken,(req,res)=>{
    const sql = "SELECT * FROM ITEMS";

    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

//post in db

app.post("/api/items", verifyToken, upload.single("image"), (req, res) => {

    const {
        type,
        name,
        category,
        description,
        location,
        item_date,
        contact,
        claimedValue
    } = req.body;

    if (req.file) {

        const uploadStream = cloudinary.uploader.upload_stream(

            {
                folder: "traceback"
            },

            (error, result) => {

             if (error) {

    console.log("CLOUDINARY ERROR:");
    console.log(error);

    return res.status(500).json({
        message: error.message,
        error
    });

}

                saveItem(result.secure_url);

            }

        );

        streamifier
            .createReadStream(req.file.buffer)
            .pipe(uploadStream);

    } else {

        saveItem("");

    }

    function saveItem(imageUrl) {

        const sql = `
            INSERT INTO items
            (type, name, category, description, location, item_date, contact, image, claimed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(

            sql,

            [
                type,
                name,
                category,
                description,
                location,
                item_date,
                contact,
                imageUrl,
                claimedValue
            ],

            (err, result) => {

                if (err) {

                    console.log("SQL ERROR:", err);

                    return res.status(500).json(err);

                }

                res.status(201).json({

                    message: "Item Added Successfully",

                    id: result.insertId,

                    image: imageUrl

                });

            }

        );

    }

});

app.delete("/api/items/:id",verifyToken,(req,res)=>{
    const id = req.params.id;
    const sql = "DELETE FROM items WHERE id = ?";
    db.query(sql,[id],(err,result)=>{
        if(err){
            console.log("SQL error:", err);
            return res.status(500).json(err);

        }
         if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }
        res.json({
            message:"Item deleted successfully"
        });
    });
});

//claimed 
app.patch("/api/items/:id/claim",verifyToken,(req, res) => {

    const id = req.params.id;

    const sql = `
        UPDATE items
        SET claimed = NOT claimed
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("SQL ERROR:", err);
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Claim status updated"
        });

    });

});

//user login system
const bcrypt = require("bcryptjs");

app.post("/api/register", async (req, res) => {
console.log(req.body);
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "All required fields are mandatory"
        });

    }

    try {

        // Check existing user
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (result.length > 0) {

                    return res.status(400).json({
                        message: "Email already exists"
                    });

                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                db.query(

                 "INSERT INTO users(name,email,password,phone) VALUES(?,?,?,?)",
    [
        name,
        email,
        hashedPassword,
        phone
    ],

                    (err, result) => {

                        if (err) {
                            return res.status(500).json(err);
                        }

                        res.status(201).json({
                            message: "Registration Successful"
                        });

                    }

                );

            }

        );

    } catch (err) {

        res.status(500).json(err);

    }

});
// jwt auth 

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and Password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Invalid Email"
            });
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(

            {
                id: user.id,
                email: user.email
            },

            JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        res.json({

            message: "Login Successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }

        });

    });

});

//
function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Login required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Invalid Token"
        });

    }

}