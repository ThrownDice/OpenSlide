/**
 * Created by TD on 2014-08-21.
 */

//Dependencies:
// 1) jQuery

var module_core = {};

(function(){

    /**
     * module이 컨트롤할 svg 캔버스
     * @type {string}
     */
    module_core.canvas_id = "svg_canvas";
    /**
     * svg namespace
     * @type {string}
     */
    module_core.svg_ns = "http://www.w3.org/2000/svg";
    /**
     * 현재 svg 문서의 id (서버에서 발급받음)
     * @type {string}
     */
    module_core.document_id = "";
    /**
     * 현재 작업 중인 슬라이드
     * @type {number}
     */
    module_core.current_slide = 1;
    /**
     * svg canvas의 viewBox attribute
     * @type {{ULCx: number, ULCy: number, UUwidth: number, UUheight: number}}
     */
    module_core.view_box = {
        ULCx : 0,
        ULCy : 0,
        UUwidth : 896,
        UUheight : 524.8
    };

})();