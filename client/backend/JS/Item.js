class Item {
    constructor(v /* values */, a /* additionalValues */) {
        this.texture = a?.texture || v?.texture || Texture.getImage("null");
        this.w = a?.w || v?.w || scale / 2;
        this.h = a?.h || v?.h || scale / 2;
        this.angle = a?.angle || v?.angle || 0;

        this.POS = a?.POS || v?.POS || { x: 0, y: 0 };
        this.amount = a?.amount || v?.amount || 1;
        this.MaxStack = a?.MaxStack || v?.MaxStack || 64;
        this.UUID = a?.UUID || v?.UUID || genUUID();
        this.TYPE = a?.TYPE || v?.TYPE || null;
        this.displayName = a?.displayName || v?.displayName || null;

        // Item optional values
        this.armorSlot = a?.armorSlot || v?.armorSlot || null;

        this.toolRotate = a?.toolRotate || v?.toolRotate || 0;
        this.mineDamage = returnFirstExsits(a?.mineDamage, v?.mineDamage, false);
        this.TOOLTYPE = returnFirstExsits(a?.TOOLTYPE, v?.TOOLTYPE, false)

        this.isBlockPlacer = a?.isBlockPlacer || v?.isBlockPlacer || false;
        this.placedBlock = a?.placedBlock || v?.placedBlock || null;

        this.isConsumeAble = returnFirstExsits(a?.isConsumeAble, v?.isConsumeAble, false)
        this.hungerPoints = a?.hungerPoints || v?.hungerPoints || 0;
        this.consumeTime = a?.consumeTime || v?.consumeTime || 1000;
        this.consumeSound = a?.consumeSound || v?.consumeSound || "/MP3/eat.mp3";

        this.isProjectileShooter = returnFirstExsits(a?.isProjectileShooter, v?.isProjectileShooter, false);
        this.Projectile = a?.Projectile || v?.Projectile || null;

        this.shootMethod =
            a?.shootMethod
            ||
            v?.shootMethod
            ||
            {
                chargeTime: { min: 750, max: 3500 }
            };

        /* 
        {
            type: "charge",
            chargeTime: {min: 750, max: 3500} 
            ||
            type: "reload",
            bullets: {
                amount: 5,
                sprayRange: 15,
                shootsCooldown: {min: 250, max: 500}
            }
        }
        */

        this.lastInteractTime = 0;
    }

    render() {
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
    }

    renderPlanPlace() {
        
    }

    interact() {
        // checking if could place block 
        if (this.isBlockPlacer) {

            let iCanPlace = true;
            const fixedBlock = Game.vanilla.block[this.placedBlock];

            Game.Data.blocks.forEach(block => {
                if (Game.mouse.isOver(block) || Game.mouse.isOver(Game.player)) {
                    iCanPlace = false;
                }
            });

            if (iCanPlace) {
                if (this.amount > 1) {
                    this.amount--;
                } else {
                    Game.player.INV.removeItem(this)
                }
                const placedBlock = new Block(Game.vanilla.block[this.placedBlock], { POS: { x: Game.mouse.data.position.canvas.x, y: Game.mouse.data.position.canvas.y } })

                Game.Data.Add(placedBlock)
            }
            Game.player.isInteracting = false
        } else if (this.isConsumeAble) {
            // eating if is eatable item
            const currentTime = Date.now();

            const eatingSound = new Audio(this.consumeSound)


            // Check if the cooldown has passed since the last interaction
            if (currentTime - this.lastInteractTime >= this.consumeTime) {
                eatingSound.play()

                this.lastInteractTime = currentTime;

                Game.player.hands[0].x += 4

                setTimeout(() => {
                    Game.player.hands[0].x -= 4
                    eatingSound.pause()

                    this.amount--;
                    if (this.amount <= 0) {
                        Game.player.INV.removeItem(this)
                    }
                }, this.consumeTime)
            }
        } else if (this.isProjectileShooter) {
            if (this.shootMethod.type == "charge") {
                if (!this.isCharging) {
                    this.isCharging = true;
                    this.chargeStartTime = Date.now();
                    console.log("Charging started.");
                }
            }
        }
    }

    interactEnd() {
        if (this.isProjectileShooter && this.shootMethod.type === "charge" && this.isCharging) {
            // Calculate charge time
            const chargeTime = Date.now() - this.chargeStartTime;

            // Ensure minimum charge time is met
            const minChargeTime = this.shootMethod.chargeTime.min;
            if (chargeTime >= minChargeTime) {
                // Calculate charge strength
                const maxChargeTime = this.shootMethod.chargeTime.max;
                const strength = Math.min(chargeTime / maxChargeTime, 1); // Ensure strength doesn't exceed 1

                // Calculate projectile speed based on strength
                const projectileSpeed = this.Projectile.SPEED * strength;

                // Create and add projectile
                const newProjectile = new Projectile(this.Projectile, {
                    shooter: Game.player,
                    POS: { x: Game.player.POS.x, y: Game.player.POS.y },
                    angle: Game.player.angle,
                    SPEED: projectileSpeed
                });
                Game.Data.Add(newProjectile);

                // Reset charging state and charge start time
                this.isCharging = false;
                this.chargeStartTime = Date.now();
                console.log("Projectile fired with charge time:", chargeTime);
            } else {
                console.log("Charging time not sufficient.");
            }
        }
    }
}
class VoidItem { }