/**
 * Created by Ninad - SweetShot on 22-06-2016.
 */
/**
 * @param target String name of the target scene to be loaded on click
 * @param imagePath String path to the image of the sprite.
 * @param imageHighlightPath String path to the image of the sprite hover
 * @param position array containing x, y, z position of the marker
 * @param size int size of marker
 * @param textInfo information about text to be displayed on hover
 * @return THREE.Mesh object which can be placed in scene.
 * **/
function Marker(target, imagePath, imageHighlightPath, position, size, textInfo) {
    //
    var geometry = new THREE.PlaneGeometry(size,size);
    geometry.scale( 1, 1, 1 );

    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(imagePath),
        side: THREE.DoubleSide
    } );
    material.transparent = true;

    var materialHighlight = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(imageHighlightPath),
        side: THREE.DoubleSide
    } );
    materialHighlight.transparent = true;

    var mesh = new THREE.Mesh( geometry, material );
    mesh.materialNormal = material;
    mesh.materialHighlight = materialHighlight;
    
    mesh.position.set(position[0], position[1] , position[2]);
    var originRotation = LootAtOrigin(mesh.position);
    mesh.rotation.set(originRotation[0],originRotation[1],originRotation[2]);
    mesh.targetScene = target;
    mesh.textInfo = textInfo;

    mesh.reRotate = function () {
        var originRotation = LootAtOrigin(mesh.position);
        mesh.rotation.set(originRotation[0],originRotation[1],originRotation[2]);
    }
    return mesh;
}
/**
 * @param pos THREE.position position of the object.
 * @return array containing angles required to look at origin.
 **/
function LootAtOrigin(pos) {
    var rotx = -Math.atan2( pos.y, pos.z )
    var roty = Math.atan2( pos.x * Math.cos(rotx), pos.z )
    var rotz = Math.atan2( Math.cos(rotx), Math.sin(rotx) * Math.sin(roty) )

    return [rotx,roty,rotz];

}
