angular.module('freedom2.chat', ['ngRoute', 'angularModalService', 'angularLoad',
				'freedom2.chat.controllers'])
.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/c/', {
		templateUrl: 'partials/chat/index.html',
		controller: 'chat.home'
	})
	.when('/c/:room*', {
		templateUrl: 'partials/chat/index.html',
		controller: 'chat.home'
	});
}]);


function generateRoomName() {
	var pick = function(str, min, max) {
	    var n, chars = '';

	    if (typeof max === 'undefined') {
	        n = min;
	    } else {
	        n = min + Math.floor(Math.random() * (max - min));
	    }

	    for (var i = 0; i < n; i++) {
	        chars += str.charAt(Math.floor(Math.random() * str.length));
	    }

	    return chars;
	};

	var shuffle = function(str) {
	    var array = str.split('');
	    var tmp, current, top = array.length;

	    if (top) while (--top) {
	        current = Math.floor(Math.random() * (top + 1));
	        tmp = array[current];
	        array[current] = array[top];
	        array[top] = tmp;
	    }

	    return array.join('');
	};

	var lowercase = 'abcdefghijklmnopqrstuvwxyz';
	var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var numbers = '0123456789';

	var all = lowercase + uppercase + numbers;

	var password = '';
	password += pick(lowercase, 5);
	password += pick(uppercase, 5);
	password += pick(all, 8, 10);
	password = shuffle(password);
	return password;
}

var ctrl = angular.module('freedom2.chat.controllers', []);

ctrl.controller('chat.join.modal', ['$scope', '$routeParams', '$element', 'close',
function ($scope, $routeParams, $element, close) {

	$scope.room = $routeParams.room;

	$scope.newRoom = function() {
		$scope.room = generateRoomName();
	}

	$scope.join = function(result) {
		if (result) {
			if (!$scope.room) {
				$scope.modal_error = "You must enter a room name!";
				return;
			}
			$element.modal('hide');
		 	return close({
		 		room: $scope.room,
		 		password: $scope.password
		 	}, 500); // close, but give time for bootstrap to animate
		}
	};
}]);


ctrl.controller('chat.home', ['$scope', '$routeParams', 'config', 'angularLoad', 'ModalService', '$window', '$document',
function ($scope, $routeParams, config, angularLoad, ModalService, $window, $document) {
	$scope.chatlog = [];
	var rtc = null;
	var password = null;

	$scope.sendMessage = function() {
		var status = 'sent';
		if (!rtc.sendMessage(CryptoJS.AES.encrypt($scope.messageText, password).toString())) {
			status = 'failed';
		}

		$scope.chatlog.push({
			sender : "Me",
			text: $scope.messageText,
			date_sent: new Date(),
			status: status
		});

		if (status == 'failed') {
			$scope.chatlog.push({
				text: "Unable to send message. There may not be any other participants yet.",
				date_sent: new Date()
			});
		}

		$scope.messageText = "";
		setTimeout(function() {
			$window.scrollTo(0, $document[0].body.scrollHeight);
		}, 1);
	}

	function apply() {
		console.log("APPLYING");
		console.log($scope.chatlog);
		setTimeout(function() { $scope.$apply(); } , 100);
	}

	ModalService.showModal({
		templateUrl: "partials/chat/join-modal.html",
		controller: "chat.join.modal"
	}).then(function(modal) {
		modal.element.modal();
		modal.close.then(function(credentials) {
			password = credentials.password;

			$scope.chatlog.push({
				text: "Joining room <a href='" + config.url + 
						+ credentials.room + "'>" + credentials.room + "</a>",
				date_sent: new Date()
			});

			angularLoad.loadScript('https://cdn.firebase.com/v0/firebase.js').then(function() {
				angularLoad.loadScript('/js/webrtc.js').then(function() {
					rtc = new WebRTC(credentials.room, credentials.password, function(event) {
						var packet = JSON.parse(event.data);

						if (packet.command) {
							$scope.chatlog.push({
								text : packet.text + " has joined the room.",
								date_sent: new Date()
							});
							 $scope.$apply();
							 return;
						}
						packet.text = CryptoJS.AES.decrypt(packet.text, password).toString(CryptoJS.enc.Utf8);
						if (!packet.text) {
							//@todo - send sytem notification
							$scope.chatlog.push({
								text : "Unable to decrypt message from " + packet.sender + ". " 
										+ "They may have typed in the wrong password for this room.",
								date_sent: new Date()
							});
						} else {
							$scope.chatlog.push(packet);
						}
						 $scope.$apply();
					});
					credentials = null;
				});
			})
		})
	});

}]);
