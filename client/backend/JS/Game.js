// Game.js

// Main game object...
const Game = {
    isDebugging: false,
    canvas: CANVAS,
    awake: () => {
        console.log("Game is awaked!")
        // registering some events listeners before awaking the game
        window.addEventListener('resize', Game.events.onResize)

        // keyboard event
        document.addEventListener('keydown', Game.events.onKeyDown)
        document.addEventListener('keypress', Game.events.onKeyPress)
        document.addEventListener('keyup', Game.events.onKeyUp)

        // mouse event
        Game.canvas.addEventListener('mousemove', Game.events.onMouseMove)
        Game.canvas.addEventListener('mousedown', Game.events.onMouseDown)
        Game.canvas.addEventListener('mouseup', Game.events.onMouseUp)
        Game.canvas.addEventListener('contextmenu', Game.events.onMouseContext)


        // awaking the game update loop
        Game.updateInterval = setInterval(Game.update, 5)
        Game.renderInterval = setInterval(Game.render.update, FPS)

        // Player 
        const p = new Player({ POS: { x: 0, y: 0 }, texture: Texture.getImage("player") })
        Game.player = p;

        // Attaching player to the camera as target
        Game.Camera.target = p;

        // Test block
        const b = new Block(Game.vanilla.block.oak, { POS: { x: 0, y: 0 } })


        Game.Data.Add(p)
        Game.Data.Add(b)
    },
    update: () => {
        Game.keyboard.update()

        Game.player.update()

        Game.Data.GUI.forEach(Button => {
            Button?.update()
        })

        Game.Data.entitys.forEach(entity => {
            entity?.update()
        })

        Game.Data.blocks.forEach(block => {
            block?.update()
        })
    },
    updateInterval: null,
    renderInterval: null,
    vanilla: null
}

// Game camera 
Game.Camera = {
    POS: { x: 0, y: 0 },
    target: null,
    follow: () => {
        if (Game.Camera.target?.POS) {
            Game.Camera.POS = Game.Camera.target.POS
        }
        // calculating realative to the canvas
        Game.mouse.data.position.canvas.x = Game.mouse.data.position.window.x + Game.Camera.POS.x - scale / 4;
        Game.mouse.data.position.canvas.y = Game.mouse.data.position.window.y + Game.Camera.POS.y - scale / 4;
    },
    update: () => {
        Game.Camera.follow()
        DRAW.setTransform(1, 0, 0, 1, -Game.Camera.POS.x + Game.canvas.width / 2, -Game.Camera.POS.y + Game.canvas.height / 2);
    }
}

// Game data located here for now
Game.Data = {
    entitys: [], blocks: [], items: [], GUI: [],

    Add: (object) => {
        if (object instanceof Block) {
            Game.Data.blocks.push(object)
        }
        else if (object instanceof Item) {
            Game.Data.items.push(object)
        }
        else if (object instanceof Entity) {
            Game.Data.entitys.push(object)
        } else {
            console.error("The added object not valid instance. \n" + object.constructor.name)
        }
    },
    Remove: (object) => {
        if (object instanceof Block) {
            if (!Game.Data.blocks.remove(object)) {
                console.warn("Object not found in Game.Data.blocks");
            }
        }
        if (object instanceof Item) {
            if (!Game.Data.items.remove(object)) {
                console.warn("Object not found in Game.Data.items");
            }
        }
        if (object instanceof Entity) {
            if (!Game.Data.entities.remove(object)) {
                console.warn("Object not found in Game.Data.entities");
            }
        }
    }
    

}

// Game render system
Game.render = {
    update() {
        Game.render.refreshCanvas()
        Game.Camera.update()
        Game.render.items()
        Game.render.entitys()
        Game.render.blocks()
        Game.render.GUI()

        Game.render.mouse()
    },
    refreshCanvas: () => { DRAW.clearRect(Game.Camera.POS.x - Game.canvas.width / 2, Game.Camera.POS.y - Game.canvas.height / 2, Game.canvas.width, Game.canvas.height) },
    items: () => {
        Game.Data.items.forEach(items => {
            items?.render()
        })
    },
    entitys: () => {
        Game.Data.entitys.forEach(entity => {
            entity?.render?.update()
        })
    },
    blocks: () => {
        Game.Data.blocks.forEach(block => {
            block?.render?.update()
        })
    },
    GUI: () => {
        Game.Data.GUI.forEach(GUI => {
            GUI?.render()
        })
    },
    mouse: () => {
        DRAW.save()
        DRAW.fillStyle = "red"
        DRAW.drawImage(Texture.getImage("cursor"), Game.mouse.data.position.canvas.x, Game.mouse.data.position.canvas.y, scale / 2, scale / 2)
        DRAW.restore()
    },
    // need to add summon gui functionality   
}

// Handle window events
Game.events = {
    onResize: () => {
        CANVAS.width = window.innerWidth * 0.95;
        CANVAS.height = window.innerHeight * 0.95;
    },
    onKeyDown: (event) => {
        Game.events.handler(event);
        Game.keyboard.last.event = event;
        Game.keyboard.last.onKeyDown = event;
    },
    onKeyPress: (event) => {
        Game.events.handler(event);
        Game.keyboard.last.event = event;
        Game.keyboard.last.onKeyPress = event;
    },
    onKeyUp: (event) => {
        Game.events.handler(event);
        Game.keyboard.last.event = event;
        Game.keyboard.last.onKeyUp = event;
    },
    onMouseMove: (event) => {
        Game.events.handler(event);
        Game.mouse.last.event = event;
        Game.mouse.last.onMouseMove = event;
    },
    onMouseDown: (event) => {
        Game.events.handler(event);
        Game.mouse.last.event = event;
        Game.mouse.last.onMouseDown = event;

        if (event.which == 1) {
            Game.mouse.data.isDownLeft = true;
        } else if (event.which == 3) {
            Game.mouse.data.isDownRight = true;
        }
    },
    onMouseUp: (event) => {
        Game.events.handler(event);
        Game.mouse.last.event = event;
        Game.mouse.last.onMouseUp = event;

        if (event.which == 1) {
            Game.mouse.data.isDownLeft = false;
        } else if (event.which == 3) {
            Game.mouse.data.isDownRight = false;
        }
    },
    onMouseContext: (event) => {
        event.preventDefault();

        Game.events.handler(event);
        Game.mouse.last.event = event;
        Game.mouse.last.onMouseContext = event;
    },
    handler(event) {
        if (event instanceof KeyboardEvent) {
            Game.keyboard.array[event.keyCode] = !(event.type == "keyup");
            if (Game.isDebugging)
                alert(event.keyCode + ' ' + event.type);

        } else if (event instanceof MouseEvent) {
            // setting the mouse position by the client pos
            Game.mouse.data.position.window.x = event.clientX - Game.canvas.offsetLeft - Game.canvas.width / 2;
            Game.mouse.data.position.window.y = event.clientY - Game.canvas.offsetTop - Game.canvas.height / 2;

            // calculating realative to the canvas on Game.Camera.follow
        } else {
            console.error("not handled input: " + event.toString())
        }
    }
}

// The keyboard data
Game.keyboard = {
    last: {
        event: null,
        onKeyDown: null,
        onKeyPress: null,
        onKeyUp: null
    },
    array: [],
    update() {
        const keys = Game.keyboard.array;
        const POS = { x: 0, y: 0 }

        // up key
        if (keys[87]) {
            POS.y--;
        } else if (!keys[87]) {
            POS.y++;
        }

        // down key
        if (keys[83]) {
            POS.y++;
        } else if (!keys[83]) {
            POS.y--;
        }

        // left key
        if (keys[65]) {
            POS.x--;
        } else if (!keys[65]) {
            POS.x++;
        }

        // right key
        if (keys[68]) {
            POS.x++;
        } else if (!keys[68]) {
            POS.x--;
        }

        Game.player.setSpeed(POS.x * 0.5, POS.y * 0.5)

        for (let i = 0; i < 8; i++) {
            if (keys[49 + i]) {
                Game.player.switchSlot(i);
                break;
            }
        }

        // q key
        if (keys[81]) {
            Game.player.throw()
        }
    }
}

// The mouse data
Game.mouse = {
    last: {
        event: null,
        onMouseDown: null,
        onMouseUp: null,
        onMouseContext: null
    },
    data: {
        position: {
            canvas: { x: 0, y: 0 },
            window: { x: 0, y: 0 }
        },
        isDownLeft: false,
        isDownRight: false
    },
    isOver: (object) => {
        const mouseX = Game.mouse.data.position.canvas.x - Game.Camera.POS.x;
        const mouseY = Game.mouse.data.position.canvas.y - Game.Camera.POS.y;

        return (
            mouseX >= object.POS.x - object.w / 2 &&
            mouseX <= object.POS.x + object.w / 2 &&
            mouseY >= object.POS.y - object.h / 2 &&
            mouseY <= object.POS.y + object.h / 2
        );
    }

}

// Vanilla pre-confguired values for blockws
Game.vanilla = {}

Game.vanilla.item = {
    oakDrop: {
        texture: Texture.getImage("oakDrop"),
        TYPE: "Game:oakDrop",
        size: 64,
        amount: 1
    },
    oakSeed: {
        texture: Texture.getImage("oakSeed"),
        TYPE: "Game:oakSeed",
        size: 64,
        amount: 1
    }
},
Game.vanilla.entity = {

},
Game.vanilla.block = {
    oak: {
        TYPE: "Game:oak",
        texture: Texture.getImage("oak"),
        HP: 50,
        w: 128,
        h: 128,
        DROPS: [Game.vanilla.item.oakDrop, Game.vanilla.item.oakDrop, Game.vanilla.item.oakSeed],
        DPD: 0.5
    }
}


setTimeout(Game.awake, 1000)