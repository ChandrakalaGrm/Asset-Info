//Script for Android in-app billing.
document.addEventListener("deviceready", initializeStore, false);

//Initializing store.
function initializeStore(){
	if(store){
		//register product in store with product id.
		store.register({
			id: "asset_info_subscription",
			alias: "assert_info",
			type: store.NON_CONSUMABLE
		})
		
		store.ready(function(){
			//Getting product details from playstore.
			var prod = store.get("asset_info_subscription");
			//Setting product details in local storage.
			console.log(prod);
			localStorage.setItem('purchaseDetails', JSON.stringify({'purchaseId': prod.id, 'purchaseTitle': prod.title, 'purchaseDesc': prod.description, 'purchasePrice': prod.price}));
		});
		
		//After register the project we need to refresh the store.
		store.refresh();
		
		//Approving product id.
		//This mandatory, this gives the conformation to the store when the ptoduct is approved or not.
		store.when("asset_info_subscription").approved(function(p){
			console.log('Approved');
			p.finish();
		});
		
		//Storing purchase status in local storage after purchase successful.
		store.when("asset_info_subscription").owned(function(){
			console.log("Owned");
			//Storing purchase status in local storage.
			// if(localStorage.getItem('purchaseStatus') != 'premium'){
				// localStorage.setItem('purchaseStatus','premium');
				// purchase = true;
				// updatingLocalWalkList();
				// checkingDownloadedMaps();
			// }
		});
	}else {
		alert("Store is not available.");
	}
}