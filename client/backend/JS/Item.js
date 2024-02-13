class Item {
    constructor(values, additionalValues) {
        this.texture = additionalValues?.texture || values?.texture || Texture.getImage("null");
        this.w = additionalValues?.w || values?.w || scale / 2;
        this.h = additionalValues?.h || values?.h || scale / 2;
        this.angle = additionalValues?.angle || values?.angle || 0;

        this.POS = additionalValues?.POS || values?.POS || { x: 0, y: 0 };
        this.amount = additionalValues?.amount || values?.amount || 1;
        this.MaxStack = additionalValues?.MaxStack || values?.MaxStack || 64;
        this.UUID = additionalValues?.UUID || values?.UUID || genUUID();
        this.TYPE = additionalValues?.TYPE || values?.TYPE || null;
        this.displayName = additionalValues?.displayName || values?.displayName || null;

        // Item optional values
        this.armorSlot = additionalValues?.armorSlot || values?.armorSlot || null;
        this.isTool = additionalValues?.isTool || values?.isTool || false;

        this.isBlockPlacer = additionalValues?.isBlockPlacer || values?.isBlockPlacer || false;
        this.placedBlock = additionalValues?.placedBlock || values?.placedBlock || null;
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

    interact () {
        let iCanPlace = true;
        Game.Data.blocks.forEach(block => {
            if (Game.mouse.isOver(block)){
                iCanPlace = false;
            }
            if (Game.mouse.isOver(Game.player)){
                iCanPlace = false;
            }
        });

        if (this.isBlockPlacer && iCanPlace){
            if (this.amount > 1){
                this.amount--;  
            } else {
                Game.player.INV.removeItem(this)
            }
            const placedBlock = new Block(Game.vanilla.block[this.placedBlock], {POS: {x: Game.mouse.data.position.canvas.x, y: Game.mouse.data.position.canvas.y}})

            Game.Data.Add(placedBlock)
        }
    }
}

class VoidItem {}