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
        getSection: (user) => {
            return Promise.all([
                new Promise((resolve, reject) => {
                    myDb.query('SELECT `header`, `side`, `position` FROM `sections` WHERE `user` = "' + user + '";', (err, result) => {

                        if (err) reject(err);
                        resolve(result);
                    });
                }),
                new Promise((resolve, reject) => {
                    myDb.query('SELECT `header`, `displayname`, `url`, `position` FROM `links` WHERE `user` = "' + user + '";', (err, result) => {

                        if (err) reject(err);
                        resolve(result);
                    });
                }),
            ]);
        },

        saveSection: (user, sections) => {
            let datastring1 = sections.map(section => '("' + user + '", "' + escape(section.header) + '", "' + escape(section.side) + '", "' + section.position + '")').join(', '),
                datastring2 = sections.map(section => {
                    return section.links.filter(link => !(link.displayname === "" && link.url === "")).map(link => '("' + user + '", "' + escape(section.header) + '", "' + escape(link.displayname) + '", "' + escape(link.url) + '", "' + link.position + '")').join(', ')
                }).join(', ');

            return Promise.all([
                new Promise((resolve, reject) => {
                    myDb.query('INSERT INTO  `sections` (`user`, `header`, `side`, `position`) VALUES ' + datastring1 + ' ON DUPLICATE KEY UPDATE `header`=VALUES(`header`);', (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                }),
                new Promise((resolve, reject) => {
                    myDb.query('INSERT INTO  `links` (`user`, `header`, `displayname`, `url`, `position`) VALUES ' + datastring2 + ' ON DUPLICATE KEY UPDATE `displayname`=VALUES(`displayname`),`url`=VALUES(`url`);', (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                })
            ]);
        },

        deleteSection: (user, sections) => {
            let datastring = '("' + sections.join('", "') + '")';

            return new Promise((resolve, reject) => {
                let finished = false;

                myDb.query('DELETE `links` FROM `sections` INNER JOIN `links` WHERE `links`.header = `sections`.header AND `links`.user = "' + user + '" AND `sections`.position IN ' + datastring + ';', (err, result) => {
                    if (err) reject(err);
                    if (finished) {
                        resolve(result);
                    } else {
                        finished = true;
                    }
                });
                myDb.query(' DELETE FROM `sections` WHERE `sections`.`position` IN ' + datastring + ' AND `sections`.user = "' + user + '";', (err, result) => {
                    if (err) reject(err);

                    if (finished) {
                        resolve(result);
                    } else {
                        finished = true;
                    }
                });
            });
        },

        deleteLink: (user, links) => {
            let datastring = '(' + links.map(item => '("' + item.position + '", "' + item.header + '")').join(', ') + ')';

            return new Promise((resolve, reject) => {
                myDb.query('DELETE FROM `links` WHERE (position, header) in ' + datastring + ' AND user = "' + user + '";', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            }).then((result) => {
                res.status(200).send();
            })
            .catch((err) => {
            console.log(err);
                res.status(500).send(err + datastring);
            });
        },

        getRemote: (user) => {
            return new Promise((resolve, reject) => {
                myDb.query('SELECT `name`, `position`, `ssl` FROM `remotes` WHERE `user` = "' + user + '";', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        },

        saveRemote: (user, remotes) => {
            let datastring = remotes.map(remote => '("' + user + '", "' + remote.position + '", "' + escape(remote.name) + '", "' + escape(remote.ssl) + '")').join(', ');
            return new Promise((resolve, reject) => {
                myDb.query('INSERT INTO  `remotes` (`user`, `position`, `name`, `ssl`) VALUES ' + datastring + ' ON DUPLICATE KEY UPDATE `name`=VALUES(`name`),`ssl`=VALUES(`ssl`);', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        },

        deleteRemote: (user, remotes) => {
            let datastring = '("' + remotes.join('", "') + '")';

            return new Promise((resolve, reject) => {
                myDb.query('DELETE FROM `remotes` WHERE `position` IN ' + datastring + ' AND user = "' + user + '";', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        },

        getScript: (user) => {
            return new Promise((resolve, reject) => {
                myDb.query('SELECT `title`, `content`, `position` FROM `scripts` WHERE `user` = "' + user + '";', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        },

        saveScript: (user, scripts) => {
            let datastring = scripts.map(script => '("' + user + '", "' + script.position + '", "' + escape(script.title) + '", "' + escape(script.content) + '")').join(', ');

            return new Promise((resolve, reject) => {
                myDb.query('INSERT INTO  `scripts` (`user`, `position`, `title`, `content`) VALUES ' + datastring + ' ON DUPLICATE KEY UPDATE `title`=VALUES(`title`),`content`=VALUES(`content`);', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            })
        },

        deleteScript: (user, scripts) => {
            let datastring = '("' + scripts.join('", "') + '")';

            return new Promise((resolve, reject) => {
                myDb.query('DELETE FROM `scripts` WHERE `position` IN ' + datastring + ' AND user = "' + user + '";', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            })
        },

        getUserInfo: (user) => {
            return new Promise((resolve, reject) => {
                myDb.query('SELECT `job`, `phone`, `email`, `name` FROM `body` WHERE `user` = "' + user + '";', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        },

        setUserInfo: (user, userData) => {
            let datastring = '("' + user + '", "' + escape(userData.job) + '", "' + escape(userData.phone) + '", "' + escape(userData.email) + '", "' + escape(userData.name) + '")';

            return new Promise((resolve, reject) => {
                myDb.query('INSERT INTO  `body` (`user`, `job`, `phone`, `email`, `name`) VALUES ' + datastring + ' ON DUPLICATE KEY UPDATE `job`=VALUES(`job`),`phone`=VALUES(`phone`),`email`=VALUES(`email`),`name`=VALUES(`name`);', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        },

        getUserList: (page) => {
            return new Promise((resolve, reject) => {
                myDb.query('SELECT `name`, `pass` FROM `users` WHERE `user` = "' + page + '";', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        }
    }
}

module.exports = db;