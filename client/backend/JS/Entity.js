class Entity {
    constructor(v /* values */, a /* additionalValues */) {
        this.CONST_HP = a?.HP || v?.HP || 1;
        this.HP = a?.HP || v?.HP || 1;

        this.texture = a?.texture || v?.texture || Texture.getImage();
        this.w = a?.w || v?.w || scale;
        this.h = a?.h || v?.h || scale;
        this.hitboxSize = a?.hitboxSize || v?.hitboxSize || 4;
        this.angle = a?.angle || v?.angle || 0;

        this.UUID = a?.UUID || v?.UUID || genUUID();
        this.name = a?.name || v?.name || null;
        this.TYPE = a?.TYPE || v?.TYPE || null;

        this.stateList = a?.stateList || v?.stateList || null;
        this.currentState = "IDLE";
        this.panicTime = a?.panicTime || v?.panicTime || {min: 3, max: 15};

        this.dropList = a?.dropList || v?.dropList || [];

        this.isVisible = returnFirstExsits(a?.isVisible, v?.isVisible, true)
        this.isHostile = returnFirstExsits(a?.isHostile, v?.isHostile, false)
        this.isAI = returnFirstExsits(a?.isAI, v?.isAI, true)

        this.POS = a?.POS || v?.POS || { x: 0, y: 0 };
        this.VEL = a?.VEL || v?.VEL || { x: 0, y: 0 };
        this.SPEED = a?.SPEED || v?.SPEED || { x: 0, y: 0 };
        this.INV = new Inv(a?.INV || v?.INV) || new Inv();

        this.onSpawn();
    }


    // list of Events
    onSpawn() { }

    onDeath() { }

    onDamage(dmg) { }

    onCollide() { }

    // update function
    update() {
        this.updatePhysics()
        if (this.isAI){
            this.AI.update()
        }
    }

    // render array
    render = {
        update: () => {
            if (this.isVisible) {
                this.render.base()
                if (this.HP < this.CONST_HP) {
                    this.render.healthBar()
                }
                if (Game.isDebugging){
                    this.render.hitBox()
                }
            }
        },
        base: () => {
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
        },
        healthBar: () => {
            const hpBarP = {
                width: this.w * 2,
                height: this.h / 4,
                border: "black",
                stroke: 2,
                color: "green"
            }

            if (this.CONST_HP / 3 > this.HP) { hpBarP.color = "red" } else if (this.CONST_HP / 2 > this.HP) { hpBarP.color = "orange" }

            DRAW.save()

            DRAW.translate(this.POS.x - this.w, this.POS.y - this.h)

            DRAW.strokeStyle = hpBarP.border
            DRAW.lineWidth = hpBarP.stroke
            DRAW.strokeRect(-hpBarP.stroke / 2, -hpBarP.stroke / 2, hpBarP.width + hpBarP.stroke, hpBarP.height + hpBarP.stroke)

            DRAW.fillStyle = hpBarP.color
            DRAW.fillRect(0, 0, hpBarP.width * (this.HP / this.CONST_HP), hpBarP.height)

            DRAW.restore()
        },
        hitBox: () => {
            DRAW.save();

            // Translate to the center of the object
            DRAW.translate(this.POS.x, this.POS.y);

            // Draw the image with its center at (0, 0)
            DRAW.strokeStyle = "red"
            DRAW.strokeRect(
                -this.w / this.hitboxSize,
                -this.h / this.hitboxSize,
                this.w / (this.hitboxSize / 2),
                this.h / (this.hitboxSize / 2)
            );

            // Restore the original drawing context
            DRAW.restore();
        }
    }

    // AI of an entitys

    AI = {
        tickPer: FPS * 25,
        ticksAlive: 0,
        update: () => {
            if (this.AI.ticksAlive % this.AI.tickPer == 0) {
                this.AI.rollState()
            }
            this.AI.ticksAlive++;
        },
        rollState: () => {
            if (this.stateList.length > 1 && this.currentState == "IDLE") {
                const rolledState = this.stateList[random(0, this.stateList.length)];
                if (this.AI[rolledState] instanceof Function) {
                    this.currentState = rolledState;
                    this.AI[rolledState]();
                }
            }
        },
        WALK: () => {
            this.step(5)
            this.turn(90 * plusOrMinus(), 1000)
            this.step(5)
            this.AI.IDLE()
        },
        PANIC: (time = 15000, object) => {
            this.currentState = "PANIC"
            if (object instanceof Entity) {
                this.angle = calculateAngle(object, this)
            }

            const zig = () => { this.turn(22.5 * plusOrMinus(), 250); this.step(15, 250) }
            const loop = setInterval(zig, 500)

            setTimeout(() => { clearInterval(loop) }, time)

            this.AI.IDLE()
        },
        IDLE: () => {
            this.currentState = "IDLE"
        }
    }
    // functions

    damage(dmg = 1, object) {
        const damgeDealt = dmg > this.HP ? this.HP : dmg;
        this.onDamage(dmg, object)


        if (this.HP <= damgeDealt) {
            this.HP = 0;
            this.die()
        } else {
            this.HP -= damgeDealt;
        }

        if (object !== null && this.isAI) {
            const panicTime = random(this.panicTime.min, this.panicTime.max);
            this.AI.PANIC(panicTime, object)
        }
    }

    die() {
        this.onDeath()

        if (this.dropList.length > 0) {
            // example structure of an drop in the list:
            // {item: "new Item()", min: 1, max: 2}
            this.dropList.forEach(drop => {
                const item = new Item(drop.item);

                item.POS.x = this.POS.x;
                item.POS.y = this.POS.y;

                item.amount = random(drop.min, drop.max)

                Game.Data.Add(item);
            })
        }

        Game.Data.Remove(this)
    }

    async turn(amount = 90, time = 1000) {
        const degreesPerInterval = amount / (time / 10);
        let loop = setInterval(() => {
            this.angle += degreesPerInterval;
            time -= 10;

            if (time <= 0) {
                clearInterval(loop);
                this.angle = NA(Math.round(this.angle))
            }
        }, 10);
    }

    async step(amount = 10, time = 1000) {
        let loop = setInterval(() => {
            const stepPerIntervalX = (amount * Math.cos(DTR(this.angle))) / (time / 10);
            const stepPerIntervalY = (amount * Math.sin(DTR(this.angle))) / (time / 10);


            this.POS.x -= stepPerIntervalX
            this.POS.y -= stepPerIntervalY
            time -= 10;

            if (time <= 0) {
                clearInterval(loop);
            }
        }, 10);
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

        // removing the AI functionality
        this.isAI = false

        // starting by adding hands
        this.hands = [{ x: -scale / 2, y: scale / 4, w: this.w / 2, h: this.h / 4 }, { x: -scale / 2, y: -scale / 2, w: this.w / 2, h: this.h / 4 }]
        this.lastHit = 1;
        this.isMining = false;
        this.isInteracting = false;
        this.base = values?.base || { dmg: 1 };

        this.itemTitle = new Title({
            content: "",
            POS: { x: 0, y: Game.canvas.height / 2 - 80 },
            font: "32px sans"
        })

        Game.Data.Add(this.itemTitle)
    }

    reloadItemTitle() {
        this.itemTitle.content = this.INV.items[this.INV.handIndex].displayName === undefined ? "" : this.INV.items[this.INV.handIndex].displayName
    }

    update() {
        this.updatePhysics()
        this.lookAtMouse()
        this.pickupItems()
        this.interact()
        this.mine()
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
        const angleInRadians = Math.atan2(deltaY, deltaX);

        // Convert radians to degrees
        this.angle = RTD(angleInRadians)
    }

    pickupItems() {
        Game.Data.items.forEach(item => {
            if (isColliding(this, item)) {
                const isAdded = this.INV.addItem(item)
                isAdded ? Game.Data.Remove(item) : null;
            }
        });
        this.reloadItemTitle()
    }

    switchSlot(number) {
        if (10 > number > 0) {
            this.INV.handIndex = number
        }
        this.reloadItemTitle()
    }

    throw(type = "handIndex") {
        if (type == "handIndex") {
            const handItem = this.INV.items[this.INV.handIndex];

            if (handItem instanceof Item) {
                this.INV.removeItem(handItem)

                handItem.POS.x = Game.mouse.data.position.canvas.x;
                handItem.POS.y = Game.mouse.data.position.canvas.y;

                Game.Data.Add(handItem);
            }
        } else if (type == "mouseItem") {
            const mouseItem = Game.mouse.item;

            if (mouseItem instanceof Item) {

                mouseItem.POS.x = Game.mouse.data.position.canvas.x;
                mouseItem.POS.y = Game.mouse.data.position.canvas.y;

                Game.Data.Add(mouseItem);

                Game.mouse.item = new VoidItem()
            }
        }
    }

    mine() {
        if (!this.isInteracting && !this.isMining && Game.mouse.data.isDownLeft) {
            this.isMining = true;

            const Hand = this.hands[this.lastHit];
            
            Hand.x -= Hand.w / 2
            this.hasPlayerHit();
            setTimeout(() => {
                Hand.x += Hand.w / 2
                this.isMining = false;
            }, 500)
           

            this.lastHit ? (this.lastHit = 0) : (this.lastHit = 1);
        }
    }

    interact() {
        const handItem = this.INV.items[this.INV.handIndex];

        if (handItem instanceof Item) {
            this.isInteracting = true;
            handItem?.interact()
        }
    }

    interactEnd () {
        const handItem = this.INV.items[this.INV.handIndex];
        
        if (handItem instanceof Item) {
            this.isInteracting = false;
            handItem?.interactEnd()
        }
    }

    hasPlayerHit() {
        // Get the hand being used for mining
        const hand = this.hands[this.lastHit];
        const tool = this.INV.items[this.INV.handIndex];


        // Loop through each block
        for (const B of Game.Data.blocks) {
            // Check for collision
            if (
                this.canMine(B)
            ) {
                let DMG = this.base.dmg
                if (tool.isTool && B.TOOLTYPE == tool.TOOLTYPE)
                    DMG += tool.mineDamage;

                B?.damage(DMG, this);
            }
        }

        // Loop through each entity
        for (const E of Game.Data.entitys) {
            // Check for collision
            if (
                this.canMine(E)
                &&
                E != this
            ) {
                E?.damage(this.base.dmg, this);
            }
        }
    }

    canMine(object) {
        const hand = this.hands[this.lastHit];

        return (distance(this, object) <= object.w / 2 + Game.player.w / 2 + hand.w / 2)
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
                if (handItem.toolRotate === 0) {
                    DRAW.drawImage(
                        handItem.texture,
                        offsetX,
                        0,
                        handItem.w,
                        handItem.h
                    );
                } else {
                    DRAW.save();

                    // Translate to the center of the image
                    const centerX = this.hands[0].x - handItem.w / 2;  // Adjust based on the center of the image
                    const centerY = this.hands[0].y - handItem.h / 2;  // Adjust based on the center of the image
                    DRAW.translate(centerX, centerY);
        
                    DRAW.rotate(DTR(handItem.toolRotate));
                    // Draw the image with its center at (0, 0)
                    DRAW.drawImage(
                        handItem.texture,
                        -handItem.w,
                        -handItem.h / 4,
                        handItem.w,
                        handItem.h
                    );
        
                    // Restore the original drawing context
                    DRAW.restore();
                }
            }        
        }
    }

    // Events 

    onDamage(dmg) { console.log("your got hitten by yourself " + dmg) }
}