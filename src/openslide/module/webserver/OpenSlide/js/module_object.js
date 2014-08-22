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
    DEFAULT : 'default',    //기본 상태
    PEN_STANDBY : 'pen_standby',    //펜 툴을 이용하여 그리기를 준비하는 상태
    PEN_MOVE : 'pen_move'   //펜 툴을 이용해서 path를 그리고 있는 상태
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
    color : "ffffff"
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

            group.setAttribute("id", "layer_" + layer_number);

            path.setAttribute("d", "M" + x + " " + y);
            path.setAttribute("fill","none");
            path.setAttribute("stroke", "#" + module_object.option.color);
            path.setAttribute("stroke-width", module_object.option.thick);

            var new_layer = new module_object.Layer("layer_" + layer_number, group, path);

            $("#"+module_core.canvas_id).append(group);
            $(group).append(path);

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
            layer.contents.setAttribute("d", d + " L" + x + " " + y);
        }
    },
    drawing_stop : function(){
        //드로잉을 종료한다
        module_object.status = module_object.status_list.DEFAULT;
    }
};


console.log("moudle_object");
