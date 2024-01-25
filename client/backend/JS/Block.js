class Block {
    constructor (values) {
        this.CONST_HP = values?.CONST_HP || 1;
        this.HP = values?.HP || 1;

        this.texture = values?.texture || Texture.getImage("null");
        this.w = values?.w * scale || scale;
        this.h = values?.h * scale || scale;
        this.isVisible = values?.isVisible || true;

        this.POS = values?.POS || {x: 0, y: 0};
        this.angle = values?.angle || 0;

        this.uuid = values?.uuid || genUUID();
        this.type = values?.type || null;

        this.onConstructor()
    }

    onConstructor () {

    }

    update () {

    }

    render = {
        update: () => {
            if (this.isVisible){
                this.render.base()
            }
        },
        base: () => {
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
        },
    }
}