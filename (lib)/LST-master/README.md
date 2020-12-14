# LST #

LST, short for **Layer Space Transforms**, is a utility class for Adobe After Effects, that helps calculating layers position in composition scope, very similar to `toWorld()` and `toComp()` methods available inside expressions.

## Why LST? ##

The old fashioned way to get layer coordinates in ExtendScript in composition scope, when it had a chain of parents, was to:
- create a temp layer in the composition,
- apply the expression to a temp layer that uses `toWorld()` method

```javascript
var targetLayer = thisComp.layer('TARGET LAYER');
targetLayer.toWorld(targetLayer.anchorPoint);
```

- read expression value and pass it back into ExtendScript,
- remove the junk layer.

That's not an ideal way to handle things in ExtendScript, especially in cases when the layer position depends on its index value.

That's where LST comes into play - it doesn't use any of this nonsense. LST logic is entirely based on matrix calculations and Model-View-Projection logic. This allows retrieving a layer's data in any scope - composition, as well as in a camera, no matter how many parents it has.

## API ##

* `LST.toComp(layer, offset);` Transforms a point from layer scope into composition scope.
* `LST.toWorld(layer, offset);` Transforms a point from layer scope into view-independent world scope.

The `offset` coordinates parameter is optional. If not provided, uses layers Anchor Point value. To get layers top-left corner coordinates, pass in `[0, 0, 0]`.

Both methods return 2 or 3 dimensional `Array`.

## Usage ##

[Download](https://github.com/rendertom/LST/archive/master.zip) the repository and include the class in your main script.

```javascript
// Include the class
#include 'LST.js'
```

### Case 1 ###

```javascript
// Get layers position in composition scope
var result = LST.toComp(layer);
```

### Case 2 ###

```javascript
// Get layers top-left point coordinate in composition scope
var result = LST.toComp(layer, [0, 0, 0]);
```

### Case 3 ###

```javascript
// Get layers position in composition scope and ignore active composition camera
var result = LST.toWorld(layer);
```
---

## Notes ##

LST assumes that the default **FILM SIZE** value is **36.00mm**, as there's no API in After Effects to retrieve this value. Also, when processing a 3D layer inside a composition that contains no active camera, the **FOCAL LENGTH** defaults to **50.00mm** (again, lack of API on AE's side to check if this value is different).

---

## Todo ##

* Get `scale` and `rotation` values of the projected layer.
* `fromComp()`: Transform a point from composition scope into layer scope. 
* `fromWorld()`: Transform a point from world scope into layer scope.

---

## Resources ##
* Three.js: https://github.com/mrdoob/three.js
* Interactive 3D Graphics course on Udacity: https://classroom.udacity.com/courses/cs291
* ModelViewProjection live demo: http://www.realtimerendering.com/udacity/transforms.html
* Foundations of 3D Rendering on Scratchapixel 2.0: https://www.scratchapixel.com/
* 3D Game Engine Programming: https://www.3dgep.com/understanding-the-view-matrix/
* World, View and Projection Transformation Matrices on Codinglabs: http://www.codinglabs.net/article_world_view_projection_matrix.aspx