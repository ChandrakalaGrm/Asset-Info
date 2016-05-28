angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'firebase'])

.run(function($ionicPlatform, $state) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
		  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		  cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
		  // org.apache.cordova.statusbar required
		  StatusBar.styleDefault();
		}
		
		//
		window.addEventListener('native.keyboardshow', function(){
			document.body.classList.add('keyboard-open');
		});
		
		//ionic.Platform.isFullScreen = true
	});
	
	//Action for android hardware back button.
	$ionicPlatform.registerBackButtonAction(function(){
		var reqState = $state.current.name;
		if(reqState == 'home' || reqState == 'projects'){
			navigator.app.exitApp();
		}else if(reqState == 'newproject' || reqState == 'reports' || reqState == 'forms' || reqState == 'Map'){
			$state.go('projects');
		}else if(reqState == 'previewSavedTemp' || reqState == 'newproj'){
			$state.go('newproject');
		}else{
			navigator.app.backHistory();
		}
	}, 100);
});

//url for AJAX.
var baseUrl = "http://clumsydreams.com/test/ai/android/";
var reqHeadTitle, newProjTitle, savedFormName;
//
//var markerContent;

// //Image upload.
// //
// var target;
// $('#project-form, #saved-form').on('click', '.upload-image-icon', function(){
	// target = $(this);
	// console.log(target);
	// $ionicActionSheet.show({
		 // buttons: [
		   // { text: 'Choose Image' },
		   // { text: 'Take Photo' }
		 // ],
		 // cancelText: 'Cancel',
		 // cancel: function() {
			// // add cancel code..
		 // },
		 // buttonClicked: function(index) {
			// if(index == 0){
				// navigator.camera.getPicture(onSuccess, onError, {
					// quality: 20,
					// sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
					// destinationType: Camera.DestinationType.FILE_URI,
					// targetWidth: 220,
					// tagetHeight: 220
				// });
			// }else {
				// navigator.camera.getPicture(onSuccess, onError, {
					// quality: 100,
					// destinationType: Camera.DestinationType.FILE_URI,
					// targetWidth: 220,
					// targetHeight: 220,
					// saveToPhotoAlbum: true
				// });
			// }
			// return true;
		 // }
	// });
// });

// //
// $('#project-form').on('click', '.remove-image', function(){
	// $(this).parent().hide();
	// $(this).parent().parent().find('.upload-image-icon').show();
	// $(this).parent().find('.image-url').val('');
// });

// //
// function onSuccess(imageURI){
	// console.log(imageURI);
	// $(target).hide();
	// $(target).parent().find('.image-preview').html('<img src="' + imageURI + '" class="uploaded_image" align="center" />');
	// $(target).parent().find('.uploaded-image').show();
	// $(target).parent().find('.image-url').val(imageURI);
// }

// //
// function onError(error){
	// console.log(error);
// }


//function to show hide required menu based on user type.
function aboutLogin(obj){
	if(obj.user_type == "2"){
		document.getElementById('trace-loc').style.display = 'none';
	}else if(obj.user_type == '0'){
		document.getElementById('trace-loc').style.display = 'none';
		document.getElementById('map-btn').style.display = 'none';
	}else{
		document.getElementById('map-btn').style.display = 'block';
		document.getElementById('trace-loc').style.display = 'block';
	}
}