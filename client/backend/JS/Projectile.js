class Projectile {
    constructor(Props) {
        this.dmg = Props?.dmg || 1;
        this.angle = Props?.angle || 0;

        this.texture = Props?.texture || Texture.getImage("bullet");
        this.w = Props?.w * scale || scale;
        this.h = Props?.h * scale || scale;

        this.SPEED = Props?.SPEED || 1;
        this.POS = Props?.POS || { x: 0, y: 0 };
        this.DMG = Props?.DMG || 5;

        this.hitboxSize = Props?.hitboxSize || 4
        this.renderHitbox = true
    }

    render = {
        update: () => {
            this.render.base()
            if (this.renderHitbox){
                this.render.hitbox()
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
        hitbox: () => {
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

    update() {
        this.simulatePhysics()
        this.isHitting()
    }

    damage () {

    }

    collide (entity) {
        entity?.damage(this.DMG)
        this.explode()
    }

    explode () {
        Game.Data.Remove(this)
    }

    simulatePhysics() {
        this.POS.x -= Math.cos(DTR(this.angle)) * this.SPEED;
        this.POS.y -= Math.sin(DTR(this.angle)) * this.SPEED;
    }

    isHitting () {
        Game.Data.entitys.forEach(entity => {
            if (entity !== this && entity instanceof Entity && isColliding(this, entity)) {
                this.collide(entity)
                return true;
            }
        })
        return false;
    }
}