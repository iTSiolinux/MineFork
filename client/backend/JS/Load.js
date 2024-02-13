// some utillty needed functions
const scale = 64,
    // code that generating ID to get diffrences each object
    genUUID = () => {
        return "0000-0000-0000-0000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },
    // checking if there is collison between two objects.
    isColliding = (o, o2) => {
        // Calculate bounding box coordinates for both objects
        const oBorders = {
            left: o.POS.x - o.w / 2,
            right: o.POS.x + o.w / 2,
            top: o.POS.y - o.h / 2,
            bottom: o.POS.y + o.h / 2
        }

        const oBorders2 = {
            left: o2.POS.x - o2.w / 2,
            right: o2.POS.x + o2.w / 2,
            top: o2.POS.y - o2.h / 2,
            bottom: o2.POS.y + o2.h / 2
        };

        // Check for horizontal overlap
        const horizontalOverlap = oBorders.left < oBorders2.right && oBorders.right > oBorders2.left;

        // Check for vertical overlap
        const verticalOverlap = oBorders.top < oBorders2.bottom && oBorders.bottom > oBorders2.top;

        // Return true if there is both horizontal and vertical overlap
        return horizontalOverlap && verticalOverlap;
    },
    // calculating distance between two objects using Pythagoras' theorem.
    distance = (o, o2) => {
        return Math.sqrt((o.POS.x - o2.POS.x) ** 2 + (o.POS.y - o2.POS.y) ** 2);
    },
    // calculating angle between two objects using the angle theorem.
    calculateAngle = (o, o2) => {
        const deltaX = o.POS.x - o2.POS.x;
        const deltaY = o.POS.y - o2.POS.y;

        // Calculate the angle using arctangent
        const angleRadians = Math.atan2(deltaY, deltaX);

        // Convert the angle from radians to degrees
        const angleDegrees = angleRadians * (180 / Math.PI);

        return angleDegrees;
    },
    // returns random int between min ~ max - 1
    random = (min, max)=>{ return Math.floor(Math.random() * max) + min },
    // creating virtul canvas element
    CANVAS = document.createElement('canvas'),
    // setting alias that will be used less then ctx
    DRAW = CANVAS.getContext('2d'),
    // setting the render update loop to 16.666666666666668 ms for an render update
    FPS = 1000 / 60;

// setting canvas width and height and then appending him to the document body
CANVAS.width = window.innerWidth * 0.95;
CANVAS.height = window.innerHeight * 0.95;
document.body.appendChild(CANVAS);

Array.prototype.remove = function (object) {
    const index = this.indexOf(object);
    if (index !== -1) {
        this.splice(index, 1);
        return true; // Indicate successful removal
    }
    return false; // Indicate that the item was not found
}; // the missing heart of Array implementation.

// this class loads and manages the textures of my game
class TextureLoader {
    constructor(src = "/null.png") {
        this.textures = {};
        this.loadImage(src, "null")
    }

    loadImage(src, name) {
        const image2load = new Image();
        image2load.src = src;
        this.textures[name] = image2load;
    }

    getImage(name) {
        if (this.textures[name] != [] && this.textures[name]) {
            return this.textures[name];
        } else {
            return this.textures['null'];
        }
    }
}

const Texture = new TextureLoader("/IMG/null.png")
Texture.loadImage("/IMG/player.png", "player")
Texture.loadImage("/IMG/_cursor.png", "cursor")
Texture.loadImage("/IMG/oakTree.png", "oak")
Texture.loadImage("/IMG/oak_drop.png", "oakDrop")
Texture.loadImage("/IMG/oakSeed.png", "oakSeed")

Texture.loadImage("/IMG/slot.png", "slot")
Texture.loadImage("/IMG/selectedSlot.png", "selectedSlot")
Texture.loadImage("/IMG/stone_drop.png", "stoneDrop")

Texture.loadImage("/IMG/bg.png", "BG")
