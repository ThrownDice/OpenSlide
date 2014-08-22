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
    slope : 0,
    thick : 1,
    fade : 0,
    color : "000000"
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
    texting_prepare : function(){
        //텍스트를 입력할 준비를 한다
        module_object.status = module_object.status_list.TEXT_STANDBY;

        //text input 셋팅
        var $text_input = $('<input type="text" id="text_input">').on({
            keyup : function(event){
                //key가 입력될 때 마다 text에 반영한다
                var layer = module_object.select_objects[0];
                var text = layer.contents;
                $(text).text($(this).val());
            }
        }).css("display","block");
        $('body').append($text_input);

    },
    texting_start : function(x,y){
        //좌표를 받아서 해당 좌표에 text 엘리먼트를 생성하고 선택 오브젝트에 추가한다.
        //그리고 텍스트를 입력하는 상태로 전환한다
        if(module_object.status == module_object.status_list.TEXT_STANDBY){
            var group = document.createElementNS(module_core.svg_ns, "g");
            var text = document.createElementNS(module_core.svg_ns, "text");
            var layer_number = module_object.getLayerNumber();

            //svg의 좌표계로 변환
            var translate_x = x * (module_core.view_box.UUwidth / $('#' + module_core.canvas_id).width());
            var translate_y = y * (module_core.view_box.UUheight / $('#' + module_core.canvas_id).height());

            text.setAttribute("x", translate_x);
            text.setAttribute("y", translate_y);

            $('input#text_input').focus();

            group.setAttribute("id", "layer_" + layer_number);

            $("#"+module_core.canvas_id).append(group);
            $(group).append(text);

            //새 레이어 선언
            var new_layer = new module_object.Layer("layer_" + layer_number, group, text);

            //선택된 오브젝트들 해제하고 펜 툴로 생성되는 오브젝트 추가
            module_object.select_clear();
            module_object.select_objects.push(new_layer);
            module_object.status = module_object.status_list.TEXT_TYPING;
        }
    },
    texting_typing : function(key_code){
        //넘겨 받은 키 코드를 이용해서 텍스트를 더해나간다
        if(module_object.status == module_object.status_list.TEXT_TYPING){
            var layer = module_object.select_objects[0];
            var text = layer.contents;

            $(text).text( $(text).text() + String.fromCharCode(key_code));
        }
    },
    texting_end : function(){
        //text_input을 삭제하고 디폴트 상태로 돌아간다
        if(module_object.status == module_object.status_list.TEXT_TYPING){
            $('input#text_input').remove();
            module_object.status = module_object.status_list.DEFAULT;
        }
    }
};