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

    /**
     * add jquery utility function
     * @param begin
     * @param end
     * @returns {*}
     */
    $.fn.caret = function (begin, end)
    {
        if (this.length == 0) return;
        if (typeof begin == 'number')
        {
            end = (typeof end == 'number') ? end : begin;
            return this.each(function ()
            {
                if (this.setSelectionRange)
                {
                    this.setSelectionRange(begin, end);
                } else if (this.createTextRange)
                {
                    var range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', begin);
                    try { range.select(); } catch (ex) { }
                }
            });
        } else
        {
            if (this[0].setSelectionRange)
            {
                begin = this[0].selectionStart;
                end = this[0].selectionEnd;
            } else if (document.selection && document.selection.createRange)
            {
                var range = document.selection.createRange();
                begin = 0 - range.duplicate().moveStart('character', -100000);
                end = begin + range.text.length;
            }
            return { begin: begin, end: end };
        }
    }

    /**
     * textarea에서 커서의 위치를 가져오기 위한 유틸리티 함수
     * get textarea cursor position, utility function
     */
    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }

})();