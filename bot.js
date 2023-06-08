process.env["NODE_CONFIG_DIR"] = ".";
const config = require("config");
// Imports
const mineflayer = require("mineflayer"); // Import mineflayer, the package I am using for this assignment.
const chalk = require('chalk') // A decoration for console, using different colors for logging the game chat.
const readline = require('readline') 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
// Sets and defines all of the functions I have defined in ./helpers. Functions include getting the amount of XP gained from the game's API, determining if you are whitelisted or not.
const d = new Date();
const { WebhookClient, EmbedBuilder } = require("discord.js");
const { STATEMENT_IS_FALSE } = require("mathsteps/lib/ChangeTypes");
const { vec3 } = require('vec3');
const mineflayerViewer = require('prismarine-viewer').mineflayer
d.getTime();

    // Define bot settings; Getting into actually starting to define the bot using Mineflayer.
    var settings = {
        username: botusername,
        auth: "microsoft",
        version: "1.16.5",
        host: "ItsCharzion.aternos.me",
        port: "34445",
        hideErrors: false,
        checkTimeoutInterval: 60000,
        viewDistance: "tiny",
        chatLengthLimit: 256,
    };

    // Create bot instance
    const bot = mineflayer.createBot(settings);
    bot.setMaxListeners(20);

    // Definite status conditionals
    let isinlobby;
    let isinpregame;
    let isingame;
    let sneakqueued = false;

    // Opposite Direction Method
    function oppositeDirection(dir) {
        if (dir == "forward") return "back";
        if (dir == "back") return "forward";
        if (dir == "left") return "right";
        if (dir == "right") return "left";
    }

    // Create Moving methods using a list
    const directions = ['forward', 'back', 'left', 'right', 'jump', 'sprint']; // The possible directions; how the bot can posibly move.
    
    function setControlState(bot, movement, state) {
        if (directions.includes(movement)) {
          bot.setControlState(movement, state);
        } else {
          console.log(`Invalid movement: ${movement}`); // Logs the correct IF the paramater used in setControlState() is not in the included list.
        }
      } // An example of this in action will be bot.setControlState(forward, True). This toggles on the bot's ability to move forward, thus making it move forward. 
    var currentdir;
    async function moveRandomDirection() {
        const randomnum = Math.floor(Math.random() * 4);

        var direction = generatormove[randomnum];
        console.log(direction);
        currentdir = direction;
        bot.setControlState(direction, true);
        await sleep(0.3);
        bot.setControlState(direction, false);
        direction = oppositeDirection(direction);
        currentdir = direction;
        await sleep(0.7);
        bot.setControlState(direction, true);
        await sleep(0.2);
        bot.setControlState(direction, false);
        await sleep(0.2);
        bot.setControlState("forward", true);
        await sleep(0.2);
        bot.setControlState("forward", false);
        await sleep(0.2);
        bot.setControlState("back", true);
        await sleep(0.2);
        bot.setControlState("back", false);
    }

    async function backForward() {
        // Move forward
        bot.setControlState("forward", true);
        // Wait .5 seconds
        await sleep(0.5);
        // Stop moving forward
        bot.setControlState("forward", false);
        // Wait .5 seconds to stop momentum
        await sleep(0.5);
        // Move head 180 degrees

        bot.look(bot.entity.yaw + degToRad(180), bot.entity.pitch);
        // Wait 1 second
        await sleep(0.3);
        // Move forward
        bot.setControlState("forward", true);
        // Wait .5 seconds
        await sleep(0.5);
        // Stop moving forward
        bot.setControlState("forward", false);
        // Move head 180 degrees to reset direction
        bot.look(bot.entity.yaw + degToRad(180), bot.entity.pitch);
    }

    // Create function that spams sneak while looking at the nearest player
    async function sneakSpam() {
        // Make the bot spam sneak 4 times
        for (let i = 0; i < 4; i++) {
            bot.setControlState("sneak", true);
            await sleep(0.2);
            bot.setControlState("sneak", false);
            await sleep(0.2);
        }
        sleep(1);
        for (let i = 0; i < 4; i++) {
            bot.setControlState("sneak", true);
            await sleep(0.2);
            bot.setControlState("sneak", false);
            await sleep(0.2);
        }
    }

    // Create function to move bot into generator at start of game
    async function moveIntoGenerator() {
        bot.setControlState("back", true);
        await sleep(2);
        bot.setControlState("back", false);
        // Set home pitch and yaw
        homePitch = bot.entity.pitch;
        homeYaw = bot.entity.yaw;
    }

    // Create function for moving around
    async function moveAround() {}

    // Create function for when the game starts
    async function gameStart() {
        await bot.chat("/locraw");
        await moveIntoGenerator();
    }

    // Create function for when the game ends
    async function gameEnd() {}

    // Creates greeting method
    async function botLogin() {
        console.log(
            chalk.hex("#8FCE00")(
                "[BOT] Logged into account: " + bot.entity.username // Lets the user know the bot has succesfully logged into their account
            )
        );
        console.log(chalk.hex("#8FCE00")("[BOT] Logged in at " + d));

        await sleep(2);
        await sleep(3);
        bot.chat(playcommand);
        console.log(`[BOT] Current Mode: ${gamemode}`);
        await webhookSend("[BOT] Logged In");
    }
    
    async function place() {
        let sourcePosition = bot.entity.position.offset(0, -1, 0);
        let sourceBlock = bot.blockAt(sourcePosition)

        let faceVector = {x:1, y:0, z:0};
        bot.placeBlock(sourceBlock, faceVector);
    }
    function lookDown() {
        bot.look(0, -Math.PI / 2, true); // Adjust the pitch angle as needed
      }
    async function crouch() {
        bot.setControlState('sneak', true);
      }
    function forward(duration) {
        bot.setControlState('back', true);
        setTimeout(() => {
          bot.setControlState('back', false);
        }, duration);
      }
    function stopForward(duration) {
        bot.setControlState('forward', false);
      }
    function ForwardUntil() {
        forward(169591);
        crouch()
    }

    // Create spawn event listener
    bot.on('chat', (username, message) => {
        if (message === 'stop' ) {
            process.exit(1)
        }
    });
    bot.once('spawn', () => {
        mineflayerViewer(bot, { firstPerson: true, port: 3000 })
      });
    bot.on('chat', (username, message) => {
        if (message === 'bridge' ) {
            bot.look(0,0)
            setTimeout(() => {
                bot.look(bot.entity.yaw + degToRad(180), bot.entity.pitch)
                bot.look(bot.entity.yaw, bot.entity.pitch - degToRad(82))
            }, 500);
            setTimeout(() => {
                sleep(0.5)
                bot.setControlState('back', true)
                crouch()
            }, 500);
            setTimeout(() => {
                place()
            }, 5000);
        }

    });

    let map;
    let xp = 0;

    let homePitch;
    let homeYaw;

    bot.on("message", async (message) => {
        let msg = message.toString();
        let fancymessage = message.toAnsi();

        console.log(fancymessage);
        // Check if message is json by checking if it starts with a { and ends with a } using regex
        if (msg.match(/^\{.*\}$/)) {
            // Parse the json
            let locraw = JSON.parse(msg);
            map = locraw.map;
            console.log(map);
        }

        if (
            msg.indexOf("Tracking: ") !== -1 &&
            msg.indexOf(" - Distance: ") !== -1
        ) {
            return null;
        } else if (msg.indexOf(": gg") !== -1) {
            return null;
        } else {
            if (msg == "+25 Bed Wars Experience (Time Played)") {
                xp = xp + 25;
                console.log(
                    "You have gained " + xp + " xp this session, since " + d
                );
                if (xp >= maxxp) {
                    console.log(
                        `[BOT] Bot has reached the maximum session xp of: ${maxxp}`
                    );
                    process.exit(1);
                }
            }
            // When the bot gets warned about getting kicked for inactivity, it will move using the function backForward() I created earlier.
            if (msg.indexOf("afk-ed in 10 seconds") !== -1) {
                console.log("[BOT] ANTIAFK STARTED");
                await backForward();
                sneakqueued = true;
            }
            if (msg.indexOf("You were kicked for inactivity") !== -1) {
                await backForward()
                bot.chat("/rejoin")
            }
            //AFK
            if (
                msg.indexOf("You are AFK. Move around to return from AFK.") !==
                -1
            ) {
                await backForward()
                await sleep(3);
                bot.chat(playcommand);
                await sleep(3);
            }
            if (msg.indexOf("game starts in 1 second!") !== -1) {
                await sleep(2);
                console.log("[BOT] GAME STARTED");
                await gameStart();
            }
            if (msg.indexOf("You have respawned!") !== -1) {
                await sleep(1.5);
                await moveIntoGenerator();
            }
            if (msg.indexOf("This game has been recorded.") !== -1) {
                const newxp = await getBWXP(botusername);
                console.log(newxp);
                console.log(startingxp);
                xp = newxp - startingxp;
                console.log("You have gained " + xp + " xp this session");
                if (xp >= maxxp) {
                    console.log(
                        `[BOT] Bot has reached the maximum session xp of: ${maxxp}`
                    );
                    process.exit(1);
                }
                console.log("[BOT] REQUEUED");
                bot.chat(playcommand);
            }
            if (
                msg.indexOf("You have been eliminated!") !== -1 ||
                msg.indexOf("A disconnect occurred in your connection,") !==
                    -1 ||
                msg.indexOf(
                    "An exception occurred in your connection, so you were put in the Bed Wars Lobby!"
                ) !== -1
            ) {
                console.log("[BOT] REQUEUED");
                bot.chat(playcommand);
            }
        }
    });
    rl.prompt(true)
    rl.on('line', async (input) => {
        switch (input) {
            default:
                bot.chat(input);
                break;
        }
    })
    rl.on('line', async (input) => {
        switch (input) {
          default:
            bot.chat(input);
            break;
        }
      })

    bot.on("error", console.log);
    bot.on("kicked", console.log);
})();
