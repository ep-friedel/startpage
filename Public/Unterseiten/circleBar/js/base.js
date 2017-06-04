
function circleBar () {
    this.options = {
        percentage : 0,                                         /*---Start Percentage---*/
        color : 'red',                                          /*---Circle Bar completion color---*/
        circleBackgroundColor : 'blue',                         /*---Circle Bar incomplete area color---*/
        innerCircleBackgroundColor: 'white',                    /*---inner circle background color---*/
        persistence : true,                                     /*---Keep Object for reuse---*/
        position : 'follow',                                    /*---position of  circle bar, takes {top: 'yypx', left: 'xx%'} or follow to follow mouse pointer---*/
        size : '30px',                                          /*---diameter of outer circle---*/
        target : document.querySelector('body'),                /*---element to append the circle bar to---*/
        showPercentageSign : false,                             /*---show percentage sign---*/
        showPercentageNumber: true,                             /*---show percentage number---*/
        percentageNumberColor: 'black',                         /*---font color of percentage---*/
        percentageNumberSizeScaleFactor: 0.65,                  /*---scale factor for fontsize relative to circle width---*/
        innerCircleWidth: 0.70,                                 /*---relative width of inner circle---*/
        outerCircleBorder: true,                                /*---display 1px border of outer circle---*/
        transitionLength: '0.3s',
        fade: false,
        callback: function () {},
        _fadeStatus: 2
    };
}




circleBar.prototype = {
    init: function (options, callback) {
        var self = this,
            _key;
        if (options !== undefined){
            for ( _key in self.options) {
                if (_key !== '_fadeStatus') {
                    if (options.hasOwnProperty(_key)) {
                        self.options[_key] = options[_key];
                    }
                }
            }
        }

            /*Create DOM-Element*/
        self._create();

            /*Check Options for Errors*/
        self._checkOptions(options);

            /*Set Options*/
        self._setOptions();
    },


    _checkOptions: function (options) {
        var self = this,
            param;

            /*-----check Percentage-----*/

        if (options.percentage !== undefined) {
            options.percentage = checkNumber(options.percentage, 'percentage');
            options.percentage = checkNumber(options.percentage, 'percentage');
            options.percentage = checkRange(options.percentage, 0, 100) ? options.percentage : null;
        }
            /*-----check PercentageNumberSizeScaleFactor-----*/

        if (options.percentageNumberSizeScaleFactor !== undefined) {
            options.percentageNumberSizeScaleFactor = checkNumber(options.percentageNumberSizeScaleFactor, 'percentageNumberSizeScaleFactor');
            options.percentageNumberSizeScaleFactor = checkRange(options.percentageNumberSizeScaleFactor, 0, 1) ? options.percentageNumberSizeScaleFactor : null;
        }

            /*-----check innerCircleWidth-----*/

        if (options.innerCircleWidth !== undefined) {
            options.innerCircleWidth = checkNumber(options.innerCircleWidth, 'innerCircleWidth');
            options.innerCircleWidth = checkRange(options.innerCircleWidth, 0, 1) ? options.innerCircleWidth : null;
        }

            /*-------Check color, circleBackgroundColor, innerCircleBackgroundColor, percentageNumberColor--------------*/

        [options.color, options.circleBackgroundColor, options.innerCircleBackgroundColor, options.percentageNumberColor].forEach(function (opt){
            if (opt !== undefined) {
                opt = checkColor(opt);
            };
        });

            /*------Check persistence, showPercentageSign, showPercentageNumber, outerCircleBorder, fade--------------*/

        [options.persistence, options.showPercentageSign, options.showPercentageNumber, options.outerCircleBorder, options.fade].forEach(function (opt){
            if (opt !== undefined) {
                opt = checkTrueFalse(opt);
            };
        });

            /*-----check Size-----*/

        if (options.size !== undefined) {
            options.size = checkUnit(options.size, ['px', 'em', '%', 'vh', 'ex', 'cm', 'mm', 'in', 'pt', 'pc', 'vw', 'rem', 'ch']);
        };

            /*-----check transitionLength-----*/

        if (options.transitionLength !== undefined) {
            options.transitionLength = checkUnit(options.transitionLength, ['s']);
        };

            /*-------check Target Selector-----*/


        if (options.target !== undefined) {
            if (!options.target instanceof Element) {
                console.log("Error: Target element is no DOM element.");
                options.target = null;
            };
        };

            /*-------check Callback Function-----*/

        if (options.callback !== undefined) {
           if (typeof options.callback !== 'function') {
                console.log("Error: The callback option is no function! Setting empty callback.");
                options.callback = null;
            };
        };

            /*--------Helper Functions-----------*/

        function checkNumber (nr, name) {
            if (parseInt(nr) === NaN) {
                console.log('Error: Option "' + name + '" is not a Number!' );
                return null;
            } else {
                return parseInt(nr);
            }

        }

        function checkRange (nr, name, lowerLim, upperLim) {
            if (parseInt(nr) >= lowerLim && parseInt(nr) <= upperLim ) {
                console.log('Error: Option "percentageNumberSizeScaleFactor" is not within the range ' + lowerLim + ' - ' + upperLim + '!' );
                return false;
            }
            return true;
        }

        function fixCase (string) {
            return string.toLowerCase()
        }

        function checkForTypo (string, target, warning) {
            var i,
                cnt = 0,
                warning;

            if (warning === undefined) {
                warning = true;
            }

            for (i = 0; i < target.length; i++){
                if (string.toLowerCase().indexOf(target[i].toLowerCase()) !== -1){
                    cnt++
                }
            }
            if (cnt / target.length !== 1 && warning) {
                console.log( 'Typo in "' + string + '" - should be "' + target + '". Closeness is ' + cnt / target.length);
            }
            return (cnt / target.length);
        }

        function checkColor (string) {
            var colors = [],
                _tempval = 0,
                _tempindex = 0,
                _tempcnt,
                colorNames = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgrey", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgrey", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];


            if (colorNames.indexOf(string.toLowerCase()) !== -1) {
                return string;
            }

            colorNames.forEach(function (value, index) {
                colors[index]={};
                colors[index].color = value;
                colors[index].number = checkForTypo(string, value, false);

            });

            colors.sort(function(a, b){
                return a.color.length - b.color.length;
            });

            for ( _tempcnt = 0; _tempcnt < colors.length; _tempcnt++ ) {
                if ( colors[_tempcnt].number > _tempval ) {
                    _tempval = colors[_tempcnt].number;
                    _tempindex = _tempcnt;
                }
            };
            if (colors[_tempindex].number >= 0.5 ) {
                return colors[_tempindex].color;
            } else {
                console.log("Error: " + string + " is no valid color.")
                return null;
            }
        }

        function checkTrueFalse (string) {
            if (string||!string) {
                return string;

            } else if (checkForTypo(string, 'true', false) > 0.7) {
                return true;

            } else if (checkForTypo(string, 'false', false) > 0.7) {
                return false;
            }
            console.log('Error: This option is neither "true" nor "false".');
            return null;
        }

        function checkUnit (str, units) {
            var _unit,
                _value,
                checkedUnits=[];

            if (str !== undefined) {
                _unit = String(str).match(/[^0-9.]+/) ? String(str).match(/[^0-9.]+/)[0] : null;
                _value = String(str).substring(0,String(str).indexOf(_unit));
            }

            if (checkNumber(_value) === NaN) {
                console.log('Error: "' + str + '" is no number with unit');
                return null;
            } else {

                if (_unit === null || _unit === undefined) {
                    console.log('Warning, no unit given in string "' + str + '"');
                    return null;
                }

                units.forEach( function (unit, index) {
                    checkedUnits[index] = checkForTypo(_unit, unit, false);
                })

                if ( Math.max(...checkedUnits) >= 0.5 ) {
                    return _value + units[checkedUnits.indexOf(Math.max(...checkedUnits))];
                }

                console.log('Error: "' + str + '" is not parseable. Please set this option in the following way: Number + either of the following units "' + units + '".');
                return null;
            }

        }

    },


    _create: function () {
        var self = this,
            circle = document.createElement('div'),
            dummy = document.createElement('div'),
            circleFill = document.createElement('div');

        circle.className += 'circle';
        dummy.className += 'circleDummy';
        circleFill.className += 'circleFill';
        circleFill.innerHTML = '<svg viewBox="0 0 16 16" class="percentageWrapper"><text x="0" y="13" fill="white"></text></svg>';
        circle.appendChild(circleFill);
        circle.appendChild(dummy);
        self.options.target.appendChild(circle);
        self.bar = circle;
        self.percentageCounter = circleFill.firstChild.firstChild;
        self.percentageWrapper = circleFill.firstChild;
    },

    _destroy: function (self) {

        if (self.options.persistence) {
            self.bar.style.transition = null;
            self.bar.style.opacity = 0;
            self.bar.style.width = self.options.size;
            self.bar.childNodes[1].style.transition = null;
            self.bar.childNodes[1].style.margin = '100%';
            self._setOptions();
            self.options.target.style.cursor = "auto";
            self.bar.removeEventListener("transitionend", self.hDestroy);
            self.options._fadeStatus = 3;

        } else {
            self.options.target.style.cursor = "auto";
            self.bar.remove();
            self.options.callback();
        }
    },

    destroy: function () {
        var self = this;
        self.bar.remove();
        self.options.callback();
    },

    _setOptions: function () {
        var self = this,
            firstChildStyle;

        /*-------Element Settings---------------*/

        self.bar.style.width = self.options.size;

        /*  follow-option: Add eventlistener and hide cursor
            position set: set position      */
        if (self.options.position === 'follow') {
            self.options.target.addEventListener("mousemove", self.mousemoveHandler = function (evt) {
                self._move(evt, self);
            }, false);
            self.options.target.style.cursor = "none";
        } else {
            self.bar.style.top = self.options.position.top;
            self.bar.style.left = self.options.position.left;
            self.options.target.style.cursor = "not-allowed";
        }

            /*  Add Fade Listener     */
        if (self.options.fade) {
            self._fadeOut(self);
            self.options.target.addEventListener('mouseenter', self._fadeIn.bind(null, self));
            self.options.target.addEventListener('mouseleave', self._fadeOut.bind(null, self));
        }
        /*-----------outer circle settings------------*/

        self.bar.style.border = '1px solid black';

        /*-------------innner circle settings-----------*/

        firstChildStyle = self.bar.firstChild.style;
        firstChildStyle.background = self.options.innerCircleBackgroundColor;
        firstChildStyle.width = self.options.innerCircleWidth * 100 + '%';
        firstChildStyle.height = self.options.innerCircleWidth * 100 + '%';
        firstChildStyle.left = (1 - self.options.innerCircleWidth)/2 * 100 + '%';
        firstChildStyle.top = (1 - self.options.innerCircleWidth)/2 * 100 + '%';

        /*--------Percentage Settings------------*/

        self.percentageCounter.style.visibility = self.options.showPercentageNumber ? 'visible' : 'hidden';
        self.percentageSignSize = self.options.showPercentageSign ? 14 : 0;
        self.percentageSign = self.options.showPercentageSign ? '%' : null;
        self.percentageCounter.setAttribute('fill', self.options.percentageNumberColor);

        /*-----------Set Start-Percentage------------*/
        self.setPercentage(self.options.percentage);


    },

        /*Place CircleBar under Cursor*/

    _move: function (evt, self) {

        if (self.options.target.offsetTop < evt.clientY - self.bar.offsetHeight / 2 && self.options.target.offsetTop + self.options.target.offsetHeight > evt.clientY + self.bar.offsetHeight / 2 ) {
            self.bar.style.top = evt.clientY - self.options.target.offsetTop - self.bar.offsetHeight / 2 + 'px';
        }

        if (self.options.target.offsetLeft < evt.clientX - self.bar.offsetWidth / 2 && self.options.target.offsetLeft + self.options.target.offsetWidth > evt.clientX + self.bar.offsetWidth / 2 ) {
            self.bar.style.left = evt.clientX - self.options.target.offsetLeft - self.bar.offsetWidth / 2 + 'px';
        }
    },

    setPercentage: function (percentage) {
        var self = this;


        if (percentage >= 0 && percentage <= 99) {

            if (self.options._fadeStatus === 3) {

                if (self.options.position === 'follow') {
                    self.options.target.style.cursor = "none";
                } else {
                    self.options.target.style.cursor = "not-allowed";
                }

                self.options._fadeStatus = 0;
                self._fadeIn();
            }


            self.percentageWrapper.setAttribute('viewBox', '0 0 '+ ((percentage < 10 ? 8 : 16) + self.percentageSignSize) + ' 16');

            self.percentageCounter.innerHTML = percentage + self.percentageSign;

            self.bar.style.background = 'linear-gradient(' +
                        (percentage > 50 ? '-90' : (percentage * 3.6 - 90)) + 'deg, ' +
                        (percentage > 50 ? self.options.color : self.options.circleBackgroundColor ) +
                        ' 50%, transparent 50%, transparent 100%),linear-gradient(' +
                        (percentage > 50 ? (percentage * 3.6 + 90) : '-90') + 'deg, ' +
                        self.options.color +
                        ' 50%, transparent 50%, transparent 100%),' +
                        self.options.circleBackgroundColor;


        } else if (percentage === 100) {

            self.bar.style.background = self.options.color;
            self.percentageWrapper.setAttribute('viewBox', '0 0 '+ (24 + self.percentageSignSize) + ' 16');
            self.percentageCounter.innerHTML = percentage + self.percentageSign;
            self.bar.addEventListener("transitionend", self.hDestroy = self._destroy.bind(null, self), false);
            window.setTimeout(function () {self._fadeOut()}, 0);
        }

    },

    _fadeOut: function (elem) {
        var self = elem || this;

        if (self.options._fadeStatus === 2) {
            self.options._fadeStatus = 0;

            self.options.target.removeEventListener("mousemove", self.mousemoveHandler);

            self.bar.style.transition = self.options.transitionLength + ' linear';
            self.bar.childNodes[1].style.transition = self.bar.style.transition;
            self.bar.childNodes[1].style.margin = '0%';
            self.bar.style.left = parseInt(self.bar.offsetLeft - self.options.target.offsetLeft) + self.bar.offsetWidth / 2 + 'px';
            self.bar.style.top = parseInt(self.bar.offsetTop - self.options.target.offsetTop) + self.bar.offsetWidth / 2 + 'px';
            self.bar.style.width = '0px';
            self.bar.style.opacity = 0;
        }
    },

    _fadeIn: function (elem) {
        var self = elem||this;
        if (self.options._fadeStatus === 0) {
            self.options._fadeStatus = 1;
            if (self.options.position === 'follow') {
                self.options.target.addEventListener("mousemove", self.mousemoveHandler = function (evt) {
                    self._move(evt, self);
                }, false);

            } else {
                self.bar.style.left = self.options.position.top;
                self.bar.style.top = self.options.position.left;
            }

            self.bar.addEventListener("transitionend", self.hFadeInEnd = self._fadeInEnd.bind(self), false);
            self.bar.style.transition = self.options.transitionLength + ' linear';
            self.bar.childNodes[1].style.transition = self.bar.style.transition;
            self.bar.childNodes[1].style.margin = '100%';
            self.bar.style.width = self.options.size;
            self.bar.style.opacity = 1;
        }
    },

    _fadeInEnd: function () {
        var self = this;
        if (self.options._fadeStatus === 1) {
            self.options._fadeStatus = 2;
            self.bar.removeEventListener("transitionend", self.hFadeInEnd);
            self.bar.style.transition = null;
            self.bar.childNodes[1].style.transition = null;
        }
    },

    smoothPercentage: function (percentage) {
        var self = this;
        self.options.currentPercentage = percentage*3.6;

        if (self.options.currentPercentage > self.options.shownPercentage) {
            self.timer=setInterval(self.setPercentage.bind(null, self), 5);
        }

    },

    errorCheck: function (percentage) {
        var self = this;

        if (self.options.target === null) {
            console.log("Target element not found, please provide an element or leave empty to bind to body.");
            return "Error";
        }

    }
}

document.addEventListener("DOMContentLoaded", function () {
    test = new circleBar;
    testoptions = {};
    testoptions.percentage = 10;
    testoptions.color = 'blue';
    testoptions.circleBackgroundColor = 'gainsboro';
    testoptions.persistence = false;
    testoptions.position = 'follow';
    testoptions.size = '10%';
    testoptions.target = document.querySelector('#main-wrapper');
    testoptions.showPercentageSign = false;
    testoptions.showPercentageNumber = true;
    testoptions.innerCircleBackgroundColor = 'black';
    testoptions.percentageNumberColor = 'white';
    testoptions.callback = function () {
        // test=null;
        // delete test;
        // window.clearInterval(testtimer);
    };
    test.init(testoptions);
});
