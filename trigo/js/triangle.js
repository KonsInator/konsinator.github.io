class Triangle {
    constructor() {
        this.points = {"A": new Point(0, 100), "B": new Point(200, 100), "C": new Point(100, 0)};
        this.values = {
            "alpha": new Component("\\alpha", 45),
            "beta": new Component("\\beta", 45),
            "gamma": new Component("\\gamma", 90),
            "side_a": new Component("a", 141.4213562373095),
            "side_b": new Component("b", 141.4213562373095),
            "side_c": new Component("c", 200)
        };
    }

    getPoints() {
        return this.points;
    }

    setPoints(points) {
        this.points = points;
    }
    
    drawOn(canvas) {
        drawPointsOnCanvas(canvas, this.points, this.values);
    }
    
    draw() {
        resizeTriangleCanvas()
        eraseOldLabels();

        let canvas = document.getElementById("triangle-canvas");
        this.drawOn(canvas);  
    }

    adjustTo(vals) {
        let values = {};
        for (let key in vals) {
            values[key] = new Component(vals[key].symbol, vals[key].value);
        }

        if (!values["side_a"].isPresent()) {
            values["side_a"].value = 1;
            values["side_b"].value = new SineTheoremSide(values["beta"], values["alpha"], values["side_a"]).result();
            values["side_c"].value = new SineTheoremSide(values["gamma"], values["alpha"], values["side_a"]).result();
        }

        let A = new Point(0, 0);
        let B = new Point(values["side_c"].value, 0);
        let Cx = Math.cos(degToRad(values["alpha"].value))*values["side_b"].value;
        let Cy = Math.sin(degToRad(values["alpha"].value))*values["side_b"].value;
        let C = new Point(Cx, -Cy);
        this.points = {"A": A, "B": B, "C": C};
        this.values = values;
    }
}

function eraseOldLabels() {
    let labels = document.getElementsByClassName("triangle-label");
    const length = labels.length;
    for (let i = 0; i < length; i++) {
        labels[0].remove();
    }
}

function drawPointsOnCanvas(canvas, points, values) {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.strokeWeight = 5;
    let normPoints = normalizePointsOn(canvas.width, canvas.height, points);
    ctx.beginPath();
    movePenOnContextBetweenPoints(ctx, normPoints, values);
    ctx.stroke();
    inscribe(normPoints, values, ctx);
}

function inscribe(points, values, ctx) {
    if (values !== undefined) {
        drawAngles(points, values, ctx);

        let triangleDiv = document.getElementById("triangle-div");
        inscribeAngles(points, values, triangleDiv);
        inscribeSides(points, triangleDiv);
    }
}

function inscribeAngles(points, values, triangleDiv) {
    inscribeAngle(values.alpha, points.A, points.B, triangleDiv);
    inscribeAngle(values.beta, points.B, points.C, triangleDiv);
    inscribeAngle(values.gamma, points.C, points.A, triangleDiv);
}

function inscribeAngle(angleComp, point, rightmostAdjPoint, triangleDiv) {
    const distToPoint = 12;
    const angleFromPoint = -point.angleToRad(rightmostAdjPoint) + degToRad(angleComp.value)/2;
    const distX = Math.cos(angleFromPoint)*distToPoint;
    const distY = Math.sin(angleFromPoint)*distToPoint;
    const x = point.x - distX;
    const y = point.y + distY;

    triangleDiv.appendChild(createTriangleLabelAt(x, y, angleComp.symbol));
}

function inscribeSides(points, triangleDiv) {
    inscribeSide(values.side_a.symbol, points.B, points.C, triangleDiv);
    inscribeSide(values.side_b.symbol, points.C, points.A, triangleDiv);
    inscribeSide(values.side_c.symbol, points.A, points.B, triangleDiv);
}

function inscribeSide(symbol, point1, point2, triangleDiv) {
    const distToLine = 12;
    const angle = point2.angleToRad(point1)-Math.PI/2;
    const distX = Math.cos(angle)*distToLine;
    const distY = Math.sin(angle)*distToLine;
    const x = Math.abs(point1.x - point2.x)/2 + Math.min(point1.x, point2.x) + distX;
    const y = Math.abs(point1.y - point2.y)/2 + Math.min(point1.y, point2.y) + distY;

    triangleDiv.appendChild(createTriangleLabelAt(x, y, symbol));
}

function createTriangleLabelAt(x, y, symbol) {
    let label = document.createElement("div");
    label.className = "triangle-label";
    label.innerText = "\\("+symbol+"\\)";
    label.style.setProperty("--left", x);
    label.style.setProperty("--top", y);
    MathJax.typeset([label]);
    return label;
}

function drawAngles(points, values, ctx) {
    drawAngle(points.A, points.B, points.C, values.side_b.value, values.side_c.value, ctx);
    drawAngle(points.B, points.C, points.A, values.side_c.value, values.side_a.value, ctx);
    drawAngle(points.C, points.A, points.B, values.side_a.value, values.side_b.value, ctx);
}

function drawAngle(point, point2, point3, lengthOfSide2, lengthOfSide3, ctx) {
    const radius = Math.min(lengthOfSide2, lengthOfSide3)/(5*scale);
    const startAngle = degToRad(point.angleToDeg(point2));
    const endAngle = degToRad(point.angleToDeg(point3));
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, startAngle, endAngle, true);
    ctx.stroke();
}

function movePenOnContextBetweenPoints(ctx, points, values) {
    points.A.moveContextThere(ctx);
    points.B.drawLineThereOnContext(ctx);
    points.C.drawLineThereOnContext(ctx);
    points.A.drawLineThereOnContext(ctx);
}

var scale = 1;

function normalizePointsOn(maxW, maxH, points) {
    let r = Math.max(points.A.x, points.B.x, points.C.x);
    let l = Math.min(points.A.x, points.B.x, points.C.x);
    let t = Math.min(points.A.y, points.B.y, points.C.y);
    let b = Math.max(points.A.y, points.B.y, points.C.y);

    let actualW = r-l;
    let actualH = b-t;

    scale = Math.max(actualH/maxH, actualW/maxW);

    let normalized = {"A": undefined, "B": undefined, "C": undefined};
    for (let i in points) {
        let x = (points[i].x-l)/scale;
        let y = (points[i].y-t)/scale;
        normalized[i] = new Point(x, y);
    }

    return normalized;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    moveContextThere(ctx) {
        ctx.moveTo(this.x, this.y);
    }

    drawLineThereOnContext(ctx) {
        ctx.lineTo(this.x, this.y);
    }

    angleToRad(point) {
        const dy = this.y-point.y;
        const dx = this.x-point.x;
        return Math.atan(dy/dx)+(dx > 0 ? Math.PI : 0);
    }

    angleToDeg(point) {
        return radToDeg(this.angleToRad(point));
    }
}
