angular.module('app.services', [])

.factory('formDetails', [function(){
	var formData = [], formTitles = [], newProjectDetails = {};
	var previewData = [];
	var valToDisSavForms = [], mapContent = [];
	return{
		setFormData: function(reqData, formTits, formDet){
			formData = reqData;
			formTitles = formTits;
			newProjectDetails = formDet;
		},
		
		getFormData: function(){
			return [formData, formTitles, newProjectDetails];
		},
		
		setVal: function(val1, val2, reqObj){
			valToDisSavForms = [val1, val2, reqObj];
		},
		
		getVal: function(){
			return valToDisSavForms;
		},
		
		setPreviewData: function(preData){
			previewData = preData;
		},
		
		getPreviewData: function(){
			return previewData;
		}
	}
	
}])

.factory('displayForms', function($timeout, $ionicScrollDelegate){
	return{
		displaySections: function(clsName){
			$timeout(function(){
				var sections = angular.element(document.getElementsByClassName(clsName));
				angular.element(sections[0]).removeClass('right-to-center center-to-left center-to-right').addClass('active-section left-to-center');
				for(i=1;i<sections.length;i++){
					angular.element(sections[i]).removeClass('active-section left-to-center right-to-center center-to-right').addClass('center-to-left');
				}

				//Assinging jquery signature pad plugin.
				$('.pad').attr('width', $(window).width() - 22);

			}, 100);
		},
		nextSection: function(formId, clsName, scope){
			angular.element(document.getElementById(formId).getElementsByClassName('active-section')[0]).removeClass('active-section left-to-center right-to-center center-to-left').addClass('center-to-right');
			angular.element(document.getElementById(formId).getElementsByClassName('center-to-left')[0]).removeClass('center-to-left right-to-center center-to-right').addClass('left-to-center active-section');

			var reqFormTitle = angular.element(document.getElementById(formId).getElementsByClassName('active-section')[0])[0];
			reqFormTitle = angular.element(reqFormTitle).attr('data-form-title');
			// var reqSelect = angular.element(document.getElementById(changeSecId))[0];
			// angular.element(reqSelect).val(reqFormTitle);
			scope.change = reqFormTitle;
			$ionicScrollDelegate.$getByHandle(formId).scrollTop();
			if(angular.element(document.getElementById(formId).getElementsByClassName(clsName)[document.getElementsByClassName(clsName).length-1]).hasClass('active-section')){
				scope.activeSectionLength = true;
			}
			scope.sectionIndex = false;
		},
		prevSection: function(formId, clsName, scope){
			angular.element(document.getElementById(formId).getElementsByClassName('active-section')[0]).removeClass('active-section left-to-center right-to-center center-to-right').addClass('center-to-left');
			angular.element(document.getElementById(formId).getElementsByClassName('center-to-right')[document.getElementById(formId).getElementsByClassName('center-to-right').length -
			1]).removeClass("center-to-right left-to-center center-to-left").addClass("right-to-center active-section");

			var reqFormTitle = angular.element(document.getElementById(formId).getElementsByClassName('active-section')[0])[0];
			reqFormTitle = angular.element(reqFormTitle).attr('data-form-title');
			// var reqSelect = angular.element(document.getElementById(changeSecId))[0];
			// angular.element(reqSelect).val(reqFormTitle);
			scope.change = reqFormTitle;
			$ionicScrollDelegate.$getByHandle(formId).scrollTop();
			if(angular.element(document.getElementById(formId).getElementsByClassName(clsName)[0]).hasClass('active-section')){
				scope.sectionIndex = true;
			}
			scope.activeSectionLength = false;
		},
		repeatForm: function(key, section, formId, clsName, changeSecId, scope, obj){
			if(key.lastIndexOf('(') > 0){
				var sectionFirst = key.substring(0, key.lastIndexOf('(')+1);
				var sectionLast = key.substring(key.lastIndexOf(')'), key.length);
				var reqSectionId = parseInt(key.substring(key.lastIndexOf('(')+1, key.lastIndexOf(')')), 10) + 1;
				
				section[sectionFirst+ reqSectionId +sectionLast] = angular.copy(section[key]);
				var reqRepeatObj = section[sectionFirst+ reqSectionId +sectionLast][0].formData
				for(keyname in reqRepeatObj){
					for(keys in reqRepeatObj[keyname]){
						var reqRepeatKeys = reqRepeatObj[keyname][keys];
						for(i=0;i<reqRepeatKeys.length;i++){
							reqRepeatKeys[i]['name'] = reqRepeatKeys[i]['name']+'(2)';
							reqRepeatKeys[i]['value'] = '';
						}
					}
				}
				var formTit =[];
				var reqSecObj = {};
				var sectionTitles = angular.element(document.getElementById(formId).getElementsByClassName(clsName));
				for(i=0;i<sectionTitles.length;i++){
					formTit.push(angular.element(sectionTitles[i]).attr('data-form-title'));
				}
				
				formTit.splice(formTit.indexOf(key)+1, 0, sectionFirst+ reqSectionId +sectionLast);
				for(i=0;i<formTit.length;i++){
					reqSecObj[formTit[i]] = section[formTit[i]];
				}
				scope.change = sectionFirst+ reqSectionId +sectionLast;
			}else {
				section[key+'(2)'] = angular.copy(section[key]);
				var reqRepeatObj = section[key+'(2)'][0].formData;
				for(keyname in reqRepeatObj){
					for(keys in reqRepeatObj[keyname]){
						var reqRepeatKeys = reqRepeatObj[keyname][keys];
						for(i=0;i<reqRepeatKeys.length;i++){
							reqRepeatKeys[i]['name'] = reqRepeatKeys[i]['name']+'(2)';
							reqRepeatKeys[i]['value'] = '';
						}
					}
				}
				var formTit =[];
				var reqSecObj = {};
				var sectionTitles = angular.element(document.getElementById(formId).getElementsByClassName(clsName));
				for(i=0;i<sectionTitles.length;i++){
					formTit.push(angular.element(sectionTitles[i]).attr('data-form-title'));
				}
				formTit.splice(formTit.indexOf(key)+1, 0, key+'(2)');
				for(i=0;i<formTit.length;i++){
					reqSecObj[formTit[i]] = section[formTit[i]];
				}
				scope.change = key+'(2)';
			}
			scope[obj]['formObj'] = reqSecObj;
			scope.formTitles = formTit;
			$timeout(function(){
				$ionicScrollDelegate.$getByHandle(formId).scrollTop();
				angular.element(document.getElementById(formId).getElementsByClassName('active-section')[0]).next().removeClass('center-to-right right-to-center center-to-left').addClass('active-section left-to-center');
				angular.element(document.getElementById(formId).getElementsByClassName('active-section')[0]).removeClass('left-to-center right-to-center center-to-left active-section').addClass('center-to-right');
				var addFormButtons = document.getElementById(formId).getElementsByClassName('repeat-form');
				for(i=0;i<addFormButtons.length-1;i++){
					addFormButtons[i].style.display = 'none';
				}
				if(angular.element(document.getElementById(formId).getElementsByClassName(clsName)[document.getElementsByClassName(clsName).length-1]).hasClass('active-section')){
					scope.activeSectionLength = true;
				}
				scope.sectionIndex = false;
			}, 300);
		},
		repeatField: function(ind, formdet){
			var changeFieldObj = {};
			for(var key in formdet[ind-1]){
				changeFieldObj[key] = formdet[ind-1][key];
			};
			var reqFieldName = changeFieldObj.name;
			if(reqFieldName.indexOf('(') >= 0){
				var firstHalfName = reqFieldName.substring(0, reqFieldName.indexOf('(')+1);
				var lastHalfName = reqFieldName.substring(reqFieldName.indexOf(')'), reqFieldName.length);
				var reqFieldCount = parseInt(reqFieldName.substring(reqFieldName.indexOf('(')+1, reqFieldName.indexOf(')')), 10);
				reqFieldCount++;
				changeFieldObj.name = firstHalfName + reqFieldCount + lastHalfName;
			}else{
				changeFieldObj.name = changeFieldObj.name + '(2)';
			}
			changeFieldObj.value = '';
			$timeout(function(){
				formdet.splice(ind, 0, changeFieldObj);
			}, 20);
		},
		changeSection: function(selVal, formId, clsName, scope){
			var reqSections = angular.element(document.getElementById(formId).getElementsByClassName(clsName));
			var activeSectionTitle = angular.element(document.getElementById(formId).getElementsByClassName('active-section')[0]).attr('data-form-title');
			for(i=0;i<reqSections.length;i++){
				if(angular.element(reqSections[i]).attr('data-form-title')  == selVal){
					for(j=0;j<i;j++){
						angular.element(reqSections[j]).removeClass('active-section left-to-center center-to-left right-to-center').addClass('center-to-right');
					}
					if(angular.element(reqSections[i]).hasClass('center-to-right')){
						angular.element(reqSections[i]).removeClass('center-to-left left-to-center center-to-right').addClass('right-to-center active-section');
					}else{
						angular.element(reqSections[i]).removeClass('center-to-left left-to-center center-to-left').addClass('left-to-center active-section');
					}
					for(j=i+1;j<reqSections.length;j++){
						angular.element(reqSections[j]).removeClass('active-section left-to-center center-to-right right-to-center').addClass('center-to-left');
					}
					break;
				}
			}
			$ionicScrollDelegate.$getByHandle(formId).scrollTop();
			
			if(angular.element(document.getElementById(formId).getElementsByClassName(clsName)[document.getElementsByClassName(clsName).length-1]).hasClass('active-section')){
				scope.activeSectionLength = true;
			}else{
				scope.activeSectionLength = false;
			}
			
			//Disabling prev section button if the selected section is first section.
			if(angular.element(document.getElementsByClassName(clsName)[0]).hasClass('active-section')){
				scope.sectionIndex = true;
			}else{
				scope.sectionIndex = false;
			}
		}
	}
})
.factory('showHideFields', function(){
	var hideShow =[];
	return{
		setHideShow: function(hideShowVal){
			hideShow = hideShowVal;
		},
		getHideShow: function(){
			return hideShow;
		}
	}
});