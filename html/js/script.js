
var isLoaded_dom=false;
var isLoaded_img=false;

/* ======================================================================================
 preloadImages
====================================================================================== */
var preload = new PrelaodImages({
	preloads:[
		{id:"mv_slide1_image",			src:"img/mv_slide1_image.jpg"},
		{id:"mv_slide2_image",			src:"img/mv_slide2_image.jpg"},
		{id:"mv_slide3_image",			src:"img/mv_slide3_image.jpg"},
	],
	parallel:6,
	//progressbar:	"#progressbar .bar",	// IE10+ (transform:scaleX 0-1)
	onComplete:function(){
		//debug("onComplete preloadImages");
		isLoaded_img=true;
		if(isLoaded_dom) init();
	}
});
/* ======================================================================================
 onDOMContentLoaded
====================================================================================== */
document.addEventListener("DOMContentLoaded",onDOMContentLoaded);
function onDOMContentLoaded(){
	isLoaded_dom=true;
	if(isLoaded_img) init();
}

/* ======================================================================================
 init
====================================================================================== */
function init(){
	initArcImages();
}

/* =======================================================================
 initArcImages
======================================================================= */
var imgSrcs=[
	"img/mv_slide1_image.jpg",
	"img/mv_slide2_image.jpg",
	"img/mv_slide3_image.jpg",
];
function initArcImages(){
	var canvas1=document.getElementsByClassName("canvas1")[0];
	var canvas2=document.getElementsByClassName("canvas2")[0];
	var archimageslider=new ArchImageSlider(canvas1,canvas2,imgSrcs);
}
/* =======================================================================
 Class ArchImageSlider
======================================================================= */
var ArchImageSlider=function(canvas1,canvas2,imgsrcs){
	this.ctx1=canvas1.getContext('2d');
	this.ctx2=canvas2.getContext('2d');
	this.cw=canvas1.width;
	this.ch=canvas1.height;
	
	this.slider_duration=5000;
	this.transition_duration=2000;
	
	this.radStart=180*Math.PI/180;
	this.radEnd=360*Math.PI/180;
	this.fps=1000/60;
	
	this.t=0;
	this.b=this.radStart;
	this.c=this.radEnd-this.radStart;
	this.d=Math.round(this.transition_duration/this.fps);
	this.easing=easeCubicOut;
	
	this.alpha=1;
	this.alphaUnit=1/this.d;
	
	this.scaleEnd=1.15;
	this.scaleUnit=(this.scaleEnd-1)/(this.slider_duration/this.fps);
	this.scale1=1;
	this.scale2=1;
	
	var _this=this;
	
	this.imgsrcs=imgsrcs;
	this.numImgs=this.imgsrcs.length;
	this.imgs=[];
	for(var i=0; i<this.numImgs; i++){
		var img=new Image();
		img.onload=function(){
			//debug("ready:"+this+" w:"+this.width+" h:"+this.height);
			var obj={img:this,w:this.width,h:this.height}
			_this.imgs.push(obj);
		}
		img.src=this.imgsrcs[i];
	}
	
	this.index_current=0;
	this.index_prev;
	this.index_next=1;
	
	this.past=0;
	this.isRunningTransition=true;
	
	this.timer=setInterval(function(){
		_this.loop();
	},this.fps);
}
ArchImageSlider.prototype = {
	loop:function(){
		
		if(!this.isRunningTransition){
			
			this.scale1+=this.scaleUnit;
			
			//draw current
			this.draw(this.ctx2,this.imgs[this.index_current].img,this.scale1,this.radStart,this.radEnd,1);
			
			this.past+=this.fps;
			if(this.past>=this.slider_duration){
				this.updateIndex();
				this.past=0;
				this.t=0;
				this.scale2=1;
				this.alpha=1;
				this.isRunningTransition=true;
				//debug("duration end");
			}
		}else{
			
			this.scale1+=this.scaleUnit;
			this.scale2+=this.scaleUnit;
			this.alpha-=this.alphaUnit;
			
			//draw prev & current
			if(this.index_prev!=undefined)	this.draw(this.ctx1,this.imgs[this.index_prev].img,this.scale1,this.radStart,this.radEnd,this.alpha);
			
			this.t++;
			var rad=this.easing(this.t,this.b,this.c,this.d);
			this.draw(this.ctx2,this.imgs[this.index_current].img,this.scale2,this.radStart,rad,1-this.alpha);
			
			this.past+=this.fps;
			if(this.past>=this.transition_duration){
				this.past=0;
				this.scale1=this.scale2;
				this.isRunningTransition=false;
				//debug("transition end");
			}
		}
	},
	updateIndex:function(){
		this.index_current=this.index_next;
		this.index_prev=(this.index_current==0)?this.numImgs-1:this.index_current-1;
		this.index_next=(this.index_current==this.numImgs-1)?0:this.index_current+1;
	},
	draw:function(ctx,img,scale,rad0,rad1,alpha){
		ctx.clearRect(0,0,this.cw,this.ch);
		ctx.globalCompositeOperation = 'source-over';
		var w=this.cw*scale;
		var h=this.ch*scale;
		var x=-(w-this.cw)/2;
		var y=-(h-this.ch)/2;
        ctx.drawImage(img,x,y,w,h);
		ctx.globalCompositeOperation='destination-in';
		drawCircleLine(ctx,690,697,495,400,"rgba(0,0,0,"+alpha+")",rad0,rad1);	//radian=degree*Math.PI/180
	}
};

/* =======================================================================
 EASING
======================================================================= */
function linear(t,b,c,d){return c*t/d+b;}
function easeSineOut(t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+b;}
function easeCircOut(t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+b;}
function easeCubicOut(t,b,c,d){return c*((t=t/d-1)*t*t+1)+b;}
function easeQuartOut(t,b,c,d){return -c*((t=t/d-1)*t*t*t-1)+b;}

/* =======================================================================
 drawCircleLine
======================================================================= */
function drawCircleLine(ctx,x,y,r,weight,color,rad0,rad1){
	ctx.lineWidth=weight;
	ctx.strokeStyle=color;
	ctx.beginPath();
	ctx.arc(x,y,r,rad0,rad1,false);
	ctx.stroke();
}