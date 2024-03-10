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
        this.mineDamage = additionalValues?.mineDamage || values?.mineDamage || false;
        this.TOOLTYPE = additionalValues?.TOOLTYPE || values?.TOOLTYPE || false;

        this.isBlockPlacer = additionalValues?.isBlockPlacer || values?.isBlockPlacer || false;
        this.placedBlock = additionalValues?.placedBlock || values?.placedBlock || null;

        this.isConsumeAble = additionalValues?.isConsumeAble || values?.isConsumeAble || false;
        this.hungerPoints = additionalValues?.hungerPoints || values?.hungerPoints || 0; // how to call how many hunger points the item will add on consume (eating)
        this.consumeTime = additionalValues?.consumeTime || values?.consumeTime || 1000;
        this.consumeSound = additionalValues?.consumeSound || values?.consumeSound || "https://www.myinstants.com/media/sounds/nom-nom-nom_gPJiWn4.mp3";

        // constant
        this.lastInteractTime = 0;
    }

    render() {
        // Save original drawing context
        DRAW.save();

        // Translate to the center of the object
        DRAW.translate(this.POS.x, this.POS.y);

        // Rotate around the center
        DRAW.rotate(DTR(this.angle));

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

    interact() {
        // checking if could place block 
        if (this.isBlockPlacer) {

            let iCanPlace = true;
            Game.Data.blocks.forEach(block => {
                if (Game.mouse.isOver(block)) {
                    iCanPlace = false;
                }
                if (Game.mouse.isOver(Game.player)) {
                    iCanPlace = false;
                }
            });

            if (iCanPlace) {
                if (this.amount > 1) {
                    this.amount--;
                } else {
                    Game.player.INV.removeItem(this)
                }
                const placedBlock = new Block(Game.vanilla.block[this.placedBlock], { POS: { x: Game.mouse.data.position.canvas.x, y: Game.mouse.data.position.canvas.y } })

                Game.Data.Add(placedBlock)
            }
        }

        if (this.isConsumeAble) {
            // eating if is eatable item
            const currentTime = Date.now();

            const eatingSound = new Audio(this.consumeSound)


            // Check if the cooldown has passed since the last interaction
            if (currentTime - this.lastInteractTime >= this.consumeTime) {
                eatingSound.play()

                this.lastInteractTime = currentTime;

                Game.player.hands[0].x += 4
                
                setTimeout(()=>{                
                    Game.player.hands[0].x -= 4
                    eatingSound.pause()
                    
                    this.amount--;
                    if(this.amount <= 0){
                        Game.player.INV.removeItem(this)
                    }
                }, this.consumeTime)
            }
        }
    }
}

class VoidItem { }