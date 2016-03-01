angular.module('freedom2.chat', ['ngRoute', 'angularModalService', 
				'freedom2.chat.controllers'])
.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/d/{room:.*}', {
		templateUrl: 'partials/chat/index.html',
		controller: 'chat.home'
	});
}]);

var ctrl = angular.module('freedom2.chat.controllers', []);

ctrl.controller('chat.home', ['$scope', 'ModalService',
function ($scope, ModalService) {
}]);
