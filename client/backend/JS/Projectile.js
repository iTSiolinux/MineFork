class Projectile {
    constructor(v /* values */, a /* additionalValues */) {
        this.dmg = a?.dmg || v?.dmg || 1;
        this.angle = a?.angle || v?.angle || 0;

        this.texture = a?.texture || v?.texture || Texture.getImage("bullet");
        this.w = a?.w * scale || v?.w * scale || scale;
        this.h = a?.h * scale || v?.h * scale || scale;

        this.SPEED = a?.SPEED || v?.SPEED || 1;
        this.POS = a?.POS || v?.POS || { x: 0, y: 0 };
        this.DMG = a?.DMG || v?.DMG || 5;

        
        this.shooter = a?.shooter || v?.shooter || null;
        this.hitboxSize = a?.hitboxSize || v?.hitboxSize || 4;
        this.renderHitbox = a?.renderHitbox || v?.renderHitbox || false;
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
            if (entity !== this && entity !== this.shooter && entity instanceof Entity && isColliding(this, entity)) {
                this.collide(entity)
                return true;
            }
        })
        return false;
    }
}