class Block {
    constructor(values, additionalValues) {
        // Use additionalValues if available, otherwise use values or default values
        this.CONST_HP = additionalValues?.CONST_HP || values?.CONST_HP || 1;
        this.HP = additionalValues?.HP || values?.HP || 1;

        this.texture = additionalValues?.texture || values?.texture || Texture.getImage("null");
        this.w = additionalValues?.w || values?.w || scale;
        this.h = additionalValues?.h || values?.h || scale;
        this.isVisible = additionalValues?.isVisible || values?.isVisible || true;

        this.POS = additionalValues?.POS || values?.POS || { x: 0, y: 0 };
        this.angle = additionalValues?.angle || values?.angle || 0;

        this.UUID = additionalValues?.UUID || values?.UUID || genUUID();
        this.TYPE = additionalValues?.TYPE || values?.TYPE || null;
        this.DROPS = additionalValues?.DROPS || values?.DROPS || [];
        this.DPD = additionalValues?.DPD || values?.DPD || 0.5; // DpD ~ Drop per damage like if DPD == 0.5 => 2 dmg = 1 drop

        this.onConstructor();
    }

    // Events

    onConstructor() {

    }

    onDeath() {

    }

    onDamage(dmg) {

    }

    // Functions

    update() {

    }

    damage(dmg) {

        const damgeDealt = dmg > this.HP ? this.HP : dmg;
        this.onDamage(dmg)


        if (this.HP <= damgeDealt) {
            this.HP = 0;
            this.die()
        } else {
            this.HP -= damgeDealt;
        }

        if (this.DROPS.length > 1) {
            for (let i = Math.round(damgeDealt * this.DPD); i > 0; i--) {
                const INT_RANDOM = random(0, this.DROPS.length),
                    ITEM = new Item(
                        this.DROPS[INT_RANDOM],
                        {
                            POS: { x: this.POS.x, y: this.POS.y }
                        }
                    )
                

                Game.Data.Add(ITEM)
            }
        } else if (this.DROPS.length == 1) {
            const ITEM = new Item(
                this.DROPS[0],
                {
                    POS: {
                        x: this.POS.x,
                        y: this.POS.y,
                    },
                    amount: Math.round(damgeDealt * this.DPD)
                }
            )


            Game.Data.Add(ITEM)
        }
        
        this.w *= 0.90
        this.h *= 0.90
        setTimeout(() => { this.h *= 10 / 9; this.w *= 10 / 9 }, 250)
    }

    die() {
        this.HP = 0;
        Game.Data.Remove(this)
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
    }
}