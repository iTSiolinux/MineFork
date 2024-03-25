class Projectile {
    constructor(v /* values */, a /* additionalValues */) {
        this.dmg = a?.dmg || v?.dmg || 1;

        this.texture = a?.texture || v?.texture || Texture.getImage("bullet");
        this.w = a?.w * scale || v?.w * scale || scale;
        this.h = a?.h * scale || v?.h * scale || scale;
        this.hitboxSize = a?.hitboxSize || v?.hitboxSize || 4;
        this.angle = a?.angle || v?.angle || 0;

        this.SPEED = a?.SPEED || v?.SPEED || 1;
        this.POS = a?.POS || v?.POS || { x: 0, y: 0 };
        this.DMG = a?.DMG || v?.DMG || 5;

        this.MaxDistance = a?.MaxDistance || v?.MaxDistance || 1024;
        this.reachedDistance = 0;
        
        this.shooter = a?.shooter || v?.shooter || null;
        this.renderHitbox = returnFirstExsits(a?.renderHitbox, v?.renderHitbox, false);
    }

    onAdd() {}

    render = {
        update: () => {
            this.render.base()
            if (this.renderHitbox || Game.isDebugging){
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
        this.reachedDistance += this.SPEED;
        if (this.reachedDistance < this.MaxDistance){
            this.POS.x -= Math.cos(DTR(this.angle)) * this.SPEED;
            this.POS.y -= Math.sin(DTR(this.angle)) * this.SPEED;
        } else {
            this.explode()
        }

    }

    isHitting () {
        Game.Data.entitys.forEach(entity => {
            const fixedCollider = {}
            fixedCollider.w = this.w
            fixedCollider.h = this.h

            fixedCollider.POS = {}
            fixedCollider.POS.x = this.POS.x
            fixedCollider.POS.y = this.POS.y

            fixedCollider.w = this.w / (this.hitboxSize / 2)
            fixedCollider.h = this.h / (this.hitboxSize / 2)

            const fixedEntityCollider = {}
            fixedEntityCollider.w = entity.w
            fixedEntityCollider.h = entity.h

            fixedEntityCollider.POS = {}
            fixedEntityCollider.POS.x = entity.POS.x
            fixedEntityCollider.POS.y = entity.POS.y

            fixedEntityCollider.w = entity.w / (entity.hitboxSize / 2)
            fixedEntityCollider.h = entity.h / (entity.hitboxSize / 2)

            if (entity !== this && entity !== this.shooter && entity instanceof Entity && isColliding(fixedCollider, fixedEntityCollider)) {
                this.collide(entity)
                return true;
            }
        })
        return false;
    }
}