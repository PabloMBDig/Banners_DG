var cube = dhtml.byId(settings.cubeId);

function createPanels() {
    for (var i = 0, l = panels.length; i < l; i++) {
        var cubePanel = cube.appendChild(document.createElement('img'));
        cubePanel.src = panels[i].wallpaper;
        cubePanel.style.width = '100%';
        cubePanel.style.height = '100%';
        
        cubePanel.onclick = function() {
            if (!adfCube.isRotating) {
                if (panels[adfCube.realIndex - 1].clicktag) {
                    window.open(panels[adfCube.realIndex - 1].clicktag, panels[adfCube.realIndex - 1].target);
                }
            }
        };
    }
}
createPanels();

var adfCube = new Adf.Cube();
adfCube.init(settings);