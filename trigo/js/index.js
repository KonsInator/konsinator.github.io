var triangle = new Triangle();

function init() {
    window.addEventListener("resize", onWindowResize);

    initFormulas();
    triangle.draw();
}

function onWindowResize() {
    triangle.draw()
}

function resizeTriangleCanvas() {
    let canvas = document.getElementById("triangle-canvas");
    let div = document.getElementById("triangle-div");
    canvas.width = div.offsetWidth-47;
}

// TODO: works but not used yet
function unsetTabIndices() {
    let mjContainers = document.getElementsByTagName("mjx-container");
    for (let  i = 0; i < mjContainers.length; i++) {
        mjContainers.item(i).tabIndex = "-1";
    }
}