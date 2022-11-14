const canvas = document.getElementById("drawing")
const ctx = canvas.getContext("2d")

let screenWidth = document.body.clientWidth
let screenHeight = document.body.clientHeight 

canvas.width = screenWidth
canvas.height = screenHeight

window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();
window.addEventListener("resize", onWindowResize)
canvas.addEventListener("mousemove", onMouseMove)
canvas.addEventListener("mousedown", onMouseDown)
canvas.addEventListener("mouseup", onMouseUp)

// EVENT HANDLERS
function onWindowResize() {
    console.log("[EVENT] window resize: ", window.innerWidth, window.innerHeight)
}

function onMouseMove(event) {
}

function onMouseDown(event) {
}

function onMouseUp(event) {
}

function getShapeData(shape) {
    switch(shape.toLowerCase()) {
        case "heart":
            let data = [];
            let i = 0;
            for(i; i < 2*Math.PI; i += .2) {
                data.push({
                    x: screenWidth / 2 + 180 * Math.pow(Math.sin(i), 3),
                    y: screenHeight / 2 + 10 * (-(15 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i)))
                })
            }
            return data
    }
}

function getColorStr(r, g, b, a) {
    H = 0;
    S = Math.random() * 40 + 60;
    B = Math.random() * 60 + 20;
    return "hsla(" + Math.floor(H) + "," + Math.floor(S) + "%," + Math.floor(B) + "%,.6)"
    red = r == 0 ? 0:(!!r ? r:Math.floor(Math.random() * 255))
    green = g == 0 ? 0:(!!g ? g:Math.floor(Math.random() * 255))
    blue = b == 0 ? 0:(!!b ? b:Math.floor(Math.random() * 255))
    alpha = a == 0  ? 0:(!!a ? a:1)
    return`rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function Point(x, y, points, pointIdx, movingDistance, direction, radius, tailLength, color) {
    this.x = x;
    this.y = y;
    this.points = points;
    this.pointIdx = pointIdx;
    this.direction = direction;
    this.color = color;
    this.velocityPercent = Math.random() * 0.2 + 0.7;
    this.radius = radius;
    this.movingDistance = movingDistance;
    this.tailLength = tailLength
    this.tail = [] 
}
Point.prototype.init = function() {
    this.stepX = 0;
    this.stepY = 0;

    let k = 0;
    this.tail = [];
    while(k < this.tailLength) {
        this.tail[k++] = {
            x: this.x,
            y: this.y
        }
    }
}
Point.prototype.updateCoordinate = function() {
    let distanceX = this.x - this.points[this.pointIdx].x;
    let distanceY = this.y - this.points[this.pointIdx].y;
    let distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)); 

    // calculate distance to move
    this.stepX += -distanceX / distance * this.movingDistance;
    this.stepY += -distanceY / distance * this.movingDistance;

    this.x += this.stepX;
    this.y += this.stepY;

    this.stepX *= this.velocityPercent;
    this.stepY *= this.velocityPercent;

    //update tail
    var k = 0, T, N;

    while(k < this.tailLength - 1) {
        T = this.tail[k];
        N = this.tail[++k];

        N.x -= (N.x - T.x) * .7;
        N.y -= (N.y - T.y) * .7;
    }
}
Point.prototype.isClose = function() {
    let distanceX = this.x - this.points[this.pointIdx].x;
    let distanceY = this.y - this.points[this.pointIdx].y;
    let distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)); 
    return distance < 10
}
Point.prototype.render = function() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, 1);
    ctx.closePath();
    ctx.fill();
}

function Shape(pointData) {
    this.pointData = pointData
    this.points = []
}

Shape.prototype.init = function() {
    this.pointData.forEach((p, i) => {
        p = new Point(
            0, 0,
            this.pointData, i,
            1, Math.sign(Math.random() * 2 - 1), 2, this.pointData.length,
            getColorStr(255, Math.random() * 50, Math.random() * 50, 0.6)
        )
        p.init()
        this.points.push(p)
    })
}

Shape.prototype.updatePoints = function() {
    this.points.forEach(p => {
        if (p.isClose()) {
            // 5% chance to swith to new target
            if(Math.random() > .95) {
                p.pointIdx = Math.floor(Math.random() * this.pointData.length);
            } else {
                // 1% chance to go back
                if(Math.random() > .99) p.direction *= -1;
                // other else go to next point
                p.pointIdx += p.direction;
                p.pointIdx %= p.points.length;
                if(p.pointIdx < 0) p.pointIdx += p.points.length;
            }
        }
        p.updateCoordinate()
    }) 
}
Shape.prototype.render = function() {
    // ctx.fillStyle = "white"
    // this.pointData.forEach(p => {
    //     ctx.fillRect(p.x, p.y, 5, 5)
    // })
    this.points.forEach(p => p.render())
}

heartShape = new Shape(getShapeData("heart"));
heartShape.init()
console.log(heartShape)

function loop() {
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    heartShape.updatePoints()
    heartShape.render()
}

(function runapp() {
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    window.requestAnimationFrame(runapp);
    loop();
})();