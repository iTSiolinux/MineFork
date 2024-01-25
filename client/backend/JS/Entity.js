class Entity {
    constructor(values) {
        this.CONST_HP = values?.HP || 1;
        this.HP = values?.HP || 1;

        this.texture = values?.texture || Texture.getImage();
        this.w = values?.w || scale;
        this.h = values?.h || scale;
        this.angle = values?.angle || 0;

        this.uuid = values?.uuid || genUUID();
        this.name = values?.name || null;
        this.type = values?.type || null;

        this.isVisible = values?.isVisible || true;

        this.POS = values?.POS || { x: 0, y: 0 };
        this.VEL = { x: 0, y: 0 };
        this.SPEED = { x: 0, y: 0 };

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
            this.render.base()
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

    updatePhysics () {
        this.SPEED.x += this.VEL.x
        this.SPEED.y += this.VEL.y

        this.POS.x += this.SPEED.x
        this.POS.y += this.SPEED.y
    }

}

class Player extends Entity {
    constructor (values){
        super(values)

        // starting by adding hands
        this.hands = [{x: -32, y: 16, w: this.w / 2, h: this.h / 4}, {x: -32, y: -32, w: this.w / 2, h: this.h / 4}]

        this.update = () => {
            this.updatePhysics()
            this.lookAtMouse()
        }
    }

    lookAtMouse() {
        const mousePos = Game.mouse.data.position.canvas;
        const deltaX = Game.Camera.POS.x - mousePos.x + Game.player.POS.x;
        const deltaY = Game.Camera.POS.y - mousePos.y + Game.player.POS.y;
    
        // Calculate the angle in radians
        const angleRadians = Math.atan2(deltaY, deltaX);
    
        // Convert radians to degrees
        this.angle = angleRadians * (180 / Math.PI);
    }
    

    render = {
        update: () => {
            this.render.base()
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
        }
    }
}