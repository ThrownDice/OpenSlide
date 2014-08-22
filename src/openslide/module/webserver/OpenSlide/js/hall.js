/**
 * Created by TD on 2014-07-28.
 */


//Global Object and Value
/** Vertx Soket Server와 연결 수립 및 이벤트 핸들링 **/
var DEFAULT_SESSION_CLIENT_ADDRESS = "openslide.session.client.";    //세션을 이용하여 이벤트를 핸들링하는 주소
var event_bus = new vertx.EventBus("http://localhost:8080/eventbus");

/** util 객체 선언 **/

var util = {};

/**
 * key에 해당하는 cookie value를 리턴해준다
 * @param key
 * @returns {*}
 */
util.getCookiee = function getCookie(key) {
    key = key + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(key);
    var cValue = '';
    if(start != -1){
        start += key.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
}

/** util 객체 선언 -끝- **/

var JSESSIONID = util.getCookiee("JSESSIONID");

event_bus.onopen = function(){
    console.log("Connected to OpenSlide Server");

    /*event_bus.send("openslide.test", {
        JSESSIONID : JSESSIONID
    }, function(message){

    });*/

    /** Session Address 이벤트 핸들링 **/

    event_bus.registerHandler(DEFAULT_SESSION_CLIENT_ADDRESS + JSESSIONID, function(message){

    });

    /** Session Address 이벤트 핸들링 -끝- **/

};

/** Vertx Soket Server와 연결 수립 및 이벤트 핸들링 -끝- **/

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";

    var weekName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

(function(){

    $(function(){

        /** 페이지 초기화 코드 **/

        //window resize 이벤트 핸들링

        $(window).on('resize', function(){
            //block 엘리먼트는 윈도우 사이즈 변경에 따라 변경됨
            $('.os-ui-block').css({
                height : window.innerHeight
            });
            //tab_right는 윈도우 사이즈 변경에 따라 위치가 변경됨
            $('.tab_right').css({
                left : window.innerWidth - 180
            });

        });

        //레이아웃 및 버튼 핸들링

        //시계 초기화
        setInterval(function(){
            $('.tab_top_middle .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
        }, 1000);

        //최초 메인 페이지에서 접속 시, 홀 콘텐츠를 로드한다
        $('#wrap').load('hall2.html', function(){

        });

        //메뉴 버튼 핸들링
        $('.left_menu').on('click', function(){

            //block 엘리먼트를 생성에서 띄운다
            var new_ele = "<div class='os-ui-block'></div>";

            $(new_ele).css({
                width : '100%',
                height : window.innerHeight,
                background : 'black',
                opacity : '0.5',
                position : 'absolute',
                left : '0px',
                top : '0px'
            }).appendTo('#wrap');

            $('.tab_left').animate({
                left : '0px'
            });

        });

        //왼쪽 탭 메뉴 초기화
        //닫기 버튼 핸들링
        $('.tab_left .btn_close').on('click', function(){
            $('.tab_left').animate({
                left : '-250px'
            });
            $('.os-ui-block').remove();
        });

        //새문서 메뉴 버튼
        $('.tab_left .btn_new_doc').on('click', function(){

            //모든 탭 메뉴를 닫는다
            $('.tab_left').animate({
                left : '-250px'
            });
            $('.os-ui-block').remove();

            $('.tab_top').animate({
                top : '-200px'
            });

            $('.tab_right').animate({
                left : window.innerWidth + 200
            });

            $('#wrap').load('editor.html', function(){

            });

        });

        //오른쪽 탭 메뉴 초기화
        $('.tab_right').css({
            left : window.innerWidth - 180
        });

        /** 페이지 초기화 코드 -끝- **/
    });

})();



