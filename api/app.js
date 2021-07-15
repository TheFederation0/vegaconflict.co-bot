// Create express app
const express = require("express");
const app = express();
const db = require("./database.js")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
const HTTP_PORT = 3000;
// Start server
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
  res.json({"message":"Ok", "headers": req.get("host")})
});

// Insert here other API endpoints

app.get("/api/users", (req, res, next) => {
  if(req.headers.secauth !== "Z1BH4Mz2stCzJ9KZKH8GMUsQl!ShGFG*lZBBUBtQ*dbq*^VupDP3FG4NPy5FvPy$w1Kc55"){
    res.status(403);
    res.json({
      "status": "403",
      "message":"forbidden"
    })
  }
  const sql = "select * from players";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json({
      "message":"success",
      "data":rows
    })
  });
});

app.get("/api/user/:alias", (req, res, next) => {
  const sql = "select * from players where alias = ?";
  const params = [req.params.alias];
  if(req.headers.secauth !== "Z1BH4Mz2stCzJ9KZKH8GMUsQl!ShGFG*lZBBUBtQ*dbq*^VupDP3FG4NPy5FvPy$w1Kc55"){
    res.status(403);
    res.json({
      "status": "403",
      "message":"forbidden"
    })
  }
  db.all(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    if(row === undefined){
      res.json({
        "status": "404",
        "message":"failure"
      })
    }
    res.json({
      "status": "200",
      "message":"success",
      "data":row
    })
  });
});

app.post("/api/user/", (req, res, next) => {
  if(req.headers.secauth !== "Z1BH4Mz2stCzJ9KZKH8GMUsQl!ShGFG*lZBBUBtQ*dbq*^VupDP3FG4NPy5FvPy$w1Kc55"){
    res.status(403);
    res.json({
      "status": "403",
      "message":"forbidden"
    })
    return;
  }
  const errors = [];
  if (!req.body.kxid){
    errors.push("No kxid specified");
  }
  if (!req.body.rank){
    errors.push("No rank specified");
  }
  if (!req.body.medals){
    errors.push("No medals specified");
  }
  if (!req.body.planet){
    errors.push("No planet specified");
  }
  if (errors.length){
    res.status(400).json({"error":errors.join(",")});
    return;
  }
  const data = {
    kxid: req.body.kxid,
    alias: req.body.alias,
    rank: req.body.rank,
    medals: req.body.medals,
    planet: req.body.planet,
    uid: req.body.uid
  };
  const sql = 'INSERT INTO players (kxid, alias, rank, medals, planet, uid) VALUES (?,?,?,?,?,?)';
  const params = [data.kxid, data.alias, data.rank, data.medals, data.planet, data.uid];

  db.run(sql, params, function (err, result) {
    if (err != null && err.errno === 19) {
      db.run(
          `UPDATE players set
                            alias = COALESCE(?,alias),
                            medals = COALESCE(?,medals),
                            rank = COALESCE(?,rank),
                            planet = COALESCE(?,planet),
                            uid = COALESCE(?,uid)
           WHERE kxid = ?`,
          [data.alias, data.medals, data.rank, data.planet, data.uid, data.kxid],
          function (err, result) {
            if (err){
              res.status(400).json({"error": res.message})
              return;
            }
            res.json({
              message: "success",
              data: data,
              changes: this.changes
            })
          });
      return;
    }
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

app.patch("/api/user/:id", (req, res, next) => {
  if(req.headers.secauth !== "Z1BH4Mz2stCzJ9KZKH8GMUsQl!ShGFG*lZBBUBtQ*dbq*^VupDP3FG4NPy5FvPy$w1Kc55"){
    res.status(403);
    res.json({
      "status": "403",
      "message":"forbidden"
    })
    return;
  }
  const data = {
    kxid: req.body.kxid,
    alias: req.body.alias,
    rank: req.body.rank,
    medals: req.body.medals,
    planet: req.body.planet,
    uid: req.body.uid
  };
  db.run(
      `UPDATE players set
                        alias = COALESCE(?,alias),
                        medals = COALESCE(?,medals),
                        rank = COALESCE(?,rank),
                        planet = COALESCE(?,planet),
                        uid = COALESCE(?,uid)
       WHERE kxid = ?`,
      [data.alias, data.medals, data.rank, data.planet, data.uid, data.kxid],
      function (err, result) {
        if (err){
          res.status(400).json({"error": res.message})
          return;
        }
        res.json({
          message: "success",
          data: data,
          changes: this.changes
        })
      });
})

// Default response for any other request
app.use(function(req, res){
  res.status(404);
  res.json({
    "status": "404"
  })
});


