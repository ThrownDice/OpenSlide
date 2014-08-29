/**
 * Created by TD on 2014-08-19.
 */

// Dependencies:
// 1) jQuery
// 2) module_core.js
var module_object = {};

/**
 * 새로운 레이어를 생성하기 위해 항상 증가하는 레이어 넘버
 * @type {number}
 */
module_object.layer_number = 0;

/**
 * 새로운 레이어 넘버를 리턴
 * @returns {number}
 */
module_object.getLayerNumber = function(){
    return module_object.layer_number++;
};

/**
 * svg 캔버스의 각 오브젝트들을 나타낸 캡슐 클래스
 * @param name {String} 레이어 이름
 * @param group {SVGGElement} 레이어를 감싸는 <g> 엘리먼트
 * @param contents {SVGElement} 레이어의 실질적인 오브젝트 엘리먼트
 * @constructor
 */
module_object.Layer = function(name, group, contents){
    this.name = name;
    this.group = group;
    this.contents = contents;
}

/**
 * Layer리스트를 가지는 array
 * @type {Array}
 */
module_object.layer_list = new Array();

/**
 * 현재 상태를 나타내는 status 리스트 객체
 * @type {{String}}
 */
module_object.status_list = {
    DEFAULT : 'default',                //기본 상태
    PEN_STANDBY : 'pen_standby',        //펜 툴을 이용하여 그리기를 준비하는 상태
    PEN_MOVE : 'pen_move',              //펜 툴을 이용해서 path를 그리고 있는 상태
    TEXT_STANDBY : 'text_standby',      //텍스트 툴을 이용하여 글쓰기 준비하는 상태
    TEXT_TYPING : 'text_typing'         //텍스트 툴로 텍스트를 쓰고 있는 상태
};

/**
 * 현재 상태를 나타내는 객체
 * @type {String}
 */
module_object.status = module_object.status_list.DEFAULT;

/**
 *기울기, 두께, 흐림, 색깔 옵션을 저장하는 객체
 * @type {{String}}
 */
module_object.option = {
    "slope" : 0,
    "thick" : 1,
    "fade" : 0,
    "color" : "000000",
    "font_size" : 10
};

/**
 * 선택된 svg 엘리먼트 리스트를 저장하는 배열 객체
 * @type {{SVGElement}}
 */
module_object.select_objects = new Array();
/**
 * 선택된 오브젝트들을 모두 선택 해제한다
 */
module_object.select_clear = function(){
    module_object.select_objects.length = 0;
}

module_object.pen = {
    drawing_prepare : function(){
        //펜 툴을 이용하여 그리기를 준비한다
        module_object.status = module_object.status_list.PEN_STANDBY;
    },
    drawing_start : function(x,y){
        //새로운 그룹과 레이어를 생성하여 초기화 작업을 한 후
        //새로운 레이어를 만들어 선택 리스트에 추가한다.
        //그리고 status를 PEN_MOVE로 바꾸어 드로잉을 준비한다
        if(module_object.status == module_object.status_list.PEN_STANDBY){
            var group = document.createElementNS(module_core.svg_ns, "g");
            var path = document.createElementNS(module_core.svg_ns, "path");
            var layer_number = module_object.getLayerNumber();

            //svg의 좌표계로 변환
            var translate_x = x * (module_core.view_box.UUwidth / $('#' + module_core.canvas_id).width());
            var translate_y = y * (module_core.view_box.UUheight / $('#' + module_core.canvas_id).height());

            group.setAttribute("id", "layer_" + layer_number);

            path.setAttribute("d", "M" + translate_x + " " + translate_y);
            path.setAttribute("fill","none");
            path.setAttribute("stroke", "#" + module_object.option.color);
            path.setAttribute("stroke-width", module_object.option.thick);

            //새 레이어 선언
            var new_layer = new module_object.Layer("layer_" + layer_number, group, path);

            $("#"+module_core.canvas_id).append(group);
            $(group).append(path);

            //선택된 오브젝트들 해제하고 펜 툴로 생성되는 오브젝트 추가
            module_object.select_clear();
            module_object.select_objects.push(new_layer);
            module_object.status = module_object.status_list.PEN_MOVE;
        }
    },
    drawing_move : function(x,y){
        //새로운 좌표를 받아서 해당 좌표로 드로잉을 한다
        if(module_object.status == module_object.status_list.PEN_MOVE){
            var layer = module_object.select_objects[0];
            var d = layer.contents.getAttribute("d");

            //svg의 좌표계로 변환
            var translate_x = x * (module_core.view_box.UUwidth / $('#' + module_core.canvas_id).width());
            var translate_y = y * (module_core.view_box.UUheight / $('#' + module_core.canvas_id).height());

            layer.contents.setAttribute("d", d + " L" + translate_x + " " + translate_y);
        }
    },
    drawing_stop : function(){
        //드로잉을 종료한다
        module_object.status = module_object.status_list.DEFAULT;
    }
};

module_object.text = {
    caret_interval : 0,    //caret action의 intervalID
    render_caret : function(){
        //편집 모드일 경우 편집 중인 텍스트 레이어에 caret을 렌더링해준다
        if(module_object.status = module_object.status_list.TEXT_TYPING){
            var layer = module_object.select_objects[0];
            var text = layer.contents;
            var text_length = text.getNumberOfChars();          //텍스트 레이어의 character 길이를 구함
            var caret_index = $("#text_input").caret().begin; //현재 caret 위치 저장
            var $caret =  $("#text_caret");
            var rect = {};

            var value = $("#text_input").val();

            console.log("caret_index : " + caret_index);

            if(caret_index <= 0){
                //만약 텍스트가 하나도 없는 상태라면 가장 좌측에 caret을 만들 수 있도록 한다
                rect.x = Number($(text).attr("x"));
                rect.y = Number($(text).attr("y")) - Math.round(module_object.option.font_size * 1.3); //7은 padding 인지 먼지 아무튼 offset todo:밝혀내라 ㅡㅡ
                rect.height = Math.round(module_object.option.font_size * 1.3);



            }else if(caret_index >= text_length){
                //만약 caret 위치가 마지막 character이라면 가장 끝부분에 caret을 렌더링 할 수 있도록 rect 값을 조정
                rect = text.getExtentOfChar(text_length - 1);
                rect.x = rect.x + rect.width;
            }else{
                rect = text.getExtentOfChar(caret_index);
            }

            //caret이 존재하지 않는다면 만든다
            if(!$caret.size()){

                var new_caret = document.createElementNS(module_core.svg_ns, "line");
                $(text).parent().prepend(new_caret);
                $(new_caret).attr({
                    "id" : "text_caret"
                });
                $caret = $("#text_caret");
            }

            //caret을 렌더링한다
            $caret.attr({
                "x1" : rect.x,
                "y1" : rect.y,
                "x2" : rect.x,
                "y2" : rect.y + rect.height
            });

            console.log(rect);

            //caret의 애니메이션을 설정한다
            if(module_object.text.caret_interval != 0){
                window.clearInterval((module_object.text.caret_interval));  //이미 존재하는 interval은 삭제
            }

            module_object.text.caret_interval = window.setInterval(function(){
                if($("#text_caret").css("display") == "none"){
                    $("#text_caret").css("display", "block");
                }else{
                    $("#text_caret").css("display", "none");
                }
            }, 500);

        }
    },
    texting_prepare : function(){
        //텍스트를 입력할 준비를 한다
        module_object.status = module_object.status_list.TEXT_STANDBY;
    },
    texting_start : function(event){
        //좌표를 받아서 해당 좌표에 text 엘리먼트를 생성하고 선택 오브젝트에 추가한다.
        //그리고 텍스트를 입력하는 상태로 전환한다
        if (module_object.status != module_object.status_list.TEXT_STANDBY) {
        } else {
            var group = document.createElementNS(module_core.svg_ns, "g");
            var text = document.createElementNS(module_core.svg_ns, "text");
            var $textarea = $('<textarea id="text_input"> </textarea>');
            var layer_number = module_object.getLayerNumber();
            var tspan = document.createElementNS(module_core.svg_ns, "tspan");
            var offset_x = event.pageX - $('#' + module_core.canvas_id).offset().left;
            var offset_y = event.pageY - $('#' + module_core.canvas_id).offset().top;

            var ratio_x = module_core.view_box.UUwidth / $('#' + module_core.canvas_id).width();
            var ratio_y = module_core.view_box.UUheight / $('#' + module_core.canvas_id).height();

            var translate_x = offset_x * ratio_x;
            var translate_y = offset_y * ratio_y;

            group.setAttribute("id", "layer_" + layer_number);

            //spacing
            text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");

            //text 엘리먼트의 속성을 설정
            $(text).attr({
                "x": translate_x,
                "y": translate_y,
                /*"font-size" : module_object.option.font_size + "pt",*/
                "stroke-width": "0",
                "fill": "#" + module_object.option.color,
                "text-rendering": "geometricPrecision",
                "kerning" : "1"
            }).on({
                'mousedown': function (event) {
                    //click하면 해당 좌표에 해당하는 character에 caret을 렌더링한다
                    //그리고 편집모드로 들어간다
                    var ratio_x = module_core.view_box.UUwidth / $('#' + module_core.canvas_id).width();
                    var ratio_y = module_core.view_box.UUheight / $('#' + module_core.canvas_id).height();

                    var offset_x = (event.pageX - $('#' + module_core.canvas_id).offset().left) * ratio_x;
                    var offset_y = (event.pageY - $('#' + module_core.canvas_id).offset().top) * ratio_y;
                    var text = $(this).get(0);
                    var text_length = text.getNumberOfChars();
                    var contents = $(this).text();
                    var char_index = 0;
                    var rect = null;
                    rect = text.getExtentOfChar(text_length - 1);

                    if (offset_x > (rect.x + rect.width)) {
                        char_index = text_length - 1;
                    } else {
                        for (var i = 0; i < text_length; i++) {
                            rect = text.getExtentOfChar(i);
                            //offset_x, offset_y가 char rect안에 속하는지 확인
                            if ((offset_x >= rect.x) && (offset_x <= (rect.x + rect.width))) {
                                if ((offset_y >= rect.y) && (offset_y <= (rect.y + rect.height))) {
                                    if (offset_x >= (rect.x + rect.width / 2)) {
                                        char_index = i + 1;
                                    } else {
                                        char_index = i;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    //rect에 속하는 char 확인 후 해당 char 뒤에 caret을 만들어줌
                    var caret = document.createElementNS(module_core.svg_ns, "line");

                    if (char_index == text_length) {
                        rect.x = Number($(this).attr("x")) + $(this).width();
                    } else {
                        rect = text.getExtentOfChar(char_index);
                    }

                    $("#text_caret").remove();
                    if (module_object.text.caret_interval != 0) {
                        window.clearInterval(module_object.text.caret_interval);
                    }

                    $(this).parent().prepend(caret);
                    $(caret).attr({
                        "x1": rect.x,
                        "y1": rect.y,
                        "x2": rect.x,
                        "y2": rect.y + rect.height,
                        "id": "text_caret"
                    }).css("display", "block");

                    module_object.text.caret_interval = window.setInterval(function () {
                        if ($("#text_caret").css("display") == "none") {
                            $("#text_caret").css("display", "block");
                        } else {
                            $("#text_caret").css("display", "none");
                        }
                    }, 500);

                    //text_input의 커서 조정한다
                    $('#text_input').caret(char_index);

                    //todo:편집 모드로 돌입할 수 있도록 기능 수정할 것
                }
            }).addClass("text");

            $(tspan).attr({
                "font-size": module_object.option.font_size + "pt",
                "fill": "#" + module_object.option.color,
                "id": "layer_" + layer_number + "_" + "0"
            }).text("여기에 입력하세요");

            //그룹과 텍스트 엘리먼트 추가
            $("#" + module_core.canvas_id).append(group);
            $(group).append(text);
            $(text).append(tspan);

            //textarea 추가
            $textarea.css({
                position: "absolute",
                /*'background-color' : "transparent",*/
                margin: 0,
                padding: 0,
                border: "none",
                /*color : 'transparent',*/
                color: "black",
                'z-index': 99
            }).on({
                'blur': function () {
                    //텍스트 에어리어가 포커스를 잃을 때 디폴트 상태로 돌아간다
                    var layer = module_object.select_objects[0];
                    var text = layer.contents;

                    //$(text).text($('#text_input').val());
                    //$('#text_input').remove();
                }, 'keyup': function () {

                    var layer = module_object.select_objects[0];
                    var layer_name = layer.name;
                    var text = layer.contents;

                    //타이핑이 되면 textarea의 값을 text에 반영하고 caret을 갱신한다
                    var contents = $(this).val();
                    var lines = contents.split(/\r|\r\n|\n/);

                    //text 갱신 부분
                    for (var i = 0; i < lines.length; i++) {

                        if (!$("#" + layer_name + "_" + i).length) {
                            var new_tspan = document.createElementNS(module_core.svg_ns, "tspan");

                            $(new_tspan).attr({
                                "font-size" : module_object.option.font_size + "pt",
                                "fill" : "#" + module_object.option.color,
                                "id" : layer_name + "_" + i,
                                "dy" : Math.round(module_object.option.font_size * 1.3 ),
                                "x" : $(text).attr("x")
                            });
                            $(text).append(new_tspan);
                        }
                        $("#" + layer_name + "_" + i).text(lines[i]);
                    }
                    module_object.text.render_caret();
                }
            }).val("");

            $('body').prepend($textarea);

            $($textarea).focus();

            //새 레이어 선언
            var new_layer = new module_object.Layer("layer_" + layer_number, group, text);

            //선택된 오브젝트들 해제하고 펜 툴로 생성되는 오브젝트 추가
            module_object.select_clear();
            module_object.select_objects.push(new_layer);
            module_object.status = module_object.status_list.TEXT_TYPING;

            //caret 렌더링
            module_object.text.render_caret();

        }
    },
    texting_typing : function(key_code){
        //넘겨 받은 키 코드를 이용해서 텍스트를 더해나간다
        if(module_object.status == module_object.status_list.TEXT_TYPING){

        }
    },
    texting_end : function(){
        //text_input을 삭제하고 디폴트 상태로 돌아간다
        if(module_object.status == module_object.status_list.TEXT_TYPING){

            var layer = module_object.select_objects[0];
            var text = layer.contents;

            $(text).text($('#text_input').val());
            $('#text_input').remove();
        }
    }
};

/**
 * 캔버스에 변화가 생겼을 경우 캔버스 내부의 엘리먼트들을 새롭게 다시 조정하는 함수
 * $(document).resize 에 핸들링 되어야 한다
 */
module_object.readjust = function(){

    var ratio_x = module_core.view_box.UUwidth / $('#' + module_core.canvas_id).width();

    if(module_object.status == module_object.status_list.TEXT_TYPING){
        var layer = module_object.select_objects[0];
        var text = layer.contents;

        //text-area 재조정
        $('#text_input').css({
            'font-size' :  (20  * (1/ratio_x)) + "pt"
        }).offset($(text).offset());
    }
}




