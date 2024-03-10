class Projectile {
    constructor (Props) {
        this.dmg = Props?.dmg || 1;
        this.angle = Props?.angle || 0;

        this.texture = Props?.texture || Texture.getImage();

        this.SPEED = Props?.SPEED || 1;
        this.POS = Props?.POS || {x: 0, y: 0};
    }

    update () {
        this.simulatePhysics()
    }

    simulatePhysics () {
        this.POS.x += thus
    }
}