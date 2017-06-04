#!/usr/bin/env node

const   express = require('express')
    ,   app = express()
    ,   server = require('http').createServer(app)
    ,   fs = require('fs')
    ,   https = require('https')
    ,   bodyParser = require('body-parser')
    ,   fetch = require('node-fetch')
    ,   server_port = process.env.SP_PORT
    ,   server_ip_address = 'localhost'
    ,   hmac = require(process.env.SP_HOME + 'modules/auth/hmac')(process.env.GITHUB_SECRET, 'X-Hub-Signature')
    ,   sslServer = https.createServer({
            key: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_key.pem'),
            cert: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_cert_chain.pem')
        }, app)
    ,   auth = require(process.env.SP_HOME + 'auth')()
    ,   sql = require(process.env.SP_HOME + 'db')();

sslServer.listen(server_port, server_ip_address, () => {
    console.log('listening on port '+ server_port);
});

app.use(bodyParser.json());

app.get('/:user/login', auth('popup'), (req, res) => {
	res.status(200).send();
});

app.use('/:user/', express.static(process.env.SP_HOME + 'Public'));

app.get('/:user/api/sections', (req, res) => {
    sql.getSection(req.params.user)
    .then((result) => {
        let parsedResult = result[0].map((section) => {
            section.links = result[1].filter(link => link.header === section.header);
            return section;
        })

        res.status(200).send(JSON.stringify(parsedResult));
    })
    .catch((err) => {
        res.status(500).send();
    });
});

app.put('/:user/api/sections', auth('popup'), (req, res) => {
    sql.saveSection(req.params.user, req.body).then((result) => {
        res.status(200).send();
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.delete('/:user/api/sections', auth('popup'), (req, res) => {
    sql.deleteSection(req.params.user, req.body)
    .then((result) => {
        res.status(200).send();
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.delete('/:user/api/link', auth('popup'), (req, res) => {
    sql.deleteLink(req.params.user, req.body)
    .then((result) => {
        res.status(200).send();
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.get('/:user/api/remotes', (req, res) => {
    sql.getRemote(req.params.user).then((result) => {
        res.status(200).send(JSON.stringify(result));
    })
    .catch((err) => {
        res.status(500).send();
    });
});

app.put('/:user/api/remotes', auth('popup'), (req, res) => {
    sql.saveRemote(req.params.user, req.body).then((result) => {
        res.status(200).send();
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.delete('/:user/api/remotes', auth('popup'), (req, res) => {
    sql.deleteRemote(req.params.user, req.body).then((result) => {
        res.status(200).send();
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.get('/:user/api/scripts', (req, res) => {
    sql.getScript(req.params.user)
    .then((result) => {
        res.status(200).send(JSON.stringify(result));
    })
    .catch((err) => {
        res.status(500).send();
    });
});

app.put('/:user/api/scripts', auth('popup'), (req, res) => {
    sql.saveScript(req.params.user, req.body)
    .then((result) => {
    	console.log(result);
        res.status(200).send(result);
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.delete('/:user/api/scripts', auth('popup'), (req, res) => {
    sql.deleteScript(req.params.user, req.body)
    .then((result) => {
        res.status(200).send();
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.get('/:user/api/testlogin', auth('noPopup'), (req, res) => {
    res.status(200).send('loggedIn');
});

app.get('/:user/api/body', (req, res) => {
    sql.getUserInfo(req.params.user)
    .then((result) => {
        res.status(200).send(JSON.stringify(result));
    })
    .catch((err) => {
        res.status(500).send();
    });
});

app.put('/:user/api/body', auth('popup'), (req, res) => {
    sql.setUserInfo(req.params.user, req.body)
    .then((result) => {
        res.status(200).send();
    })
    .catch((err) => {
    console.log(err);
        res.status(500).send(err + datastring);
    });
});

app.get('/:user/api/weather', (req, res) => {
    fetch('http://www.wetter.com/wetter_aktuell/nowcast_update/?lat=50.9030&lng=11.6016', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(res => res.json())
    .then(data => res.status(200).send(data));
});

app.get('/:user/api/*', (req, res) => res.status(404).send());

app.get('/:user/*', (req, res) => res.redirect('https://' + req.headers.host + '/index.html'));

app.post('/:user/api/triggerBuild', hmac, (req, res) => {
    exec(process.env.SP_HOME + "scripts/build", (error, stdout, stderr) => {
        console.log(stdout + error + stderr);
    });
    res.status(200).send();
});