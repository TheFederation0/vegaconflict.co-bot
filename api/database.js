const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "./db.sqlite"

let db = new sqlite3.Database(DBSOURCE, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE players (
            kxid text PRIMARY KEY,
            alias text, 
            rank INTEGER,
            medals INTEGER,
            planet text,
            uid text 
            )`,
            (err) => {
                if (err) {
                    // Table already created
                }else{
                    // Table just created, creating some rows
                    var insert = 'INSERT INTO players (kxid, alias, rank, medals ) VALUES (?,?,?,?)'
                    db.run(insert, ["50d050c84a3a8a5f0c08eef4","ӍЄԀѦLՏ ѣѺՏՏ","1", 995])
                    db.run(insert, ["50d02a9e4a3a8a5e560087fd","ēคt ๓ē໓คlŞ","2", 974])
                }
            });
    }
});
//db.close();

module.exports = db