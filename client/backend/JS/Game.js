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
        window.addEventListener('keydown', Game.events.onKeyDown)
        window.addEventListener('keyup', Game.events.onKeyUp)

        // mouse event
        Game.canvas.addEventListener('mousemove', Game.events.onMouseMove)
        Game.canvas.addEventListener('mousedown', Game.events.onMouseDown)
        Game.canvas.addEventListener('mouseup', Game.events.onMouseUp)


        // awaking the game update loop
        Game.updateInterval = setInterval(Game.update, 5)
        Game.renderInterval = setInterval(Game.render.update, FPS)
        
        // Player 
        const p = new Player({POS: {x: 64, y: 64}, texture: Texture.getImage("player")})
        Game.arrays.entitys.push(p)
        Game.player = p;

    },
    update: () => {
        Game.player.update()

        Game.arrays.entitys.forEach(entity => {
            entity?.update()
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
        Game.mouse.data.position.canvas.x = Game.mouse.data.position.window.x + Game.Camera.POS.x;
        Game.mouse.data.position.canvas.y = Game.mouse.data.position.window.y + Game.Camera.POS.y;
    },
    update: () => {
        Game.Camera.follow()
        DRAW.setTransform(1, 0, 0, 1, -Game.Camera.POS.x + Game.canvas.width / 2, -Game.Camera.POS.y + Game.canvas.height / 2);
    }
};

// Game data located here for now
Game.arrays = {
    entitys: []
}

// Game render system
Game.render = {
    update() {
        Game.render.refreshCanvas()
        Game.Camera.update()
        Game.render.entitys()

        Game.render.mouse()
    },
    mouse: () => {
        DRAW.save()
        DRAW.fillStyle = "red"
        DRAW.drawImage(Texture.getImage("cursor"), Game.mouse.data.position.canvas.x - scale / 4, Game.mouse.data.position.canvas.y - scale / 4, scale / 2, scale / 2)
        DRAW.restore()
    },
    refreshCanvas: () => { DRAW.clearRect(Game.Camera.POS.x - Game.canvas.width / 2, Game.Camera.POS.y - Game.canvas.height / 2, Game.canvas.width, Game.canvas.height) },
    entitys: () => {
        Game.arrays.entitys.forEach(entity => {
            entity?.render?.update()
        })
    }
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
    },
    onMouseUp: (event) => {
        Game.events.handler(event);
        Game.mouse.last.event = event;
        Game.mouse.last.onMouseUp = event;
    },
    handler(event) {
        if (event instanceof KeyboardEvent) {
            Game.keyboard.array[event.keyCode] = event.type;
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
        onKeyUp: null
    },
    array: []
}

// The mouse data
Game.mouse = {
    last: {
        event: null,
        onMouseDown: null,
        onMouseUp: null
    },
    data: {
        position: {
            canvas: {x: 0, y: 0},
            window: {x: 0, y: 0}
        },
        isDown: false
    }
}

setTimeout(Game.awake, 1000)