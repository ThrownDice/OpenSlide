/**
 * Created by TD on 2014-08-21.
 */

// Dependencies:
// 1) jQuery
// 2) module_core.js

/**파일 모듈**/

var module_file = {};

(function(){

    //새로만들기
    /**
     *새로운 문서를 만드는 메소드
     * @param callback -required- {function} 문서 생성 후 실행할 작업을 정의한 콜백함수
     */
    module_file.newDocument = function(callback){

        var document_title = $('.file_new_dialog input').val();

        event_bus.send('openslide.editor', {
            action : 'editor_create_document',
            document_title : document_title,
            JSESSIONID : JSESSIONID
        }, function(reply){
            //execute callback function
            callback(reply);
        });
    };

    /**
     * 새로운 문서를 업로드 해서 열 수 있도록 하는 메소드
     * @param callback -required- {function} 새문서 열기 완료 후 수행할 작업을 정의한 콜백함수
     */
    module_file.uploadDocument = function(files, callback){

        var upload_url = "/upload";

        for(var i=0; i<files.length; i++){

            var form_data = new FormData();
            form_data.append('file',files[i]);

            var jqXHR = $.ajax({
                xhr : function(){
                    var xhrobj = $.ajaxSettings.xhr();
                    if (xhrobj.upload) {
                        //진행률 표시를 위한 이벤트 핸들링
                        xhrobj.upload.addEventListener('progress', function(event) {
                            var percent = 0;
                            var position = event.loaded || event.position;
                            var total = event.total;
                            if (event.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }
                            //Set progress
                            $('.file_upload').css('color',"#3461B2").text(percent + "%");
                        }, false);
                    }
                    return xhrobj;
                },
                url : upload_url,
                type : "POST",
                contentType:false,
                processData:false,
                cache:false,
                data:form_data,
                success:function(result){

                    var response = JSON.parse(result);
                    console.log(result);

                    if(response.status == "ok"){
                        $('.file_upload').text('업로드가 완료되었습니다');

                        setTimeout(function(){
                            console.log(response.file_name);

                            event_bus.send('openslide.editor', {
                                action : 'editor_open_document',
                                JSESSIONID : JSESSIONID,
                                file_name : response.file_name
                            }, function(reply){
                                //파일 업로드 및 SVG 파싱 성공 시
                            });

                        }, 2000);

                    }else{
                        alert(response.message);
                    }
                    //success to upload file
                    callback();

                }
            })
        }
    };

})();


/**파일 모듈 -끝- **/