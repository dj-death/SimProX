(function () {
    'use strict';
	

	angular.module('marksimos.websitecomponent').directive('chatWindow', ['$q', function ($q) {
        return {
            restrict: 'E',
            scope: {
                me: '=username',
                seminarMessages: '=',
                companyMessages: '=',
                dictionaryMessages: '=',
                sendSeminarMessage: '&',
                sendCompanyMessage: '&',
                sendDictionaryMessage: '&',
                hideChatHeader: '='
            },
            templateUrl: '/app/partials/website/chatwindow.html',
            link: function(scope, elem, attrs, ctrl) {
                scope.data = {
                    seminarInput: null,
                    companyInput: null,
                    dictionaryInput: null
                };
                scope.css = {
                    currentChatTab: 'seminar',
                    showChat: false,
                    newMessage: false,
                    currentTab: 'chat'
                };

                var chatWindow = elem[0];
                chatWindow.addEventListener('keydown', function(event) {
                    // todo: handle line break?

                    if (event.keyCode != 13 || event.target.tagName.toUpperCase() != 'TEXTAREA' || (!scope.data.seminarInput && !scope.data.companyInput && !scope.data.dictionaryInput) ) return;

                    var target = angular.element(event.target);
                    //var matches = target.matches || target.msMatchesSelector;
                    //matches = matches.bind(target);

                    if (target.hasClass('seminar')) {
                        $q.when(scope.sendSeminarMessage({messageInput: scope.data.seminarInput})).then(function() {
                            scope.data.seminarInput = '';
                        });
                    } else if(target.hasClass('company')) {
                        $q.when(scope.sendCompanyMessage({messageInput: scope.data.companyInput})).then(function() {
                            scope.data.companyInput = '';
                        });
                    } else if(target.hasClass('dictionary')) {
                        $q.when(scope.sendDictionaryMessage({messageInput: scope.data.dictionaryInput})).then(function() {
                            scope.data.dictionaryInput = '';
                        });
                    }
                });

                scope.$watchCollection('seminarMessages', scrollToBottom);
                scope.$watchCollection('companyMessages', scrollToBottom);
                scope.$watchCollection('dictionaryMessages', scrollToBottom);

                function scrollToBottom() {
                    if (scope.seminarMessages.length || (scope.companyMessages && scope.companyMessages.length)) {
                        scope.css.newMessage = true;
                    }

                    scope.$$postDigest(function() {
                        if (!scope.css.showChat) return;
                        var messagesWindow = chatWindow.querySelector('.messages');
                        messagesWindow.scrollTop = messagesWindow.scrollHeight;
                    });
                }

                scope.clickToggleWindow = function(tab) {
                    if (tab) scope.css.currentTab = tab;
                    scope.css.showChat = !scope.css.showChat;
                    scope.css.newMessage = false;
                };
            }
        };
    }]);
		

})();