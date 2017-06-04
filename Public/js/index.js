$(window).on('load', loadPageItems);

function loadPageItems () {
    var links = [],
        remoteMachinesList = [],
        scripts = [],

        sorter = (a,b) => {a.position - b.position},

        remotesList = document.querySelector('.remoteMachines'),
        scriptsList = document.querySelector('.scriptsList'),
        loginButton = document.getElementById('login'),
        messageHolder = document.querySelector('.messageHolder'),
        mainframe = document.querySelector('.mainframe'),
        footer = document.querySelector('.footer'),
        googleForm = document.querySelector('.googleForm'),
        googleIcon = document.querySelector('.googleIcon'),
        weatherContainer = document.querySelector('.weatherContainer'),
        renderController,
        weatherTimer,
        loggedIn = false,
        warningRead = false;

    function getData(table) {
        return fetch('/api/' + table);
    }

    function getNextPosition(arr) {
        return arr.length ? (parseInt(arr[arr.length-1].position) + 10) : 0;
    }

    function deleteData(table, data) {
        return fetch('/api/' + table, {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
    }

    function setData(table, data) {
        return fetch('/api/' + table, {
          method: 'PUT',
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
    }

    function renderItems (editable) {
        editScript = editable ? ' contenteditable="true"' : '',
        weatherTimer,
        templates = {
            newRemoteTmpl: (index) => {
                return `<div data-id="${index}" class="machine clean">
                    <h3 contenteditable="true">Vm-Name</h3>
                    <span class="sslRow">
                        <label for="">SSL: </label>
                        <span>
                            <input name="ssl${index}" class="sslInput" value="1" type="radio" checked="true" />
                            <span>Yes</span>
                        </span>
                        <span>
                            <input name="ssl${index}" class="sslInput" value="0" type="radio" />
                            <span>No</span>
                        </span>
                    </span>
                    <ul class="remotesList">
                        <a target="_blank" href="#">
                            <li>MBO</li>
                        </a>
                        <a target="_blank" href="#">
                            <li>PBO</li>
                        </a>
                        <a target="_blank" href="#">
                            <li>TBO</li>
                        </a>
                        <a target="_blank" href="#">
                            <li>Diag</li>
                        </a>
                    </ul>
                </div>`;
            },

            newScriptTmpl: (index) => {
                return `<div data-id="${index}" class="script machine clean">
                    <h3 contenteditable="true">Title</h3>
                    <textarea rows="5" onfocus="this.select()"></textarea>
                </div>`;
            },

            remoteTmpl: (machine, index) => {
                var httpVar = machine.ssl ? 'https://' : 'http://',
                    sslString = editable ?
                        `<span class="sslRow">
                            <label for="">SSL: </label>
                            <span>
                                <input name="ssl${index}" class="sslInput" value="1" type="radio" ${machine.ssl ? 'checked="true"' : ''} />
                                <span>Yes</span>
                            </span>
                            <span>
                                <input name="ssl${index}" class="sslInput" value="0" type="radio" ${!machine.ssl ? 'checked="true"' : ''} />
                                <span>No</span>
                            </span>
                        </span>`
                        : '';

                return `<div data-id="${index}" class="machine ">
                    <h3${editScript}>${machine.name}</h3>
                    ${sslString}
                    <ul class="remotesList">
                        <a target="_blank" href="${httpVar}${machine.name}/MBO">
                            <li>MBO</li>
                        </a>
                        <a target="_blank" href="${httpVar}${machine.name}/PBO">
                            <li>PBO</li>
                        </a>
                        <a target="_blank" href="${httpVar}${machine.name}/TBO">
                            <li>TBO</li>
                        </a>
                        <a target="_blank" href="${httpVar}${machine.name}/Diagnostics">
                            <li>Diag</li>
                        </a>
                    </ul>
                </div>`;
            },

            scriptTmpl: (script, index) => {
                return `<div data-id="${index}" class="script machine">
                    <h3${editScript}>${script.title}</h3>
                    <textarea rows="5" onfocus="this.select()">${script.content}</textarea>
                </div>`;
            },

            sideSectionTmpl: (header, linkTemplates, index) => {
                return `<section data-id="${index}" class="quicklinks">
                    <h2${editScript}>${header}</h2>
                    <ul>
                        ${linkTemplates}
                    </ul>
                </section>`;
            },

            newSideSectionTmpl: (index) => {
                return `<section data-id="${index}" class="quicklinks clean">
                    <h2${editScript}>New Section</h2>
                    <ul>
                    </ul>
                </section>`;
            },

            linkTmpl: (link, index) => {
                return `<li data-id="${index}">
                    <a target="_blank" href="${link.url}" >${link.displayname}</a>
                </li>`;
            },

            newLinkTmpl: (index) => {
                return `<li data-id="${index}" class="clean newLink">
                    <input type="text" placeholder="Linkname" class="nameInput"/>
                    <input type="text" placeholder="URL" class="urlInput"/>
                </li>`;
            },

            footerTmpl: (data) => {
                return `<p class="impressum">
                    <span${editScript} id="name">${data.name}</span>,
                    <span${editScript} id="job">${data.job}</span> |
                    Tel: <span${editScript} id="phone">${data.phone}</span> |
                    Mail: <span${editScript} id="email">${data.email}</span>
                </p>`;
            },

            messageTmpl: (message) => {
                return `<div class="message">
                    <span>${message}</span>
                    <span class="delete closeMessage"></span>
                </div>`;
            },

            weatherTmpl: (color, time) => {
                return `<div class="weatherBlock" style="background:${color}">
                    <span>${time}</span>
                </div>`;
            }
        },

        generateCloseButton = function (table, arr) {
            let closeElem = document.createElement('span');

            closeElem.addEventListener('click', function() {
                let item = this.parentNode;

                deleteData(table, [arr[item.dataset.id].position]);
                item.remove();
            });
            closeElem.classList.add('delete');

            return closeElem;
        };

        generateLinkCloseButton = function (arr, header) {
            let closeElem = document.createElement('span');

            closeElem.addEventListener('click', function() {
                let item = this.parentNode;

                deleteData('link', [{position: arr[item.dataset.id].position, header: header}]);
                item.remove();
            });
            closeElem.classList.add('delete');

            return closeElem;
        };

        return {
            initScripts : function() {
                getData('scripts')
                .then(data => data.json())
                .then(scriptDataList => {
                    scripts = scriptDataList;
                    scriptDataList.sort(sorter).forEach((script, index) => {
                        let myObject = script;

                        scriptsList.insertAdjacentHTML(
                            'beforeend',
                            templates.scriptTmpl(script, index)
                        );

                        if (editable) {
                            scriptsList.querySelector('div:last-child > h3').addEventListener('blur', function() {
                                if (this.innerText === script.title) return;

                                myObject.title = this.innerText;
                                setData('scripts', [myObject]);
                            });

                            scriptsList.querySelector('div:last-child > textarea').addEventListener('blur', function() {
                                if (this.value === script.content) return;

                                myObject.content = this.value;
                                setData('scripts', [myObject]);
                            });

                            scriptsList
                                .querySelector('div:last-child')
                                .appendChild(generateCloseButton('scripts', scripts));
                        }
                    });

                    if (editable) {
                        this.newScript();
                    }
                });
            },

            newScript: function() {
                var newObject = {content: '', title: '', position: getNextPosition(scripts)},
                    newAdded = false,
                    self = this;

                scripts.push(newObject);

                scriptsList.insertAdjacentHTML(
                    'beforeend',
                    templates.newScriptTmpl(scripts.length - 1)
                );

                scriptsList.querySelector('div:last-child > h3').addEventListener('blur', function() {
                    if (this.innerText === 'Title') return;

                    newObject.title = this.innerText;
                    setData('scripts', [newObject]);

                    if (!newAdded) {
                        newAdded = true;
                        self.newScript();
                        this.parentNode.classList.remove('clean');
                    }
                });

                scriptsList.querySelector('div:last-child > textarea').addEventListener('blur', function() {
                    if (this.value === '') return;

                    newObject.content = this.value;
                    setData('scripts', [newObject]);

                    if (!newAdded) {
                        newAdded = true;
                        scriptsList
                            .querySelector('div:last-child')
                            .appendChild(generateCloseButton('scripts', scripts));

                        self.newScript();
                        this.parentNode.classList.remove('clean');
                    }
                });
            },

            initRemotes: function () {
                getData('remotes')
                .then(data => data.json())
                .then(remotes => {
                    remoteMachinesList = remotes;
                    remotes.sort(sorter).forEach((machine, index) => {
                        let myObject = machine;

                        remotesList.insertAdjacentHTML(
                            'beforeend',
                            templates.remoteTmpl(machine, index)
                        );

                        if (editable) {
                            remotesList.querySelector('div:last-child > h3').addEventListener('blur', function() {
                                if (this.innerText === machine.name) return;

                                myObject.name = this.innerText;
                                setData('remotes', [myObject]);
                                this.parentNode.querySelectorAll('a').forEach(elem => elem.href = elem.href.replace(/http:\/\/.*?\//, 'http://' + this.innerText + '/'));
                            });

                            remotesList.querySelectorAll('.machine:last-child input.sslInput').forEach(el => {
                                el.addEventListener('change', function() {
                                    if (this.checked) {
                                        myObject.ssl = this.value;
                                        setData('remotes', [myObject]);
                                    }
                                });
                            });

                            remotesList
                                .querySelector('div:last-child')
                                .appendChild(generateCloseButton('remotes', remoteMachinesList));
                        }
                    });

                    if (editable) {
                        this.newRemote();
                    }
                });
            },

            newRemote: function () {
                var newObject = {name: '', ssl: '1', position: getNextPosition(remoteMachinesList)},
                    newAdded = false,
                    self = this;

                remoteMachinesList.push(newObject);

                remotesList.insertAdjacentHTML(
                    'beforeend',
                    templates.newRemoteTmpl(remoteMachinesList.length - 1)
                );

                remotesList.querySelector('div:last-child > h3').addEventListener('blur', function() {
                    if (this.innerText === 'Vm-Name') return;

                    newObject.name = this.innerText;
                    setData('remotes', [newObject]);
                    this.parentNode.querySelectorAll('a').forEach(elem => elem.href = elem.href.replace(/http:\/\/.*?\//, 'http://' + this.innerText + '/'));

                    if (!newAdded) {
                        newAdded = true;
                        remotesList
                            .querySelector('div:last-child')
                            .appendChild(generateCloseButton('remotes', remoteMachinesList));

                        self.newRemote();
                        this.parentNode.classList.remove('clean');
                    }
                });

                remotesList.querySelector('input.sslInput').addEventListener('change', function() {
                    myObject.ssl = this.value;
                    setData('remotes', [myObject]);
                });
            },

            initLinkList: function() {
                let sidebarRight = document.querySelector('#sideBarRight .container'),
                    sidebarLeft = document.querySelector('#sideBarLeft .container'),
                    sidebarString;

                getData('sections')
                .then(data => data.json())
                .then(linkObj => {
                    links = linkObj;

                    sidebarString = links.reduce((sectionObject, section, index) => {
                        let linkTemplates;
                        linkTemplates = section.links.sort(sorter).reduce((tmplString, link, linkid) => tmplString + templates.linkTmpl(link, linkid), '');
                        sectionObject[section.side] += templates.sideSectionTmpl(section.header, linkTemplates, index);
                        return sectionObject;
                    }, {left: '', right: ''});

                    sidebarRight.insertAdjacentHTML(
                        'afterbegin',
                        sidebarString.right
                    );

                    sidebarLeft.insertAdjacentHTML(
                        'afterbegin',
                        sidebarString.left
                    );

                    if (editable) {
                        Array.from(sidebarRight.querySelectorAll('li')).concat(Array.from(sidebarLeft.querySelectorAll('li'))).forEach((elem) => {
                            let id = elem.parentNode.parentNode.dataset.id;

                            elem.appendChild(generateLinkCloseButton(links[id].links, links[id].header));
                        });

                        Array.from(sidebarRight.querySelectorAll('section'))
                            .concat(Array.from(sidebarLeft.querySelectorAll('section')))
                            .forEach((elem) => {
                                let id = elem.dataset.id;

                                elem.querySelector('h2').addEventListener('blur', function() {
                                    if (this.innerText === links[id].header) return;

                                    links[id].header = this.innerText;
                                    setData('sections', [links[id]]);
                                });

                                elem.appendChild(generateCloseButton('section', links));
                                this.newListLink(elem);
                            });

                        this.newSideSection('left');
                        this.newSideSection('right');
                    }
                });
            },

            newSideSection: function(side) {
                let sidebar = document.querySelector('#sideBar' + ((side === 'left') ? 'Left' : 'Right') + ' .container'),
                    currentArray = links,
                    newObject = {header: '', side: side, position: getNextPosition(currentArray), links: []},
                    newAdded = false,
                    self = this;

                currentArray.push(newObject);

                sidebar.insertAdjacentHTML(
                    'beforeend',
                    templates.newSideSectionTmpl(currentArray.length - 1)
                );

                sidebar.querySelector('section:last-child > h2').addEventListener('blur', function() {
                    if (this.innerText === 'New Section') return;

                    newObject.header = this.innerText;
                    setData('sections', [newObject]);

                    if (!newAdded) {
                        newAdded = true;
                        sidebar
                            .querySelector('section:last-child')
                            .appendChild(generateCloseButton(newObject.header, links));

                        self.newListLink(sidebar.querySelector('section:last-child'));
                        self.newSideSection(side);
                        this.parentNode.classList.remove('clean');
                    }
                });
            },

            newListLink: function(section) {
                var sectionId = section.dataset.id,
                    currentArray = links[sectionId].links,
                    newObject = {header: links[sectionId].header, url: '', displayname: '', position: getNextPosition(currentArray)},
                    newAdded = false,
                    self = this;

                currentArray.push(newObject);

                section.querySelector('ul').insertAdjacentHTML(
                    'beforeend',
                    templates.newLinkTmpl(currentArray.length - 1)
                );

                section.querySelector('li:last-child > input.nameInput').addEventListener('blur', function() {
                    if (this.value === '') return;

                    newObject.displayname = this.value;
                    setData('sections', [links[sectionId]]);

                    if (!newAdded) {
                        newAdded = true;
                        section
                            .querySelector('li:last-child')
                            .appendChild(generateCloseButton(links[sectionId].header, links[sectionId].links));

                        self.newListLink(section);
                        this.parentNode.classList.remove('clean');
                    }
                });

                section.querySelector('li:last-child > input.urlInput').addEventListener('blur', function() {
                    if (this.value === '') return;

                    newObject.url = this.value;
                    setData('sections', [links[sectionId]]);

                    if (!newAdded) {
                        newAdded = true;
                        section
                            .querySelector('li:last-child')
                            .appendChild(generateCloseButton(links[sectionId].header, links[sectionId].links));

                        self.newListLink(section);
                        this.parentNode.classList.remove('clean');
                    }
                });
            },

            initMainBody: function() {
                getData('body')
                .then(data => data.json())
                .catch((err) => {
                    return {};
                })
                .then(body => {
                    let defaults = {
                            name: 'Name',
                            job: 'Jobtitel',
                            phone: 'Telephonnummer',
                            email: 'Email-Adresse'
                        },
                        data = Object.assign(defaults, body[0]);

                    footer.insertAdjacentHTML(
                        'beforeend',
                        templates.footerTmpl(data)
                    );

                    document.title = data.name + '\'s interne Seite';
                    document.querySelector('.subtitle').innerText = 'Willkommen auf der Startseite von ' + data.name + '.';

                    if (editable) {
                        ['job', 'phone', 'email'].forEach(prop => {
                            footer.querySelector('#' + prop).addEventListener('blur', function() {
                                if (this.innerText === data[prop]) return;

                                data[prop] = this.innerText;
                                setData('body', data);
                            });
                        });

                        footer.querySelector('#name').addEventListener('blur', function() {
                            if (this.innerText === data.name) return;

                            data.name = this.innerText;

                            document.title = data.name + '\'s interne Seite';
                            document.querySelector('.subtitle').innerText = 'Willkommen auf der Startseite von ' + data.name + '.';
                            setData('body', data);
                        });
                    }

                });
            },

            generateMessage: function(message) {
                let messageElem,
                    closeButton,
                    timeout;

                messageHolder.insertAdjacentHTML(
                    'beforeend',
                    templates.messageTmpl(message)
                );

                messageElem = messageHolder.querySelector('.message:last-child');
                closeButton = messageElem.querySelector('.delete');

                messageElem.addEventListener('transitionend', () => {
                    messageElem.remove();
                });

                timeout = setTimeout(() => {


                    messageElem.classList.add('noHeight');
                }, 10000);

                closeButton.addEventListener('click', () => {
                    clearTimeout(timeout);
                    messageElem.classList.add('noHeight');
                });
            },

            clearAll: function() {
                let remotes = document.querySelectorAll('.remoteMachines > div'),
                    scripts = document.querySelectorAll('.scriptsList > div'),
                    links = document.querySelectorAll('.sideBar section');

                remotes.forEach(el => el.remove());
                scripts.forEach(el => el.remove());
                links.forEach(el => el.remove());
                document.querySelector('.footer').innerHTML = '';
            },

            generateWeatherBox: function(showWarning) {
                getData('weather')
                .then(res => res.json())
                .catch(err => {
                    return {
                        events: []
                    };
                })
                .then(data => {
                    let weatherString = data.events.reduce((acc, weatherBlock) => {
                            return acc + templates.weatherTmpl(weatherBlock.color, weatherBlock.time);
                        }, '') + '<span class="marker"></span>',

                        time = new Date(),
                        currentTime = ('00' + time.getHours()).slice(-2) + ':' + ('00' + Math.floor(time.getMinutes() / 5) * 5).slice(-2),
                        startPosition = data.events.map((event) => event.time).indexOf(currentTime),
                        upcomingWeather = data.events.slice(startPosition, startPosition + 8),
                        sendWarning = upcomingWeather.some(item => (item.value <= 1)),
                        markerLeft = (startPosition + (time.getMinutes() % 5) / 5) / 24 * 100,
                        firstMinuteStampType = parseInt(data.events[0].time.split(':')[1]) % 15 / 5,
                        marker;

                    if (showWarning && sendWarning && new Date().getHours() > 17 && !warningRead) {
                        createNotification('In den nächsten 45 Minuten könnte es regnen!');
                    }

                    if (warningRead && !sendWarning && upcomingWeather.some(item => (item.value <= 1) )) {
                        warningRead = false;
                    }

                    weatherContainer.innerHTML = weatherString;
                    marker = weatherContainer.querySelector('.marker');
                    marker.style.left = markerLeft + '%';
                    weatherContainer.className = 'weatherContainer ' + ((firstMinuteStampType === 0) ? 'first' : (firstMinuteStampType === 1) ? 'second' : 'third');

                    clearInterval(weatherTimer);
                    weatherTimer = setInterval(() => {
                       marker.style.left = (parseFloat(marker.style.left) + (10 / 12)) + '%';
                    }, 60000);

                })
            }
        }
    }

    function edit() {
        mainframe.classList.add('edit');
        renderController = renderItems(true);
        renderController.clearAll();

        renderController.initScripts();
        renderController.initRemotes();
        renderController.initLinkList();
        renderController.initMainBody();
    }

    function read() {
        mainframe.classList.remove('edit');
        renderController = renderItems(false);
        renderController.clearAll()

        renderController.initScripts();
        renderController.initRemotes();
        renderController.initLinkList();
        renderController.initMainBody();
        weather();
    }

    function weather() {
        clearInterval(weatherTimer);

        weatherTimer = setInterval(() => {
            renderController.generateWeatherBox(true);
        }, 600000 + 300000 * Math.random() );

        renderController.generateWeatherBox();
    }

    function testlogin() {
        fetch('/api/testlogin', {
              credentials: 'same-origin'
        }).then((res) => {
            loginButton.classList.remove('hidden');
            if (res.status === 200) {
                loggedIn = true;
                loginButton.innerText = 'Edit';
            } else {
                loginButton.innerText = 'Login';
            }
        });
    }

    function testNotification() {
        return new Promise((resolve, reject) => {
            if (Notification) {
                if (Notification.permission !== 'granted') {
                    Notification.requestPermission()
                    .then(resolve)
                    .catch(reject);
                } else {
                    resolve();
                }
            } else {
                reject();
            }

        })
    }

    function createNotification(text, icon) {
        if (!text) {
            return;
        }

        testNotification()
        .then(() => {
            let notification = new Notification('Notification title', {
                icon: icon ? icon : '/favicon.ico?v=2',
                body: text,
            });

            notification.addEventListener('click', (evt) => {
                window.focus();
                evt.target.close();
                warningRead = true;
            });
        })
    }

    loginButton.addEventListener('click', function(evt) {
        if (loggedIn) {
            if (loginButton.classList.contains('pressed')) {
                loginButton.classList.remove('pressed');
                read();
            } else {
                edit();
                loginButton.classList.add('pressed');
            }
        } else {
            fetch('/login', {
                credentials: 'same-origin'
            })
            .then(res => {
                if (res.status === 200) {
                    loggedIn = true;
                    loginButton.innerText = 'Edit';
                } else {
                    renderController.generateMessage('Error logging in - please check your credentials.');
                }
            })
            .catch(() => {
                renderController.generateMessage('Error logging in - please check your credentials.');
            });

        }
    });

    window.addEventListener('focus', () => {
        weather();
    })

    googleIcon.addEventListener('click', () => googleForm.submit());

    read();
    testlogin();
    createNotification();
}

