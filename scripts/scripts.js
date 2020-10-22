// Init the canvas
var canvas = new fabric.Canvas('canvas', {
    width: 960,
    height: 540,
    backgroundColor: '#efefef',
    selection: true,
    selectionColor: 'transparent',
    selectionBorderColor: 'rgba(0,0,0,.3)',
    selectionDashArray: [1, 2],
    selectionLineWidth: 1
});

// Group default settings
fabric.Group.prototype.padding = 0;
fabric.Group.prototype.borderOpacityWhenMoving = 1;
fabric.Group.prototype.cornerSize = 9;
fabric.Group.prototype.cornerStyle = 'circle';
fabric.Group.prototype.hasControls = false;

// Rect default settings
fabric.Rect.prototype.padding = 0;
fabric.Rect.prototype.borderOpacityWhenMoving = 1;
fabric.Rect.prototype.cornerSize = 9;
fabric.Rect.prototype.cornerStyle = 'circle';
fabric.Rect.prototype.setControlVisible('mtr', false);

// Textbox default settings
fabric.Textbox.prototype.padding = 0;
fabric.Textbox.prototype.borderOpacityWhenMoving = 1;
fabric.Textbox.prototype.cornerSize = 9;
fabric.Textbox.prototype.cornerStyle = 'circle';
fabric.Textbox.prototype.setControlVisible('mtr', false);
fabric.Textbox.prototype.setControlVisible('mt', false);
fabric.Textbox.prototype.setControlVisible('mb', false);

// IText default settings
fabric.IText.prototype.padding = 0;
fabric.IText.prototype.borderOpacityWhenMoving = 1;
fabric.IText.prototype.cornerSize = 9;
fabric.IText.prototype.cornerStyle = 'circle';
fabric.IText.prototype.setControlVisible('mtr', false);
fabric.IText.prototype.setControlVisible('mt', false);
fabric.IText.prototype.setControlVisible('mb', false);
fabric.IText.prototype.setControlVisible('ml', false);
fabric.IText.prototype.setControlVisible('mr', false);

// Set the current mode
var mode = 'select';

// Get ref to the tools
var toolSet = document.querySelectorAll('.tool');

// Add click to the tools
for (var i = 0; i < toolSet.length; i++) {
    toolSet[i].addEventListener('click', (e) => { changeTool(e.target.id) }, false);
}

// Change the current tool
function changeTool(tool) {
    // Set the mode
    mode = tool;

    // Remove "active" class from all tools
    toolSet.forEach(element => {
        element.classList.remove('active')
    });

    // Add "active" class to current tool
    document.getElementById(mode).classList.toggle('active');

    // Update canvas options
    if(mode == 'select') {
        canvas.selection = true;
        canvas.defaultCursor = 'default';
    }
    if (mode == 'text') {
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
    }
    if (mode == 'rect') {
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
    }
}

var isDown = false;
var obj;
var origX;
var origY;

canvas.on('mouse:down', function (o) {
    isDown = true;

    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;

    // Create a new rect
    if (mode == 'rect') {
        obj = new fabric.Rect({
            left: origX,
            top: origY,
            width: pointer.x - origX,
            height: pointer.y - origY,
            fill: '',
            stroke: 'rgba(0,0,0,.3)',
            strokeWidth: 1,
            objectCaching: false
        });
        canvas.add(obj);
    }

    // Create a new Textbox
    if (mode == 'text') {
        obj = new fabric.Rect({
            left: origX,
            top: origY,
            width: pointer.x - origX,
            height: pointer.y - origY,
            fill: '',
            stroke: 'rgba(0,0,0,.3)',
            strokeWidth: 1,
            objectCaching: false
        });
        canvas.add(obj);
    }
});

canvas.on('mouse:move', function (o) {
    if (isDown) {
        var pointer = canvas.getPointer(o.e);

        if (mode == 'rect' || mode == 'text') {
            if (origX > pointer.x) {
                obj.set({ left: Math.abs(pointer.x) });
            }
            if (origY > pointer.y) {
                obj.set({ top: Math.abs(pointer.y) });
            }

            obj.set({ width: Math.abs(origX - pointer.x) });
            obj.set({ height: Math.abs(origY - pointer.y) });
        }

        canvas.renderAll();
    }
});

canvas.on('mouse:up', function (o) {
    isDown = false;

    // Set rect attrs
    if(mode == 'rect') {
        obj.set({ fill: '#D8D8D8' });
        obj.set({ stroke: '#979797' });
        obj.set({ strokeWidth: 2 });

        // Change the tool back to select
        changeTool('select');

        // Set active object
        canvas.setActiveObject(obj);
    }

    // Set text attrs
    if (mode == 'text') {
        // Get the coords and width of the drawn rect
        // Height is calculated automatically
        var drawnX = obj.left;
        var drawnY = obj.top;
        var drawnWidth = obj.width;

        // Clear the temporary rect
        canvas.remove(obj);

        // If the box is big enough
        if (drawnWidth > 5) {
            // Create a textbox
            obj = new fabric.Textbox('Textbox', {
                left: drawnX,
                top: drawnY,
                width: drawnWidth,
                fill: '#000000',
                objectCaching: false,
                textAlign: 'left',
                fontFamily: 'Helvetica',
                fontSize: 24,
                fontStyle: 'normal',
                fontWeight: 400
            });
        }
        else {
            // Create a text line
            obj = new fabric.IText('Text', {
                left: drawnX,
                top: drawnY,
                fill: '#000000',
                objectCaching: false,
                textAlign: 'left',
                fontFamily: 'Helvetica',
                fontSize: 24,
                fontStyle: 'normal',
                fontWeight: 400
            });
        }

        // Add to the canvas
        canvas.add(obj);

        // Change the tool back to select
        changeTool('select');

        // Select the text for editing
        obj.enterEditing().selectAll()
        obj.hiddenTextarea.focus();

        // Set active object
        canvas.setActiveObject(obj);
    }

    canvas.renderAll();

    // Set coordinates for proper mouse interaction
    var objs = canvas.getObjects();
    for (var i = 0; i < objs.length; i++) {
        objs[i].setCoords();
    }
});

canvas.on("object:scaling", function (e) {
    var target = e.target;

    if (target.type == 'rect') {
        var sX = target.scaleX;
        var sY = target.scaleY;
        target.width *= sX;
        target.height *= sY;
        target.scaleX = 1;
        target.scaleY = 1;
    }
});

document.addEventListener("keydown", event => {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    // console.log(event);
    const key = event.key;

    // Delete any selected objects
    if (key === "Backspace" || key === "Delete") {
        deleteObjects();
    }

    // Change to text tool
    if (key === "t") {
        changeTool('text');
    }

    // Change to rect tool
    if (key === "r") {
        changeTool('rect');
    }

    // Change to select tool
    if (key === "Escape") {
        // If already on the select tool
        // Deselect any selected objects
        if(mode == 'select') {
            canvas.discardActiveObject().renderAll();
        }
        else {
            changeTool('select');
        }
    }
});

// Delete selected objects
function deleteObjects() {
    // Get an array of the selected objects
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 0) {
        if (confirm('Are you sure?')) {
            // Deselect to remove bounding box
            canvas.discardActiveObject().renderAll();

            // Loop objects and remove
            activeObjects.forEach((object) => {
                canvas.remove(object);
            });
        }
    }
    else {
        console.log('No items selected.')
    }
}

/*
    IDEAS/TODO
    • Change text object scale to abs values
    • Deselect when changing tools
    • Create a palette for changing object attributes
    • Saving
    • Resizing
    • Copying to another canvas
    • Handle objects going off canvas
*/
