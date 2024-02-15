class Entity {
    constructor(values, additionalValues) {
        this.CONST_HP = additionalValues?.HP || values?.HP || 1;
        this.HP = additionalValues?.HP || values?.HP || 1;
    
        this.texture = additionalValues?.texture || values?.texture || Texture.getImage();
        this.w = additionalValues?.w || values?.w || scale;
        this.h = additionalValues?.h || values?.h || scale;
        this.angle = additionalValues?.angle || values?.angle || 0;
    
        this.UUID = additionalValues?.UUID || values?.UUID || genUUID();
        this.name = additionalValues?.name || values?.name || null;
        this.TYPE = additionalValues?.TYPE || values?.TYPE || null;

        this.stateList = additionalValues?.stateList || values?.stateList || null;
        this.currentState = "IDLE";
    
        this.isVisible = additionalValues?.isVisible || values?.isVisible || true;
        this.isHostile = additionalValues?.isHostile || values?.isHostile || false;
    
        this.POS = additionalValues?.POS || values?.POS || { x: 0, y: 0 };
        this.VEL = additionalValues?.VEL || values?.VEL || { x: 0, y: 0 };
        this.SPEED = additionalValues?.SPEED || values?.SPEED || { x: 0, y: 0 };
        this.INV = new Inv(additionalValues?.INV || values?.INV) || new Inv();
    
        this.onSpawn();
    }
    

    // list of Events
    onSpawn () { }

    onDeath () { }

    onDamage (dmg) { }

    onCollide () { }

    // update function
    update () {
        this.updatePhysics()
        // this.AI.update()
    }

    // render array
    render = {
        update: () => {
            if (this.isVisible) {
                this.render.base()
                if (this.HP < this.CONST_HP){
                    this.render.healthBar()
                }
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
        healthBar: () => {
            const hpBarP = {
                width: this.w * 2,
                height: this.h / 4,
                border: "black",
                stroke: 2,
                color: "green"
            }

            if (this.CONST_HP / 3 > this.HP){hpBarP.color = "red"} else if (this.CONST_HP / 2 > this.HP){hpBarP.color = "orange"}

            DRAW.save()

            DRAW.translate(this.POS.x - this.w,  this.POS.y - this.h * 2)

            DRAW.strokeStyle = hpBarP.border
            DRAW.lineWidth = hpBarP.stroke
            DRAW.strokeRect(-hpBarP.stroke / 2, -hpBarP.stroke / 2, hpBarP.width + hpBarP.stroke, hpBarP.height + hpBarP.stroke)

            DRAW.fillStyle = hpBarP.color
            DRAW.fillRect(0, 0, hpBarP.width * (this.HP / this.CONST_HP), hpBarP.height)

            DRAW.restore()
        }
    }

    // AI of an entitys

    AI = {
        tickPer: FPS * 25,
        ticksAlive: 0,
        update: ()=>{
            if (this.AI.ticksAlive % this.AI.tickPer == 0){
                this.AI.rollState()
            }
            this.AI.ticksAlive++;
        },
        rollState:  ()=>{
            if (this.stateList.length > 1){
                const rolledState = this.stateList[random(0, this.stateList.length)];
                if (this.AI[rolledState] instanceof Function){
                    this.currentState = rolledState;
                    this.AI[rolledState]();
                }
            } 
        },
        WALK: ()=>{
            this.step(5)
            this.turn(90 *  plusOrMinus(), 1000)
            this.currentState = "IDLE"
        },
        IDLE: ()=>{

        }
    }
    // functions

    damage(dmg) {
        const damgeDealt = dmg > this.HP ? this.HP : dmg;
        this.onDamage(dmg)


        if (this.HP <= damgeDealt) {
            this.HP = 0;
            this.die()
        } else {
            this.HP -= damgeDealt;
        }
    }

    die () {
        this.onDeath()

        Game.Data.Remove(this)
    }

    turn(amount = 90, time = 1000) {
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

    step (amount = 0) {
        this.POS.x -= amount * Math.cos(DTR(this.angle))
        this.POS.y -= amount * Math.sin(DTR(this.angle))
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

    }

    update () {
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

    throw(type = "handIndex") {
        if (type == "handIndex"){
            const handItem = this.INV.items[this.INV.handIndex];

            if (handItem instanceof Item) {
                this.INV.removeItem(handItem)
    
                handItem.POS.x = Game.mouse.data.position.canvas.x;
                handItem.POS.y = Game.mouse.data.position.canvas.y;
    
                Game.Data.Add(handItem);
            }
        } else if (type == "mouseItem"){
            const mouseItem = Game.mouse.item;

            if (mouseItem instanceof Item){

                mouseItem.POS.x = Game.mouse.data.position.canvas.x;
                mouseItem.POS.y = Game.mouse.data.position.canvas.y;
    
                Game.Data.Add(mouseItem);

                Game.mouse.item = new VoidItem()
            }
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
        const handItem = this.INV.items[this.INV.handIndex];

        if (Game.mouse.data.isDownRight && handItem instanceof Item){
            this.isInteracting = true;

            handItem?.interact()
            this.isInteracting = false;
        }
    }

    hasPlayerHit() {
        // Get the hand being used for mining
        const hand = this.hands[this.lastHit];
    
        // Loop through each block
        for (const B of Game.Data.blocks) {
            // Check for collision
            if (
                distance(this, B) <= B.w / 2 + Game.player.w / 2 + hand.w / 2
                &&
                this.isInAngle(this.angle) 
            ) {
                B?.damage(this.base.dmg);
            }
        }
    
        // Loop through each entity
        for (const E of Game.Data.entitys) {
            // Check for collision
            if (
                distance(this, E) <= E.w / 2 + Game.player.w / 2 + hand.w / 2
                &&
                this.isInAngle(this.angle) 
                &&
                E != this
            ) {
                E?.damage(this.base.dmg);
            }
        }
    }

    isInAngle (angle){
        return (
            angle <= 45 && angle >= -45 // right to left
            ||
            angle <= 180 + 45 && angle >= 180 - 45 // left to right 
            ||
            angle <= 90 + 45 && angle >= 90 - 45 // botttom to top
            ||
            angle <= -90 + 45 && angle >= -90 -45 // top to bottom
        )
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

    // Events 

    onDamage (dmg) { console.log("your got hitten by yourself " + dmg)}
}