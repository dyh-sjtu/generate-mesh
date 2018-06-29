let app = document.getElementById('app');
let draw = document.getElementById('draw');
let clear = document.getElementById('clear');
let start = document.getElementById('start');
let finish = document.getElementById('finish');
let WIDTH = 620;  // 画布宽度
let HEIGHT = 620;  // 画布高度
let STARTX = 10;  // 网格横向起始位置
let ENDX = WIDTH - STARTX;  // 网格横向终止位置
let STARTY = 10;  // 网格纵向起始位置
let ENDY = HEIGHT - STARTY;  // 网格纵向终止位置
let status = false;  // 是否初始化网格
let POINT_ARR;  // 所有的网格顶点 （horizontal_edge+1）*（vertical_edge+1）
let ExitPoint;  // 出口位置中心点
let MESH_CENTER_POINT;  // 所有的网格中心点  （horizontal_edge）*（vertical_edge）
let PERSON_POINT_INIT;  // 人群所在网格的中心点序号数组 [{i: 几行, j: 几列}]
let horizontal_edge;  // 横向网格数
let vertical_edge;  // 纵向网格数
let person_num;  // 房间的总人数
draw.onclick = function () {
	if (!status) {
		// 初始化参数
		horizontal_edge = parseInt(document.getElementById('horizontal_edge').value) || 10;
		vertical_edge = parseInt(document.getElementById('vertical_edge').value) || 10;
		person_num = parseInt(document.getElementById('person_num').value) || 1;
		if (person_num > horizontal_edge*vertical_edge) {
			alert('房间人数不能大于网格数');
			return;
		}
		let canvas = document.createElement("canvas");
		canvas.setAttribute('id', 'myCanvas');
		canvas.setAttribute('width', WIDTH);
		canvas.setAttribute('height', HEIGHT);
		app.appendChild(canvas);
		// 获得canvas画布
		let myCanvas = document.getElementById("myCanvas");
		let ctx = myCanvas.getContext("2d");
		
		// 生成所有的网格点
		POINT_ARR = generateMeshPoint();
		
		// 打印出所有的网格点
		showPointArr(POINT_ARR);
		
		// 绘制网格
		drawLine(POINT_ARR, ctx);
		
		// 随机生成出口中心点
		ExitPoint = generateExitPoint(ctx, (ENDX-STARTX)/horizontal_edge);
		
		// 生成每个网格中心点的势能
		MESH_CENTER_POINT = generateCenterPoint(POINT_ARR, ctx);
		
		// 生成网格中的人的随机位置
		PERSON_POINT_INIT = generate_person(MESH_CENTER_POINT, ctx);
		
		status = true;
		// start.setAttribute('disabled', 'false');  // 即使设置disabled=false, 按钮还是不可用的，需要把disbaled属性移除才可以
		start.removeAttribute('disabled');
	} else {
		alert("请先清除已有图形重新绘制!")
	}
};

clear.onclick = function () {
	if (status) {
		let canvas = document.getElementById('myCanvas');
		app.removeChild(canvas);
		status = false;
	} else {
		alert("请先绘制图形!")
	}
};

let SPEED;  // 移动速度
/**
 * 开始人群移动
 */
start.onclick = function () {
	finish.removeAttribute('disabled');
	SPEED = Number(document.getElementById('person_speed').value)|| 1;
	moveMesh(SPEED);
};

function moveMesh() {
	let PERSON_POINT_PROCESS = PERSON_POINT_INIT.slice();
	let ctx = document.getElementById('myCanvas').getContext("2d");
	PERSON_POINT_PROCESS.map((cur,index) => {
		window[`timer_${index}`] = setInterval(function () {
			let suroundPoint = generateSuroundPoint(cur);
			let nextPoint = minDistanceLine(suroundPoint);
			ctx.beginPath();
			ctx.moveTo(MESH_CENTER_POINT[cur.i][cur.j].x, MESH_CENTER_POINT[cur.i][cur.j].y);
			ctx.lineTo(MESH_CENTER_POINT[nextPoint.i][nextPoint.j].x, MESH_CENTER_POINT[nextPoint.i][nextPoint.j].y);
			ctx.strokeStyle = '#20f839';
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.closePath();
			cur = nextPoint;
			if (cur.j === PERSON_POINT_INIT[index].j && cur.i === PERSON_POINT_INIT[index].i) {
				clearInterval(window[`timer_${index}`]);
			}
		}, 1/SPEED*1000);
		
	})
}

/**
 * 暂停所有定时器
 */
finish.onclick=function () {
	for (let i = 0; i < person_num.length; i++) {
		clearInterval(window[`timer_${i}`]);
	}
};

/**
 * 打印出二维数组所有点
 * @param arr
 */
function showPointArr(arr) {
	arr.map((item, index) => {
		item.map((_item, _index) => {
			console.log('第' + (index + 1) * (_index + 1) + '个点 => ' + '[ x: ' + _item.x + ', y: ' + _item.y + ' ]')
		})
	})
}


/**
 * 绘制网格
 * @param arr
 * @param ctx
 */
function drawLine(arr, ctx) {
	ctx.beginPath();
	for (let i = 0; i <= vertical_edge; i++) {
		ctx.moveTo(arr[i][0].x, arr[i][0].y);
		ctx.lineTo(arr[i][horizontal_edge].x, arr[i][horizontal_edge].y)
	}
	for (let j = 0; j <= horizontal_edge; j++) {
		ctx.moveTo(arr[0][j].x, arr[0][j].y);
		ctx.lineTo(arr[vertical_edge][j].x, arr[vertical_edge][j].y)
	}
	//设置样式
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#F5270B";
	//绘制
	ctx.stroke();
	ctx.closePath();
}


/**
 * 生成网格点 horizontal_edge*vertical_edge
 * @returns {Array}
 */
function generateMeshPoint() {
	return Array.from({length: vertical_edge + 1}, (item, index) => {
		return Array.from({length: horizontal_edge + 1}, (_item, _index) => {
			_item = {
				x: STARTX + (ENDX - STARTX) / horizontal_edge * _index,
				y: STARTY + (ENDY - STARTY) / vertical_edge * index
			};
			return _item;
		})
	});
}


/**
 * 生成出口位置
 * @param ctx
 * @param exitLen
 * @returns {{x: number, y: number}}
 */
function generateExitPoint(ctx, exitLen) {
	let randomPointX = STARTX + Math.floor(Math.random()*horizontal_edge)*exitLen;
	// 获得canvas画布
	ctx.beginPath();
	ctx.moveTo(randomPointX, STARTY);
	ctx.lineTo(randomPointX + exitLen, STARTY);
	ctx.lineWidth = 5;
	ctx.strokeStyle = "#58A55c";
	ctx.lineCap = 'round';
	//绘制
	ctx.stroke();
	ctx.closePath();
	return {
		x: randomPointX + exitLen/2,
		y: STARTY,
		i: 0,
		j: (randomPointX-STARTX)/exitLen
	}
}


/**
 * 生成每个点中心位置的势能以及是否有人在这个网格内
 * @param arr
 * @param ctx
 * @returns {Array}
 */
function generateCenterPoint(arr, ctx) {
	let centerPointArr = [];
	for (let i = 0; i < vertical_edge; i++) {
		let temp  = [];
		for (let j = 0; j < horizontal_edge; j++) {
			let pointObj = {
				x: (arr[i][j].x + arr[i][j+1].x)/2,
				y: (arr[i][j].y + arr[i+1][j].y)/2, // 网格中心点坐标
				isFilled: false
			};
			pointObj.dis = Number(get_distance(ExitPoint, pointObj).toFixed(2));
			ctx.beginPath();
			//设置字体样式
			ctx.fillStyle="#0000FF";
			ctx.font = "10px 宋体";
			//绘制成矩形
			ctx.fillText(pointObj.dis, pointObj.x-10,pointObj.y+10);
			ctx.closePath();
			temp.push(pointObj)
		}
		centerPointArr.push(temp);
	}
	showPointArr(centerPointArr);
	return centerPointArr;
}


/**
 * 求出中心点距离出口的距离
 * @param point1
 * @param point2
 * @returns {number}
 */
function get_distance(point1, point2) {
	return Math.sqrt((point1.x - point2.x)*(point1.x - point2.x) + (point1.y - point2.y)*(point1.y - point2.y));
}


/**
 * 生成人群在网格的随机位置，位置以当前网格在网格二维数组的序号为准
 * @param arr
 * @param ctx
 * @returns {Array} [{i: 几行 , j: 几列}]
 */
function generate_person(arr, ctx) {
	// let img = new Image();
	// img.src = './timg.jpeg';
	// 生成随机位置的人
	let PERSON_POINT_INIT_ARR = [];
	let randomPoint;
	while(person_num > 0) {
		randomPoint = {i: Math.floor(Math.random()*horizontal_edge), j: Math.floor(Math.random()*vertical_edge)};
		while (arr[randomPoint.i][randomPoint.j].isFilled) {
			randomPoint = {i: Math.floor(Math.random()*horizontal_edge), j: Math.floor(Math.random()*vertical_edge)};
		}
		let centerPoint = arr[randomPoint.i][randomPoint.j];
		PERSON_POINT_INIT_ARR.push(randomPoint);
		centerPoint.isFilled = true;
		ctx.beginPath();
		ctx.arc(centerPoint.x, centerPoint.y, 5, 0, 2*Math.PI, true);
		ctx.fillStyle = '#93cfef';
		ctx.fill();
		ctx.closePath();
		// ctx.drawImage(img, arr[randomPoint.i][randomPoint.j].x-10, arr[randomPoint.i][randomPoint.j].y-10, 10, 10);
		person_num--;
	}
	return PERSON_POINT_INIT_ARR;
}


/**
 *
 * @param point 某个人所处网格的中心点位置 point{i: 几行, j: 几列}
 * @returns [{i: 几行, j: 几列}]
 */
function generateSuroundPoint(point) {
	let currentI = point.i;
	let currentJ = point.j;
	let pointArr = [];
	pointArr.push(
		{i: currentI-1, j: currentJ-1},
		{i: currentI-1, j: currentJ},
		{i: currentI-1, j: currentJ+1},
		{i: currentI, j: currentJ-1},
		{i: currentI, j: currentJ+1},
		{i: currentI+1, j: currentJ-1},
		{i: currentI+1, j: currentJ},
		{i: currentI+1, j: currentJ+1}
	);
	pointArr = pointArr.filter(item => {
		return item.i >= 0 && item.i <= horizontal_edge-1 && item.j >= 0 && item.j <= vertical_edge-1;
	});
	return pointArr;
}

/**
 * 返回当前点周围八个(有些局部点周围没有八个点，则不计入)点势能最低的点
 * @param pointArr [{i: 几行, j: 几列}]
 * @returns {*}
 */
function minDistanceLine(pointArr) {
	pointArr.sort((a,b) => {
		return MESH_CENTER_POINT[a.i][a.j].dis - MESH_CENTER_POINT[b.i][b.j].dis;
	});
	return pointArr[0];
}


