/**
 * Created by Ninad - SweetShot on 22-06-2016.
 */
var camera, scene, renderer; // scene is current scene
// Marker Format {object:obj , target:"string"} i.e. add property to object
// Scene add property markers
var scenes = [];
var infoNode,span;
var isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0;

// effects
var playZoomIn = false, playZoomOut = false;
var nextScene = null;
var sprite1;
var sprite2;
var imagePath = "textures/ring_sprite.png", imageHighlightedPath = "textures/ring_highlighted.png";
var spriteSize = 50;
init();
function init() {

    var container, player;

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
    camera.target = new THREE.Vector3( 0, 0, 0 );

    // Scene 1  Flag lvl1
    scene = ExplorerScene('textures/pics/4.jpg', 'lvl1', camera, window);
    sprite1 = Marker("lvl2",imagePath, imageHighlightedPath,[0, 0, 250], spriteSize,"Way to\n Amphitheatre");
    scene.addMarker(sprite1);
    scenes.push(scene);
    // end scene1

    scene = findScene("lvl1");

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    player = renderer.domElement;
    container.appendChild(player);
    //
    infoNode = createInfoNode();
    span = document.createElement('span');
    span.id='infoText';
    infoNode.hidden=true;
    infoNode.appendChild(span);
    container.appendChild(infoNode);
    console.log(infoNode);


    // Mouse event handlers
    {
        player.addEventListener('mousedown', onDocumentMouseDown, false);
        player.addEventListener('mousemove', onDocumentMouseMove, false);
        player.addEventListener('mouseup', onDocumentMouseUp, false);
        player.addEventListener('mousewheel', onDocumentMouseWheel, false);
        player.addEventListener('MozMousePixelScroll', onDocumentMouseWheel, false);
    }
    // Drag event handlers
    {
        player.addEventListener('dragover', function (event) {

            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';

        }, false);
        player.addEventListener('dragenter', function (event) {

            document.body.style.opacity = 0.5;

        }, false);
        player.addEventListener('dragleave', function (event) {

            document.body.style.opacity = 1;

        }, false);
        player.addEventListener('drop', function (event) {

            event.preventDefault();

            var reader = new FileReader();
            reader.addEventListener('load', function (event) {

                material.map.image.src = event.target.result;
                material.map.needsUpdate = true;

            }, false);
            reader.readAsDataURL(event.dataTransfer.files[0]);

            document.body.style.opacity = 1;

        }, false);
    }
    // Resize event handlers
    {
        window.addEventListener( 'resize', onWindowResize, false );
    }

    // Start app
    animate();

    // All Functions
    // Resize event function
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
    // Mouse event functions
    function onDocumentMouseDown(event) {

        event.preventDefault();

        isUserInteracting = true;

        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;

        // detect sprite click
        var name = scene.checkForMarker(event,"targetScene");
        console.log("warning"+name);
        if (name) {
            nextScene = findScene(name);
            if (nextScene != null) {
                console.log("No such scene:- " + name);
            }
            playZoomIn = true;
        }
    }

    function onDocumentMouseMove(event) {

        if (isUserInteracting === true) { // user has clicked on page element
            lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
        }
        else {
            var infoText = scene.checkForMarker(event,"textInfo");
            if(infoText){
                infoNode.hidden = false;
                infoNode.style.left=(event.pageX+10)+"px";
                infoNode.style.top=(event.pageY)+"px";
                span.innerText = infoText;
            }
            else{
                infoNode.hidden=true;
            }
        }
    }

    function onDocumentMouseUp(event) {

        isUserInteracting = false;

    }

    function onDocumentMouseWheel(event) {

        // WebKit

        if (event.wheelDeltaY) {

            camera.fov -= event.wheelDeltaY * 0.05;

            // Opera / Explorer 9

        } else if (event.wheelDelta) {

            camera.fov -= event.wheelDelta * 0.05;

            // Firefox

        } else if (event.detail) {

            camera.fov += event.detail * 1.0;

        }

        camera.updateProjectionMatrix();

    }
    // Graphics
    function animate() {

        requestAnimationFrame( animate );
        update();

    }

    function update() {
        // if zoom in i.e. end scene
        if (playZoomIn){
            camera.fov -= 3;

            if (camera.fov < 0){
                camera.fov = 0;
                playZoomIn = false;
                scene = nextScene;
                nextScene = null;
                playZoomOut = true;
            }
            camera.updateProjectionMatrix();
            renderer.render( scene, camera );
            return;
        }
        if (playZoomOut){
            camera.fov += 3;
            if (camera.fov > 60){
                camera.fov = 60;
                playZoomOut = false;
            }
            camera.updateProjectionMatrix();
            renderer.render( scene, camera );
            return;
        }

        // else
        if ( isUserInteracting === false ) {



        }
        var angles = windowLatLonToPhiTheta(lat, lon);
        lat = angles[2];
        var pos = rPhiThetaToXYZ(500 ,angles[0], angles[1]);
        camera.target.x = pos[0];
        camera.target.y = pos[1];
        camera.target.z = pos[2];
        camera.lookAt(camera.target);
        sprite1.position.set(camera.target.x, camera.target.y, camera.target.z);
        sprite1.reRotate();
        renderer.render( scene, camera );

    }


    // Helpers
    function findScene(name) {
        for( var z = 0; z < scenes.length; z++ ) {
            if (scenes[z].name === name){
                return scenes[z];
            }
        }
        return null;
    }

    /**
     * Converts latitude longitude to Phi and Theta with clipping of -85 to 85 for phi (vertical)
     * @param lat int latitude -90 to 90
     * @param lon int longitude -90 to 90
     * @return Array [phi, theta, lat] new lat for clipping ( prevents camera to go upside down)
     */
    function windowLatLonToPhiTheta(lat, lon) {
        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );
        return [phi, theta, lat];
    }

    /**
     *
     * @param position THREE.Mesh.position position in 3d space
     * @param radius number radius of Sphere
     * @returns [] lat and lon lat in -90 to 90 and lon in -180 to 180
     */
    function XYZtoLatLon(position, radius) {
        var lat = Math.acos(position.Y / radius); //theta
        var lon = Math.atan(position.X / position.Z); //phi
        return [lat, lon];
    }

    /**
     * Phi theta to XYZ
     * @param r radius of sphere
     * @param phi radians
     * @param theta radians
     * @returns [] x,y,z of object
     */
    function rPhiThetaToXYZ(r, phi, theta) {
        var x = r * Math.sin( phi ) * Math.cos( theta );
        var y = r * Math.cos( phi );
        var z = r * Math.sin( phi ) * Math.sin( theta );
        return [x, y, z];
    }

    function createInfoNode(){
        var  node  = document.createElement("div");
        node.id = 'infoNode';
        node.style.position = 'absolute';
        /*node.style.height='auto';
        node.style.width='auto';*/
        node.style["z-index"] = 1000;
        node.style["background"] = "#FFFFFF" ;
        return node;
    }

    function htmlToElement(html){
        var template = document.createElement("template");
        template.innerHTML = html;
        return template.content;
    }

    function rotateTargetAroundOrigin(deltaAlpha, deltaBeta, deltaGamma, position) {
        //var loc = [position.x, position.y, position.z];
        var loc = [0, 0, 250];
        var sinA = Math.sin(deltaAlpha), sinB = Math.sin(deltaBeta), sinC = Math.sin(deltaGamma);
        var cosA = Math.cos(deltaAlpha), cosB = Math.cos(deltaBeta), cosC = Math.cos(deltaGamma);
        var newPos = [0, 0, 0];
        newPos[0] = loc[0] * cosA * cosB + loc[1] * sinA * cosB +
            loc[2] * (-sinB);
        newPos[1] = loc[0] * (cosA * sinB * sinC - sinA * cosC) +
            loc[1] * (sinA * sinB * sinC + cosA * cosC) +
            loc[2] * cosB * sinC;
        newPos[2] = loc[0] * (cosA * sinB * cosC + sinA * sinC) +
            loc[1] * (sinA * sinB * cosC - cosA * sinC) +
            loc[2] * cosB * cosC;
        return newPos;
    }
}
