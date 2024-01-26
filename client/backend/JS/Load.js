const scale = 64,
    genUUID = () => {
        return "0000-0000-0000-0000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },
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
