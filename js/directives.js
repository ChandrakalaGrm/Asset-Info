angular.module('app.directives', [])

.directive('compareTo', [function(){
	return {
		require: 'ngModel',
		scope: {
			otherModelValue: "=compareTo"
		},
		link: function(scope, element, attrs, ngModel){
			ngModel.$validators.compareTo = function(modelValue) {
				return modelValue == scope.otherModelValue;
			};
			
			scope.$watch("otherModelValue", function(){
				ngModel.$validate();
			});
		}
	};
}])
.directive('sigPad', ['$parse', function($parse){
	return{
		restrict: 'C',
		link: function(scope, element, attrs){
			var api = $(element).signaturePad({drawOnly: true, lineTop: 200, penColour: '#145394', onDrawEnd: function(){
					scope.$apply(function(){
						$parse($(element).find('.sig-val').attr('ng-model')).assign(scope, JSON.stringify(api.getSignature()));
					});
				}
			});
			
			//
			$(element).find('a').bind('click', function(){
				scope.$apply(function(){
					$parse($(element).find('.sig-val').attr('ng-model')).assign(scope, '');
				});
			});
		}
	}
}])
.directive('uploadImages', function($ionicActionSheet, $parse){
	return{
		restrict: 'C',
		link: function(scope, element, attrs){
			var target;
			$(element).find('.upload-image-icon').bind('click', function(){
				target = $(this);
				$ionicActionSheet.show({
					 buttons: [
					   { text: 'Choose Image' },
					   { text: 'Take Photo' }
					 ],
					 cancelText: 'Cancel',
					 cancel: function() {
						// add cancel code..
					 },
					 buttonClicked: function(index) {
						if(index == 0){
							navigator.camera.getPicture(onSuccess, onError, {
								quality: 20,
								sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
								destinationType: Camera.DestinationType.FILE_URI,
								targetWidth: 220,
								tagetHeight: 220
							});
						}else {
							navigator.camera.getPicture(onSuccess, onError, {
								quality: 100,
								destinationType: Camera.DestinationType.FILE_URI,
								targetWidth: 220,
								targetHeight: 220,
								saveToPhotoAlbum: true
							});
						}
						return true;
					 }
				});
			});
			
			$(element).find('.remove-image').bind('click', function(){
				$(this).parent().hide();
				$(this).parent().parent().find('.upload-image-icon').show();
				//$(this).parent().find('.image-url').val('');
				scope.$apply(function(){
					$parse($(this).parent().find('.image-url').attr('ng-model')).assign(scope, '');
				});
			});
			
			function onSuccess(imageURI){
				console.log(imageURI);
				$(target).hide();
				$(target).parent().find('.image-preview').html('<img src="' + imageURI + '" class="uploaded_image" align="center" />');
				$(target).parent().find('.uploaded-image').show();
				// $(target).parent().find('.image-url').val(imageURI);
				scope.$apply(function(){
					$parse($(target).parent().find('.image-url').attr('ng-model')).assign(scope, imageURI);
				});
			}
			
			//
			function onError(error){
				console.log(error);
			}
		}
	}
})
.directive('contAsGuest', function($state){
	return{
		restrict: 'C',
		link: function(scope, element, attrs){
			element.bind('click', function(){
				document.getElementById('map-btn').style.display = 'none';
				document.getElementById('trace-loc').style.display = 'none';
				document.getElementById('settings').style.display = 'none';
				document.getElementById('logout').style.display = 'none';
				$state.go('projects');
			});
		}
	}
});