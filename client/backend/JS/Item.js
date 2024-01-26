class Item {
    constructor(values){
        this.texture = values?.texture || Texture.getImage("null");
        this.size = values?.size * scale || scale;

        
    }
}