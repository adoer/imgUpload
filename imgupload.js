+function($){
    "use strict";
    var Imgupload=function(opt,saveCallBack){
        this._imgBoxSize=opt.imgBoxSize;
        this._imgCropSize=opt.imgCropSize;
        this._imgPreSize=opt.previewBoxSize;
        this._uploadInputBtn=$(opt.uploadInputBtn);
        this._imgBox=$(opt.imgBox);
        this._previewBox=$(opt.previewBox);
        this._init();
    }
    Imgupload.prototype={
        constructor:Imgupload,
        _imgBoxSize:0,
        _imgBox:null,
        _previewBox:null,
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

        _$canvasPreview:null,
        _imgPreSize:0,
        _imgPre_sx:0,
        _imgPre_sy:0,
        _imgPreW:0,
        _imgPreH:0,

        _init:function (){
            var self=this;
            self.initCanvas();
            self.readFile();
            $("#save").click(function(){
                self.save();
            });
        },
        //初始化图片容器，预览容器
        initCanvas:function(){
            var self=this;
            //设置图片容器高宽
            self._imgBox.css({
                "width":self._imgBoxSize,
                "height":self._imgBoxSize
            });
            self._$canvasW=self._imgBoxSize;
            self._$canvasH=self._imgBoxSize;
            self._$canvas =$('<canvas ' +
                'width="' + self._$canvasW  + '"height="' + self._$canvasH + '">' +
                '</canvas>');
            self._imgBox.append(self._$canvas);
            self._$canvas.ctx = self._$canvas[0].getContext('2d');
            // 绘制canvas上的遮罩层
            self.drwaShade();

            //添加剪裁框 并绘制默认剪裁框
            self._$canvasCrop =$('<canvas ' +
                'width="' + self._imgCropSize  + '"height="' + self._imgCropSize + '">' +
                '</canvas>');
            self._imgBox.append(self._$canvasCrop);
            self._$canvasCrop.ctx = self._$canvasCrop[0].getContext('2d');

            self._$canvasCrop.ctx.beginPath();
            self._$canvasCrop.ctx.fillStyle="rgba(255,255,255,0.9)";
            self._$canvasCrop.ctx.fillRect(0, 0, self._imgCropSize, self._imgCropSize);

            // 绘制预览canvas
            self._$canvasPreview =$('<canvas ' +
                'width="' + self._imgPreSize  + '"height="' + self._imgPreSize + '">' +
                '</canvas>');
            self._previewBox.append(self._$canvasPreview);
            self._$canvasPreview.ctx = self._$canvasPreview[0].getContext('2d');

            self._$canvasPreview.ctx.beginPath();
            self._$canvasPreview.ctx.fillStyle="rgba(0,0,0,0.3)";
            self._$canvasPreview.ctx.fillRect(0, 0, self._imgPreSize, self._imgPreSize);
            //添加说明文字 预览框
            self._$canvasPreview.ctx.font="16px Microsoft YaHei";
            self._$canvasPreview.ctx.fillText("预览框",6,20);
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
        //生成预览图
        buildBox:function(src){
            var self=this;
            // self._imgBox.empty();
            self._img=new Image();
            self._img.src = src;
            self._img.onload=function(){
                self._imgScale=self._img.width/self._img.height;
                drawImg();
            };
            function drawImg() {
                // 检测图片的大小是否小于剪裁框 如果小于提示 并阻止下一步操作
                if(self._img.width<self._imgPreSize){
                    alert("图片宽度不能小于"+self._imgPreSize+"px");
                    return false;
                }
                if(self._img.height<self._imgPreSize){
                    alert("图片高度不能小于"+self._imgPreSize+"px");
                    return false;
                }

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

                //记录初始的self._img_sx self._img_sy
                self._img_sx=self._$canvasW/2-self._img.width/2;
                self._img_sy=self._$canvasW/2-self._img.height/2;
                //记录初始的图片宽高
                self._imgW=self._img.width;
                self._imgH=self._img.height;

                //清除画布
                self.clearCanvas();
                //绘制图片
                self._$canvas.ctx.drawImage(self._img, self._img_sx, self._img_sy, self._img.width, self._img.height);
                // 绘制canvas上的遮罩层
                self.drwaShade();

                // 绘制剪裁的canvas
                self.drawCanvasCrop();

                //绘制预览的canvas
                self.drawCanvasPreview();
            }
        },
         //清除画布
        clearCanvas:function () {
            if(this._$canvas){
                this._$canvas.ctx.clearRect(0, 0, this._$canvasW,this._$canvasH);
            }
            if(this._$canvasCrop){
                this._$canvasCrop.ctx.clearRect(0, 0, this._imgCropSize,this._imgCropSize);
            }
            if(this._$canvasPreview){
                this._$canvasPreview.ctx.clearRect(0, 0, this._imgPreSize, this._imgPreSize);
            }
        },
        // 绘制canvas上的遮罩层
        drwaShade:function(){
            this._$canvas.ctx.beginPath();
            this._$canvas.ctx.fillStyle="rgba(0,0,0,0.3)";
            this._$canvas.ctx.fillRect(0, 0, this._$canvasW, this._$canvasH);
        },

        //绘制预览的canvas
        drawCanvasPreview:function(){
            this._$canvasPreview.ctx.drawImage(this._img, this._imgCrop_sx, this._imgCrop_sy, this._img.width, this._img.height);
        },
        // 绘制剪裁的canvas
        drawCanvasCrop:function(){
            var self=this;
            self._imgCrop_sx=-((self._$canvasW - self._imgCropSize)/2-self._img_sx);
            self._imgCrop_sy=-((self._$canvasH - self._imgCropSize)/2-self._img_sy);
            if(self._img_sx<0){
                self._imgCrop_sx=-((self._$canvasW - self._imgCropSize)/2-self._img_sx)
            }
            if(self._img_sy<0){
                self._imgCrop_sy=-((self._$canvasH - self._imgCropSize)/2-self._img_sy);
            }
            self._$canvasCrop.ctx.drawImage(self._img, self._imgCrop_sx, self._imgCrop_sy, self._img.width, self._img.height);
        },
        //移动 或 者放大缩小 检测图片是否超出剪裁框
        checkCanvasXY:function(){
            var self=this;
            //检测_img_sx 不让图片移除剪裁框范围以内
            if((-self._img_sx+(self._$canvasW - self._imgCropSize)/2+self._imgCropSize)>self._imgW){
                self._img_sx=-(self._imgW-self._imgCropSize-(self._$canvasW - self._imgCropSize)/2);
            }
            if(self._img_sx>(self._$canvasW - self._imgCropSize)/2){
                self._img_sx=(self._$canvasW - self._imgCropSize)/2;
            }
            //检测_img_sy 不让图片移除剪裁框范围以内
            if((-self._img_sy+(self._$canvasH - self._imgCropSize)/2+self._imgCropSize)>self._imgH){
                self._img_sy=-(self._imgH-self._imgCropSize-(self._$canvasH - self._imgCropSize)/2);
            }
            if(self._img_sy>(self._$canvasH - self._imgCropSize)/2){
                self._img_sy=(self._$canvasH - self._imgCropSize)/2;
            }
        },
        //绑定_$canvasDown 鼠标滚动图片 放大缩小, 按下鼠标拖动
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
                    //缩小的时候进行检测 _img_sx _img_sy 以免让图片缩小到检测框大小以内
                    if(self._img_sx>=(self._$canvasW - self._imgCropSize)/2){
                        return false;
                    }
                    if((-self._img_sx+(self._$canvasW - self._imgCropSize)/2+self._imgCropSize)>=self._imgW){
                        return false;
                    }
                    if((-self._img_sy+(self._$canvasH - self._imgCropSize)/2+self._imgCropSize)>=self._imgH){
                        return false;
                    }
                    if(self._img_sy>=(self._$canvasH - self._imgCropSize)/2){
                        return false;
                    }

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
                // 绘制剪裁的canvas
                self.drawCanvasCrop();
                //绘制预览的canvas
                self.drawCanvasPreview();
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
                    // console.log(cX+"-"+cY);
                    //更新prevX prevY
                    prevX=e.pageX;
                    prevY=e.pageY;
                    //更新self._img_sx self._img_sy
                    self._img_sx+=cX;
                    self._img_sy+=cY;
                    // 检测_img_sx _img_sy 不让图片移除剪裁框范围以内
                    self.checkCanvasXY();
                    // 清除上一次绘制的图片区域
                    self.clearCanvas();
                    //绘制新的图片区域
                    self._$canvas.ctx.drawImage(self._img,self._img_sx,self._img_sy,self._imgW,self._imgH);
                    // 绘制canvas上的遮罩层
                    self.drwaShade();
                    // 绘制剪裁的canvas
                    self.drawCanvasCrop();
                    //绘制预览的canvas
                    self.drawCanvasPreview();
                }
            });
        },
        save:function(){
            var base64Url =this._$canvasPreview[0].toDataURL('image/jpeg');
            saveCallBack && saveCallBack(base64Url);
        }
    }
    window.Imgupload = Imgupload;
}(jQuery);
