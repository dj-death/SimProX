(function () {
    'use strict';
	


        
        
    angular.module('marksimos.websitecomponent').directive('appVersion', ['version',
        function(version) {
            return function(scope, elm, attrs) {
                elm.text(version);
            };
        }
    ]);

    angular.module('marksimos.websitecomponent').directive('btnLoading', function() {
        return {
            link: function(scope, element, attrs) {
                scope.$watch(
                    function() {
                        return scope.$eval(attrs.btnLoading);
                    },
                    function(value) {
                        //console.log('directive, btnLoading:' + value);
                        if (value) {
                            if (!attrs.hasOwnProperty('ngDisabled')) {
                                element.addClass('disabled').attr('disabled', 'disabled');
                            }
                            element.data('resetText', element.html());
                            element.html(element.data('loading-text'));
                        } else {
                            if (!attrs.hasOwnProperty('ngDisabled')) {
                                element.removeClass('disabled').removeAttr('disabled');
                            }
                            element.html(element.data('resetText'));
                        }
                    }
                );
            }
        };
    });

    angular.module('marksimos.websitecomponent').directive('loadEnd', function() {
        return function(scope, elm, attrs) {
            pageloader = document.getElementById('pageloader');
            pageloader.style.display = "none";
        }
    });


    angular.module('marksimos.websitecomponent').directive('activeNav', ['$location',
        function(location) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var nestedA = element.find('a')[0];
                    var path = nestedA.href;
                    scope.location = location;
                    scope.$watch('location.absUrl()', function(newPath) {
                        if (path === newPath) {
                            element.addClass('active');
                        } else {
                            element.removeClass('active');
                        }
                    });
                }
            };
        }
    ]);

    angular.module('marksimos.websitecomponent').directive('navBootstrap', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $('.bs-sidenav li').click(function() {
                    $(".bs-sidenav li").removeClass("active");
                    $(this).addClass('active');
                    //$(this).firstChild.addClass('active');
                });
                $('.second-sidenav li').click(function() {
                    $('.second-sidenav li').removeClass("active");
                    $(".bs-sidenav li").removeClass("active");
                    $($($(this).parent()).parent()).addClass("active");
                    $(this).addClass('active');
                })
            }

        }
    });

    angular.module('marksimos.websitecomponent').directive('angularBootstrap', function() {
        return function(scope, elm, attrs) {
            $(".bs-docs-sidenav>li>a").click(function() {
                $(".bs-docs-sidenav li").removeClass("active");
                $(this).parent().addClass("active");
                if ($($($(this).parent()).children()[1]).children()[0] != undefined) {
                    $($($($(this).parent()).children()[1]).children()[0]).addClass('active');
                }
            });
            $(".second-sidenav>li>a").click(function() {
                $(".second-sidenav li").removeClass("active");
                $(this).parent().addClass("active");
            });
        }
    });
    
    angular.module('marksimos.websitecomponent').directive('angularWizard', function() {
        return function(scope, elm, attrs) {
            $(".steps-indicator>li>a").click(function() {
                $(".steps-indicator li").removeClass("editing");
                $(this).parent().addClass("editing");
            });
        }
    });


    angular.module('marksimos.websitecomponent').directive('accessLevel', ['$rootScope', 'Auth',
        function($rootScope, Auth) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var prevDisp = element.css('display');
                    $rootScope.$watch('user.role', function(role) {
                        if (!Auth.authorize(attrs.accessLevel)) {
                            element.css('display', 'none');
                        } else {
                            element.css('display', prevDisp);
                        }
                    });
                }
            };
        }
    ]);

    angular.module('marksimos.websitecomponent').directive('jqxTree', function() {
        return function(scope, elm, attrs) {
            $('.listTree').listTree(scope.tree, {
                "startCollapsed": true
            });
            scope.$watch(attrs.ngModel, function(v) {
                $('.listTree').listTree('update', scope.tree, {
                    "startCollapsed": true
                });
                $(document).on('click', '.jqx-btn-success', function(e) {
                    $('.listTree').listTree('selectAll');
                }).on('click', '.jqx-btn-danger', function(e) {
                    $('.listTree').listTree('deselectAll');
                }).on('click', '.jqx-btn-primary', function(e) {
                    var data = "?period=" + scope.period + "&cat=" + scope.cat + "&market=" + scope.market + "&language=" + scope.language + "&data=" + JSON.stringify($('.listTree').data('listTree').selected);
                    scope.params = data;
                });
            })
        }
    });


    angular.module('marksimos.websitecomponent').directive('scrollSpy', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, elem, attr) {
                var offset = parseInt(attr.scrollOffset, 10)
                if (!offset) offset = 10;
                console.log("offset:  " + offset);
                $(elem).scrollspy({
                    "offset": offset
                });
                scope.$watch(attr.scrollSpy, function(value) {
                    $timeout(function() {
                        $(elem).scrollspy('refresh', {
                            "offset": offset
                        })
                    }, 1);
                }, true);
            }
        }
    });

    angular.module('marksimos.websitecomponent').directive('preventDefault', function() {
        return function(scope, element, attrs) {
            jQuery(element).click(function(event) {
                event.preventDefault();
            });
        }
    });

    angular.module('marksimos.websitecomponent').directive('scrollTo', ["$window",
        function($window) {
            return {
                restrict: "AC",
                compile: function() {

                    function scrollInto(elementId) {
                        if (!elementId) $window.scrollTo(0, 0);
                        //check if an element can be found with id attribute
                        var el = document.getElementById(elementId);
                        if (el) el.scrollIntoView();
                    }

                    return function(scope, element, attr) {
                        element.bind("click", function(event) {
                            scrollInto(attr.scrollTo);
                        });
                    };
                }
            };
        }
    ]);

    angular.module('marksimos.websitecomponent').directive('affix', ['$window', '$document', '$parse',
        function($window, $document, $parse) {
            return {
                scope: {
                    affix: '@'
                },
                link: function(scope, element, attrs) {
                    var win = angular.element($window),
                        affixed;

                    // Obviously, whenever a scroll occurs, we need to check and possibly 
                    // adjust the position of the affixed element.
                    win.bind('scroll', checkPosition);

                    // Less obviously, when a link is clicked (in theory changing the current
                    // scroll position), we need to check and possibly adjsut the position. We,
                    // however, can't do this instantly as the page may not be in the right
                    // position yet.
                    win.bind('click', function() {
                        setTimeout(checkPosition, 1);
                    });

                    function checkPosition() {
                        var offset = $parse(scope.affix)(scope);
                        var affix = win.prop('pageYOffset') <= offset ? 'top' : false;
                        if (affixed === affix) return;

                        affixed = affix;

                        element.removeClass('affix affix-top').addClass('affix' + (affix ? '-' + affix : ''));
                    }
                }
            };
        }
    ]);

    angular.module('marksimos.websitecomponent').directive('scrollBind',function(){
        return function(scope,elem,attrs){
            $($(elem).find('.firstTbody')).scroll(function(){
                $($(elem).find('.secondTbody')).scrollTop($($(elem).find('.firstTbody')).scrollTop());
            });
            $($(elem).find('.secondTbody')).scroll(function(){
                $($(elem).find('.firstTbody')).scrollTop($($(elem).find('.secondTbody')).scrollTop());
            });
            $($(elem).find('.thirdTbody')).scroll(function(){
                $($(elem).find('.fourthTbody')).scrollTop($($(elem).find('.thirdTbody')).scrollTop());
            });
            $($(elem).find('.fourthTbody')).scroll(function(){
                $($(elem).find('.thirdTbody')).scrollTop($($(elem).find('.fourthTbody')).scrollTop());
            });
        }
    });
	
	angular.module('marksimos.websitecomponent').directive('genParseMd', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
        function (mdParse, sanitize, pretty, isVisible, $timeout) {
            // <div gen-parse-md="document"></div>
            // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
            return function (scope, element, attr) {
                scope.$watch(attr.genParseMd, function (value) {
                    if (isVisible(element)) {
                        parseDoc(value);
                    } else {
                        $timeout(function () {
                            parseDoc(value);
                        }, 500);
                    }
                });

                function parseDoc(value) {
                    if (angular.isDefined(value)) {
                        value = mdParse(value);
                        value = sanitize(value);
                        element.html(value);
                        angular.forEach(element.find('code'), function (value) {
                            value = angular.element(value);
                            if (!value.parent().is('pre')) {
                                value.addClass('prettyline');
                            }
                        });
                        element.find('pre').addClass('prettyprint'); // linenums have bug!
                        element.find('a').attr('target', function () {
                            if (this.host !== location.host) {
                                return '_blank';
                            }
                        });
                        pretty();
                    }
                }
            };
        }
    ]);
	
	angular.module('marksimos.websitecomponent').directive('mutiSelect', ['$window', '$translate', '$filter', function ($window, $translate, $filter){
        return {
            scope: {
                selectstyle : '=',
                show        : '=',
                datasource  : '=',
                selectclick : '&',
                close : '&',
                ngModel : '=',
                selectfitler : '@'
            },
            restrict: 'AE',
            templateUrl: '/app/partials/websitecomponent/mutiselect.html',
            link: function (scope, element, attrs) {

                scope.selectLevel2 = function (level2) {
                    scope.selectclick({current:level2});
                    scope.ngModel = level2.id;
                };

            }
        };
    }]);
	
	
	angular.module('marksimos.websitecomponent').directive('highlightKey', function () {        
        return {
            scope: {
                key:'=highlightKey'
            }, 
            restrict: 'AE',
            compile: function (tElement, tAttrs) {
                return function (scope, tElement, tAttrs) {                  
                    scope.$watch(tAttrs, function (newValue, oldValue) {
                        if (scope.key) {
                            var keys = angular.isArray(scope.key) ? scope.key.slice() : [scope.key];
                            keys.forEach(function(key, i) {
                                // use [] to escape some meta chars, like '+!' .
                                keys[i] = '[' + key.split('').join('][') + ']';
                            });
                            keys = keys.join('|');
                            var re = new RegExp(keys, "ig");
                            replace(tElement[0], re);
                        }
                    });
                };

                function replace(node, re) {
                    var childNodes = node.childNodes,
                        textNodes = [],
                        elements = [];

                    for (var i = 0; i < childNodes.length; i++) {
                        var childNode = childNodes[i];
                        if (childNode.nodeType == 3) {
                            textNodes.push(childNode);
                        } else if (childNode.nodeType == 1) {
                            elements.push(childNode);
                        }
                    }

                    for (i = 0; i < textNodes.length; i++) {
                        var html = textNodes[i].nodeValue.replace(re, function(match) {
                            return "<span class='text-danger'>" + match + "</span>";
                        });
                        if (html != textNodes[i].nodeValue) {
                            var div = document.createElement('div');
                            div.innerHTML = html;
                            node.replaceChild(div, textNodes[i]);
                            div.outerHTML = div.innerHTML;
                        }
                    }

                    for (i = 0; i < elements; i++) replace(elements[i], re);
                }
            }
        };
    });
	

	angular.module('marksimos.websitecomponent').directive('circleProgressBar', ['$compile', function($compile) {
        // http://spencermortensen.com/articles/bezier-circle/
        var factor = 0.5519;

        var xmlns = 'http://www.w3.org/2000/svg';

        /**
         *  To fill a target square(L * L) with the circle, confirm the constraint: L = 2r + s.
         *  Ex.: Given 200 * 200 svg, stroke width is 10, then r = (L - s)/2 = 95, and cx(cy) = 100,
         *  so call getCirclePath(100, 100, 95)
         */
        function getCirclePath(cx, cy, r) {
            var d = factor * r;
            return  'M' + point(cx, cy - r) +
                ' c' + [
                    // top
                    point(d, 0),
                    // right
                    point(r, r - d),
                    point(r, r)
                ].join(', ') +
                ' c' + [
                    point(0, d),
                    // bottom
                    point(d - r, r),
                    point(-r, r)
                ].join(', ') +
                ' c' + [
                    point(-d, 0),
                    // left
                    point(-r, d - r),
                    point(-r, -r)
                ].join(', ') +
                ' c' + [
                    point(0, -d),
                    // top
                    point(r - d, -r),
                    point(r, -r)
                ].join(', ') + 'Z';
        }

        function point(x, y) {
            return x + ' ' + y;
        }

        return {
            scope: {
                progress: '=',
                cx: '@',
                cy: '@',
                r: '@',
                strokeWidth: '@'
            },
            restrict: 'E',
            link: function(scope, elem) {
                var cx = +scope.cx,
                    cy = +scope.cy,
                    r = +scope.r,
                    w = +scope.strokeWidth,
                    perimeter = 2 * Math.PI * r; //todo: may be should use path.getTotalLength to replace it.

                if (!isFinite(cx + cy + r + w)) throw Error('cx, cy, r and stroke-width should be number');

                var svg = document.createElementNS(xmlns, 'svg'),
                    path = document.createElementNS(xmlns, 'path'),
                    width = 2 * r + w,
                    d = getCirclePath(cx, cy, r);

                svg.setAttribute('width', width);
                svg.setAttribute('height', width);

                path.setAttribute('d', getCirclePath(cx, cy, r));
                path.setAttribute('stroke-width', w);
                path.setAttribute('stroke-dasharray', perimeter);
                path.setAttribute('stroke-dashoffset', '{{(1 - progress) * ' + perimeter + '}}');
                path.setAttribute('fill', 'transparent');

                svg.appendChild(path);
                elem.append(svg);

                $compile(svg)(scope);
            }
        };
    }]);

})();