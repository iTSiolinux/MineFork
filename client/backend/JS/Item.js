class Item {
    constructor(values) {
        this.texture = values?.texture || Texture.getImage("null");
        this.w = values?.w  || scale / 2;
        this.h = values?.h  || scale / 2;
        this.angle = values?.angle || 0;

        this.POS = values?.POS || {x: 0, y: 0}
        this.amount = values?.amount || 1;
        this.MaxStack = values?.MaxStack || 64;
        this.UUID = values?.UUID || genUUID()
        this.TYPE = values?.TYPE || null;
        this.displayName = values?.displayName || null;

        // item optinal values
        this.armorSlot = values?.armorSlot || null
        this.isTool = values?.isTool || false
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
            -this.w / 2,
            -this.h / 2,
            this.w,
            this.h
        );

        // Restore the original drawing context
        DRAW.restore();
    }
}