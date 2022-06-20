const { Client } = require('photop-client')

const client = new Client({ username: 'RPS', password: process.env['Pass'] })

const JSONdb = require('simple-json-db')
const db = new JSONdb('storage.json')
const START = 'playrps'
const STARTTEXT = 'Started RPS! chat "rps!play" to play!'
const TIME = 120000
const PREFIX = 'rps!'
const WrongCommand = 'wrong command bozo'
const choices = ["rock", "paper", "scissors"]
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getCom(c) {
  switch (c) {
    case 'play':
      return {
        name: 'play',
        func: ({ chat, body, args: [h], data }) => {
          const d = JSON.parse(db.get(chat.author.id))
          var ai = (`${choices[getRandomInt(choices.length)]}`)
          if (body == "") {
            chat.reply(`You need to provide a body (aka choice) ex: r (standing for rock)`)
          }
          if (body == "r" && ai == "paper") {
            chat.reply(`You lose... Opponent: ` + ai)
            d.points -= 10
          }
          if (body == "r" && ai == "scissors") {
            chat.reply(`You win! Opponent: ` + ai)
            d.points += 15
          }
          if (body == "r" && ai == "rock") {
            chat.reply(`You tied... Opponent: ` + ai)
            d.points += 5
          }
          if (body == "p" && ai == "scissors") {
            chat.reply(`You lose... Opponent: ` + ai)
            d.points -= 10
          }
          if (body == "p" && ai == "rock") {
            chat.reply(`You win! Opponent: ` + ai)
            d.points += 15
          }
          if (body == "p" && ai == "paper") {
            chat.reply(`You tied... Opponent: ` + ai)
            d.points += 5
          }
          if (body == "s" && ai == "rock") {
            chat.reply(`You lose... Opponent: ` + ai)
            d.points -= 10
          }
          if (body == "s" && ai == "paper") {
            chat.reply(`You win! Opponent: ` + ai)
            d.points += 15
          }
          if (body == "s" && ai == "scissors") {
            chat.reply(`You tied... Opponent: ` + ai)
            d.points += 5
          }
          d.matches += 1
          if (body != "r" & body != "p" && body != "s" && body != "") {
            chat.reply(`Unidentified body... the options are r, p, or s.`)
          }
          db.set(chat.author.id, JSON.stringify(d))
          //use db.set(chat.author.id, JSON.stringify(data)) when you are changing data (only after the data is added. I recommend a timeout)
        }
      }
    case 'stats':
      return {
        name: 'stats',
        func: ({ chat, body, args: [h], data }) => {
          if (data.matches > 0) {
            chat.reply(`Stats for ${chat.author.username}: Matches played: ${data.matches}, Points: ${data.points}, Level: ${data.level}. You earn 15 points if you win, 5 points if you tie, and -10 points if you lose.`)
          }
          if (data.matches == null) {
            chat.reply(`You haven't played any matches! start playing with the command "play".`)
          }
        }
      }
    case 'levelup':
      return {
        name: 'levelup',
        func: ({ chat, body, args: [h], data }) => {
          const d = JSON.parse(db.get(chat.author.id))
          if (data.level == null && data.points > 100) {
            d.level = 2
            chat.reply(`Leveled up from 1 to 2`)
          }
          if (data.level == 2 && data.points > 150) {
            d.level = 3
            chat.reply(`Leveled up from 2 to 3`)
          }
          if (data.level == 3 && data.points > 200) {
            d.level = 4
            chat.reply(`Leveled up from 3 to 4`)
          }
          if (data.level == 4 && data.points > 300) {
            d.level = 5
            chat.reply(`Leveled up from 4 to 5`)
          }
          if (data.level == 5 && data.points > 400) {
            d.level = 6
            chat.reply(`Leveled up from 5 to 6`)
          }
          if (data.level == 6 && data.points > 500) {
            d.level = 7
            chat.reply(`Leveled up from 6 to 7`)
          }
          if (data.level == 7 && data.points > 650) {
            d.level = 8
            chat.reply(`Leveled up from 7 to 8`)
          }
          if (data.level == 8 && data.points > 800) {
            d.level = 9
            chat.reply(`Leveled up from 8 to 9`)
          }
          if (data.level == 9 && data.points > 1000) {
            d.level = 10
            chat.reply(`Leveled up from 9 to 10`)
          }
          db.set(chat.author.id, JSON.stringify(d))
        }
      }
    case 'help':
      return {
        name: 'help',
        func: ({ chat, body, args: [h], data }) => {
          if (body == "") {
            chat.reply(`Not a valid command.`)
          }
          if (body == "levels") {
            chat.reply(`100 points = level 2, 150 = 3, 200 = 4, 300 = 5, 400 = 6, 500 = 7, 650 = 8, 800 = 9, 1000 = 10.`)
          }
          if (body == "stats") {
            chat.reply(`Use the command. It's pretty self explanitory.`)
          }
        }
      }
  }
}

const Version = 2.11//this cant be in a decimal, it can only be a whole number

const defaultData = {//this data is for the new user
  version: 2.11//the starting version (1 for now)
}

async function VersionUpdate(uid) {
  const d = JSON.parse(await db.get(uid))
  switch (d.version) {
    case 1://the version that people need to update their account
      d.lvl = 2.11//the data added
      db.set(uid, JSON.stringify(d))//use this whenever you are saving an account update
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
        post.chat("Disconnected because of inactivity. My waiting limit is 2 minutes!")
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
              chat.reply(WrongCommand)
            }
          }, 111)
        } else {
          chat.reply(`no command?`)
        }
      }
    }
  }
}

client.onReady = () => {
  if (START == undefined || START == '') {
    throw new Error(`Your 'START' variable cant be empty...`)
  }
  if (STARTTEXT == undefined || STARTTEXT == '') {
    throw new Error(`Your 'STARTTEXT' variable cant be empty...`)
  }
  if (PREFIX == undefined || PREFIX == '') {
    throw new Error(`Your 'PREFIX' variable cant be empty...`)
  }
  if (TIME == undefined || TIME == '' || TIME < 30000) {
    throw new Error(`Your 'TIME' variable cant be less than 30000 milliseconds...`)
  }
  if (WrongCommand == undefined || WrongCommand == '') {
    throw new Error(`Your 'WrongCommand' variable cant be empty...`)
  }

  console.log(`Bot is ready!`)
}
require('http').createServer((req, res) => res.end('online and running on app.photop.live')).listen(3000)
