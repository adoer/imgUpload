+function($){
    "use strict";
    var Imgupload=function(opt,saveCallBack){
        this._imgBoxSize=opt.imgBoxSize;
        this._imgCropSize=opt.imgCropSize;
        this._uploadInputBtn=$(opt.uploadInputBtn);
        this._imgBox=$(opt.imgBox);
        this._previewImgBox=$(opt.previewImgBox);
        this._init();
    }
    Imgupload.prototype={
        constructor:Imgupload,
        _imgBoxSize:0,
        _imgBox:null,
        _previewImgBox:null,
        _uploadInputBtn:null,

        _$canvas:null,
        _$canvasW:0,
        _$canvasH:0,
        _$canvas2d:null,

        _imgScale:0,

        _img:null,
        //剪裁的x y坐标
        _img_sx:0,
        _img_sy:0,
        // 图片的高宽
        _imgW:0,
        _imgH:0,

        _imgCropSize:0,
        _$canvasCrop:null,
        _imgCrop_sx:0,
        _imgCrop_sy:0,
        _imgCropW:0,
        _imgCropH:0,

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
                    if(self._img.width>self._imgBoxSize){
                        self._img.width=self._imgBoxSize;
                        self._img.height=self._img.width/self._imgScale;
                    }
                }else{
                    if(self._img.height>self._imgBoxSize){
                        self._img.height=self._imgBoxSize;
                        self._img.width=self._img.height*self._imgScale;
                    }
                }
                //设置图片容器高宽
                self._imgBox.css({
                    "width":self._imgBoxSize,
                    "height":self._imgBoxSize
                });
                self._$canvasW=self._imgBoxSize-parseInt(self._imgBox.css("border-width"))*2;
                self._$canvasH=self._imgBoxSize-parseInt(self._imgBox.css("border-width"))*2;
                self._$canvas =$('<canvas ' +
                            'width="' + self._$canvasW  + '"height="' + self._$canvasH + '">' +
                        '</canvas>');
                self._imgBox.append(self._$canvas);
                self._$canvas.ctx = self._$canvas[0].getContext('2d');

                //记录初始的self._img_sx self._img_sy
                self._img_sx=self._$canvasW/2-self._img.width/2;
                self._img_sy=self._$canvasW/2-self._img.height/2;
                //记录初始的图片宽高
                self._imgW=self._img.width;
                self._imgH=self._img.height;

                //绘制图片
                self._$canvas.ctx.drawImage(self._img, self._img_sx, self._img_sy, self._img.width, self._img.height);
                // 绘制canvas上的遮罩层
                self.drwaShade();

                //添加剪裁框 并绘制剪裁图像
                self._$canvasCrop =$('<canvas ' +
                    'width="' + self._imgCropSize  + '"height="' + self._imgCropSize + '">' +
                    '</canvas>');
                self._imgBox.append(self._$canvasCrop);
                self._$canvasCrop.ctx = self._$canvasCrop[0].getContext('2d');
                self._$canvasCrop.ctx.beginPath();
                self._$canvasCrop.ctx.fillStyle="rgba(224,57,224,0.3)";
                self._$canvasCrop.ctx.fillRect(0, 0, self._imgCropSize, self._imgCropSize);

                self._imgCrop_sx=-((self._$canvasW - self._imgCropSize)/2-self._img_sx);
                self._imgCrop_sy=-((self._$canvasH - self._imgCropSize)/2-self._img_sy);
                if(self._img_sx<0){
                    self._imgCrop_sx=(self._$canvasW - self._imgCropSize)/2+self._img_sx
                }
                if(self._img_sy<0){
                    self._imgCrop_sy=(self._$canvasH - self._imgCropSize)/2+self._img_sy;
                }
                self._$canvasCrop.ctx.drawImage(self._img, self._imgCrop_sx, self._imgCrop_sy, self._img.width, self._img.height);
            }
        },

         //清除画布
        clearCanvas:function () {
            this._$canvas.ctx.clearRect(0, 0, this._$canvasW,this._$canvasH);
            this._$canvasCrop.ctx.clearRect(0, 0, this._imgCropSize,this._imgCropSize);
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
                var size;
                if(zoomFlag===true){
                    size=setSize;
                    self._img_sx=self._img_sx-setSize/2;
                    self._img_sy=self._img_sy-setSize/2;
                }else{
                    size=-setSize;
                    self._img_sx=self._img_sx+setSize/2;
                    self._img_sy=self._img_sy+setSize/2;
                }
                self._imgW=self._img.width+size;
                self._imgH=self._imgW/self._imgScale;
                self._img.width=self._imgW;
                self._img.height=self._imgH;

                // 清除上一次绘制的图片区域
                self.clearCanvas();
                //绘制新的图片区域
                self._$canvas.ctx.drawImage(self._img,self._img_sx,self._img_sy,self._imgW,self._imgH);
                //绘制canvas上的遮罩层
                self.drwaShade();
                //绘制剪裁框

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
                    // console.log("wheeldown");
                    zoomInOut(10,false);
                }
//                window.event.returnValue=false;
                return false;
            });

            //绑定事件
            var mouseTag=false;
            //鼠标上一次的X,Y值用于实时计算鼠标移动的偏移量
            var prevX=0,prevY=0;
            self._imgBox.on({
                mousedown:function(e){
                    mouseTag=true;
                    //按下的时候记录第一个坐标值
                    prevX=e.pageX;
                    prevY=e.pageY;
                },
                mouseup:function(){
                    mouseTag=false;
                },
                //修复了 按下鼠标拖出元素外以后再次回来还是按下mousedown的状态
                //解决方案 鼠标移出元素外 那么就更改状态为mouseup状态
                mouseleave:function(){
                    mouseTag=false;
                },
                mousemove:function(e){
                    if(!mouseTag) return false;
                    //获取偏移量 重新绘制canvas
                    var cX=e.pageX-prevX;
                    var cY=e.pageY-prevY;
                    console.log(cX+"-"+cY);
                    //更新prevX prevY
                    prevX=e.pageX;
                    prevY=e.pageY;
                    //更新self._img_sx self._img_sy
                    self._img_sx+=cX;
                    self._img_sy+=cY;
                    // 清除上一次绘制的图片区域
                    self.clearCanvas();
                    //绘制新的图片区域
                    self._$canvas.ctx.drawImage(self._img,self._img_sx,self._img_sy,self._imgW,self._imgH);
                    // 绘制canvas上的遮罩层
                    self.drwaShade();

                    self._imgCrop_sx=-((self._$canvasW - self._imgCropSize)/2-self._img_sx);
                    self._imgCrop_sy=-((self._$canvasH - self._imgCropSize)/2-self._img_sy);
                    if(self._img_sx<0){
                        self._imgCrop_sx=-((self._$canvasW - self._imgCropSize)/2+self._img_sx)
                    }
                    if(self._img_sy<0){
                        self._imgCrop_sy=-((self._$canvasH - self._imgCropSize)/2+self._img_sy);
                    }
                    self._$canvasCrop.ctx.drawImage(self._img, self._imgCrop_sx, self._imgCrop_sy, self._img.width, self._img.height);
                }
            });
        },

        save:function(){
            saveCallBack && saveCallBack();
        }
    }
    window.Imgupload = Imgupload;
}(jQuery);
