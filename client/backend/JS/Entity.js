class Entity {
    constructor(values) {
        this.CONST_HP = values?.HP || 1;
        this.HP = values?.HP || 1;

        this.texture = values?.texture || Texture.getImage();
        this.w = values?.w || scale;
        this.h = values?.h || scale;
        this.angle = values?.angle || 0;

        this.UUID = values?.UUID || genUUID();
        this.name = values?.name || null;
        this.TYPE = values?.TYPE || null;

        this.isVisible = values?.isVisible || true;

        this.POS = values?.POS || { x: 0, y: 0 };
        this.VEL = { x: 0, y: 0 };
        this.SPEED = { x: 0, y: 0 };
        this.INV = new Inv(values?.INV) || new Inv()

        this.onSpawn()
    }

    // list of Events
    onSpawn = () => { }

    onDeath = () => { }

    onCollide = () => { }

    // update function
    update = () => {
        this.updatePhysics()
    }

    // render array
    render = {
        update: () => {
            if (this.isVisible) {
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
        }
    }
    // functions

    damage(dmg) {

    }

    // list of Velocity functions

    setSpeed(X = this.SPEED.x, Y = this.SPEED.y) {
        // Update speed based on parameters
        this.SPEED = { x: X, y: Y };
    }

    setVel(X = this.VEL.x, Y = this.VEL.y) {
        // Update velocity based on parameters
        this.VEL = { x: X, y: Y };
    }

    updatePhysics() {
        this.SPEED.x += this.VEL.x
        this.SPEED.y += this.VEL.y

        this.POS.x += this.SPEED.x
        this.POS.y += this.SPEED.y
    }

}

class Player extends Entity {
    constructor(values) {
        super(values)

        // starting by adding hands
        this.hands = [{ x: -32, y: 16, w: this.w / 2, h: this.h / 4 }, { x: -32, y: -32, w: this.w / 2, h: this.h / 4 }]
        this.lastHit = 1;
        this.isMining = false;
        this.isInteracting = false;
        this.base = values?.base || {dmg: 2};

        this.update = () => {
            this.updatePhysics()
            this.lookAtMouse()
            this.pickupItems()
            this.interact()
            this.mine()
        }
    }

    lookAtMouse() {
        const mousePos = Game.mouse.data.position.canvas;
        let deltaX = Game.Camera.POS.x - mousePos.x + Game.player.POS.x,
            deltaY = Game.Camera.POS.y - mousePos.y + Game.player.POS.y;

        if (Game.Camera.target) {
            deltaX -= Game.player.POS.x;
            deltaY -= Game.player.POS.y;
        }

        // Calculate the angle in radians
        const angleRadians = Math.atan2(deltaY, deltaX);

        // Convert radians to degrees
        this.angle = angleRadians * (180 / Math.PI);
    }

    pickupItems() {
        Game.Data.items.forEach(item => {
            if (isColliding(this, item)) {
                const isAdded = this.INV.addItem(item)

                isAdded  ?  Game.Data.Remove(item) : null;
            }
        });
    }

    switchSlot (number) {
        if (10 > number > 0){
            this.INV.handIndex = number
        }
    }

    throw() {
        const handItem = this.INV.items[this.INV.handIndex];
        if (handItem instanceof Item) {
            this.INV.removeItem(handItem)

            handItem.POS.x = Game.mouse.data.position.canvas.x;
            handItem.POS.y = Game.mouse.data.position.canvas.y;


            Game.Data.Add(handItem);
        }
    }

    mine() {
        if (!this.isInteracting && !this.isMining && Game.mouse.data.isDownLeft){
            this.isMining = true;
    
            const Hand = this.hands[this.lastHit];
            const Item = this.INV.items[this.INV.handIndex];
            if (Item?.isTool){

            } else {
                Hand.x -= Hand.w / 2
                this.hasPlayerHit();
                setTimeout(()=>{
                    Hand.x += Hand.w / 2
                    this.isMining = false;
                }, 500)
            }
        
            this.lastHit ? (this.lastHit = 0) : (this.lastHit = 1);
        }
    }

    interact() {
        if (Game.mouse.data.isDownRight){
            this.isInteracting = true;

            const handItem = this.INV.items[this.INV.handIndex];
            handItem?.interact()
            this.isInteracting = false;
        }
    }

    hasPlayerHit () {
        // Get the hand being used for mining
        const hand = this.hands[this.lastHit];
    
        // Loop through each block
        for (const B of Game.Data.blocks) {
            // Check for collision
            if (
                distance(this, B) <= B.w / 2 + Game.player.w / 2 + hand.w / 2 
                && 
                this.angle - 45 < Math.abs(calculateAngle(this, B)) && Math.abs(calculateAngle(this, B)) < this.angle + 45

            ) {
                B?.damage(this.base.dmg);
            }
        }
    }
    
    render = {
        update: () => {
            if (this.isVisible) {
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

            // Render the fists of the player
            this.render.hands()
            this.render.handItem()

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
        hands: () => {
            DRAW.fillStyle = Game.isDebugging ? "red" : 'rgb(255 184 45)';
            DRAW.fillRect(this.hands[0].x, this.hands[0].y, this.hands[0].w, this.hands[0].h); // the RED hand
            DRAW.fillStyle = Game.isDebugging ? "blue" : 'rgb(255 184 45)';
            DRAW.fillRect(this.hands[1].x, this.hands[1].y, this.hands[1].w, this.hands[1].h); // the BLUE hand!
        },
        handItem: () => {
            const handItem = Game.player.INV.items[Game.player.INV.handIndex];

            const offsetX = this.hands[0].x - this.hands[0].w;

            if (handItem instanceof Item) {
                DRAW.drawImage(
                    handItem.texture,
                    offsetX,
                    0,
                    handItem.w,
                    handItem.h
                )
            }
        }
    }
}