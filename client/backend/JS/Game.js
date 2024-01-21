// Game.js

// Main game object...
const Game = {
    awake: () => {
        console.log("Game is awaked!")
        // registering some events listeners before awaking the game
        window.addEventListener('resize', Game.events.onResize)

        window.addEventListener('keydown', Game.events.onKeyDown)
        window.addEventListener('keyup', Game.events.onKeyUp)

        // awaking the game update loop
        Game.loopIntreval = setInterval(Game.update, 5)
    },
    update: () => {

        Game.render.refreshCanvas()
        Game.Camera.update()
        Game.render.entitys()

    },
    loopIntreval: null
}

// Game camera 
Game.Camera = {
    POS: { x: 0, y: 0 },
    update: () => {
        DRAW.setTransform(1, 0, 0, 1, -Game.Camera.POS.x, -Game.Camera.POS.y);
    }
};

// Game data located here for now
Game.arrays = {
    entitys: []
}

// Game render system
Game.render = {
    refreshCanvas: () => {DRAW.clearRect(Game.Camera.POS.x - CANVAS.width / 2, Game.Camera.POS.y - CANVAS.height / 2, CANVAS.width, CANVAS.height)},
    entitys: () => {
        Game.arrays.entitys.forEach(entity => {
            entity?.update()
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
       Game.keyboard.last.event = event;
       Game.keyboard.last.onKeyDown = event;
    },
    onKeyUp: (event) => {
        Game.keyboard.last.event = event;
        Game.keyboard.last.onKeyUp = event;
    }
}

// The keyboard data
Game.keyboard = {
    last: {
        event: null,
        onKeyDown: null,
        onKeyUp: null
    }
}

setTimeout(Game.awake, 1000)