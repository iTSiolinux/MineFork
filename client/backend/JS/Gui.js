class Button {
    constructor(values) {
        this.texture = values?.texture || Texture.getImage("null");
        this.w = values?.w || scale;
        this.h = values?.h || scale;
        this.angle = values?.angle || 0;

        this.POS = values?.POS || { x: 0, y: 0 }
        this.ID = values?.ID || null;

        this.isPressed = false
    }

    // Events

    onSpawn() {

    }

    onRightClick() {

    }

    onLeftClick() {

    }

    onHover() {

    }

    // Functions

    hover() {
        this.onHover();
    
        if (Game.mouse.data.isDownLeft && !this.isPressed) {
            this.leftClick();
            this.isPressed = true;
        }
    
        if (Game.mouse.data.isDownRight && !this.isPressed) {
            this.rightClick();
            this.isPressed = true;
        }
    
        if (!Game.mouse.data.isDownLeft && !Game.mouse.data.isDownRight) {
            this.isPressed = false;
        }
    }
    

    leftClick() {
        this.onLeftClick()
    }

    rightClick() {
        this.onRightClick()
    }

    update() {
        const fixedThis = {POS: {x: this.POS.x + + Game.Camera.POS.x, y: this.POS.y + + Game.Camera.POS.y}, w: this.w, h: this.h}
        if (Game.mouse.isOver(fixedThis)) {
            this.hover()
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


class Slot extends Button {
    constructor(values) {
        super(values)

        this.index = values?.index || -1;

        this.render = () => {
                // Save original drawing context
                DRAW.save();

                // Translate to the center of the object
                DRAW.translate(this.POS.x, this.POS.y);

                // Rotate around the center
                DRAW.rotate(this.angle * Math.PI / 180);

                // Draw the image with its center at (0, 0)
                DRAW.drawImage(
                    this.index - 1== Game.player.INV.handIndex ? Texture.getImage("slotFocused") : Texture.getImage("slot"),
                    -this.w / 2 + Game.Camera.POS.x,
                    -this.h / 2 + Game.Camera.POS.y,
                    this.w,
                    this.h
                );

                // Restore the original drawing context
                DRAW.restore(); 

        
            const targetItem = Game.player.INV.items[this.index - 1]
            if (targetItem instanceof Item){
                // Save original drawing context
                DRAW.save();

                // Translate to the center of the object
                DRAW.translate(this.POS.x, this.POS.y);

                // Rotate around the center
                DRAW.rotate(this.angle * Math.PI / 180);

                // Draw the image with its center at (0, 0)
                DRAW.drawImage(
                    targetItem.texture,
                    -this.w / 2 + Game.Camera.POS.x,
                    -this.h / 2 + Game.Camera.POS.y,
                    this.w,
                    this.h
                );

                DRAW.fillStyle = "blue";
                DRAW.font = '20px Arial';
                DRAW.fillText(targetItem.amount, Game.Camera.POS.x - (DRAW.measureText(targetItem.amount).width / 2), Game.Camera.POS.y - this.h / 2)

                // Restore the original drawing context
                DRAW.restore(); 
            }
        }

        this.leftClick = () => {
            this.onLeftClick()

            const currentItem = Game.player.INV.items[this.index - 1]
            if (currentItem instanceof Item || currentItem instanceof VoidItem){
                Game.player.INV.items[this.index - 1] = Game.mouse.item;
                Game.mouse.item = currentItem;
            }
        }
    }
}