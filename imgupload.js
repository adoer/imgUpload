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

        _$canvas:null,
        _$canvasW:null,
        _$canvasH:null,
        _$canvas2d:null,

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
                    self.bindCanvas();
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
                self._$canvasW=self._box_width-parseInt(self._imgBox.css("border-width"))*2;
                self._$canvasH=self._box_width-parseInt(self._imgBox.css("border-width"))*2;
                self._$canvas =$('<canvas ' +
                            'width="' + self._$canvasW  + '"height="' + self._$canvasH + '">' +
                        '</canvas>');
                self._imgBox.append(self._$canvas);
                self._$canvas.ctx = self._$canvas[0].getContext('2d');
                self._$canvas.ctx.drawImage(self._img, self._$canvasW/2-self._img.width/2, self._$canvasH/2-self._img.height/2, self._img.width, self._img.height);

                // 绘制canvas上的遮罩层
                self.drwaShade();
            }
        },

         //清除画布
        clearCanvas:function () {
            this._$canvas.ctx.clearRect(0, 0, this._$canvasW,this._$canvasH);
        },
        // 绘制canvas上的遮罩层
        drwaShade:function(){
            this._$canvas.ctx.beginPath();
            this._$canvas.ctx.fillStyle="rgba(0,0,0,0.3)";
            this._$canvas.ctx.fillRect(0, 0, this._$canvasW, this._$canvasH);
        },

        //绑定_$canvasDown 鼠标滚动图片 放大缩小, a按下鼠标拖动
        bindCanvas:function(){
            var self=this;
            //放大缩小函数
            function zoomInOut(setSize,zoomFlag){
                var size=zoomFlag===true?setSize:-setSize;
                var imgW=self._img.width+size;
                var imgH=imgW/self._imgScale;
                self._img.width=imgW;
                self._img.height=imgH;
                var imgX=0,imgY;
                if(imgW<self._$canvasW){
                    imgX=(self._$canvasW-imgW)/2;
                    imgY=(self._$canvasH-imgH)/2;
                }else{
                    imgX=-(imgW-self._$canvasW)/2;
                    imgY=-(imgH-self._$canvasH)/2;
                }
                // 清除上一次绘制的图片区域
                self.clearCanvas();
                //绘制新的图片区域
                self._$canvas.ctx.drawImage(self._img,imgX,imgY,imgW,imgH);
                // 绘制canvas上的遮罩层
                self.drwaShade();
            }
            // jquery 兼容的滚轮事件
            $(document).on("mousewheel DOMMouseScroll",''+self._imgBox.selector+'', function (e) {

                var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox

                if (delta > 0) {
                    // 向上滚
                    zoomInOut(10,true);
                } else if (delta < 0) {
                    // 向下滚
                    console.log("wheeldown");
                    zoomInOut(10,false);
                }
//                window.event.returnValue=false;
                return false;
            });

            var mouseTag=false;
            self._imgBox.mousedown(function(){
                mouseTag=true;
            });
            self._imgBox.mouseup(function(){
                mouseTag=false;
            });

            $(document).on("mousemove",''+self._imgBox.selector+'',function(e){
                if(!mouseTag) return false;
                console.log(e.pageX+":"+e.pageX);
            });

        },

        save:function(){
            saveCallBack && saveCallBack();
        }
    }
    window.Imgupload = Imgupload;
}(jQuery);
