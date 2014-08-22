/*
 * TeamSlide
 * 
 * Editor Module
 * @require : jQuery
 * 
 * 
 * 
 * 
 */
//editor module
(function(){
	
	var svgNS = "http://www.w3.org/2000/svg";
	
	var editor = {};

	editor.resizer = {};
	
	editor.resizer.setResizer = function(obj){
		
		var x = new Number(obj.getAttribute("x"));
		var y = new Number(obj.getAttribute("y"));
		
		var width = new Number(obj.getAttribute("width"));
		var height = new Number(obj.getAttribute("height"));
		
		//나중에 루프로 바꿔보장
		var p1 = {x:x, y:y};
		var p2 = {x:x + width/2, y:y};
		var p3 = {x:x+ width, y:y};
		var p4 = {x:x,y:y+height/2};
		var p5 = {x:x+width,y:y+height/2};
		var p6 = {x:x,y:y+height};
		var p7 = {x:x+width/2,y:y+height};
		var p8 = {x:x+width,y:y+height};
		
		editor.resizer.setResizerPointer(obj, p1);
		editor.resizer.setResizerPointer(obj, p2);
		editor.resizer.setResizerPointer(obj, p3);
		editor.resizer.setResizerPointer(obj, p4);
		editor.resizer.setResizerPointer(obj, p5);
		editor.resizer.setResizerPointer(obj, p6);
		editor.resizer.setResizerPointer(obj, p7);
		editor.resizer.setResizerPointer(obj, p8);
		
	};
	
	editor.resizer.setResizerPointer = function(obj, p){
		
		var path = document.createElementNS(svgNS, "path");
		path.setAttribute("d","M"+(p.x-5)+" "+(p.y-5)+" L"+(p.x+5)+" "+(p.y-5)+" L"+(p.x+5)+" "+(p.y+5)+" "+" L"+(p.x-5)+" "+(p.y+5)+" Z");
		path.setAttribute("fill", "#6FEAFF");
		path.setAttribute("stroke", "#227F90");
		
		$('.svg_palet').append(path);
		
	};
	
	
	var current_selected = null;
	
	//document loaded
	$(function(){

        $(document).on('click', function(e){

            console.log(e.target);

            console.log('document clicked');
        });



		/**
		 * SVG 기능 테스트 
		 */
		$('.btn_svg_bx_test1').on("click", function (e){
			
			//var g = document.createElement("g");
			var rect = document.createElementNS(svgNS, "rect");
			
			rect.setAttribute("x", 20);
			rect.setAttribute("y", 20);
			rect.setAttribute("fill", "red");
			rect.setAttribute("width", 300);
			rect.setAttribute("height", 200);
			
			var current_status = null;
			var rect_offset_x = 0;
			var rect_offset_y = 0;
			
			$(rect).on('mousedown',function(e){
				rect.setAttribute("stroke", "green");
				current_status = true;
				current_selected = rect;
				rect_offset_x = new Number($('.svg_palet').get(0).offsetLeft) + new Number(rect.getAttribute("x"));
				rect_offset_y = new Number($('.svg_palet').get(0).offsetTop) + new Number(rect.getAttribute("y"));
				
				console.log(rect_offset_x);
				console.log(rect_offset_y);
				
				console.log(e.pageX);
				console.log(e.pageY);
				
				obj_offset_x = e.pageX - rect_offset_x;
				obj_offset_y = e.pageY - rect_offset_y;
				
				editor.resizer.setResizer(rect);
				
			});
			
			$(rect).on('mouseup', function(e){
				current_status = false;	
			});
			
			$(document).on('mousemove', function(e){
				
				if(current_status){
					var offset_x = $('.svg_palet').get(0).offsetLeft;
					var offset_y = $('.svg_palet').get(0).offsetTop;
					
					rect.setAttribute("x", e.pageX - offset_x - obj_offset_x);
					rect.setAttribute("y", e.pageY - offset_y - obj_offset_y);
				}
			});
			
			
			$('.svg_palet').append(rect);
			
			//$('.svg_palet').append('<rect x="10" y="10" height="50" width="50" rx="5" ry="5" style="stroke:#006600; fill: #00cc00"/>');
			
		});
		
		//
		
		$(document).on('dragenter', function (e) 
		{
		    e.stopPropagation();
		    e.preventDefault();
		});
		$(document).on('dragover', function (e) 
		{
		  e.stopPropagation();
		  e.preventDefault();
		});
		$(document).on('drop', function (e) 
		{
		    e.stopPropagation();
		    e.preventDefault();
		});
		
		
		//file drag event configuration
		var bx_middle = $("#contents .middle").get(0);
		
		bx_middle.ondragenter = function(event){
			//add css class
			console.log("ondragenter");
			$(this).addClass("drag_hover");
		};
		//drag leave event
		bx_middle.ondragleave = function(event){
			console.log("ondragleave");
			$(this).removeClass("drag_hover");
		};
		//drag drop event
		bx_middle.ondrop = function(event){
			event.stopPropagation();
			event.preventDefault();
			
			$(this).removeClass("drag_hover");
			
			var files = event.dataTransfer.files;
			
			for (var i = 0; i < files.length; i++) 
			{
		        var fd = new FormData();
		        fd.append('file', files[i]);
		 
		        //var status = new createStatusbar(obj); //Using this we can set progress.
		        //status.setFileNameSize(files[i].name,files[i].size);
	            var uploadURL ="/presentation/upload"; //Upload URL
	            var extraData ={}; //Extra Data.
	            $.ajax({
	                url: uploadURL,
	                type: "POST",
	                contentType:false,
	                processData: false,
	                cache: false,
	                data: fd,
	                success: function(data){
	                	
	                	//alert(data);
	                	//$("#contents .middle").html(decodeURIComponent(data));
	                	$("#contents .middle").html(data);
	                	
	                }
	            }); 
			}
		};
		
		$('.btn_slideshow').on("click", function(){
			
			var ele = document.documentElement;
			//var ele = $('.middle').get(0);
			
			
			if(ele.requestFullscreen) {
			    ele.requestFullscreen();
			  } else if(ele.mozRequestFullScreen) {
			    ele.mozRequestFullScreen();
			  } else if(ele.webkitRequestFullscreen) {
			    ele.webkitRequestFullscreen();
			  } else if(ele.msRequestFullscreen) {
			    ele.msRequestFullscreen();
			  }
		});
		
		
		$('.btn_svg_test1').on('click', function(){
			
			
			
		});
		
		var eventBus = new vertx.EventBus("http://localhost:8080/eventbus");
		
		eventBus.onopen = function(){
			alert("Wellcome to TeamSlide");
		};
		
	});
	
	
})();

