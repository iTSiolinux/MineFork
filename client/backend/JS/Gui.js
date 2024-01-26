class Button {
    constructor(values) {
        this.texture = values?.texture || Texture.getImage("null");
        this.w = values?.w * scale || scale;
        this.h = values?.h * scale || scale;
        this.angle = values?.angle || 0;

        this.POS = values?.POS || { x: 0, y: 0 }
    }

    // Events

    onSpawn() {

    }

    onClick() {

    }

    onHover() {
        console.log("Mouse is over: " + this)
    }

    // Functions

    update() {
        if (Game.mouse.isOver(this)) {
            this.onHover()
        }
    }

    render() {
        // Save original drawing context
        DRAW.save();

        // Translate to the center of the object
        DRAW.translate(this.POS.x, this.POS.y);

        // Rotate around the center
        DRAW.rotate(this.angle * Math.PI / 180);

        // Draw the image with its center at (0, 0)
        DRAW.drawImage(
            this.texture,
            -this.w / 2 + Game.Camera.POS.x,
            -this.h / 2 + Game.Camera.POS.y,
            this.w,
            this.h
        );

        // Restore the original drawing context
        DRAW.restore();
    }
}