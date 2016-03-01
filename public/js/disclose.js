angular.module('freedom2.disclose', ['ngRoute', 'ui.bootstrap', 'ngclipboard', 
				'angularModalService', 'freedom2.disclose.controllers'])
.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/d/', {
		templateUrl: 'partials/disclose/encrypt.html',
		controller: 'disclose.encrypt'
	})
	.when('/d/:message*', {
		templateUrl: 'partials/disclose/decrypt.html',
		controller: 'disclose.decrypt'
	});
}]);

var ctrl = angular.module('freedom2.disclose.controllers', []);

ctrl.controller('disclose.encrypt.modal', ['$scope', '$element', 'close',
function ($scope, $element, close) {
	$scope.encrypt = function(result) {
		if (result) {
			if ($scope.password != $scope.confirm_password) {
				$scope.modal_error = "Passwords do not match!";
				return;
			}
			$element.modal('hide');
		 	return close($scope.password, 500); // close, but give time for bootstrap to animate
		}
	};
}]);

ctrl.controller('disclose.encrypt', ['$scope', '$routeParams', 'config', 'ModalService',
function ($scope, $routeParams, config, ModalService) {
	$scope.complete = false;
	$scope.copy_popover = false;

	$scope.restart = function() {
		$scope.complete = false;
		$scope.copy_popover = false;
		$scope.url = null;
	}

	$scope.copied = function() {
		$scope.copy_popover = true;
	}

	$scope.prepare = function() {
		ModalService.showModal({
			templateUrl: "partials/disclose/encrypt-modal.html",
			controller: "disclose.encrypt.modal"
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(password) {
				var compressed = LZString.compressToUTF16($scope.message);
				var encrypted_message = CryptoJS.AES.encrypt(compressed, password).toString();
				var encoded_url = encodeURIComponent(encrypted_message);
				$scope.url = config.url + 'd/' + encoded_url;
				$scope.complete = true;
				$scope.message = null; // clear from memory
			})
		});
	}
}]);


ctrl.controller('disclose.decrypt.modal', ['$scope', '$element', 'close',
function ($scope, $element, close) {
	$scope.encrypt = function(result) {
		if (result) {
			$element.modal('hide');
		 	return close($scope.password, 500); // close, but give time for bootstrap to animate
		}
	};
}]);

ctrl.controller('disclose.decrypt', ['$scope', '$routeParams', 'config', 'ModalService',
function ($scope, $routeParams, config, ModalService) {
	$scope.complete = false;
	$scope.copy_popover = false;

	$scope.encrypted_message = $routeParams.message;

	function showModal() {
		ModalService.showModal({
			templateUrl: "partials/disclose/decrypt-modal.html",
			controller: "disclose.decrypt.modal"
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(password) {
				var decoded = decodeURIComponent($scope.encrypted_message);
				var decrypted_message = CryptoJS.AES.decrypt(decoded, password).toString(CryptoJS.enc.Utf8);
				var decompressed = LZString.decompressFromUTF16(decrypted_message);
				$scope.complete = true;
				$scope.message = decompressed;

				if (!$scope.message) {
					$scope.error_message = "Incorrect password!";
					return;
				} else {
					$scope.error_message = null;
				}
			})
		});
	}

	$scope.tryAgain = function() {
		showModal();
	}

	showModal();
}]);
