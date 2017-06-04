function db() {
    const   mysql = require('mysql')
    ,   setup = require(process.env.SP_HOME + 'setup');

    let myDb;

    function initDb() {
        let db = mysql.createConnection({
              host     : process.env.SP_DB_HOST,
              port     : process.env.SP_DB_PORT,
              user     : process.env.SP_DB_USERNAME,
              password : process.env.SP_DB_PASSWORD,
              database : process.env.SP_DB_NAME
            });

        db.on('error', (err) => {
            if (err){
                if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
                    throw('MySQL-ConnectionError: ' + err);
                } else {
                    myDb = initDb();
                }
            }
        });

        db.connect((err) => {
            if (err) {
                throw('MySQL-ConnectionError: ' + err);
            }
        });

        return db;
    };

    myDb = initDb();
    setup(myDb);

    function escape(str) {
        if (!str) {
            return '';
        }

        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char;
            }
        });
    }

    return {
        getUserList: (page) => {
            return new Promise((resolve, reject) => {
                myDb.query('SELECT `name`, `pass` FROM `users` WHERE LOWER(`user`) = LOWER("' + page + '");', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        }
    }
}

module.exports = db;