angular.module("freedom2", ["ngRoute", "ngSanitize", "angularModalService", 
				"freedom2.content", "freedom2.disclose", "freedom2.chat"])
.constant('config', {
	url : location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+'/'
})
.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
	
	$routeProvider
	.when('/', {
		templateUrl: 'partials/index.html',
		controller: 'content.index'
	})
	.when('/donate', {
		templateUrl: 'partials/donate.html',
		controller: 'content.donate'
	});

    $locationProvider.html5Mode(true);
}])
.directive('activeLink', ['$location', function (location) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, controller) {
			var clazz = attrs.activeLink;
			var path = attrs.href;
			path = path.substring(0); //hack because path does not return including hashbang
			scope.location = location;
			scope.$watch('location.path()', function (newPath) {
				newPath = newPath.replace(/\//g, "");
				if (path === newPath) {
					element.addClass(clazz);
				} else {
					element.removeClass(clazz);
				}
			});
		}
	}
}]);

var ctrl = angular.module('freedom2.content', []);

ctrl.controller('content.index', ['$scope',  
function ($scope) {
}]);

ctrl.controller('content.donate', ['$scope',  
function ($scope) {
}]);