var express = require("express")
var app = express()
var db = require("./database.js")
var cors = require("cors");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

var HTTP_PORT = 3000

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

app.get("/contatos", (req, res, next) => {
    var sql = "select * from contatos"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(rows)
      });
});


app.get("/contato/:id", (req, res, next) => {
    var sql = "select * from contatos where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(row);
      });
});


app.post("/contato/", (req, res, next) => {
    var errors=[]
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        phone : req.body.phone
    }
    var sql ='INSERT INTO contatos (name, email, phone) VALUES (?,?,?)'
    var params =[data.name, data.email, data.phone]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})



app.patch("/contato/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        phone : req.body.phone //? md5(req.body.password) : undefined
    }
    db.run(
        `UPDATE contatos set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           phone = coalesce(?,phone) 
           WHERE id = ?`,
        [data.name, data.email, data.phone, req.params.id],
        (err, result) => {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data
            })
    });
})


app.delete("/contato/:id", (req, res, next) => {
    db.run(
        'DELETE FROM contatos WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", rows: this.changes})
    });
})


// Root path
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});
