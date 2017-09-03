+function($){
    "use strict";
    var Imgupload=function(opt,saveCallBack){
        this._box_width=opt.imgBoxSize;
        this._box_height=opt.imgBoxSize;
        this._uploadInputBtn=$(opt.uploadInputBtn);
        this._imgBox=$(opt.imgBox);
        this._previewImgBox=$(opt.previewImgBox);
        this._init();
    }
    Imgupload.prototype={
        constructor:Imgupload,
        _box_width:0,
        _box_height:0,
        _imgBox:null,
        _previewImgBox:null,
        _uploadInputBtn:null,
        _$canvasDown: null,
        _$canvasUp: null,
        _img:null,
        _imgScale:0,
        _imgCrop:{
            width:0,
            hieght:0,
            x:0,
            y:0
        },
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
            self._img.onload=function(){
                self._imgScale=self._img.width/self._img.height;
                drawImg();
            };
            function drawImg() {
                //设置drawImage 合适的 高宽使图片刚好不变形的显示在canvas内
                //检查图片尺寸 并调整以适应
                if(self._imgScale>1){
                    if(self._img.width>self._box_width){
                        self._img.width=self._box_width;
                        self._img.height=self._img.width/self._imgScale;
                    }
                }else{
                    if(self._img.height>self._box_height){
                        self._img.height=self._box_height;
                        self._img.width=self._img.height*self._imgScale;
                    }
                }
                //设置图片容器高宽
                self._imgBox.css({
                    "width":self._box_width,
                    "height":self._box_height
                });
                var canvasWidth=self._box_width-parseInt(self._imgBox.css("border-width"))*2;
                var canvasHeight=self._box_width-parseInt(self._imgBox.css("border-width"))*2;
                var $canvas=$('<canvas ' +
                            'width="' + canvasWidth  + '"height="' + canvasHeight + '">' +
                        '</canvas>');
                self._imgBox.append($canvas);
                var $ctx = $canvas[0].getContext('2d');
                $ctx.drawImage(self._img, canvasWidth/2-self._img.width/2, canvasHeight/2-self._img.height/2, self._img.width, self._img.height);
                //裁剪区域透明
                $ctx.beginPath();
                $ctx.fillStyle="rgba(0,0,0,0.4)";
                $ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                self._$canvasDown = $canvas;

            }
        },

        //绑定_$canvasDown 鼠标滚动放大 以及 鼠标按下拖动事件


        save:function(){
            saveCallBack && saveCallBack();
        }
    }
    window.Imgupload = Imgupload;
}(jQuery);
