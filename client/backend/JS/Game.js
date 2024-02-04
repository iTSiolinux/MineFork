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
        Game.arrays.entitys.push(p)
        Game.player = p;

        // Attaching player to the camera as target
        Game.Camera.target = p;

        // Test block
        const b = new Block({ texture: Texture.getImage("oak"), w: 128, h: 128, POS: {x: -64, y: -64 }})
        Game.arrays.blocks.push(b)

        // Test item
        const i = new Item({texture: Texture.getImage("stoneDrop"), TYPE: "stoneDrop", size: 64, POS: {x: 64, y: 64}})
        Game.arrays.items.push(i)
    },
    update: () => {
        Game.keyboard.update()

        Game.player.update()

        Game.arrays.GUI.forEach(Button => {
            Button?.update()
        })

        Game.arrays.entitys.forEach(entity => {
            entity?.update()
        })

        Game.arrays.blocks.forEach(block => {
            block?.update()
        })
    },
    updateInterval: null,
    renderInterval: null
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
};

// Game data located here for now
Game.arrays = {
    entitys: [], blocks: [], items: [], GUI: []
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
        Game.arrays.items.forEach(items => {
            items?.render()
        })
    },
    entitys: () => {
        Game.arrays.entitys.forEach(entity => {
            entity?.render?.update()
        })
    },
    blocks: () => {
        Game.arrays.blocks.forEach(block => {
            block?.render?.update()
        })
    },
    GUI: () => {
        Game.arrays.GUI.forEach(GUI => {
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

        Game.mouse.data.isDown = true
    },
    onMouseUp: (event) => {
        Game.events.handler(event);
        Game.mouse.last.event = event;
        Game.mouse.last.onMouseUp = event;

        Game.mouse.data.isDown = false
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
            Game.mouse.data.position.window.x = event.clientX + Game.canvas.offsetLeft - Game.canvas.width / 2;
            Game.mouse.data.position.window.y = event.clientY + Game.canvas.offsetTop - Game.canvas.height / 2;

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

        Game.player.setSpeed(POS.x, POS.y)

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
        isDown: false
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

setTimeout(Game.awake, 1000)