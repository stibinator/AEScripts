// @target aftereffects
app.beginUndoGroup("Shuffle Selected Layers");
var curComp = app.project.activeItem;
var theLayers= curComp.layers;
var selectedLayrs = [];
var unselectedLayers = [];
var unselectedIndexes = [];
for (i=1; i<= theLayers.length; i++){
    if (theLayers[i].selected){
        selectedLayrs.push(theLayers[i]);
     } else {
        unselectedLayers.push(theLayers[i]);
        unselectedIndexes.push(theLayers[i].index);
     }
 }
 
for (i = 0; i < selectedLayrs.length; i++) {
   r = Math.floor(Math.random() * selectedLayrs.length);
   if (selectedLayrs[r].index !== selectedLayrs[i].index){
      selectedLayrs[i].moveBefore(selectedLayrs[r]);
   }
}
var needsSorting = true;
// var sortCount =0;
while (needsSorting){
   needsSorting = false;
   // sortCount++;
   for (i = 0; i < unselectedLayers.length; i++){
      if (unselectedLayers[i].index < unselectedIndexes[i]){
         // alert("" + unselectedLayers[i].index + " was: " + unselectedIndexes[i] );
         unselectedLayers[i].moveAfter(curComp.layers[unselectedIndexes[i]]);
         needsSorting = true;
      } else if (unselectedLayers[i].index > unselectedIndexes[i]){
         unselectedLayers[i].moveBefore(curComp.layers[unselectedIndexes[i]]);
         needsSorting = true;
      }
   }
}
// alert(sortCount);
app.endUndoGroup();
