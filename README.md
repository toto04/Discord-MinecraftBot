# Discord-MinecraftBot

### A web / discord interface for your local minecraft server
  
This Node.js app will let you control your local minecraft Java Edition server with 
- a simple Web interface based on [express](https://expressjs.com) and [socket.io](https://socket.io)   
**or** 
- via a Discord bot based on [discord.js](https://discord.js.org/#/)

# Setup
## prerequisites:
You have to have installed
- **[Java](https://www.java.com/it/)** (how on earth would you play minecraft otherwise??)
- **[Node.js](https://nodejs.org/en/)** as this thing is written in Javascript, you know

You will also need to create a Discord application [here](https://discordapp.com/developers/applications/)  
Once you are done you should navigate to bot, create the bot and copy your token

## setting the script up

Just git clone the repository with

> git clone https://github.com/toto04/Discord-MinecraftBot.git 

You will now have the folder with everything you need inside.

Rename the `.env_example` file to `.env` and paste your bot token where you see
> BOT_TOKEN=`<your_token>`  

and edit the rest of the settings to your heart's content

# IDs
If you want to bind a text channel for the bot to report the minecraft chat or if you want to be able to use the `'/'` command you'll want to find the channel's / user's IDs respectively

To do so you'll need to make sure Discord's Developer Mode is enabled by going to  
`User settings` > `appearance` > `Enable Developer Mode`

Once you're done you can simply right click the channel / the user of whom you want to copy the ID, and paste it as described in the `.env` file