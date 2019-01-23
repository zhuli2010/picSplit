var gif_frames = 0,s_img,imglist=new Array(),imglist_crt=new Array(),imglista=new Array(),resizes,view,bgimgsrc,loadbox,slb,slwz;
var imglist_new=new Array();
var isDownLoad= false;
var progressWrapper = document.getElementById('progressWrapper');
var progressText = document.getElementById('progressWrapper');
function modifyDownLoad() {
  isDownLoad = !isDownLoad;
}
function readFile() {
    if(document.getElementById('import-gif').files.length<=0){return false;}
	imglist.splice(0,imglist.length);
	imglist_crt.splice(0,imglist_crt.length);
	imglista.splice(0,imglista.length);
  var file=document.getElementById('import-gif').files[0];
  console.log(file)
	if (/gif$/.test(file.type)) {
		progress('Loadging...');
		loadBuffer(file,
		function(buf) {
			progress('图片素材读取中...');
      var gif = new Gif();
      console.log(gif)
			gif.onparse = function() {
				progress('图片逐帧分解中...过程有点慢，一定耐心等待');
				setTimeout(function() {
					buildView(gif, file.name, true);
					//progress()
				},
				50)
			};
			gif.onerror = function(e) {
				progress();
				alert(e)
			};
			gif.onprogress = function(e) {
				progress('图片素材分析中...' + ((100 * e.loaded / e.total) | 0) + '%')
			};
			gif.parse(buf)
		},
		function(e) {
			alert(e)
		},
		function(e) {
			progress('载入中...' + ((100 * e.loaded / e.total) | 0) + '%')
		})
	} else {
		var file=document.getElementById('import-gif').files[0];
		//var file = this.files[0];
		if (!/image\/\w+/.test(file.type)) {
			alert("文件必须为图片！");
			return false
		}
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function(e) {
			s_img = new Image();
			s_img.src = this.result;
			// s_img.onload = function() {
			// 	reback(9999, s_img, s_img.width, s_img.height, 10)
			// }
		}
	}
}

function progress(msg){
  if(msg){
    progressWrapper.style.display='block';progressText.textContent=msg
  }
  else{
    progressWrapper.style.display='none';
  }
}
function loadBuffer(file,onload,onerror,onprogress){var fr;fr=new FileReader();fr.onload=function(){onload(this.result)};fr.onerror=function(){if(onerror){onerror(this.error)}};fr.onprogress=function(e){if(onprogress){onprogress(e)}};fr.readAsArrayBuffer(file)}
function buildView(gif, fname, preRender) {
 	var inub=0;
     var canvas_frame, context, frames;
     var canvas_sprite = new fabric.Canvas('merge');
     canvas_frame = document.createElement('canvas');  
     canvas_frame.width = gif.header.width;
     canvas_frame.height = gif.header.height;
     canvas_frame.title = 'w=' + canvas_frame.width + ' h=' + canvas_frame.height;
     context = canvas_frame.getContext('2d');
     frames = gif.createFrameImages(context, preRender, !preRender);
     gif_frames = frames.length;     
     frames.forEach(function(frame, i) {
         var canvas_frame;
         canvas_frame = document.createElement('canvas');
         var canvas_context=canvas_frame.getContext("2d");
         canvas_context.fillStyle="#FFFFFF";
         canvas_context.fillRect(0,0,canvas_frame.width,canvas_frame.height);
         canvas_context.fill();
         canvas_frame.width = frame.image.width;
         canvas_frame.height = frame.image.height;
         canvas_frame.getContext('2d').putImageData(frame.image, 0, 0);
         canvas_frame.title =i+ ':w=' + frame.image.width + ' h=' + frame.image.height + ' delay=' + frame.delay + ' disposal=' + frame.disposalMethod;
         if (frames.length > 1) {
            s_img=canvas_frame;
            imglist[inub]=new Array();
            imglist_new[inub]=s_img;
            imglist[inub][0]=s_img;
            imglist[inub][1]=frame.image.width;
            imglist[inub][2]=frame.image.height;
            imglist[inub][3]=frame.delay;
            imglist[inub][4]=frame.disposalMethod;
            inub+=1;
         } else {
        s_img=canvas_frame; 
		// reback(9999, s_img, s_img.width, s_img.height, 10)
        //     alert("你选择的GIF有结构性问题，请选择其它GIF");
         }
     });
     progress("正在整理图片素材...");
     console.log(imglist)
     var liStr = ''
     var time = new Date()
     imglist.forEach(
       (item,index) => {
         console.log(isDownLoad)
         if (window.isDownLoad) {
          Download(item[0],index + time.getTime());
         }
        liStr += "<li><img src='"+item[0].toDataURL("image/jpeg",1)+"' /></li>"
       }
     )
     document.getElementById('imgUL').innerHTML = liStr;

    //  if (frames.length > 1) {listimg();}
 }
 
 function base64Img2Blob(code){
 
  var parts = code.split(';base64,');

  var contentType = parts[0].split(':')[1];

  var raw = window.atob(parts[1]);

  var rawLength = raw.length;



  var uInt8Array = new Uint8Array(rawLength);



  for (var i = 0; i < rawLength; ++i) {

   uInt8Array[i] = raw.charCodeAt(i);

  }

console.log(contentType)

  return new Blob([uInt8Array], {type: contentType}); 

}

function downloadFile(fileName, content){

   

  var aLink = document.createElement('a');

  var blob = base64Img2Blob(content); //new Blob([content]);

   

  var evt = document.createEvent("HTMLEvents");

  evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错

  aLink.download = fileName;

  aLink.href = URL.createObjectURL(blob);

console.log(aLink)
  aLink.dispatchEvent(evt);

}      
function Download(d,index){
  //cavas 保存图片到本地  js 实现
  //------------------------------------------------------------------------
  //1.确定图片的类型  获取到的图片格式 data:image/Png;base64,......
  var type ='jpg';//你想要什么图片格式 就选什么吧
  var imgdata=d.toDataURL(type);
  //2.0 将mime-type改为image/octet-stream,强制让浏览器下载
  var fixtype=function(type){
      type=type.toLocaleLowerCase().replace(/jpg/i,'jpeg');
      var r=type.match(/png|jpeg|bmp|gif/)[0];
      return 'image/'+r;
  };
  imgdata=imgdata.replace(fixtype(type),'image/octet-stream');
  //3.0 将图片保存到本地
  var savaFile=function(data,filename)
  {
      var save_link=document.createElement('a');
      save_link.href=data;
      save_link.download=filename;
      var event=document.createEvent('MouseEvents');
      event.initMouseEvent('click',true,false,window,0,0,0,0,0,false,false,false,false,0,null);
      save_link.dispatchEvent(event);
  };
  var filename= index+'.'+type;
  //我想用当前秒是可以解决重名的问题了 不行你就换成毫秒
  savaFile(imgdata,filename);
}