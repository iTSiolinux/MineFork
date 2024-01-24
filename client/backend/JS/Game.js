// Game.js

// Main game object...
const Game = {
    awake: () => {
        console.log("Game is awaked!")
        // registering some events listeners before awaking the game
        window.addEventListener('resize', Game.events.onResize)

        // keyboard event
        window.addEventListener('keydown', Game.events.onKeyDown)
        window.addEventListener('keyup', Game.events.onKeyUp)

        // mouse event
        window.addEventListener('mousedown', Game.events.onMouseDown)
        window.addEventListener('mouseup', Game.events.onMouseUp)


        // awaking the game update loop
        Game.updateInterval = setInterval(Game.update, 5)
        Game.renderInterval = setInterval(Game.render.update, FPS)
    },
    update: () => {
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
    },
    update: () => {
        Game.Camera.follow()
        DRAW.setTransform(1, 0, 0, 1, -Game.Camera.POS.x, -Game.Camera.POS.y);
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
    },
    refreshCanvas: () => { DRAW.clearRect(Game.Camera.POS.x - CANVAS.width / 2, Game.Camera.POS.y - CANVAS.height / 2, CANVAS.width, CANVAS.height) },
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
            Game.mouse.data.position.window.x = event.clientX;
            Game.mouse.data.position.window.y = event.clientY;

            // calculating realative to the canvas
            Game.mouse.data.position.canvas.x = event.clientX + Game.Camera.POS.x;
            Game.mouse.data.position.canvas.y = event.clientY + Game.Camera.POS.y;
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