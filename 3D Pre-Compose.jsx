/* Copyright (c) 2014 VideoCopilot */

var cameraCheckbox, lightsCheckbox, linkCameraCheckbox, linkLightsCheckbox, layerNameTextbox;

function LinkProperty(srcProp, dstProp, srcCompName, srcLayerName, propPath)
{
    if (!dstProp.canSetExpression)
        return;
    
    var exp = 'comp("' + srcCompName + '").layer("' + srcLayerName + '")' + (propPath ? '("' + propPath + '")' : "") + '("' + srcProp.name + '")';
    
    try     // Some properties are hidden and for some reason we can't set expressions on them. I couldn't find a way to check if a property is hidden, so we just skip it.
    {
        dstProp.expression = exp;
    }
    catch(err)
    {
        //Do nothing.
    }
}

function LinkPropertyGroups(srcPropGroup, dstPropGroup, srcCompName, srcLayerName, propPath)
{
    for (var i = 1; i <= dstPropGroup.numProperties; i++)
    {
        var dstProp = dstPropGroup.property(i);
        if (dstProp.name == "Marker")
            continue;
            
        var srcProp = srcPropGroup.property(dstProp.name);
        
        if (dstProp instanceof PropertyGroup)
            LinkPropertyGroups(srcProp, dstProp, srcCompName, srcLayerName, propPath);    //TODO: Concatenate propPath. Not needed if we only copy CameraLayer and LightLayer.
        else
            LinkProperty(srcProp, dstProp, srcCompName, srcLayerName, propPath);
    }
}

function PreCompose(linkCamera, linkLights, linkCameraProperties, linkLightsProperties)
{
    // BEGIN: Code duplication to be able to debug script. Doesn't  work if vars passed by argument.
    var curComp = app.project.activeItem;
    if (!curComp || !(curComp instanceof CompItem))
    {
            alert("Please select a Composition.");
            return;
    }

    var selectedLayer = curComp.selectedLayers[0];
    if (!selectedLayer)
    {
            alert("Please select a Layer.");
            return;
    }
    // END

    // Create array with selected layer indexes.
    var selectedLayersCount = getSize(curComp.selectedLayers);    
    var selectedIndexes = new Array(selectedLayersCount);
    var parents = new Array(selectedLayersCount);
    for (var i = 0; i < selectedLayersCount; i++)
    {
        selectedIndexes[i] = curComp.selectedLayers[i].index;
        parents[i] = curComp.selectedLayers[i].parent;
    }
    
    var nComp = curComp.layers.precompose(selectedIndexes, layerNameTextbox.text);
    
    for (var i = 0; i < selectedLayersCount; i++)
    {
        var parentLayer = parents[i];
        
        if (parentLayer)
        {
            parentLayer.copyToComp(nComp);
            var nParentLayer = nComp.layer(1);
            
            var mainLayer = nComp.layer(2);
            mainLayer.parent = nParentLayer;
        }
    }
    
    for (var i = 1; i <= curComp.numLayers; i++)
    {  
        var curLayer = curComp.layer(i);

        var layerFound = false;
        for (var j = 0; j < selectedLayersCount; j++)
        {
            if (i == selectedIndexes[i])
            {
                layerFound = true;
                break;
            }
        }
        if (layerFound)
            continue;
        
        if (!( (curLayer instanceof CameraLayer) || (curLayer instanceof LightLayer) ))
            continue;
            
        if ( ((curLayer instanceof CameraLayer) && !linkCamera) || ((curLayer instanceof LightLayer) && !linkLights) )
            continue;
            
        curLayer.copyToComp(nComp);
        var nLayer = nComp.layer(1);
            
        if ( !linkCameraProperties && (curLayer instanceof CameraLayer))
            continue;
                
        if ( !linkLightsProperties && (curLayer instanceof LightLayer))
            continue;
        
        for (var j = 1; j <= nLayer.numProperties; j++)
        {
            var prop = nLayer.property(j);
            if (prop.name == "Marker")
                continue;
            
            if (prop instanceof PropertyGroup)
                LinkPropertyGroups(curLayer.property(j), prop, curComp.name, curLayer.name, prop.name);
            else
                LinkProperty (curLayer.property(prop.name), prop);
        }
    }

    nComp.label = 9;    // Change color label to green.
}

function getSize(dictionary)
{
    var index = 0, key;
    for (key in dictionary)
    {
        if (dictionary.hasOwnProperty(key)) 
            index++;
    }

    return index;
}

function updateCheckboxes()
{
    linkCameraCheckbox.enabled = cameraCheckbox.value;
    linkLightsCheckbox.enabled = lightsCheckbox.value;
}

function main()
{
    var curComp = app.project.activeItem;
    if (!curComp || !(curComp instanceof CompItem))
    {
            alert("Please select a Composition.");
            return;
    }

    var selectedLayer = curComp.selectedLayers[0];
    if (!selectedLayer)
    {
            alert("Please select a Layer.");
            return;
    }

    var win = new Window("dialog", "3D Pre-Compose");
    win.margins.bottom = 5;
    win.alignChildren = "top";
    win.orientation = "column";
    
        var inputGroup = win.add("panel");
        inputGroup.alignment = "fill";
        inputGroup.text = "New Name:";
            
            layerNameTextbox = inputGroup.add("edittext", undefined, selectedLayer.name + " PreComp");
            layerNameTextbox.alignment = "fill";
        
        var checkGroup = win.add("panel");
        checkGroup.orientation = "row";
        checkGroup.text = "Pre-Compose:";
        
            var checkGroup1 = checkGroup.add("group");
            checkGroup1.orientation ="column";
            checkGroup1.alignChildren = "left";
            
                cameraCheckbox = checkGroup1.add("checkbox", undefined, "Camera");
                cameraCheckbox.value = true;
                cameraCheckbox.onClick = updateCheckboxes;
                
                lightsCheckbox = checkGroup1.add("checkbox", undefined, "Lights");
                lightsCheckbox.value = true;
                lightsCheckbox.onClick = updateCheckboxes;
        
            var checkGroup2 = checkGroup.add("group");
            checkGroup2.orientation ="column";
            checkGroup2.alignChildren = "left";
            
                linkCameraCheckbox = checkGroup2.add("checkbox", undefined, "Link Properties");
                linkCameraCheckbox.value = false;
                
                linkLightsCheckbox = checkGroup2.add("checkbox", undefined, "Link Properties");
                linkLightsCheckbox.value = false;
                
        var checkGroup3 = win.add("panel");
        checkGroup3.alignment = "fill";
        checkGroup3.text = "Options:";
        
            var keepOriginalLayerCheckbox = checkGroup3.add("checkbox", undefined, "Leave existing copy");
            keepOriginalLayerCheckbox.value = true;
        
        var buttonGroup = win.add("group");
        buttonGroup.orientation = "row";
        
            var okButton = buttonGroup.add("button", undefined, "OK");
            var cancelButton = buttonGroup.add("button", undefined, "Cancel");
            
        var checkGroup4 = win.add("group");
        checkGroup4.orientation = "row";
        checkGroup4.alignment = "right";
        checkGroup4.alignChildren = "right";
        
        var creditsLabel = checkGroup4.add("statictext", [86, 0, 200, 12], "© Video Copilot 2014");
        creditsLabel.graphics.foregroundColor = creditsLabel.graphics.newPen(creditsLabel.graphics.PenType.SOLID_COLOR, [0.2156, 0.7098, 0.8549], 1);
    
    if (win.show() == 1)
    {
        app.beginUndoGroup("Precompose");
        
        // Duplicate layers keeping the same names.
        if (keepOriginalLayerCheckbox.value)
        {
            var selectedLayersCount = getSize(curComp.selectedLayers);
        
            for (var i = 0; i < selectedLayersCount; i++)
            {
                var selectedLayer = curComp.selectedLayers[i];
                var duplicatedLayer = selectedLayer.duplicate();
                
                duplicatedLayer.name = selectedLayer.name;
                
                duplicatedLayer.moveAfter(curComp.selectedLayers[0]);
            }
        }
        
        PreCompose(cameraCheckbox.value, lightsCheckbox.value, linkCameraCheckbox.value, linkLightsCheckbox.value);
        
        app.endUndoGroup();
    }
}

main();
