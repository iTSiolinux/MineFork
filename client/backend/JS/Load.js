const scale = 64,
    genUUID = () => {
        return "0000-0000-0000-0000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },
    isColliding = (obj, obj2) => {
        // Calculate bounding box coordinates for both objects
        const o = {
            left: obj.POS.x - obj.w / 2,
            right: obj.POS.x + obj.w / 2,
            top: obj.POS.y - obj.h / 2,
            bottom: obj.POS.y + obj.h / 2
        }

        const o2 = {
            left: obj2.POS.x - obj2.w / 2,
            right: obj2.POS.x + obj2.w / 2,
            top: obj2.POS.y - obj2.h / 2,
            bottom: obj2.POS.y + obj2.h / 2
        };

        // Check for horizontal overlap
        const horizontalOverlap = o.left < o2.right && o.right > o2.left;

        // Check for vertical overlap
        const verticalOverlap = o.top < o2.bottom && o.bottom > o2.top;

        // Return true if there is both horizontal and vertical overlap
        return horizontalOverlap && verticalOverlap;
    },
    distance = (o, o2) => {
        return Math.sqrt( (o.POS.x - o2.POS.x) ** 2 + (o.POS.y - o2.POS.y) ** 2 );
    },
    calculateAngle = (o, o2) => {
        const deltaX = o.POS.x - o2.POS.x;
        const deltaY = o.POS.y - o2.POS.y;
        
        // Calculate the angle using arctangent
        const angleRadians = Math.atan2(deltaY, deltaX);
    
        // Convert the angle from radians to degrees
        const angleDegrees = angleRadians * (180 / Math.PI);
    
        return angleDegrees;
    }

// chatGPT SAT function
function areRectanglesColliding(rect1, rect2) {
    // Convert angles to radians
    const angle1 = (rect1.angle * Math.PI) / 180;
    const angle2 = (rect2.angle * Math.PI) / 180;

    // Calculate the four corners of each rectangle
    const rect1Corners = calculateRectangleCorners(rect1);
    const rect2Corners = calculateRectangleCorners(rect2);

    // Calculate the axes to test (perpendicular to edges of rectangles)
    const axes = [
        { x: Math.cos(angle1), y: Math.sin(angle1) },
        { x: Math.cos(angle1 + Math.PI / 2), y: Math.sin(angle1 + Math.PI / 2) },
        { x: Math.cos(angle2), y: Math.sin(angle2) },
        { x: Math.cos(angle2 + Math.PI / 2), y: Math.sin(angle2 + Math.PI / 2) },
    ];

    // Check for overlap on each axis
    for (const axis of axes) {
        const proj1 = projectRectangleOntoAxis(rect1Corners, axis);
        const proj2 = projectRectangleOntoAxis(rect2Corners, axis);

        if (!isOverlap(proj1, proj2)) {
            // If no overlap on any axis, rectangles are not colliding
            return false;
        }
    }

    // If overlap on all axes, rectangles are colliding
    return true;
}

function calculateRectangleCorners(rect) {
    const cosA = Math.cos((rect.angle * Math.PI) / 180);
    const sinA = Math.sin((rect.angle * Math.PI) / 180);
    const wHalf = rect.w / 2;
    const hHalf = rect.h / 2;

    const corners = [
        {
            x: rect.POS.x + wHalf * cosA - hHalf * sinA,
            y: rect.POS.y + wHalf * sinA + hHalf * cosA,
        },
        {
            x: rect.POS.x - wHalf * cosA - hHalf * sinA,
            y: rect.POS.y - wHalf * sinA + hHalf * cosA,
        },
        {
            x: rect.POS.x - wHalf * cosA + hHalf * sinA,
            y: rect.POS.y - wHalf * sinA - hHalf * cosA,
        },
        {
            x: rect.POS.x + wHalf * cosA + hHalf * sinA,
            y: rect.POS.y + wHalf * sinA - hHalf * cosA,
        },
    ];

    return corners;
}

function projectRectangleOntoAxis(corners, axis) {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const corner of corners) {
        const dotProduct = corner.x * axis.x + corner.y * axis.y;
        min = Math.min(min, dotProduct);
        max = Math.max(max, dotProduct);
    }

    return { min, max };
}

function isOverlap(proj1, proj2) {
    return proj1.max >= proj2.min && proj1.min <= proj2.max;
}


CANVAS = document.createElement('canvas'),
    DRAW = CANVAS.getContext('2d'),
    FPS = 1000 / 60;

CANVAS.width = window.innerWidth * 0.95;
CANVAS.height = window.innerHeight * 0.95;
document.body.appendChild(CANVAS);

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
Texture.loadImage("/IMG/slot.png", "slot")
Texture.loadImage("/IMG/selectedSlot.png", "selectedSlot")
Texture.loadImage("/IMG/stone_drop.png", "stoneDrop")

