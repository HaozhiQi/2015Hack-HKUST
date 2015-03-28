

function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
};

document.getElementById('button-save').addEventListener('click', function() {
    downloadCanvas(this, 'main-canvas', 'test.jpg');
}, false);
