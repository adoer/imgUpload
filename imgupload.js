+function($){
    "use strict";
    var Imgupload=function(opt,saveCallBack){
        this._box_width=opt.width;
        this._box_height=opt.width;
        this._uploadInputBtn=opt.uploadInputBtn;
        this._imgBox=opt.imgBox;
        this._previewImgBox=opt.previewImgBox;
        this._init();
    }
    Imgupload.prototype={
        constructor:Imgupload,
        _box_width:"",
        _box_height:"",
        _imgBox:$(this._imgBox),
        _previewImgBox:$(this._previewImgBox),
        _uploadInputBtn:$(this._uploadInputBtn),

        _img:"",

        _init:function (){
            var self=this;
            self.readFile();
        },
        //读取图片
        readFile:function(){
            var self=this;
            if(typeof FileReader==='undefined'){
                alert("当前浏览器较老，请升级到最新版本或者更换浏览器！");
            }else{
                self._uploadInputBtn[0].addEventListener('change', readFile, false);
            }
            function readFile(){
                var file = this.files[0];
                console.log(file);
                if(!/image\/\w+/.test(file.type)){
                    alert("文件必须为图片！");
                    return false;
                }
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function(e){
                    self.buildBox(this.result);
                }
            }
        },
        //生成容器
        buildBox:function(src){
            var self=this;
            self._imgBox.empty();
            self._img=new Image();
            self._img.src = src;

            var $canvas=$('<canvas width="' + self._box_width  + '" height="' + self._box_height + '"></canvas>');
            self._imgBox.append($canvas);
            // var getCtx=

        },
        save:function(){
            saveCallBack && saveCallBack();
        }
    }
    window.Imgupload = Imgupload;
}(jQuery);
