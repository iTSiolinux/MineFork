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
        this.hands = [{x: 0, y: 0, w: this.size, h: this.size / 4}, {x: 0, y: 0, w: this.size, h: this.size / 4}]
    }

    lookAtMouse () {
        const mouseX = GAME.mouse.position.x;
        const mouseY = GAME.mouse.position.y;

        // Calculate the angle between the player and the mouse cursor
        const deltaX = mouseX - (gameCanvas.width / 2);
        const deltaY = mouseY - (gameCanvas.height / 2);
        const angle = Math.atan2(deltaY, deltaX);

        // Update player rotation
        player.rotation = angle;
    }

}