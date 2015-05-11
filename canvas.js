/**
 * Created by xuan on 15-5-11.
 */
var img = [
    'images/4a64afb844d073c7ed28769df644a0e7.jpg',
    'images/c57641e644cdf7a65d9308adaf7315ee.jpg',
    'images/eb5c473900ed8f4778cc4ed7ed9044d9.jpg'
];

$(function () {
    "use strict";

    function PictureLab(canvasEl) {
        var ctx = canvasEl.getContext('2d'),
            imgsInLab = [],
            currentMiddleLine = 0,
            totalVirtualWidth = 0;
        this.buildImageObject = function buildImageObject(imgEl) {
            return {
                el: imgEl,
                width: 400,
                height: 300,
                relPosition: 0
            }
        };
        this.insertPicture = function insertPicture(imgEl) {
            var imgObj = this.buildImageObject(imgEl);
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
        function drawImgObj(imgObj, x, y, scale) {
            ctx.drawImage(imgObj.el, x, y, imgObj.width * scale, imgObj.height * scale);
        }

        function drawPictureLab() {
            ctx.globalAlpha = 1;
            if (imgsInLab.length == 0)
                return;
            var scale = 1;
            var iset = imgsInLab.slice(0, imgsInLab.length);
            iset.sort(function (a, b) {
                return Math.abs(a.relPosition - currentMiddleLine) -
                    Math.abs(b.relPosition - currentMiddleLine);
            });
            for (var i = iset.length - 1; i >= 0; --i) {
                scale = 1 - (Math.abs(iset[i].relPosition - currentMiddleLine) / totalVirtualWidth);
                drawImgObj(
                    iset[i],
                    ((iset[i].relPosition - currentMiddleLine) / totalVirtualWidth + 0.5) * 800,
                    (canvasEl.height - iset[i].height * scale) / 2,
                    scale);
            }
        }

        function draw() {
            currentMiddleLine++;
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            ctx.save();
            ctx.globalAlpha = 1;

            drawPictureLab();
            ctx.restore();
            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);
    }

    var canvasEl = document.getElementById('canvas');

    function resize_canvas() {
        canvasEl.width = document.documentElement.clientWidth;
        canvasEl.height = document.documentElement.clientHeight;
    }

    function insert_picture(src) {
        var imgEl = document.createElement('img');
        $(imgEl).on('load', function () {
            lab.insertPicture(imgEl);
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