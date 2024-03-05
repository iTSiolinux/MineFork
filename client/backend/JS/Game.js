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
        const p = new Player({ HP: 100, POS: { x: 0, y: 0 }, texture: Texture.getImage("player") })
        Game.player = p;

        // Attaching player to the camera as target
        Game.Camera.target = p;

        // Test block
        const b = new Block(Game.vanilla.block.oak, { POS: { x: 0, y: 0 } })

        // Test chicken
        const c = new Entity(Game.vanilla.entity.chicken, { POS: { x: 128, y: 0 } })

        Game.Data.Add(c)
        Game.Data.Add(p)
        Game.Data.Add(b)

        Game.render.hotbar()
        Game.render.inventoryBtn()
        Game.render.craftBtn()
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
            Game.Camera.POS.x = Game.Camera.target.POS.x
            Game.Camera.POS.y = Game.Camera.target.POS.y
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
        }
        else if (object instanceof Button || object instanceof Display || object instanceof Title || object instanceof NumberInput) {
            Game.Data.GUI.push(object)
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
        else if (object instanceof Item) {
            if (!Game.Data.items.remove(object)) {
                console.warn("Object not found in Game.Data.items");
            }
        }
        else if (object instanceof Entity) {
            if (!Game.Data.entitys.remove(object)) {
                console.warn("Object not found in Game.Data.entitys");
            }
        }
        else if (object instanceof Button || object instanceof Display || object instanceof Title || object instanceof NumberInput) {
            Game.Data.GUI.remove(object)
        } else {
            console.error("The added object not valid instance. \n" + object.constructor.name)
        }
    }


}

// Game render system
Game.render = {
    // awake functions
    hotbar: () => {
        const slotProperties =
        {
            w: scale / 2, // width
            h: scale / 2, // height
            m: scale / 8 // margin
        }

        let s = slotProperties;
        const halfSize = (s.w + s.m) * -4;


        for (i = Game.player.INV.hotbarSlots; i > 0; i--) {
            const values = { index: i, POS: { x: halfSize + i * (s.w + s.m), y: (Game.canvas.height / 2 - s.h * 1.5) }, w: s.w, h: s.h, ID: i }
            const newSlot = new Slot(values)

            Game.Data.Add(newSlot)
        }
    },
    inventoryBtn: () => {
        const btn = new Button({
            texture: Texture.getImage("inv"),
            POS: { x: Game.canvas.width / 2 - scale, y: -Game.canvas.height / 2 + scale }
        })

        btn.onLeftClick = Game.render.inventory
        Game.var = btn

        Game.Data.Add(btn)
    },
    craftBtn: () => {
        const btn = new Button({
            texture: Texture.getImage("craft"),
            POS: { x: Game.canvas.width / 2 - scale * 2, y: -Game.canvas.height / 2 + scale }
        })

        btn.onLeftClick = Game.render.craft

        Game.Data.Add(btn)
    },
    inventory: () => {
        const invDisplay = Game.Data.GUI.find(gui => gui.ID === "INV");

        if (invDisplay instanceof Display) {
            // Close the existing inventory window
            Game.Data.Remove(invDisplay);
        } else {
            const existingWindows = Game.Data.GUI.filter(gui => gui instanceof Display);

            if (existingWindows.length === 0) {
                const slotProperties = {
                    w: scale / 2,
                    h: scale / 2,
                    m: scale / 8,
                    rows: 3,
                    cols: Game.player.INV.maxSlots / 3,
                };

                // Create a new inventory window only if no other windows are open
                const newInvDisplay = new Display("INV", {
                    w: (slotProperties.w + slotProperties.m) * 9,
                    h: (slotProperties.h) * 9,
                    title: "Inventory",
                    hasTitle: true
                });


                let s = slotProperties;
                const halfSize = (s.w + s.m) * -s.cols / 2.5;

                for (let row = 1; row < s.rows; row++) {
                    for (let col = 0; col < s.cols; col++) {
                        const index = row * s.cols + col;
                        const values = {
                            index: index + 1,
                            POS: {
                                x: halfSize + col * (s.w + s.m),
                                y: row * (s.h + s.m),
                            },
                            w: s.w,
                            h: s.h,
                            ID: index + 1,
                        };
                        const newSlot = new Slot(values);

                        newInvDisplay.addChild(newSlot);
                    }
                }

                Game.Data.Add(newInvDisplay);
            }
        }
    },
    craft: () => {
        const craftDisplay = Game.Data.GUI.find(gui => gui.ID === "CRAFT");

        if (craftDisplay instanceof Display) {
            // Close the existing crafting window
            Game.Data.Remove(craftDisplay);
        } else {
            const existingWindows = Game.Data.GUI.filter(gui => gui instanceof Display);

            if (existingWindows.length === 0) {
                const cProps = {
                    window: {
                        w: Game.canvas.width / 2,
                        h: Game.canvas.height / 2 + scale * 2
                    },
                    card: {
                        w: scale * 4,
                        h: scale * 2,
                        amount: 2
                    }
                };
                // Create a new crafting window only if no other windows are open
                const newCraftDisplay = new Display("CRAFT", {
                    w: cProps.window.w,
                    h: cProps.window.h,
                    title: "Crafting",
                    hasTitle: true
                });

                newCraftDisplay.onUpdate = () => {
                    if (newCraftDisplay.indexToggle instanceof NumberInput) {
                        newCraftDisplay.indexToggle.update()
                    }
                }

                newCraftDisplay.onRender = () => {
                    if (newCraftDisplay.indexToggle instanceof NumberInput) {
                        newCraftDisplay.indexToggle.render()
                    }
                }

                // Loop through available recipes and add CraftCard for each if craftable
                for (const recipeName in Game.vanilla.recipes) {
                    const recipeObject = Game.vanilla.recipes[recipeName];

                    const isCraftable = recipeObject.ingredients.every(({ item, amount }) => {
                        const inventoryItem = Game.player.INV.items.find(invItem => invItem.TYPE === item.TYPE);
                        return inventoryItem && inventoryItem.amount >= amount;
                    });

                    if (isCraftable) {
                        if (newCraftDisplay.hasRecipes !== true) {
                            newCraftDisplay.hasRecipes = true
                            newCraftDisplay.recipesList = []
                        }

                        newCraftDisplay.recipesList.push([recipeObject, recipeName])
                    }
                }

                let offsetY = -cProps.window.h / 2 + cProps.card.h; // Offset for the vertical position of buttons

                if (newCraftDisplay.hasRecipes) {
                    let index = 0;
                    for (i in newCraftDisplay.recipesList) {
                        const AnObject = newCraftDisplay.recipesList[i]
                        if (i != "remove") { // i have anarray method called "remove" and it makes an error ): <== sad face
                            index++;
                            if (index >= cProps.card.amount + 1)
                                break;

                            const craftedCraft = new CraftCard(AnObject[0], AnObject[1], {
                                POS: { x: 0, y: offsetY },
                                w: cProps.card.w,
                                h: cProps.card.h,
                                bgFill: "green"
                            });
                            newCraftDisplay.addChild(craftedCraft);

                            offsetY += craftedCraft.h + craftedCraft.h / 2;
                        }
                    }

                    if (newCraftDisplay.recipesList.length > cProps.card.amount) {
                        newCraftDisplay.indexToggle = new NumberInput({
                            margin: 64,
                            numberSize: 128,
                            numberFont: "sans",
                            POS: { y: offsetY, x: 0 }
                        });

                        newCraftDisplay.indexToggle.onChange = () => {
                            // TODO: left to make it update the items that would apper!
                        }
                    }
                }

                Game.Data.Add(newCraftDisplay);
            }
        }
    },
    // loop functions
    update() {
        Game.render.refreshCanvas()
        Game.Camera.update()
        Game.render.items()
        Game.render.entitys()
        Game.render.blocks()
        Game.render.GUI()
        Game.render.hearts()

        Game.render.mouse()
    },
    refreshCanvas: () => {
        DRAW.clearRect(Game.Camera.POS.x - Game.canvas.width / 2, Game.Camera.POS.y - Game.canvas.height / 2, Game.canvas.width, Game.canvas.height);
    },
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
    hearts: () => {
        const player = Game.player;
        const heartSize = scale / 2;
        const margin = heartSize + 4;
        const startX = Game.Camera.POS.x - (margin + heartSize) * 2.25;
        const staticY = Game.Camera.POS.y + (Game.canvas.height / 2 - scale / 2);

        for (let i = 0; i < Math.floor(player.HP / 10); i++) {
            DRAW.drawImage(Texture.getImage("heart"), startX + i * margin, staticY, heartSize, heartSize);
        }

        if (player.HP % 10 > 0) {
            DRAW.drawImage(Texture.getImage("heart2"), startX + Math.floor(player.HP / 10) * margin, staticY, heartSize, heartSize);
        }
    },
    mouse: () => {
        DRAW.save()
        // move to mouse position
        DRAW.translate(Game.mouse.data.position.canvas.x, Game.mouse.data.position.canvas.y)
        // draw the item if exsits
        const mouseItem = Game.mouse.item;
        if (mouseItem instanceof Item) {
            DRAW.drawImage(
                mouseItem.texture,
                -mouseItem.w / 2,
                -mouseItem.h / 2,
                mouseItem.w,
                mouseItem.h
            );
        }
        // draw the mouse image
        DRAW.drawImage(Texture.getImage("cursor"), 0, 0, scale / 2, scale / 2)
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
        const keys = this.array;
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
        const mouseX = Game.mouse.data.position.canvas.x;
        const mouseY = Game.mouse.data.position.canvas.y;

        return (
            mouseX >= object.POS.x - object.w / 2 &&
            mouseX <= object.POS.x + object.w / 2 &&
            mouseY >= object.POS.y - object.h / 2 &&
            mouseY <= object.POS.y + object.h / 2
        );
    },
    item: new VoidItem(),
}

// Vanilla pre-confguired values for blocks
Game.vanilla = {}

Game.vanilla.item = {
    oakDrop: {
        texture: Texture.getImage("oakDrop"),
        TYPE: "Game:oakDrop",
        size: 64,
        amount: 1,
        displayName: "Oak drop"
    },
    oakSeed: {
        texture: Texture.getImage("oakSeed"),
        TYPE: "Game:oakSeed",
        size: 64,
        amount: 1,
        isBlockPlacer: true,
        placedBlock: "oakPlant",
        displayName: "Oak plant"
    },
    feather: {
        texture: Texture.getImage("feather"),
        TYPE: "Game:feather",
        size: 64,
        amount: 1,
        displayName: "Feather"
    },
    rawChicken: {
        texture: Texture.getImage("rawChicken"),
        TYPE: "Game:rawChicken",
        size: 64,
        amount: 1,
        isConsumeAble: true,
        hungerPoints: 1,
        consumeTime: 1500,
        displayName: "Raw chicken"
    },
    oakPlank: {
        texture: Texture.getImage("oakPlank"),
        TYPE: "Game:oakPlank",
        size: 64,
        amount: 16,
        isBlockPlacer: true,
        placedBlock: "oakPlank",
        displayName: "Oak plank"
    },
}

Game.vanilla.entity = {
    chicken: {
        HP: 10,
        texture: Texture.getImage("chicken"),
        TYPE: "Game:chicken",
        stateList: ["WALK", "IDLE", "IDLE"],
        dropList: [
            { item: Game.vanilla.item.feather, min: 1, max: 3 },
            { item: Game.vanilla.item.rawChicken, min: 1, max: 2 }
        ]
    }
}

Game.vanilla.block = {
    oak: {
        TYPE: "Game:oak",
        texture: Texture.getImage("oak"),
        HP: 16,
        w: 2,
        h: 2,
        DROPS: [Game.vanilla.item.oakDrop, Game.vanilla.item.oakDrop, Game.vanilla.item.oakSeed],
        DPD: 0.5
    },
    oakPlant: {
        TYPE: "Game:oakPlant",
        texture: Texture.getImage("oakSeed"),
        HP: 2,
        w: 2,
        h: 2,
        DROPS: [Game.vanilla.item.oakSeed],
        DPD: 0.5,
        growTime: 5000,
        growBlock: "oak"
    },
    oakPlank: {
        TYPE: "Game:oakPlank",
        texture: Texture.getImage("oakPlank"),
        HP: 2,
        w: 2,
        h: 2,
        DROPS: [Game.vanilla.item.oakPlank],
    }
}

Game.vanilla.recipes = {
    oakPlank:
    {
        ingredients: [
            { item: Game.vanilla.item.oakDrop, amount: 4 }
        ],
        result: { item: Game.vanilla.item.oakPlank, amount: 16 }
    },
    oakDrop:
    {
        ingredients: [
            { item: Game.vanilla.item.oakDrop, amount: 2 }
        ],
        result: { item: Game.vanilla.item.oakDrop, amount: 4 }
    },
    oakSeed:
    {
        ingredients: [
            { item: Game.vanilla.item.oakDrop, amount: 0.1 }
        ],
        result: { item: Game.vanilla.item.oakSeed, amount: 1 }
    }
}

setTimeout(Game.awake, 1000)