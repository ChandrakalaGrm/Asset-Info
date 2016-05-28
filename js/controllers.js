angular.module('app.controllers', [])

//Controller for index.html
.controller("mainCtrl", function($scope, $http, $state){
	document.getElementById('side-menu21').style.display = 'block';
	//scope variable to get data from fire bas.
	$scope.ref = new Firebase('https://mapapp-527ac.firebaseio.com/mapDetails');
	
	//Get user location enable status from local storage.
	$scope.location = localStorage.getItem('ai_trace_location') == 'true' ? true : false;
	

	//function to set the trace location status in local storage.
	var watchId = '';
	$scope.locationStatus = function(loc){
		//Get user detials from local storage.
		var userDetails = JSON.parse(localStorage.getItem('ai_forms_user_details'));
		var mngrMailId = userDetails['manager_email'].replace(/\./g, '*');
		console.info(mngrMailId);
		
		//Get user id from local storage.
		if(loc == true){
			//Watch the employee location.
			watchId = navigator.geolocation.watchPosition(function(position){
				console.log(position.coords.latitude, position.coords.longitude);
				$scope.ref.child('/'+mngrMailId+'/'+userDetails['user_id']).set({latitude: position.coords.latitude, longitude: position.coords.longitude, username: userDetails['first_name']+userDetails['last_name']});
				localStorage.setItem('ai_trace_location', loc);
			}, function(error){
				console.error(error);
			});
			console.log(watchId);
		}else {
			//Clear watch.
			navigator.geolocation.clearWatch(watchId);
			watchId = '';
			$scope.ref.child('/'+mngrMailId+'/'+userDetails['user_id']).set({latitude: '', longitude: ''});
			localStorage.setItem('ai_trace_location', loc);
		}
	};
	
	//Logout.
	$scope.logout = function(){
		for(key in localStorage){
			if(key.indexOf('ai') >= 0){
				localStorage.removeItem(key);
			}
		}
		//Displaying required menu when user logout.
		document.getElementById('map-btn').style.display = 'block';
		document.getElementById('trace-loc').style.display = 'block';
		document.getElementById('settings').style.display = 'block';
		document.getElementById('logout').style.display = 'block';
		
		$state.go('assetInfo');
	}
})
.controller('assetInfoCtrl', function($scope){
	
})
.controller('signuptypesCtrl', function($scope, showHideFields) {
	//Functions to set user type to to display the required signup form.
	
	$scope.hideManagerCompanyFields = function(){
		showHideFields.setHideShow([false, false, 0]);
	};
	
	$scope.showMangerCompanyFields = function(){
		showHideFields.setHideShow([true, true, 1]);
	};
	
	$scope.showCompanyField = function(){
		showHideFields.setHideShow([false, true, 2]);
	};
	
})
.controller('signupCtrl', function($scope, $http, showHideFields, $state) {
	$scope.$on("$ionicView.beforeEnter", function(){
		//User signup detials objects.
		$scope.user = { firstName: '', lastName: '', email: '',	pwd: '', userType: '', managerEmail: '', companyName: '' };
		$scope.hideShowValues = showHideFields.getHideShow();
		
		//scope variable to show the message when signup fail.
		$scope.errorMessage = true;
	});

	//AJAX for signup form.
	$scope.signup = function(form){
		$scope.errorMessage = true;
		if(form.$valid){
			$http.post(baseUrl+"signup/add_member", {firstname: $scope.user.firstName, lastname: $scope.user.lastName, email: $scope.user.email, password: $scope.user.pwd, user_type: $scope.hideShowValues[2], manager_email: $scope.user.managerEmail, company_name: $scope.user.companyName}).then(function(response){
				if(response.data.error == ''){
					console.info(response.data);
					$scope.errorMessage = true;
					$state.go('login');
				}else {
					$scope.errorMessage = false;
					$scope.errorInfo = response.data.error;
				}
			}, function(error){
				console.error(error);
			});
		}
	};
})
.controller('loginCtrl', function($scope, $http, $state) {
	
	$scope.$on('$ionicView.beforeEnter', function(){
		//User login details object.
		$scope.user = {email: '', pwd: ''};
		
		//Show hide error message details to user.
		$scope.loginResponse = true;
	});
	
	//AJAX to send user login detials.
	$scope.login = function(form){
		$scope.loginResponse = true;
		if(form.$valid){
			$http.post(baseUrl+"login/validate",{username: $scope.user.email, password:$scope.user.pwd}).then(function(response){
				console.log(response.data);
				if(response.data.error == ''){
					//Set the user details in local storage.
					localStorage.setItem('ai_forms_user_details', JSON.stringify(response.data));
					$state.go('projects');
				}else {
					$scope.loginError = response.data.error;
					$scope.loginResponse = false;
				}
			}, function(error){
				console.error(error);
			});
		}
	};
})
.controller('projectsCtrl', function($scope, formDetails, $state, $ionicPopup) {
	//Toggle search-bar in header-bar.
	$scope.toggleSearch = function(){
		$scope.hide = $scope.hide === false ? true: false;
	};
	
	//Projects controller viewbefore enter. 
	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.searchProjects = '';
		$scope.hide = true;
		$scope.savedForms = [];
		//Pushing projects details into savedFroms to display projects in projects templates.
		for(i=0;i<localStorage.length;i++){
			var reqLocalStorageKey = localStorage.key(i);
			if(reqLocalStorageKey.indexOf('ai_project_') >= 0){
				var reqFormTitleObj = JSON.parse(localStorage.getItem(reqLocalStorageKey));
				reqFormTitleObj.projectName = reqLocalStorageKey;
				$scope.savedForms.push(reqFormTitleObj);
			}
		}
	});
	
	//
	$scope.userDetails = JSON.parse(localStorage.getItem('ai_forms_user_details'));
	console.log($scope.userDetails);
	if($scope.userDetails){
		aboutLogin($scope.userDetails);
	}
	
	//Set project details to services to get project details in other controllers.
	$scope.showForms = function(val1, val2, formObj, $event){
		console.log(formObj);
		if(formObj != undefined && $event != undefined){
			newProjTitle = $event.target.innerHTML;
			newProjTitle = newProjTitle.substring(0, newProjTitle.indexOf('<b'));
			formDetails.setVal(val1, val2, formObj);
		}else{
			newProjTitle = 'New Project';
			formDetails.setVal(val1, val2, {});
		}
		
		$state.go('newproject');
	};
	
	//Function to remove project form Projects list.
	$scope.removeProject = function(mainObj, savedForm, ind){
		//Ionic popover to confirm saved project delete.
		$ionicPopup.confirm({template:"Are you sure to delete "+ '<span class="proj-name">'+savedForm['siteAddress']+'</span>'}).then(function(res){
			if(res){
				mainObj.splice(ind, 1);
				localStorage.removeItem(savedForm['projectName']);
			}else{
				console.info("Cancelled.");
			}
		});
	};
})
.controller('mapCtrl', function($scope, formDetails, $timeout, $compile, $state){
	//Toggle search-bar in header-bar.
	$scope.toggleSearch = function(){
		$scope.hide = $scope.hide === false ? true: false;
	};
	
	//view before enter to empty searched values.
	$scope.$on('ioniView.beforeEnter', function(){
		$scope.searchMarkers = '';
	});
	//Reports controller view before enter.
	$scope.$on('$ionicView.enter', function(){
		$scope.hide = true;
		$scope.sites = [];
		$scope.latLng = {};
		
		//Pushing projects details into savedFroms to display projects in projects templates.
		for(i=0;i<localStorage.length;i++){
			var reqLocalStorageKey = localStorage.key(i);
			if(reqLocalStorageKey.indexOf('ai_project_') >= 0){
				var reqFormTitleObj = JSON.parse(localStorage.getItem(reqLocalStorageKey));
				reqFormTitleObj.projectName = reqLocalStorageKey;
				$scope.sites.push(reqFormTitleObj);
			}
		}

		//google maps geocoder.
		$scope.geocoder = new google.maps.Geocoder();
		//Map declaration.
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 51.5081, lng: 0.0759},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		
		//
		$scope.markers = {};
		$scope.markers.projects = [];
		angular.forEach($scope.sites, function(value){
			var address = value.siteAddress;
			genMark(address);
		});
	});
	
	//Display the employees markers on the map only to the manager.
	if(JSON.parse(localStorage.getItem('ai_forms_user_details'))['user_type'] === '2'){
		var myMail = JSON.parse(localStorage.getItem('ai_forms_user_details'))['email'].replace(/\./g, '*');
		console.log(myMail);
		$scope.usersList = {};
		$timeout(function(){
			$scope.ref.child('/'+myMail).on('value', function(datasnapshot){
				datasnapshot.forEach(function(childsnapshot){
					//get key value from datasnapshot with key() function
					$scope.userIdKey = childsnapshot.key();
					//get value from datasnapshot with val() function
					$scope.userLocaionDetails = childsnapshot.val();
					if($scope.usersList[$scope.userIdKey] != undefined){
						if($scope.userLocaionDetails.latitude != ''){
							if($scope.userLocaionDetails.latitude != $scope.usersList[$scope.userIdKey]['latlng'].latitude || $scope.userLocaionDetails.longitude != $scope.usersList[$scope.userIdKey]['latlng'].longitude){
								var reqlatlng = new google.maps.LatLng($scope.userLocaionDetails.latitude, $scope.userLocaionDetails.longitude);
								$scope.usersList[$scope.userIdKey]['marker'].setPosition(reqlatlng);
								$scope.usersList[$scope.userIdKey]['latlng'] = {latitude: $scope.userLocaionDetails.latitude, longitude: $scope.userLocaionDetails.longitude};
							}
						}else {
							$scope.usersList[$scope.userIdKey]['marker'].setMap(null);
							delete $scope.usersList[$scope.userIdKey];
						}
					}else {
						if($scope.userLocaionDetails.latitude != ''){
							var marker = new google.maps.Marker({
								map: $scope.map,
								position: {lat: $scope.userLocaionDetails.latitude, lng: $scope.userLocaionDetails.longitude}
							});

							var infoWindow = new google.maps.InfoWindow({
								content: $scope.userLocaionDetails.username
							});

							marker.addListener('click', function(){
								infoWindow.open($scope.map, marker);
							});
							$scope.usersList[$scope.userIdKey] = {latlng: {latitude: $scope.userLocaionDetails.latitude, longitude: $scope.userLocaionDetails.longitude}, marker: marker};
						}
					}
				});
			});
		}, 2000);
	}

	//filtering markers thourgh search bar.
	$scope.changeMarkers = function(mark){
		for(i=0;i<$scope.markers.projects.length;i++){
			$scope.markers.projects[i].setMap(null);
		}
		$scope.markers.projects = [];
		
		var regExp = new RegExp($scope.searchMarkers, 'gim'), m;
		if($scope.searchMarkers != ''){
			angular.forEach($scope.sites, function(value){
				while(m = regExp.exec(value.siteAddress)){
					var address = m['input'];
					genMark(address);
					return;	//break
				}
			});
		}else {
			angular.forEach($scope.sites, function(value){
				var address = value.siteAddress;
				genMark(address);
			});
		}
		console.log($scope.sites);
	};
	
	//Go to sub-forms page when click on marker info window.
	$scope.toSubForms = function(event){
		var reqSubformDetails = formDetails.getVal();
		newProjTitle = event.target.innerHTML;
		if(reqSubformDetails.length > 0){
			subformsList(reqSubformDetails[2]);
		}else{
			subformsList($scope.sites);
		}
		$state.go('newproject');
	};
	
	//Sending sub forms list to subforms controller.
	function subformsList(formval){
		angular.forEach(formval, function(value){
			if(value.siteAddress == event.target.innerHTML){
				formDetails.setVal(false, true, value);
			}
		});
	}
	
	////Generate Markers
	function genMark(address){
		$scope.geocoder.geocode({address: address}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				//$scope.map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: $scope.map,
					position: results[0].geometry.location
				});
				var markerContent = $compile('<a ng-click="toSubForms($event)">'+address+'</a>')($scope);
				
				var infoWindow = new google.maps.InfoWindow({
					content: markerContent[0]
				});
				marker.addListener('click', function(){
					infoWindow.open($scope.map, marker);
				});

				$scope.markers.projects.push(marker);
			}else{
				console.error(status);
			}
		});
	}
})
.controller('reportsCtrl', function($scope) {
	//Toggle search-bar in header-bar.
	$scope.toggleSearch = function(){
		$scope.hide = $scope.hide === false ? true: false;
	};
	
	//Reports controller view before enter.
	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.hide = true;
	});
	
})
.controller('formsCtrl', function($scope) {
	//Toggle search-bar in header-bar.
	$scope.toggleSearch = function(){
		$scope.hide = $scope.hide === false ? true: false;
	};
	
	//Ionic view before enter for forms controller.
	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.hide = true;
	});
})
.controller('newprojectCtrl', function($scope, $ionicModal, $http, $timeout, $ionicScrollDelegate, $timeout, $ionicActionSheet, formDetails, $state, displayForms, $ionicNavBarDelegate, $ionicPopup){
	//Toggle search-bar in header-bar.
	$scope.toggleSearch = function(){
		$scope.hide = $scope.hide === false ? true: false;
	};
	
	//$scope.addFormButton = true;
	$scope.newProjDet = {};
	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.searchForm = '';
		$scope.hide = true;
		$scope.newProjTitle = newProjTitle;
		$scope.toggleSections = angular.copy(formDetails.getVal());
		$scope.displaySection = $scope.toggleSections[0];
		$scope.displaySavedForms = $scope.toggleSections[1];
		var reqFormObj = $scope.toggleSections[2];
		$scope.reqSubForms = [];
		for(key in reqFormObj){
			if(key.indexOf('form') >= 0){
				reqFormObj[key]['formDetails'].reqFormKey = key;
				$scope.reqSubForms.push(reqFormObj[key]);
				// // reqFormObj['formName'] = key;
				// // $scope.reqSubForms[key] = reqFormObj[key];
			}
		}
		console.log($scope.reqSubForms);
	});

	//Assigning jquery plugin combobox.
	// $('#combo-0015').scombobox({
		// filterIgnoreCase: false // now case matters
	// });
	
	//AJAX to get form details or form data(object).
	$http.post(baseUrl+'ai_forms/index').then(function(response){
		if(response.data.result == 'success'){
			$scope.formList = response.data.message;
		}
		//Registering forms with google play store.
		// for(i=0; i<$scope.formList.result.length; i++){
			// if(store){
				// store.register({
					// id: "com.thatonepx.assetinfo."+ $scope.formList.result[i].id,
					// alias: $scope.formList.result[i].name,
					// type: store.PAID_SUBSCRIPTION
				// });
				
			// }else{
				// console.log("Store is not available.");
			// }
		// }
		// //Refresh store after registering all products.
		// store.refresh();
	}, function(error){
		console.log(JSON.stringify(error));
	});
	
	//Function for assigning ionic model.
	$ionicModal.fromTemplateUrl("templates/formsList.html", {
		animation: 'slide-in-up',
		scope: $scope,
		focusFirstInput: true
	}).then(function(modal){
		$scope.modal = modal;
	});
	
	//Add form after subscription completion.
	$scope.appendFrom = function(ind, formname, formdata){
		$scope.formDetails = {};
		$scope.formTitles = [];
		// var prodId = "com.thatonepx.assetinfo."+ind;
		// var subsDetails = localStorage.getItem(prodId);
		// if(!subsDetails){
			// store.order(prodId);
			// store.when(prodId).approved(function(prod){
				// // prod.finish();
				// localStorage.setItem(prodId, JSON.stringify(prod.transaction));
				// changeStateIfSubscribed(formdata);
			// });

			// store.when(prodId).owned(function(){
				// alert("Subscription successfull.");
			// });
		// }else {
			//var prod = store.get(prodId);
			//alert(JSON.stringify(prod.transaction));
			changeStateIfSubscribed(formname, formdata);
		// }
	};
	
	//Function to preview the saved form.
	$scope.formPreview = function(title, key){
		reqHeadTitle = title;
		formDetails.setPreviewData([title, key, $scope.toggleSections[2]]);
		$state.go('previewSavedTemp');
	};
	
	//function to change the state after subscription successfull.
	function changeStateIfSubscribed(formname, formdata){
		formdata = JSON.parse(formdata);
		for(form in formdata){
			$scope.formTitles.push(form);
			var reqForm = formdata[form];
			if(reqForm != null){
				for(i=0; i<reqForm.length; i++){
					if(reqForm[i] != null){
						if(reqForm[i].data != undefined){
							reqForm[i].data = JSON.parse(reqForm[i].data);
							reqForm[i].formData = [];
							reqForm[i].formData.push(reqForm[i].data);
						}
					}
				}
			}
		}
		// // // Pushing form data into formDetails to display forms and sections.
		formdata['formName'] = formname;
		$scope.formDetails['formObj'] = formdata;
		formDetails.setPreviewData(['', '', $scope.toggleSections[2]]);
		formDetails.setFormData($scope.formDetails, $scope.formTitles, $scope.newProjDet);
		$state.go('newproj');
		$scope.modal.hide();
	}

	//Funtion to remove the sub-form from sub-forms list.
	$scope.removeSubForm = function(subforms, subform, ind){
		//Ionic popover to confirm sub-form delete.
		$ionicPopup.confirm({template:"Are you sure to delete "+ '<span class="proj-name">' + subform['formDetails']['reqFormName']+'</span>'}).then(function(res){
			if(res){
				var reqSavedObj = JSON.parse(localStorage.getItem($scope.toggleSections[2]['projectName']));
				delete reqSavedObj[subform['formDetails']['reqFormKey']];
				localStorage.setItem($scope.toggleSections[2]['projectName'], JSON.stringify(reqSavedObj));
				subforms.splice(ind, 1);
				delete $scope.toggleSections[2][subform['formDetails']['reqFormKey']];
				formDetails.setVal($scope.toggleSections[0], $scope.toggleSections[1],$scope.toggleSections[2]);
			}else{
				console.info("Cancelled.");
			}
		});
	};
})
.controller('newProjCtrl', function($scope, $timeout, $http, $ionicModal, $ionicScrollDelegate, formDetails, $state, displayForms){
	//New Project controller view enter.
	$scope.$on("$ionicView.enter", function(){
		//Setting defaults values to enable and disable buttons on new project page.
		$scope.sectionIndex = true;
		$scope.activeSectionLength = true;
		//Get form data from formDetails service to display saved forms list.
		var getData = angular.copy(formDetails.getFormData());
		$scope.formDetails = getData[0];
		$scope.reqFormName = $scope.formDetails['formObj']['formName'];
		delete $scope.formDetails['formObj']['formName'];
		$scope.formTitles = getData[1];
		
		// //Scope variable for displaying select value in sub-header.
		$scope.change = $scope.formTitles[0];
		$scope.newProjectDetails = getData[2];
		// //Displaying saved forms using displayForms service.
		displayForms.displaySections('section');
		
		//Show hidden repeat-form button
		var addFormButtons = document.getElementById('project-form').getElementsByClassName('repeat-form');
		for(i=0;i<addFormButtons.length-1;i++){
			addFormButtons[i].style.display = 'block';
		}
		
		// //
		$scope.reqInfo = {};
		
		//Enabling and disabling forward and backward buttons.
		$timeout(function(){
			if(angular.element(document.getElementsByClassName('section')[document.getElementsByClassName('section').length-1]).hasClass('active-section')){
				$scope.activeSectionLength = true;
			}else{
				$scope.activeSectionLength = false;
			}
		}, 210);
	});

	//Go to next section when click right arrow button.
	$scope.nextSection = function(){
		displayForms.nextSection('project-form', 'section', $scope);
	};
	
	//Go to prev section when click left arrow button.
	$scope.prevSection = function(){
		displayForms.prevSection('project-form', 'section', $scope);
	};
	
	//Repeating form when user click on repeat form button.
	$scope.repeatForm = function(key, section){
		//forms.push(form);
		var reqRepeatFormObj = displayForms.repeatForm(key, section, 'project-form', 'section', 'change-section', $scope, 'formDetails');
	};
	
	//Repeating field when user click on repeat field button.
	$scope.repeatFeild = function(ind, formdet){
		displayForms.repeatField(ind, formdet);
	};
	
	//Changing section when user user change through select menu.
	$scope.changeSection = function(selVal){
		displayForms.changeSection(selVal, 'project-form', 'section', $scope);
	};
	
	//Save form after complete the form in newproject.
	$scope.complete = function(event){
		if(angular.element(event.target).hasClass('ion-android-done')){
			saveComplete('Completed');
		}else {
			saveComplete('Saved');
		}
	};
	
	//Save the form with status.
	function saveComplete(stat){
		if(newProjTitle == 'New Project'){
			$scope.reqInfo.status = stat;
			$scope.reqInfo.reqFormName = $scope.reqFormName;
			$scope.formDetails['formDetails'] = $scope.reqInfo;
			$scope.newProjectDetails['form'+Date.now().toString()] = $scope.formDetails;
			localStorage.setItem('ai_project_'+$scope.newProjectDetails.siteAddress.replace(/ /g, ''), JSON.stringify($scope.newProjectDetails));
			formDetails.setVal(false, true, $scope.newProjectDetails);
			$state.go('newproject');
		}else {
			$scope.reqInfo.status = stat;
			$scope.reqInfo.reqFormName = $scope.reqFormName;
			$scope.formDetails['formDetails'] = $scope.reqInfo;
			var savedFormDetails = angular.copy(formDetails.getPreviewData());
			savedFormDetails[2]['form'+Date.now().toString()] = $scope.formDetails;
			localStorage.setItem(savedFormDetails[2]['projectName'], JSON.stringify(savedFormDetails[2]));
			formDetails.setVal(false, true, savedFormDetails[2]);
			$state.go('newproject');
		}
	}
})
.controller('previewSavedTempCtrl', function($scope, $state, formDetails, $timeout, $ionicActionSheet, displayForms){
	//Ionic view before enter for preview saved form controller.
	$scope.$on('$ionicView.enter', function(){
		$scope.previewFormObj = angular.copy(formDetails.getPreviewData());
		$scope.previewData = $scope.previewFormObj[2][$scope.previewFormObj[1]];
		//$scope variable to show to status of the form(either saved or completed).
		if($scope.previewData['formDetails']['status'] == 'Completed'){
			$scope.status = false;
		}else {
			$scope.status = true;
		}

		// //Deleting status in the previewData array.
		$scope.reqFormDetails = $scope.previewData['formDetails'];
		delete $scope.previewData['formDetails'];
		$scope.sectionIndex = true;
		
		// //$scope variable for displaying titles in select in sub-header.
		$scope.formTitles = [];
		for(key in $scope.previewData['formObj']){
			$scope.formTitles.push(key);
		}
		//Scope variable for display the select value in sub-header.
		$scope.change = $scope.formTitles[0];
		
		// //Scope variable for displaying saved form title.
		$scope.pageTitle = reqHeadTitle;
		displayForms.displaySections('pre-section');
		
		//Show hidden repeat-form button
		var addFormButtons = document.getElementById('saved-form').getElementsByClassName('repeat-form');
		for(i=0;i<addFormButtons.length-1;i++){
			addFormButtons[i].style.display = 'block';
		}
		
		//
		$timeout(function(){
			//Enabeling and disabling forward and backward buttons.
			if(angular.element(document.getElementsByClassName('pre-section')[document.getElementsByClassName('pre-section').length-1]).hasClass('active-section')){
				$scope.activeSectionLength = true;
			}else{
				$scope.activeSectionLength = false;
			}
			
			//Regenerate signature if signature co-ordinates are not null.
			$('#saved-form .sigPad').each(function(){
				if($(this).find('.sig-val').val() != ''){
					var sigVal = $(this).find('.sig-val').val();
					$(this).signaturePad({displayOnly:true}).regenerate(sigVal);
				}
			});
		}, 250);
	});

	//Go to next section when click right arrow button.
	$scope.nextSection = function(){
		displayForms.nextSection('saved-form', 'pre-section', $scope);
	};
	
	//Go to prev section when click left arrow button.
	$scope.prevSection = function(){
		displayForms.prevSection('saved-form', 'pre-section', $scope);
	};
	
	//Repeating form when user click on repeat form button.
	$scope.repeatForm = function(key, section){
		var reqRepeatFormObj = displayForms.repeatForm(key, section, 'saved-form', 'pre-section', 'pre-change-section', $scope, 'previewData');
	};
	
	//Repeating field when user click on repeat field button.
	$scope.repeatFeild = function(ind, formdet){
		displayForms.repeatField(ind, formdet);
	};
	
	//Changing section when user user change through select menu.
	$scope.changeSection = function(selVal){
		displayForms.changeSection(selVal, 'saved-form', 'pre-section', $scope);
	};
	
	//Complete or save the saved form.
	$scope.complete = function(event){
		if(angular.element(event.target).hasClass('ion-android-done')){
			$scope.reqFormDetails['status'] = "Completed";
		}else {
			$scope.reqFormDetails['status'] = "Saved";
		}
		$scope.previewData['formDetails'] = $scope.reqFormDetails;
		$scope.previewFormObj[2][$scope.previewFormObj[1]] = $scope.previewData;
		// $scope.previewFormObj[2][reqHeadTitle] = $scope.previewData;
		// console.log($scope.previewFormObj[2]);
		formDetails.setVal(false, true, $scope.previewFormObj[2]);
		localStorage.setItem($scope.previewFormObj[2]['projectName'], JSON.stringify($scope.previewFormObj[2]));
		formDetails.setPreviewData($scope.previewFormObj);
		$state.go('newproject');
	};
});