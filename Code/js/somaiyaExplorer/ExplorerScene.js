/**
 * Created by Ninad - SweetShot on 22-06-2016.
 */

/**
 * @param imagePath String path to the image of the sprite.
 * @param camera THREE.Camera camera used to render the screen
 **/
var raycaster = new THREE.Raycaster();

function ExplorerScene(imagePath, name, camera, window ){


    var scene = new THREE.Scene();
    scene.name = name;
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.scale( -1, 1, 1 );

    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(imagePath)
    } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    scene.markers =[];

    scene.addMarker = function(marker){
        scene.markers.push(marker);
        scene.add(marker);
    };
    scene.currentHighlightedMarker = null;
    scene.checkForMarker = _checkForMarker;
    return scene;
}
/**
 * @param event EventSystem.Event mouse event generated
 * @param attr string returns attribute of marker
 * @returns name of the scene to load if hit else null
 * @private
 */
function _checkForMarker(event, attr) {
    raycaster.setFromCamera(new THREE.Vector2(( event.clientX / window.innerWidth ) * 2 - 1,
        -( event.clientY / window.innerHeight ) * 2 + 1), camera);

    var intersects = raycaster.intersectObjects(scene.children);
    if (this.currentHighlightedMarker) {
        this.currentHighlightedMarker.material = this.currentHighlightedMarker.materialNormal;
        this.currentHighlightedMarker.scale.set(1, 1, 1);
    }

    for( var k = 0; k < intersects.length; k++ ) {
        var i = intersects[k];
        if (_contains(scene.markers, i.object)) {
            console.log("nextScene is " + i.object.targetScene);
            i.object.material = i.object.materialHighlight;
            this.currentHighlightedMarker = i.object;
            i.object.scale.set(1.7, 1.7, 1.7);
            return i.object[attr];
        }
    }


    return null;
}
/**
 * checks of list contains object
 */
function _contains(list, object){
    for(var i =0; i<list.length; i++){
        if(list[i].id === object.id) {
            return true;
        }
    }
    return false;
}