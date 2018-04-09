/* ======================================================================================
 PrelaodImages Class
 ----------------------------------------------------------------------------------------
* USAGE *
var preload = new PrelaodImages({
	preloads:[
		{id:"image0",	src:"img/image0.jpg"},
		{id:"image1",	src:"img/image1.jpg"},
		{id:"image2",	src:"img/image2.jpg"},
	],
	parallel:		6,
	progressbar:	"#progressbar .bar",	// IE10+ (transform:scaleX 0-1)
	onComplete:		init
});
====================================================================================== */

var PrelaodImages = function(settings){
	
	//MERGE SETTINGS
	var defaults={
        preloads:		{},
        parallel:		5,
        progressbar:	undefined,
        onComplete:		undefined,
	}
	this.settings=settings;
	this.merge(this.settings,defaults);
	
	//INITIALIZE
	this.isLoaded_dom=false;
	this.isLoaded_images=false;
	
	this.numImages=this.settings.preloads.length;
	this.numSets=Math.ceil(this.numImages/this.settings.parallel);
	this.numLoaded=0;
	this.currentSet=0;
	
	this.progressbar=undefined;
	
	var scope=this;
	document.addEventListener("DOMContentLoaded",function(){
		scope.onDOMContentLoaded(scope);
	});
	
	//START
	this.loadSet();
	
};
PrelaodImages.prototype = {
	
	//METHODS
	onDOMContentLoaded: function(scope){
		//console.log("onDOMContentLoaded");
		scope.isLoaded_dom=true;
		
		//progressbar
		if(scope.settings.progressbar){
			var dom=document.querySelector(scope.settings.progressbar);
			if(dom) scope.progressbar=dom;
		}
		//すでにプリロードが終わってる場合
		if(scope.isLoaded_images){
			if(scope.progressbar) scope.updateProgressbar(1);
			scope.settings.onComplete();
		}
	},
	loadSet: function(){
		//console.log("loadSet");
		var scope=this;
		var idx0=this.currentSet * this.settings.parallel;
		var idx1=idx0 + this.settings.parallel;
		var set=this.settings.preloads.slice(idx0,idx1);
		var imgs = [];
		var len=set.length;
		var loaded=0;
		for(var i=0; i<len; i++){
			imgs[i] = new Image();
			imgs[i].src = set[i].src;
			imgs[i].id = set[i].id;
			//onload
			imgs[i].onload = function(e){
				//console.log("onload:"+e.target.id);
				loaded++;
				scope.numLoaded++;
				if(scope.progressbar) scope.updateProgressbar(scope.numLoaded/scope.numImages);
				if(loaded == len) scope.onCompleteSet();
			}
			//onerror
			imgs[i].onerror = function(e){
				//console.log("onerror:"+e.target.id);
				loaded++;
				scope.numLoaded++;
				if(scope.progressbar) scope.updateProgressbar(scope.numLoaded/scope.numImages);
				if(loaded == len) scope.onCompleteSet();
			}
		}
	},
	onCompleteSet: function(){
		this.currentSet++;
		//console.log("onCompleteSet: "+this.currentSet+"|"+this.numSets);
		if(this.currentSet==this.numSets){
			this.isLoaded_images=true;
			if(this.isLoaded_dom){
				if(this.settings.onComplete) this.settings.onComplete();
			}
		}else{
			this.loadSet();
		}
	},
	merge: function(obj1,obj2){
		if(!obj2) obj2 = {};
		for (var key in obj2) {
			if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)){
				obj1[key] = obj2[key];
			}
		}
	},
	updateProgressbar: function(ratio){
		//cdebug(Math.round(ratio*100)+"%");
		this.progressbar.style.webkitTransform="scaleX("+ratio+")";
		this.progressbar.style.transform="scaleX("+ratio+")";
	}
};