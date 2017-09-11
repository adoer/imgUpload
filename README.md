# 图片剪裁上传
> 基于canvas图片剪裁，并上传base64码。支持本地预览、拖动、放大缩小等操作。
# 初始化
```javascript
    function saveCallBack(base64){
        $("#base64 img").attr("src",base64);
        //最终把此base64传给后端
        /**
         $.ajax({
                data: {
                    base64: base64
                }
            })
         **/
    }
    //    初始化
    var imgupload=new Imgupload({
        //选择文件按钮id
        uploadInputBtn:"#inputBtn",
        //预览容器id
        previewBox:"#previewImgBox",
        //容纳图片的容器id
        imgBox:"#imgBox",
        //容纳图片的容器大小设置
        imgBoxSize:350,
        //图片剪裁区域大小校设置
        imgCropSize:200,
        //剪裁图片预览容器大小
        previewBoxSize:200
    },saveCallBack);
```
*内部代码注释详细可根据需要修改*
# 演示地址
[演示地址](http://www.xerduo.com/2017/09/11/imgUpload/)
