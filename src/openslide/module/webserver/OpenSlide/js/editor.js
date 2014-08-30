/**
 * Created by TD on 2014-07-11.
 */

// Dependencies:
// 1) jQuery
// 2) colpick.js
// 3) module_core.js
// 4) module_file.js
// 5) module_edit.js
// 6) module_object.js

(function(){

    $(function(){

    });
    /**Socket Server와 연결을 시도 **/

    /**Socket Server와 연결을 시도 -끝- **/

    /**화면 레이아웃 초기화**/
        //오른쪽 레이아웃 초기화
    $('#container_right').css({
        width :Number(window.innerWidth) - 200 + "px",
        height : Number(window.innerHeight) - 53 + "px"
    });
    //오른쪽 레이아웃 캔버스 초기화
    var container_width = $('.container_right_top').width();
    var container_height = $('.container_right_top').height();
    var min_token = container_width > container_height ? container_height : container_width; //상하 크기 중 작은 쪽을 기준으로 레이아웃을 잡는다(그래야만 짤리지 않는다)
    $('.svg_canvas').attr({
        'width' :  min_token*0.85*1.7,
        'height' : min_token*0.85
    });
    $('#dummy2').attr({
        "transform" : "scale(" + Number(135/(min_token*0.80*1.7)) + ")",
        "x" : Number(34 * Number((min_token*0.80*1.7)/135)),
        "y" : Number(19 * Number((min_token*0.80*1.7)/135))
    });

    //이후 윈도우가 리사이즈 될 때 마다 크기가 변화도록 함
    $(window).resize(function(){
        //컨테이너 레이아웃 사이즈 재조정
        $('#container_right').css({
            width :Number(window.innerWidth) - 200 + "px",
            height : Number(window.innerHeight) - 53 + "px"
        });
        //svg 캔버스 레이아웃 사이즈 재조정
        var container_width = $('.container_right_top').width();
        var container_height = $('.container_right_top').height();
        var min_token = container_width > container_height ? container_height : container_width;
        $('.svg_canvas').attr({
            'width' :  min_token*0.80*1.7,
            'height' : min_token*0.80
        });

        //테스트 코드 (현재 첫 슬라이드만 미리보기 기능을 지원)
        var o_x = $('#dummy2').attr("x");
        var o_y = $('#dummy2').attr("y");

        $('#dummy2').attr({
            "transform" : "scale(" + Number(135/(min_token*0.80*1.7)) + ")",
            "x" : Number(34 * Number((min_token*0.80*1.7)/135)),
            "y" : Number(19 * Number((min_token*0.80*1.7)/135))
        });

        //캔버스 재 조정
        module_object.readjust();

    });
    /**화면 레이아웃 초기화 -끝- **/

    /**버튼 위젯 초기화 및 이벤트 핸들링 **/
        //document 이벤트 초기화
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

    //파일버튼 초기화
    $('.topmenu_file').button({ icons: { primary: "ui-icon-document"} }).css('font-size','10pt').on('click', function(){
        //파일 버튼 클릭시, 파일 서브 메뉴를 보여준다
        $('.submenu').hide();
        var menu = $('.submenu_file').show().position({
            my: "left top",
            at: "left bottom",
            of: this
        });
        $( document ).one( "click", function() {
            menu.hide();
        });
        return false;
    });
    //편집버튼 초기화
    $('.topmenu_edit').button({ icons: { primary: "ui-icon-gear"} }).css('font-size','10pt').on('click', function(){
        //편집 버튼 클릭시, 편집 서브 메뉴를 보여준다
        $('.submenu').hide();
        var menu = $('.submenu_edit').show().position({
            my: "left top",
            at: "left bottom",
            of: this
        });
        $( document ).one( "click", function() {
            menu.hide();
        });
        return false;
    });
    //삽입버튼 초기화
    $('.topmenu_object').button({ icons: { primary: "ui-icon-image"} }).css('font-size','10pt').on('click', function(){
        //삽입 버튼 클릭시, 삽입 서브 메뉴를 보여준다
        $('.submenu').hide();
        var menu = $('.submenu_object').show().position({
            my: "left top",
            at: "left bottom",
            of: this
        });
        $( document ).one( "click", function() {
            menu.hide();
        });
        return false;
    });
    $('.topmenu_form').button({ icons: { primary: "ui-icon-pencil"} }).css('font-size','10pt');           //서식버튼 초기화
    $('.topmenu_view').button({ icons: { primary: "ui-icon-search"} }).css('font-size','10pt');           //보기버튼 초기화
    $('.topmenu_animation').button({ icons: { primary: "ui-icon-video"} }).css('font-size','10pt');      //애니메이션버튼 초기화
    $('.topmenu_presentation').button({ icons: { primary: "ui-icon-circle-triangle-e"} }).css('font-size','10pt');   //프레젠테이션보기버튼 초기화
    $('.topmenu_comment').button({ icons: { primary: "ui-icon-comment"} }).css('font-size','10pt');    //댓글버튼 초기화
    $('.topmenu_share').button({ icons: { primary: "ui-icon-unlocked"} }).css('font-size','10pt');  //공유버튼 초기화

    //서브메뉴 초기화
    $('.submenu_file').menu().css('font-size', '10pt').hide();
    $('.submenu_edit').menu().css('font-size', '10pt').hide();
    $('.submenu_object').menu().css('font-size', '10pt').hide();

    /** 파일 서브메뉴 이벤트 핸들링 **/
    //다이얼로그 셋팅
    //파일-새문서 dialog
    $('.file_new_dialog').hide();
    //파일-열기 dialog
    $('.file_open_dialog').hide();
    $('.file_open_dialog .file_upload').on({
        dragenter : function(){
            $(this).css({
                color : '#3461B2',
                'border-color' : '#3461B2'
            });
        }, dragleave : function(){
            $(this).css({
                color : 'gray',
                'border-color' : 'gray'
            });
        }, drop : function(event){

            $(this).css({
                color : 'gray',
                'border-color' : 'gray'
            });

            event.preventDefault();

            var files = event.originalEvent.dataTransfer.files;

            module_file.uploadDocument(files, function(){

            });

        }
    });

    //파일-새로만들기
    $('.file_new').on('click', function(){
        $('.file_new_dialog').dialog({
            resizable: false,
            height: 160,
            width: 360,
            modal: true,
            buttons: {
                '확인' : function(){
                    module_file.newDocument(function(result){

                        /**
                         * result = {status,document_id}
                         */

                        console.log("result is " + result);

                        if(result.status == "ok"){
                            //새로운 문서 생성 성공
                        }else{
                            //새로운 문서 생성 실패
                            alert("새로운 문서를 생성하는데 실패하였습니다.");
                        }
                        $(".file_new_dialog").dialog("close");
                    });
                },
                '취소' : function () {
                    $(this).dialog("close");
                }
            }
        }).css('font-size','10pt');
    });
    //파일-열기
    $('.file_open').on('click', function(){
        $('.file_open_dialog').dialog({
            resizable : false,
            height : 360,
            width : 360,
            modal : true,
            buttons : {
                '취소' : function(){
                    $(this).dialog('close');
                }
            }
        })
    });
    /** 파일 서브메뉴 이벤트 핸들링 -끝- **/


    /** 편집 서브메뉴 이벤트 핸들링 -끝- **/

    /** 편집 서브메뉴 이벤트 핸들링 -끝- **/


    /** 삽입 서브메뉴 이벤트 핸들링  **/

    //펜 도구
    $('.object_pencil').on('click', function(){
        module_object.pen.drawing_prepare();
    });

    $('#svg_canvas').on('mousedown', function(event){
        //펜 드로잉 시작
        if(module_object.status == module_object.status_list.PEN_STANDBY){
            var x = event.pageX - $('#svg_canvas').offset().left;
            var y = event.pageY - $('#svg_canvas').offset().top;
            module_object.pen.drawing_start(x,y);
        }
    });
    $('#svg_canvas').on('mousemove', function(event){
        //펜 드로잉
        if(module_object.status == module_object.status_list.PEN_MOVE) {
            var x = event.pageX - $('#svg_canvas').offset().left;
            var y = event.pageY - $('#svg_canvas').offset().top;
            module_object.pen.drawing_move(x, y);
        }
    });

    $('#svg_canvas').on('mouseup', function(){
        //펜 드로잉 끝
        if(module_object.status == module_object.status_list.PEN_MOVE) {
            module_object.pen.drawing_stop();
        }
    });

    //텍스트 도구
    $('.object_text').on('click', function(){
        module_object.text.texting_prepare();
    });

    $('#svg_canvas').on('mouseup', function(event){
        //텍스트 타이핑 시작
        if(module_object.status == module_object.status_list.TEXT_STANDBY){
            module_object.text.texting_start(event);
        }
    });

    //차트 도구
    $('.object_chart').on('click', function(){
        $('.chart_tab').css('display', 'block');
    });

    $('.chart_tab .btn_close').on('click', function(){
        $('.chart_tab').css('display', 'none');
    });

    //차트 종류 핸드링
    $('.chart_tab .solid_stick').on('click', function(){
        module_object.chart.create();
    });


    //제 1 안
    /*$(document).on('click', function(){
        //빈 공간을 클릭하면 타이핑을 끝내고 디폴트 상태로 돌아감
        if(module_object.status == module_object.status_list.TEXT_TYPING){
            module_object.text.texting_end();
        }
    });*/

    /*$(document).on('keyup', function(event){
        if(module_object.status == module_object.status_list.TEXT_TYPING){

            module_object.text.texting_typing(event.keyCode);

            //console.log(event.keyCode);

        }
    });*/

    /** 삽입 서브메뉴 이벤트 핸들링 -끝- **/


    //탑 메뉴 그룹화
    $('.header_menu').buttonset();

    /**버튼 위젯 초기화 및 이벤트 핸들링 -끝- **/

    /** 상단 하위 메뉴 초기화 **/

    //기울기
    $('.slope .slope_slider').slider({
        value : 0,
        min : 0,
        max : 100,
        slide : function(event, ui){
            $('.slope_value').val(ui.value);
            module_object.option.slope = ui.value;
        }
    }).css({
        float:'left',
        width : 60
    });
    $('.slope_value').on('keyup', function(){
        $('.slope .slope_slider').slider('value', $(this).val());
        module_object.option.slope = $(this).val();
    });

    //두께
    $('.thick .thick_slider').slider({
        value : 1,
        min : 1,
        max : 100,
        slide : function(event, ui) {
            $('.thick_value').val(ui.value);
            module_object.option.thick = ui.value;
        }
    }).css({
        float:'left',
        width : 60
    });
    $('.thick_value').on('keyup', function(){
        $('.thick .thick_slider').slider('value', $(this).val());
        module_object.option.thick =  $(this).val()
    });

    //흐림
    $('.fade .fade_slider').slider({
        value : 0,
        min : 0,
        max : 100,
        slide : function(event, ui){
            $('.fade_value').val(ui.value);
            module_object.option.fade = ui.value;
        }
    }).css({
        float:'left',
        width : 60
    });
    $('.fade_value').on('keyup', function(){
        $('.fade .fade_slider').slider('value', $(this).val());
        module_object.option.fade = $(this).val();
    });

    //색깔
    $('.color_button').colpick({
        color : module_object.option.color,
        submit : 0,
        onChange : function(hsb,hex,rgb,el,bySetColor){

            module_object.option.color = hex;

            $(el).css('background-color','#'+hex);
            if(!bySetColor) $(el).val(hex);
        }
    }).css('background-color', '#'+module_object.option.color);

    //폰트 사이즈
    $('.font .font_size').on('keyup', function(){
        module_object.option.font_size = $(this).val();
    });

    //슬라이더 핸들러 크기 조절
    $('.header_bottom_menu .ui-slider-handle').css({
        width : 10,
        height : 17
    })

    /** 상단 하위 메뉴 초기화 -끝- **/

})();