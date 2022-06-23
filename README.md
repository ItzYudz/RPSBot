# RPSBot
This is a bot I made that has an actual database, point system, and level system with wins, losses, and ties with an AI. There is a shop where you can get bonus points, etc.
## Commands
### Prefix
The prefix is rps!
### Play
Use this to play a game of rock, paper, scissors. Use r, p, or s for the body of the command.
### Stats
Shows your stats. Current layout:
`Stats for ${chat.author.username}: Matches played: ${d.matches}, Points: ${d.points}, Level: ${d.level}. You earn 15 points if you win, 5 points if you tie, and -10 points if you lose.` chat.author.username is the username for the person who ran the command, d.matches is the amount of rps games you played, d.points is how much points you have (also used as currency), and d.level is what level you are. I will explain the leveling system later.
### Levelup
Levels up if you have the right amount of points. 50 points is level 2, 100 is 3, 150, is 4, and so on.
### Shop
Shows the shop items. (currently 1)
### Buy
Buys an item.
### Help
Shows help.
