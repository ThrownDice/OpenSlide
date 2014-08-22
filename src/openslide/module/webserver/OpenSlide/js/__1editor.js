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
    var selected_object = [];
    var current_mouse_status = "stop";
    var previous_mouse_point = {};
    var object_offset = {};

    var select_box = null;

    //초기화 코드

    //

    var util = {};

    /**
     * 선택된 오브젝트들을 순회하면서 포커스를 추가해준다
     */
    util.setSelectFocus = function(){

        for(var i=0; i<selected_object.length ; i++){

            if(selected_object[i].getAttribute("class") != "focus"){
                selected_object[i].setAttribute("class","focus");
                util.createSelectFocus(selected_object[i].parentNode);
            }

        }

    };

    /**
     * 파라미터로 받은 obj 의 모든 focus pointer를 지운다
     * @param obj
     */
    util.unsetSelectFocus = function(obj){

    };

    /**
     * selected_object[] 의 모든 obj 의 focus pointer를 지운다
     */
    util.unsetSelectFocusAll = function(){

    }

    /**
     * obj를 파라미터로 받아서 obj 주변에 포커스를 추가해준다
     * @param obj
     */
    util.createSelectFocus = function(obj){

        var x = new Number(obj.getAttribute("x"));
        var y = new Number(obj.getAttribute("y"));

        var width = new Number(obj.getAttribute("width"));
        var height = new Number(obj.getAttribute("height"));

        var p1 = {x:x, y:y};                //left_top
        var p2 = {x:x + width/2, y:y};      //middle_top
        var p3 = {x:x+ width, y:y};         //right_top
        var p4 = {x:x,y:y+height/2};        //left_middle
        var p5 = {x:x+width,y:y+height/2};  //right_middle
        var p6 = {x:x,y:y+height};          //left_bottom
        var p7 = {x:x+width/2,y:y+height};  //middle_bottom
        var p8 = {x:x+width,y:y+height};    //right_bottom

        //각 포커스들을 구분하기 위해서 클래스를 추가해줌
        util.createSelectFocusPointer(obj, p1).setAttribute("class", "left_top");
        util.createSelectFocusPointer(obj, p2).setAttribute("class", "middle_top");
        util.createSelectFocusPointer(obj, p3).setAttribute("class", "right_top");
        util.createSelectFocusPointer(obj, p4).setAttribute("class", "left_middle");
        util.createSelectFocusPointer(obj, p5).setAttribute("class", "right_middle");
        util.createSelectFocusPointer(obj, p6).setAttribute("class", "left_bottom");
        util.createSelectFocusPointer(obj, p7).setAttribute("class", "middle_bottom");
        util.createSelectFocusPointer(obj, p8).setAttribute("class", "right_bottom");

    };

    /**
     * 오브젝트와 점을 받아서 오브젝트 주변에 포커스를 생성하는 메소드
     * @param obj 포커스를 생성하려는 오브젝트
     * @param p 생성하고자 하는 포인트
     * @returns {HTMLElement} 생성된 focus 엘리먼트
     */
    util.createSelectFocusPointer = function(obj, p){

        //path로 하면 엘리먼트 이동이 용의하지 않아서 rect로 대체한다
        /*var path = document.createElementNS(svgNS, "path");
        path.setAttribute("d","M"+(p.x-5)+" "+(p.y-5)+" L"+(p.x+5)+" "+(p.y-5)+" L"+(p.x+5)+" "+(p.y+5)+" "+" L"+(p.x-5)+" "+(p.y+5)+" Z");
        path.setAttribute("fill", "#6FEAFF");
        path.setAttribute("stroke", "#227F90");*/

        //가로4 세로4의 rect를 만든다
        var focus_rect = document.createElementNS(svgNS, "rect");

        focus_rect.setAttribute("x", p.x - 4);
        focus_rect.setAttribute("y", p.y - 4);

        focus_rect.setAttribute("width", 8);
        focus_rect.setAttribute("height", 8);

        focus_rect.setAttribute("fill", "#6FEAFF");
        focus_rect.setAttribute("stroke", "#227F90");

        $(obj).append(focus_rect);

        return focus_rect;
    };

    /**
     * obj를 받아서 해당 obj의 focus 포인트들을 obj 주변으로 이동시킨다
     * @param obj
     */
    util.moveSelectedFocus = function(obj){

        var parent_node = obj.parentNode;
        var child_node = parent_node.childNodes;
        var node_length = child_node.length;

        var x = new Number(obj.getAttribute("x"));
        var y = new Number(obj.getAttribute("y"));

        var width = new Number(obj.getAttribute("width"));
        var height = new Number(obj.getAttribute("height"));

        var focus_width = 4;
        var focus_height = 4;

        var p1 = {x:x, y:y};                //left_top
        var p2 = {x:x + width/2, y:y};      //middle_top
        var p3 = {x:x+ width, y:y};         //right_top
        var p4 = {x:x,y:y+height/2};        //left_middle
        var p5 = {x:x+width,y:y+height/2};  //right_middle
        var p6 = {x:x,y:y+height};          //left_bottom
        var p7 = {x:x+width/2,y:y+height};  //middle_bottom
        var p8 = {x:x+width,y:y+height};    //right_bottom

        for(var i=0; i<node_length ; i++){

            var type = child_node[i].getAttribute("class");

            //포커스 타입에 따라 새롭게 위치를 지정해준다
            switch(type){

                case "left_top" :
                    child_node[i].setAttribute("x",p1.x - focus_width);
                    child_node[i].setAttribute("y",p1.y - focus_height);
                    break;
                case "middle_top" :
                    child_node[i].setAttribute("x",p2.x - focus_width);
                    child_node[i].setAttribute("y",p2.y - focus_height);
                    break;
                case "right_top" :
                    child_node[i].setAttribute("x",p3.x - focus_width);
                    child_node[i].setAttribute("y",p3.y - focus_height);
                    break;
                case "left_middle" :
                    child_node[i].setAttribute("x",p4.x - focus_width);
                    child_node[i].setAttribute("y",p4.y - focus_height);
                    break;
                case "right_middle" :
                    child_node[i].setAttribute("x",p5.x - focus_width);
                    child_node[i].setAttribute("y",p5.y - focus_height);
                    break;
                case "left_bottom" :
                    child_node[i].setAttribute("x",p6.x - focus_width);
                    child_node[i].setAttribute("y",p6.y - focus_height);
                    break;
                case "middle_bottom" :
                    child_node[i].setAttribute("x",p7.x - focus_width);
                    child_node[i].setAttribute("y",p7.y - focus_height);
                    break;
                case "right_bottom" :
                    child_node[i].setAttribute("x",p8.x - focus_width);
                    child_node[i].setAttribute("y",p8.y - focus_height);
                    break;
            }

        }

    };


    /**
     * select_box를 만든다. 이미 select_box가 만들어져 있다면 파라미터로 받은 좌표로
     * select_box를 갱신한다
     * @param start_point
     * @param end_point
     * @return {HTMLElement}
     */
    util.setSelectBox = function(start_point, end_point){

        if(select_box == null){

            select_box = document.createElementNS(svgNS, "path");
            select_box.setAttribute("fill", "#6FEAFF");
            select_box.setAttribute("stroke", "#227F90");
            select_box.setAttribute("fill-opacity", 0.5);

            $('.svg_palette').append(select_box);

        }else{

            if(start_point && end_point){

                var d = "M " + start_point.x + " " + start_point.y + " L" + end_point.x + " " + start_point.y
                    + " L" + end_point.x + " " + end_point.y + " L" + start_point.x + " " + end_point.y
                    + " L" + start_point.x + " " + start_point.y;

                select_box.setAttribute("d", d);

            }
        }

        return select_box;
    }

    /**
     * 생성된 select_box를 지운다
     */
    util.unsetSelectBox = function(){

        //$('.select_box').remove();
        $(select_box).remove();
        select_box = null;

    }

    $(function(){
        //svg interface
        $('.svg_palette').on('mousedown', function(e){

            current_mouse_status = "mousedown";

            if(e.target.tagName == "svg"){
                selected_object.length = 0;

                //빈 여백에 클릭 되었을 경우는 모든 오브젝트를 선택 해제하고 드래그 모드로 들어간다
                util.unsetSelectFocusAll();
                util.setSelectBox().setAttribute("class","select_box");

            }else{

                //todo : 나중에 focus에 대해선 예외처리를 해야 한다

                selected_object[selected_object.length] = e.target;

                object_offset.x = e.pageX - ($('.svg_palette').get(0).offsetLeft + Number(e.target.getAttribute("x")));
                object_offset.y = e.pageY - ($('.svg_palette').get(0).offsetTop + Number(e.target.getAttribute("y")));
            }
            previous_mouse_point.x = e.pageX - $('.svg_palette').get(0).offsetLeft;
            previous_mouse_point.y = e.pageY - $('.svg_palette').get(0).offsetTop;

            console.log(previous_mouse_point);

        });


        $('.svg_palette').on('mousemove', function(e){

            if(current_mouse_status == "mousedown"){

                if(selected_object.length > 0){

                    for(var i=0; i<selected_object.length; i++){
                        switch(selected_object[i].tagName){
                            case "rect" :
                                //rect의 새로운 x,y 좌표값을 계산한 다음 rect와 parent인 g 노드의 새로운 좌표를 설정
                                var x = e.pageX - $('.svg_palette').get(0).offsetLeft - object_offset.x
                                var y = e.pageY - $('.svg_palette').get(0).offsetTop - object_offset.y

                                selected_object[i].setAttribute("x", x);
                                selected_object[i].setAttribute("y",y);

                                selected_object[i].parentNode.setAttribute("x",x);
                                selected_object[i].parentNode.setAttribute("y",y);

                                util.moveSelectedFocus(selected_object[i]);

                                break;
                            case "circle" :
                                break;
                            case "ellipse" :
                                break;
                        }
                    }
                }else{

                    //선택된 오브젝트 없이 mousedown 인 채로 mousemove 중인 때는 드래그 모드이다
                    //드래그 모드에서는 마우스가 움직 일 때마다 selectbox 가 생기고 크기가 변화한다
                    //todo:나중에 selectbox 에 오브젝트가 포함되는지 조사해서 selected_object[]에 추가해야한다

                    var end_point = {};
                    end_point.x = e.pageX - $('.svg_palette').get(0).offsetLeft;
                    end_point.y = e.pageY - $('.svg_palette').get(0).offsetTop;

                    util.setSelectBox(previous_mouse_point, end_point);

                }
            }

            //previous_mouse_point.x = e.pageX;
            //previous_mouse_point.y = e.pageY;

        });

        $('.svg_palette').on('mouseup', function(e){
            current_mouse_status = "stop";


            //선택된 오브젝트들에 포커스를 추가해줌
            util.setSelectFocus();

            //셀렉트 박스를 없앤다
            util.unsetSelectBox();

        });

        //menu interface

        //make rectangle
        $('.btn_rect').on('click', function(){

            var g = document.createElementNS(svgNS, 'g');
            var rect = document.createElementNS(svgNS, 'rect');

            g.setAttribute("x", 20);
            g.setAttribute("y", 20);
            g.setAttribute("width", 300);
            g.setAttribute("height", 200);

            rect.setAttribute("x", 20);
            rect.setAttribute("y", 20);
            rect.setAttribute("fill", "red");
            rect.setAttribute("width", 300);
            rect.setAttribute("height", 200);

            $('.svg_palette').append(g);
            $(g).append(rect);

        });
        //make circle
        $('.btn_circle').on('click', function(){

            var g = document.createElementNS(svgNS, 'g');
            var circle = document.createElementNS(svgNS, 'circle');

            g.setAttribute("x", 50);
            g.setAttribute("y", 50);
            g.setAttribute("width", 300);
            g.setAttribute("height", 300);

            circle.setAttribute("cx", 100);
            circle.setAttribute("cy", 100);
            circle.setAttribute("fill", "red");
            circle.setAttribute("r", 50);

            $('.svg_palette').append(g);
            $(g).append(circle);

        });
        //make ellipse
        $('.btn_ellipse').on('click', function(){

            var g = document.createElementNS(svgNS, 'g');
            var ellipse = document.createElementNS(svgNS, 'ellipse');

            g.setAttribute("x", 20);
            g.setAttribute("y", 50);
            g.setAttribute("width", 300);
            g.setAttribute("height", 200);

            ellipse.setAttribute("cx", 100);
            ellipse.setAttribute("cy", 100);
            ellipse.setAttribute("fill", "red");
            ellipse.setAttribute("rx", 80);
            ellipse.setAttribute("ry", 50);

            $('.svg_palette').append(g);
            $(g).append(ellipse);

        });






    });



})();

