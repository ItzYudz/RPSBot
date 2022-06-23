const { Client } = require('photop-client')

const client = new Client({ username: 'RPS', password: process.env['Pass'] })

const JSONdb = require('simple-json-db')

const db = new JSONdb('storage.json')

const START = 'rps!start'

const STARTTEXT = 'Started RPS! chat "rps!play" to play!'

const TIME = 120000

const PREFIX = 'rps!'

const choices = ["rock", "paper", "scissors"]

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getAI(player, ai) {
  switch (player) {
    case 'p':
      switch (ai) {
        case 'scissors':
          return 'lose'
        case 'rock':
          return 'win'
        case 'paper':
          return 'tie'
      }
      break;
    case 'r':
      switch (ai) {
        case 'scissors':
          return 'win'
        case 'paper':
          return 'lose'
        case 'rock':
          return 'tie'
      }
      break;
    case 's':
      switch (ai) {
        case 'scissors':
          return 'tie'
        case 'paper':
          return 'win'
        case 'rock':
          return 'lose'
      }
  }
}

function getCom(c) {
  switch (c) {
    case 'play':
      return {
        name: 'play',
        func: async ({ chat, body, args: [h], data }) => {
          const d = JSON.parse(db.get(chat.author.id))
          var ai = (`${choices[getRandomInt(choices.length)]}`)
          if (body == undefined && body != '') {
            chat.reply(`You need to provide a body (aka choice) ex: r (standing for rock)`)
          } else {
            const game = await getAI(body, ai)
            let t;
            switch (game) {
              case 'tie':
                t = `You tied... | Opponent: ${ai}`
                break;
              case 'lose': //just a second brb ok
                if (d.extraEXP == false) {
                  t = `You lost... | Opponent: ${ai}`
                  d.points -= 10
                } else {
                  t = `You lost... | Opponent: ${ai} | (Your extraEXP was used.)`
                  d.points -= 5
                }
                break;
              case 'win':
                if (d.extraEXP == false) {
                  t = `You won! | Opponent: ${ai}`
                  d.points += 15
                } else {
                  t = `You won! | Opponent: ${ai} | (Your extraEXP was used.)`
                  d.points += 20
                }
                break;
            }
            setTimeout(function() {
              chat.reply(t)
              d.matches += 1
              db.set(chat.author.id, JSON.stringify(d))
            }, 1000)
          }
        }
      }
    case 'stats':
      return {
        name: 'stats',
        func: ({ chat, body, args: [h], data }) => {
          const d = JSON.parse(db.get(chat.author.id))
          if (d.matches > 0) {
            chat.reply(`Stats for ${chat.author.username}: Matches played: ${d.matches}, Points: ${d.points}, Level: ${d.level}. You earn 15 points if you win, 5 points if you tie, and -10 points if you lose.`)
          }
          if (d.matches == 0) {
            chat.reply(`You haven't played any matches! start playing with the command "play".`)
          }
        }
      }
    case 'levelup':
      return {
        name: 'levelup',
        func: async ({ chat, body, args: [h], data }) => {
          const d = JSON.parse(db.get(chat.author.id))
          const exp = d.level * 50
          if (d.points >= exp) {
            chat.reply(`Leveled up from ${d.level} to ${d.level + 1}`)
            d.level += 1
          }
          db.set(chat.author.id, JSON.stringify(d))
        }
      }
    case 'shop':
      return {
        name: 'shop',
        func: ({ chat, body, args: [h], data }) => {
          chat.reply(`Shop items: Extra Points. Instead of losing and subtracting 10, you only subtract 5, and when you win, instead of 15 points, you get 20! ID: extraEXP, Cost: 250 points.`)
        }
      }
    case 'buy':
      return {
        name: 'buy',
        func: ({ chat, body, args: [h], data }) => {
          const d = JSON.parse(db.get(chat.author.id))
          if (body == undefined) {
            chat.reply("You need to provide something to buy! Run the shop command for items.")
          }
          if (body == "extraEXP" && d.points >= 250) {
            d.points -= 250
            d.extraEXP = true
            chat.reply("Bought Extra Points item!")
            db.set(chat.author.id, JSON.stringify(d))
          } else {
            chat.reply("Couldn't buy item... Likely reason: Not enough points. Run the command again if you think this is an error.")
          }
        }
      }
    case 'help':
      return {
        name: 'help',
        func: ({ chat, body, args: [h], data }) => {
          if (body == undefined) {
            chat.reply(`Not a valid command.`)
          }
          if (body == "levels") {
            chat.reply(`Level 2 is 50 points, 3 is 50, 4 is 150, and so on.`)
          }
          if (body == "stats") {
            chat.reply(`Shows your stats. Use the command. It's pretty self explanitory.`)
          }
        }
      }
  }
}

const Version = 4

const defaultData = {
  version: 4,
  level: 1,
  points: 0,
  matches: 0,
  extraEXP: false
}

async function VersionUpdate(uid) {
  const d = JSON.parse(await db.get(uid))
  switch (d.version) {
    case 4:
      d.version = 4
      d.extraEXP = false
      db.set(uid, JSON.stringify(d))
      break;
  }
}

client.onPost = async (post) => {
  if (post.text == START) {
    setTimeout(function() {
      post.chat(STARTTEXT)
    }, 2500)
    const resettime = await post.connect(TIME, () => {
      post.onChat = () => { };
      if (post.text == START) {
        post.chat("I have disconnected because it has been 2 minutes since you used a command.")
      }
    })
    resettime()
    post.onChat = async (chat) => {
      resettime()
      if (chat.text.toString().toLowerCase().startsWith(PREFIX)) {
        const match = chat.text.substring(PREFIX.length).match(/([a-z0-9\.]+)(.*)/i);
        if (match) {
          const [_, commandname, _body] = match;
          const body = _body.trim()
          const args = body.split(/\s+/);
          const context = { client, chat, body, args }
          if (db.get(chat.author.id) != undefined) {
            context.data = JSON.parse(await db.get(chat.author.id))
            if (context.data.version != Version) {
              VersionUpdate(chat.author.id)
            }
          } else {
            db.set(chat.author.id, JSON.stringify(defaultData))
            context.data = defaultData
          }
          setTimeout(async function() {
            if (getCom(commandname) != undefined) {
              getCom(commandname).func(context)
            } else {
              chat.reply(`Couldn't find command... Make sure that your spelling is correct.`)
            }
          }, 111)
        } else {
          chat.reply(`You must provide a command to use! Run rps!help for help!`)
        }
      }
    }
  }
}

client.onReady = () => {
  let interval = setInterval(() => {
    if (client._network.simpleSocket.secureID) {
      console.log("Bot is ready!")
      clearInterval(interval)
    }
  }, 100)
}
require('http').createServer((req, res) => res.end('online and running on app.photop.live')).listen(3000)
