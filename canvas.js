/**
 * Created by xuan on 15-5-11.
 */
var img = [
    'images/1.jpg',
    'images/2.jpg',
    'images/3.jpg'
];

$(function () {
    "use strict";

    function PictureLab(canvasEl) {
        var ctx = canvasEl.getContext('2d'),
            imgsInLab = [],
            currentMiddleLine = 0,
            totalVirtualWidth = 0;
        this.buildImageObject = function buildImageObject(imgEl, id) {
            return {
                id: id,
                el: imgEl,
                width: 400,
                height: 300,
                relPosition: 0
            }
        };
        this.insertPicture = function insertPicture(imgEl, id) {
            var imgObj = this.buildImageObject(imgEl, id);
            if (imgObj)
                imgsInLab.push(imgObj);
            this.refreshPosition();
        };
        this.refreshPosition = function refreshPosition() {
            var rp = 0;
            for (var i = 0; i < imgsInLab.length; i++) {
                imgsInLab[i].relPosition = rp;
                rp += imgsInLab[i].width;
            }
            totalVirtualWidth = rp;
        };
        function drawImgObj(imgObj, x, y, scale, higlight) {
            ctx.save();
            ctx.globalAlpha = higlight ? 1 : scale * scale;
            ctx.drawImage(imgObj.el, x, y, imgObj.width * scale, imgObj.height * scale);

            if (higlight) {
                for (var offset = 5; offset >= 0; --offset) {
                    ctx.globalAlpha = (11 - offset) / 20;
                    ctx.strokeStyle = "#0000ff";
                    ctx.strokeRect(x - offset, y - offset, imgObj.width * scale + 2 * offset, imgObj.height * scale + 2 * offset);
                }
            }
            ctx.restore();
        }

        function drawPictureLab() {
            if (imgsInLab.length == 0)
                return;
            var i,
                scale = 1,
                imgPosLeft,
                iset = imgsInLab.slice(0, imgsInLab.length);
            iset.sort(function (a, b) {
                return Math.abs(a.relPosition - currentMiddleLine) -
                    Math.abs(b.relPosition - currentMiddleLine);
            });

            for (i = iset.length - 1; i >= 0; --i) {
                scale = 1 - (Math.abs(iset[i].relPosition - currentMiddleLine) / totalVirtualWidth);
                imgPosLeft = (canvasEl.width - iset[i].width ) / 2 +
                (iset[i].relPosition - currentMiddleLine) * 0.25 / (scale * scale);
                if (imgPosLeft + iset[i].width < 0) {
                    iset[i].requeue = true;
                }
                drawImgObj(
                    iset[i],
                    imgPosLeft,
                    // ((iset[i].relPosition - currentMiddleLine) / totalVirtualWidth + 0.5) * 800,
                    (canvasEl.height - iset[i].height * scale) / 2,
                    scale,
                    scale > 0.9
                );
            }
            var requeue_list = [];
            imgsInLab = imgsInLab.filter(function (i) {
                if (i.requeue) {
                    if (delete i.requeue) {
                        requeue_list.push(i);
                        return false;
                    }
                }
                return true;
            });

            if (requeue_list.length > 0) {
                var adjust;
                adjust = imgsInLab[0].relPosition;
                for (i = 1; i < imgsInLab.length; i++) {
                    if (imgsInLab[i].relPosition < adjust) {
                        adjust = imgsInLab[i].relPosition;
                    }
                }
                imgsInLab.push.apply(imgsInLab, requeue_list);
                this.refreshPosition();
                currentMiddleLine -= adjust;
            }
        }

        this.draw = function draw() {
            currentMiddleLine++;
            ctx.globalAlpha = 1;

            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            ctx.save();
            drawPictureLab.apply(this);
            ctx.restore();
            requestAnimationFrame(this.draw);
        };
        this.draw = this.draw.bind(this);
        requestAnimationFrame(this.draw);
    }

    var canvasEl = document.getElementById('canvas');

    function resize_canvas() {
        canvasEl.width = document.documentElement.clientWidth;
        canvasEl.height = document.documentElement.clientHeight;
    }

    function insert_picture(src) {
        var imgEl = document.createElement('img');
        $(imgEl).on('load', function () {
            lab.insertPicture(imgEl, src);
        });
        $(imgEl).on('error', function () {
            alert(src + 'fail');
        });
        imgEl.src = src;
    }

    var lab = new PictureLab(canvasEl);
    $(window).on('resize', resize_canvas);
    resize_canvas();
    img.forEach(insert_picture);
});