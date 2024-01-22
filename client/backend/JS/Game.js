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
        Game.updateInterval = setInterval(Game.update, 5)
        Game.renderInterval = setInterval(Game.render.update, FPS)
    },
    update: () => {

    },
    updateInterval: null,
    renderInterval: null
}

// Game camera 
Game.Camera = {
    POS: { x: 0, y: 0 },
    target: null,
    follow: ()=> {
        if (Game.Camera.target?.POS){
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
    update () {
        Game.render.refreshCanvas()
        Game.Camera.update()
        Game.render.entitys()
    },
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