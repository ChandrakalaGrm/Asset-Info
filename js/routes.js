angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('assetInfo', {
		url: '/home',
		templateUrl: 'templates/assetInfo.html',
		controller: 'assetInfoCtrl'	
	})
	.state('signup', {
		url: '/signup',
		templateUrl: 'templates/signup.html',
		controller: 'signupCtrl'
	})
	.state('signuptypes',{
		url: '/signuptypes',
		templateUrl: 'templates/signuptypes.html',
		controller: 'signuptypesCtrl'
	})
	.state('login', {
		url: '/login',
		templateUrl: 'templates/login.html',
		controller: 'loginCtrl'
	})
	.state('projects', {
		url: '/projects',
		templateUrl: 'templates/projects.html',
		controller: 'projectsCtrl'
	})
	.state('Map', {
		url: '/Map',
		templateUrl: 'templates/map.html',
		controller: 'mapCtrl'
	})
	.state('reports', {
		url: '/reports',
		templateUrl: 'templates/reports.html',
		controller: 'reportsCtrl'
	})
	.state('forms', {
		url: '/forms',
        templateUrl: 'templates/forms.html',
        controller: 'formsCtrl'
	})
	.state('newproject',{
		url: 'newproject',
		//cache: true,
		templateUrl: 'templates/newproject.html',
		controller: 'newprojectCtrl'
	})
	.state('newproj', {
		url: '/newproj',
		templateUrl: 'templates/newproj.html',
		controller: 'newProjCtrl'
	})
	.state('previewSavedTemp', {
		url: '/previewSavedTemp',
		templateUrl: 'templates/previewSavedTemp.html',
		controller: 'previewSavedTempCtrl'
	});

	$urlRouterProvider.otherwise(function(){
		if(!localStorage.getItem("ai_forms_user_details")){
			return '/home';
		}else {
			return '/projects'
		}
	});
});