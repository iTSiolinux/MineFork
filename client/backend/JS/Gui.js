class Button {
    constructor(Props) {
        this.texture = Props?.texture || Texture.getImage("null");
        this.w = Props?.w || scale;
        this.h = Props?.h || scale;
        this.angle = Props?.angle || 0;

        this.POS = Props?.POS || { x: 0, y: 0 };
        this.ID = Props?.ID || null;

        this.isPressed = false;
    }

    // Events
    onSpawn() { }

    onRightClick() { }

    onLeftClick() { }

    onHover() { }

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
        this.onLeftClick();
    }

    rightClick() {
        this.onRightClick();
    }

    update() {
        const fixedThis = {
            POS: {
                x: this.POS.x + Game.Camera.POS.x,
                y: this.POS.y + Game.Camera.POS.y,
            },
            w: this.w,
            h: this.h,
        };
        if (Game.mouse.isOver(fixedThis)) {
            this.hover();
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
        if (Props?.hasTitle) {
            this.title = new Title({ font: "32px sans-serif", POS: { x: 0, y: -this.h / 2 + scale / 2 }, content: (Props?.title || "No valid Display title") })
            this.addChild(this.title)
        }
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
        this.onUpdate()
    }

    onUpdate () {

    }

    render() {
        this.renderSelf()
        for (const child of this.children) {
            child.render();
        }
        this.onRender()
    }

    onRender () {

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

class Title {
    constructor(Props) {
        this.content = Props?.content || "not defined text!"

        this.font = Props?.font || "10px sans-serif"
        this.color = Props?.color || "black"

        this.POS = Props?.POS || { x: 0, y: 0 }
        this.angle = Props?.angle || 0
    }

    render() {
        DRAW.save();

        DRAW.font = this.font;
        DRAW.fillStyle = this.color

        DRAW.translate(this.POS.x, this.POS.y);
        DRAW.rotate(this.angle * Math.PI / 180);
        DRAW.fillText(this.content, Game.Camera.POS.x - DRAW.measureText(this.content).width / 2, Game.Camera.POS.y + parseInt(this.font.match(/\d+/)[0]) / 4) ;

        DRAW.restore();
    }

    update() {

    }
}

class NumberInput {
    constructor(Props) {
        this.index = 0;

        this.margin = Props?.margin || scale;
        this.btnScale = Props?.btnScale || scale;
        this.padding = Props?.padding || 16;
        this.numberSize = Props?.numberSize || 20;
        this.numberFont = Props?.numberFont || "Arial";

        this.POS = Props?.POS || { x: 0, y: 0 }

        this.refresh()
    }

    update() {
        this.leftBtn.update()
        this.rightBtn.update()

        this.indexBox.content = this.index
    }

    render() {
        this.indexBox.render()

        this.leftBtn.render()
        this.rightBtn.render()
    }

    refresh () {
        this.leftBtn = new Button({
            w: this.btnScale,
            h: this.btnScale,
            POS: { x: -(this.padding + this.margin) + this.POS.x, y: this.POS.y },
            texture: Texture.getImage("left")
        })

        this.indexBox = new Title({
            content: this.index,
            font: `${this.numberSize}px ${this.numberFont}`,
            color: "black",
            POS: { x: this.POS.x, y: this.POS.y },
        });

        this.rightBtn = new Button({
            w: this.btnScale,
            h: this.btnScale,
            POS: { x: (this.padding + this.margin) + this.POS.x, y: this.POS.y },
            texture: Texture.getImage("right")
        })

        this.rightBtn.onLeftClick = () => {
            this.index++
            this.onChange()
        }

        this.leftBtn.onLeftClick = () => {
            this.index--
            this.onChange()
        }
    }

    onChange() {

    }
}

class CraftCard extends Display {
    constructor(recipe, ID, Props) {
        super(ID, Props);

        this.recipe = recipe;
        this.ID = ID;
        this.POS = Props?.POS || { x: 0, y: 0 };
        this.w = Props?.w || scale;
        this.h = Props?.h || scale;
        this.bgFill = Props?.bgFill || "gray";

        this.isPressed = false;
    }

    renderIngredients() {
        for (const itemUnit in this.recipe.ingredients) {
            if (this.recipe.ingredients[itemUnit].item?.texture instanceof Image && itemUnit == 0) {
                DRAW.save()

                DRAW.translate(this.POS.x + Game.Camera.POS.x, this.POS.y + Game.Camera.POS.y);

                DRAW.drawImage(
                    this.recipe.ingredients[itemUnit].item?.texture,
                    -this.w / 2,
                    -this.h / 4,
                    scale,
                    scale
                );

                // drawing Item amount
                DRAW.fillStyle = "blue";
                DRAW.font = '20px Arial';
                DRAW.fillText(
                    this.recipe.ingredients[itemUnit].amount,
                    - (DRAW.measureText(this.recipe.ingredients[itemUnit].amount).width / 2) - this.w / 2.5,
                    - this.h / 4
                )

                DRAW.restore()
            } else if (this.recipe.ingredients[itemUnit].item?.texture instanceof Image && itemUnit == 1) {
                DRAW.save()

                DRAW.translate(this.POS.x + Game.Camera.POS.x, this.POS.y + Game.Camera.POS.y);

                DRAW.drawImage(
                    this.recipe.ingredients[itemUnit].item?.texture,
                    -this.w / 8,
                    -this.h / 4,
                    scale,
                    scale
                );

                // drawing Item amount
                DRAW.fillStyle = "blue";
                DRAW.font = '20px Arial';
                DRAW.fillText(
                    this.recipe.ingredients[itemUnit].amount,
                    - (DRAW.measureText(this.recipe.ingredients[itemUnit].amount).width / 2),
                    - this.h / 4
                )

                DRAW.restore()
            }
        }
    }

    renderResult() {
        const result = this.recipe.result;

        DRAW.save()

        DRAW.translate(this.POS.x + Game.Camera.POS.x, this.POS.y + Game.Camera.POS.y);

        DRAW.drawImage(
            result.item?.texture,
            this.w / 4,
            -this.h / 4,
            scale,
            scale
        );

        // drawing Item amount
        DRAW.fillStyle = "blue";
        DRAW.font = '20px Arial';
        DRAW.fillText(
            result.amount,
            - (DRAW.measureText(result.amount).width / 2) + this.w / 2.5,
            - this.h / 4
        )

        DRAW.restore()
    }

    handleClick() {
        // Check if the player has enough resources to craft the item
        const canCraft = this.recipe.ingredients.every(({ item, amount }) => {
            const inventoryItem = Game.player.INV.items.find(invItem => invItem.TYPE === item.TYPE);
            return inventoryItem && inventoryItem.amount >= amount;
        });

        if (canCraft) {
            // Craft the item and remove ingredients from the inventory
            this.recipe.ingredients.forEach(({ item, amount }) => {
                const inventoryItemIndex = Game.player.INV.items.findIndex(invItem => invItem.TYPE === item.TYPE);

                if (inventoryItemIndex !== -1) {
                    Game.player.INV.items[inventoryItemIndex].amount -= amount;
                    if (Game.player.INV.items[inventoryItemIndex].amount <= 0) {
                        // Remove the item from the inventory if its amount is zero or negative
                        Game.player.INV.items.splice(inventoryItemIndex, 1);
                    }
                }
            });

            // Add the crafted item to the player's inventory
            const craftedItem = new Item(this.recipe.result.item);
            craftedItem.amount = this.recipe.result.amount;
            Game.player.INV.addItem(craftedItem);

            // Call the custom onClick handler if provided
            this.onClick();
        }
    }

    onClick() {

    }

    onHover() {
        if (Game.mouse.data.isDownLeft && !this.isPressed) {
            this.handleClick();
        }
    }

    update() {
        const fixedThis = { POS: { x: this.POS.x + Game.Camera.POS.x, y: this.POS.y + Game.Camera.POS.y }, w: this.w, h: this.h }
        if (Game.mouse.isOver(fixedThis)) {
            this.onHover();

            if (Game.mouse.data.isDownLeft && !this.isPressed) {
                this.handleClick();
                this.isPressed = true;
            }

            if (!Game.mouse.data.isDownLeft) {
                this.isPressed = false;
            }
        }
    }

    render() {
        this.renderSelf();
        this.renderIngredients();
        this.renderResult();

        for (const child of this.children) {
            child.render();
        }
    }
}

