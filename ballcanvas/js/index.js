 var hh;
 window.onload = function() {
     var back = document.getElementById("back"),
         ctx = back.getContext("2d"),
         flag = '',
         moveTool = document.getElementsByClassName("move")[0],
         lineTool = document.getElementsByClassName("line")[0],
         reactTool = document.getElementsByClassName("react")[0],
         textTool = document.getElementsByClassName("text")[0],
         curveTool = document.getElementsByClassName("curve")[0],
         circleTool = document.getElementsByClassName("circle")[0],
         undoTool = document.getElementsByClassName("undo")[0],
         redoTool = document.getElementsByClassName("redo")[0],
         w = document.getElementsByClassName("bgi")[0].width,
         h = document.getElementsByClassName("bgi")[0].height,
         elemList = [moveTool, lineTool, reactTool, textTool, curveTool, circleTool],
         lineStack = new objStack,
         circleStack = new objStack,
         reactStack = new objStack,
         playerStack = new objStack,
         status = new statusStack;
     hh = status;
     //初始化画布
     (function init() {
         //左边工具栏功能控制
         function setShadow(ele) {
             for (var i = 0; i < elemList.length; i++) {
                 var cn = elemList[i].className,
                     index = 0;
                 if (cn.search(/\s/) == -1) {
                     index = cn.search(/\w$/g) + 1;
                 } else index = cn.search(/\s/g);
                 elemList[i].className = elemList[i].className.slice(0, index);
             }
             ele.className += ' active-tool';
         }
         for (var i = 0; i < elemList.length; i++) {
             elemList[i].addEvent('click', function move() {
                 setShadow(this);
                 var cn = this.className,
                     index = 0;
                 if (cn.search(/\s/) == -1) {
                     index = cn.search(/\w$/g) + 1;
                 } else index = cn.search(/\s/g);
                 flag = this.className.slice(0, index);
                 console.log(flag);
             })
         };
         ctx.canvas.width = w;
         ctx.canvas.height = h;
         undoTool.onclick = function() {
            for (var i = 0; i < elemList.length; i++) {
                 var cn = elemList[i].className,
                     index = 0;
                 if (cn.search(/\s/) == -1) {
                     index = cn.search(/\w$/g) + 1;
                 } else index = cn.search(/\s/g);
                 elemList[i].className = elemList[i].className.slice(0, index);
             };
             var sta = status.undo();
             if (sta) {
                 ctx.putImageData(sta, 0, 0);
             }

         };
         redoTool.onclick = function() {
            var sta = status.redo()
             if (sta) {
                 ctx.putImageData(sta, 0, 0);
             }
         }


         // function drag(f1, f2, f3) {
         //     this.mousedown = false;
         //     this.addEvent('mousedown', f1(e));
         //     this.addEvent('mousemove', f2(e));
         //     this.addEvent('mouseup', f3(e));
         // };
         //拖拽对象
         function drag() {
             var mousedown = false,
                 obj = {};
             back.onclick = null;
             back.onmousedown = function(e) {
                 var event = event || window.event;
                 var pos = canvasMousePos(back, event);
                 playerStack.status.forEach(function(pla) {
                     if (pla.inCircle(pos.x, pos.y)) {
                         mousedown = true;
                         obj = pla;
                     };
                 });
             };
             back.onmousemove = function(e) {
                 if (mousedown) {
                     var ev = e || window.e;
                     var pos = canvasMousePos(back, ev);
                     obj.move(pos.x, pos.y);
                     ctx.clearRect(0, 0, w, h);
                     for (var i = 0; i < lineStack.status.length; i++) {
                         lineStack.status[i].update();
                     };
                     for (var i = 0; i < playerStack.status.length; i++) {
                         playerStack.status[i].update();
                     };
                     obj.update();
                 }
             };
             back.onmouseup = function(e) {
                 mousedown = false;
                 var sta = ctx.getImageData(0, 0, w, h);
                 status.push(sta);
             };
         };

         // drag(s1);
         function circle() {
             var pos = {};
             back.onmousedown = null;
             back.onmousemove = null;
             back.onmouseup = null;
             back.onclick = function(e) {
                 var ev = e || window.e;
                 pos = canvasMousePos(back, ev);
                 var pla = new SoccerPlayer(ctx, pos.x, pos.y, 11, 2.5, 'blue', '6');
                 playerStack.push(pla);
                 var sta = ctx.getImageData(0, 0, w, h);
                 status.push(sta);
             };
         };

         function line() {
             var fullLine;
             var start = {},
                 mousedown = false,
                 end = {};
             back.onclick = null;
             back.onmousedown = function(e) {
                 var event = event || window.event;
                 start = canvasMousePos(back, event);
                 mousedown = true;
             };
             back.onmousemove = function(e) {
                 if (mousedown) {
                     var ev = e || window.e;
                     end = canvasMousePos(back, ev);
                     fullLine = new drawLine(ctx, start, end);
                     ctx.clearRect(0, 0, w, h);
                     for (var i = 0; i < lineStack.status.length; i++) {
                         lineStack.status[i].update();
                     };
                     for (var i = 0; i < playerStack.status.length; i++) {
                         playerStack.status[i].update();
                     };
                     fullLine.update();
                 };
             };
             back.onmouseup = function(e) {
                 mousedown = false;
                 lineStack.push(fullLine);
                 // if (fullLine) {
                 //     lineStack.push(fullLine);
                 // };
                 var sta = ctx.getImageData(0, 0, w, h);
                 status.push(sta);
             };
         };

         function text() {
             var pos = {};
             back.onmousedown = null;
             back.onmousemove = null;
             back.onmouseup = null;
             back.onclick = function(e) {
                 var event = event || window.event;
                 var pos = canvasMousePos(back, event);
                 playerStack.status.forEach(function(pla) {
                     if (pla.inCircle(pos.x, pos.y)) {
                         mousedown = true;
                         var inputText = document.getElementById("inputText");
                         inputText.style.display = 'block';
                         inputText.style.top = pos.x + 'px';
                         inputText.style.left = pos.y + 'px';
                         inputText.focus();
                         document.onkeydown = function(e) {
                             var ev = e || window.e;
                             if (e.keyCode == 13) {
                                 pla.text = inputText.value;
                                 inputText.style.display = 'none';
                                 ctx.clearRect(0, 0, w, h);
                                 pla.update();
                                 for (var i = 0; i < lineStack.status.length; i++) {
                                     lineStack.status[i].update();
                                 };
                                 for (var i = 0; i < playerStack.status.length; i++) {
                                     playerStack.status[i].update();
                                 };
                                 var sta = ctx.getImageData(0, 0, w, h);
                                 status.push(sta);
                             }
                         }
                     };
                 });
             };
         };

         function curve() {
             var count = 1,
                 start, ctrl, end;
             back.onmousedown = null;
             back.onclick = function(e) {
                 var ev = e || window.e;
                 if (count == 1) {
                     start = canvasMousePos(back, event);
                     count++
                 } else if (count == 2) {
                     ctrl = canvasMousePos(back, event);
                     count++
                 } else if (count == 3) {
                     end = canvasMousePos(back, event);
                     count = 0;
                     var curveLine = new drawLine(ctx, start, end, ctrl);
                     lineStack.push(curveLine);
                     var sta = ctx.getImageData(0, 0, w, h);
                     status.push(sta);
                 }
             }
         }
         back.onmouseover = function(e) {
             switch (flag) {
                 case 'move':
                     drag();
                     break;
                 case 'line':
                     line();
                     break;
                 case 'circle':
                     circle();
                     break;
                 case 'text':
                     text()
                     break;
                 case 'curve':
                     curve()
                     break;
                 default:

                     break;
             };
         }

         //获取鼠标在画布上的位置

         // function canvasMousePos(ele, event) {
         //     var x = getMousePos(event).x,
         //         y = getMousePos(event).y;
         //     return {
         //         x: x - ele.offsetParent.offsetLeft,
         //         y: y - ele.offsetParent.offsetTop
         //     }
         // }
         // back.addEvent('mousedown', function backdown(e) {
         //     console.log(new Date() + flag);
         //     var event = this.getEvent(e);
         //     switch (flag) {
         //         case 'line':
         //             var posX = canvasMousePos(this, event).x,
         //                 posY = canvasMousePos(this, event).y;
         //             back.addEvent('mousemove', function drawLine(e) {
         //                 if (flag == 'line') {
         //                     var event = this.getEvent(e),
         //                         x = canvasMousePos(this, event).x,
         //                         y = canvasMousePos(this, event).y
         //                     bctx.clearRect(posX, posY, x - posX, y - posY);
         //                     bctx.beginPath();
         //                     bctx.strokeStyle = 'black';
         //                     bctx.lineWidth = 1;
         //                     bctx.moveTo(posX, posY);
         //                     bctx.lineTo(x, y);
         //                     bctx.closePath();
         //                     bctx.stroke();
         //                     back.addEvent('click', function end() {
         //                         flag = ''
         //                     })
         //                 }

         //             });
         //             break;
         //         case 'circl':
         //             var posX = canvasMousePos(this, event).x,
         //                 posY = canvasMousePos(this, event).y;
         //             back.addEvent('mousedown', function drawLine(e) {
         //                 if (flag == 'circl') {
         //                     var event = this.getEvent(e),
         //                         x = canvasMousePos(this, event).x,
         //                         y = canvasMousePos(this, event).y
         //                     bctx.beginPath();
         //                     bctx.strokeStyle = 'black';
         //                     bctx.lineWidth = 1;
         //                     bctx.moveTo(posX + 20, posY);
         //                     bctx.arc(posX, posY, 20, 0, Math.PI * 2);
         //                     bctx.closePath();
         //                     bctx.stroke();
         //                     // back.addEvent('click', function end() {
         //                     flag = ''
         //                         // })
         //                 }

         //             });
         //             break;
         //         case 'text':
         //             var posX = canvasMousePos(this, event).x,
         //                 posY = canvasMousePos(this, event).y;
         //             back.addEvent('click', function drawLine(e) {
         //                 if (flag == 'text') {
         //                     var event = this.getEvent(e),
         //                         x = canvasMousePos(this, event).x,
         //                         y = canvasMousePos(this, event).y;
         // var inputText = document.getElementById("inputText");
         // inputText.style.display = 'block';
         // inputText.style.top = posY + 'px';
         // inputText.style.left = posX + 'px';
         // inputText.addEvent('blur', function text() {
         //     var value = inputText.value;
         //     bctx.strokeText(value, posX, posY);
         //     inputText.style.display = 'none';
         //     flag = '';
         // });
         //                     // back.addEvent('click', function end() {

         //                     // });
         //                 }

         //             });
         //             break;
         //         default:
         //             // statements_def
         //             break;
         //     }

         // });
     })()

 };