class Item {
    constructor(values) {
        this.texture = values?.texture || Texture.getImage("null");
        this.size = (values?.size * scale  || scale) / 2;
        this.angle = values?.angle || 0;

        this.POS = values?.POS || {x: 0, y: 0}
        this.amount = values?.amount || 1;
        this.MaxStack = values?.MaxStack || 64;
        this.UUID = values?.UUID || genUUID()
        this.TYPE = values?.TYPE || null;
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
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );

        // Restore the original drawing context
        DRAW.restore();
    }
}