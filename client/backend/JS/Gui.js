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
        const fixedThis = { POS: { x: this.POS.x + Game.Camera.POS.x, y: this.POS.y + Game.Camera.POS.y }, w: this.w, h: this.h }
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
    }

    render() {
        // Save original drawing context
        DRAW.save();

        DRAW.translate(this.POS.x, this.POS.y);
        DRAW.rotate(this.angle * Math.PI / 180);
        DRAW.drawImage(
            this.index - 1 == Game.player.INV.handIndex ? Texture.getImage("slotFocused") : Texture.getImage("slot"),
            -this.w / 2 + Game.Camera.POS.x,
            -this.h / 2 + Game.Camera.POS.y,
            this.w,
            this.h
        );

        const targetItem = Game.player.INV.items[this.index - 1]
        if (targetItem instanceof Item) {

            DRAW.drawImage(
                targetItem.texture,
                -this.w / 2 + Game.Camera.POS.x,
                -this.h / 2 + Game.Camera.POS.y,
                this.w,
                this.h
            );

            // drawing Item amount
            DRAW.fillStyle = "blue";
            DRAW.font = '20px Arial';
            DRAW.fillText(targetItem.amount, Game.Camera.POS.x - (DRAW.measureText(targetItem.amount).width / 2), Game.Camera.POS.y - this.h / 2)
        }

        DRAW.restore();
    }

    leftClick() {
        this.onLeftClick()

        const currentItem = Game.player.INV.items[this.index - 1]
        const mouseItem = Game.mouse.item;

        // if it will pass that means that they are from the same type and it will try to stack as possible
        if (
            currentItem.amount < currentItem.MaxStack
            &&
            currentItem.TYPE == mouseItem.TYPE
            &&
            currentItem.displayName == mouseItem.displayName
            &&
            currentItem.MaxStack == mouseItem.MaxStack) {
            const leftSpace = currentItem.MaxStack - currentItem.amount;

            if (leftSpace >= mouseItem.amount) {
                currentItem.amount += mouseItem.amount;
                Game.mouse.item = new VoidItem()
            } else {
                currentItem.amount += leftSpace;
                mouseItem.amount -= leftSpace;
            }
        }
        else {
            // shuffle between them without thinking!
            Game.player.INV.items[this.index - 1] = mouseItem;
            Game.mouse.item = currentItem;
        }
    }

    rightClick() {
        this.onRightClick()

        const currentItem = Game.player.INV.items[this.index - 1]
        const mouseItem = Game.mouse.item;


        if (currentItem instanceof Item && currentItem.amount > 1 && mouseItem instanceof VoidItem) {
            const half = Math.round(currentItem.amount / 2)
            currentItem.amount -= half;
            const newMouseItem = new Item(Game.vanilla.item[currentItem.TYPE.substring(5)], { amount: half })
            Game.mouse.item = newMouseItem;
        }
    }
}

class Display {
    constructor(ID, Props) {
        this.children = [];
        this.ID = ID;

        this.POS = Props?.POS || { x: 0, y: 0 };
        this.w = Props?.w || scale;
        this.h = Props?.h || scale;
        this.bgFill = Props?.bgFill || "gray";
    }

    addChild(guiObjects) {
        if (Array.isArray(guiObjects)) {
            for (const child of guiObjects) {
                this.children.push(child);
            }
        } else {
            this.children.push(guiObjects);
        }
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }

    removeAllChildren() {
        this.children = [];
    }

    update() {
        for (const child of this.children) {
            child.update();
        }
    }

    render() {
        this.renderSelf()
        for (const child of this.children) {
            child.render();
        }
    }

    renderSelf() {
        DRAW.save();
        DRAW.translate(this.POS.x, this.POS.y);
        DRAW.rotate(this.angle * Math.PI / 180);
        if (this.bgFill instanceof Image) {
            DRAW.drawImage(
                this.bgFill,
                -this.w / 2 + Game.Camera.POS.x,
                -this.h / 2 + Game.Camera.POS.y,
                this.w,
                this.h
            )
        } else {
            DRAW.fillStyle = this.bgFill
            DRAW.fillRect(
                -this.w / 2 + Game.Camera.POS.x,
                -this.h / 2 + Game.Camera.POS.y,
                this.w,
                this.h
            )
        }

        DRAW.restore();
    }
}
