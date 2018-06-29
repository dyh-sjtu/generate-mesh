let app = document.getElementById('app');
let draw = document.getElementById('draw');
let clear = document.getElementById('clear');
let WIDTH = 800;
let HEIGHT = 800;
let status = false;
draw.onclick = function () {
	if (!status) {
		let edgeNum = parseInt(document.getElementById('inregular_edge').value) || 4;
		console.log(edgeNum);
		let canvas = document.createElement("canvas");
		canvas.setAttribute('id', 'myCanvas');
		canvas.setAttribute('width', WIDTH);
		canvas.setAttribute('height', HEIGHT);
		app.appendChild(canvas);
		let myCanvas = document.getElementById("myCanvas");
		let ctx = myCanvas.getContext("2d");
		// ctx.moveTo(10, 10);
		// ctx.lineTo(200, 200);
		//设置对象起始点和终点
		let POINT_ARR = [];  // 储存图形绘制的所有顶点坐标
		let firstPoint = generate_endPoint(WIDTH, HEIGHT)
		let startX = firstPoint.x;
		let startY = firstPoint.y;
		POINT_ARR.push({
			x: startX,
			y: startY
		});
		let endX;
		let endY;
		for (let i = 0; i < edgeNum-1; i++) {
			ctx.moveTo(POINT_ARR[i].x, POINT_ARR[i].y);  // 设置起点
			// 终点属于随机生成，生成规则 generate_endPoint()
			// 将每一次划线的终点赋值给下一步作为起点
			let endPoint = generate_endPoint(WIDTH, HEIGHT);
			endX = endPoint.x;
			endY = endPoint.y;
			ctx.lineTo(endX, endY);
			startX = endX;
			startY = endY;
			POINT_ARR.push({x: startX, y: startY});
		}
		showPointArr(POINT_ARR);
		ctx.moveTo(POINT_ARR[edgeNum-1].x, POINT_ARR[edgeNum-1].y);
		ctx.lineTo(POINT_ARR[0].x, POINT_ARR[0].y);
		//设置样式
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#F5270B";
		//绘制
		ctx.stroke();
		status = true;
	} else {
		alert("请先清除已有图形重新绘制!")
	}
}

clear.onclick = function () {
	if (status) {
		let canvas = document.getElementById('myCanvas');
		app.removeChild(canvas);
		status = false;
	} else {
		alert("请先绘制图形!")
	}
};

/**
 * 产生处于画布内的随机点
 * @param width
 * @param height
 * @returns {{x: , y: }}
 */
function generate_endPoint(width, height) {
	// 只要改点在canvas画布内就行
	let gap = 5;
	width = width - gap*2;
	height = height - gap*2;  //保证点不在画布边框线上
	let point = {};
	point.x = Math.random()*width + gap;
	point.y = Math.random()*height + gap;
	return point
}


function showPointArr(arr) {
	arr.map((item, index) => {
		console.log("第" + (index+1) + "个点为" + "{x: " + item.x + "y: " + item.y + "}" );
	})
}

/**
 *
 * @param arr 所有点组合，不包括当前起点和终点
 * @param startPoint 当前起点
 * @param endPoint 当前终点
 * @returns {boolean} 返回当前连线是否与之前任意一条线段相交或重合
 */
function filterIntersectionLine(arr, startPoint, endPoint) {
	// 保证每一步生成的终点与上一个连成的线不与之前任意一条线段相交
	
	return false;
}