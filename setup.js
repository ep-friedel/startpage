function setup(myDb) {
	myDb.query('CREATE TABLE IF NOT EXISTS `remotes` ( `user` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `position` varchar(20) NOT NULL, UNIQUE KEY `position` (`position`, `user`) );',(err) => {
	    if (err) console.log(err);
	});
	myDb.query('CREATE TABLE IF NOT EXISTS `scripts` ( `user` varchar(255) NOT NULL, `title` varchar(255) NOT NULL,`content` TEXT NOT NULL, `position` varchar(20) NOT NULL, UNIQUE KEY `position` (`position`, `user`) );',(err) => {
	    if (err) console.log(err);
	});
	myDb.query('CREATE TABLE IF NOT EXISTS `sections` ( `user` varchar(255) NOT NULL, `header` varchar(255) NOT NULL, `side` varchar(255) NOT NULL, `position` varchar(20) NOT NULL, UNIQUE KEY `position` (`position`, `user`) );',(err) => {
	    if (err) console.log(err);
	});
	myDb.query('CREATE TABLE IF NOT EXISTS `links` ( `user` varchar(255) NOT NULL, `header` varchar(255) NOT NULL, `displayname` varchar(255) NOT NULL, `url` varchar(255) NOT NULL, `position` int(20) NOT NULL, UNIQUE KEY `position` (`position`, `header`, `user`) );',(err) => {
	    if (err) console.log(err);
	});
	myDb.query('CREATE TABLE IF NOT EXISTS `body` ( `user` varchar(255) NOT NULL, `job` varchar(255) NOT NULL, `phone` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, UNIQUE KEY `user` (`user`) );',(err) => {
	    if (err) console.log(err);
	});
	myDb.query('CREATE TABLE IF NOT EXISTS `users` ( `user` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `pass` varchar(255) NOT NULL, UNIQUE KEY `user` (`user`, `name`) );',(err) => {
	    if (err) console.log(err);
	});
}

module.exports = setup;