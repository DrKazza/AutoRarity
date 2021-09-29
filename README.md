# AutoRarity

### Helper
```
    Rarity Autolevelling commands are:
        node index.js sum/summary                   - gives a summary of your characters
        node index.js gs/globalStats                - gives global stats (gold/materials1/number of token of each classes)
        node index.js xp                            - claim xp/level up/gold collection/dungeon/transferToMule - one off
        node index.js auto                          - automatic repeating xp/levelling/gold collection/dungeon/transferToMule
        node index.js utl/updateTokenList           - update the token id list in .env file
        node index.js dgl/dgList                    - get list of available dungeon
        node index.js cl/classList                  - get list of available class
        node index.js tl/templateList               - get list of available template
        node index.js ap/assignPoint <name> [token] - apply template <name> to all characters or to a specific [token]
        node index.js scout <name> [token]          - scout <name> dungeon with all characters or with a specific [token]
        node index.js dg <name> [token]             - go in <name> dungeon with all characters or with a specific [token]
        node index.js sm [class] [quantity]         - summon [quantity=1] of [class=all]
        node index.js tn/testNames <file>           - validate and check for availability of names in <file>  
        node index.js lpt <block>                   - load transaction starting from <block> into the local database  
        node index.js df [token]                    - gives all fees incurred by tokens or for a specific [token] (based on tx in local db)
        node index.js dtf                           - gives total fees incurred by all token (based on tx in local db)
        node index.js gp                            - get current gas price
```
## How to Use

1. run `npm install`
2. Copy the `.env.dist` to `.env`
3. Fill the variables with your data, you don't have to fill the `TOKENIDS` variable
4. Run `node index utl` to update the `TOKENIDS` variable
5. Run `node index sum` or ` node index gl` to see if everything is setup correctly
6. Run `node index xp` to launch one time or `node index auto` for automatic farming

## In case you have multiple address
You can have multiple `.env` file like `.env.addr2`/`.env.addr3`.  
to use it start the script as follows `node -r dotenv/config index sum dotenv_config_path=./.env.addr2`

## Telegram bot feature
Open Telegram to create a bot and obtain a bot token for it.  
Talk to [@BotFather](https://telegram.me/BotFather) to do this. The bot token looks like `123456:aBcDeF_gHiJkLmNoP-q`.  
Put the token in `.env` file and set `ENABLE_TELEGRAM_BOT` to 'true'.  
Next run `node index auto` wait to see `Bot started` then send `/init` to your bot to finish setup

The telegram bot only work when the script is started in auto mode

For now the bot send warning when your FTM balance is low (the low balance is configurable in `.env` file)  
And there is one command `/getStats` that will send you the same data as `node index gs`, you can test it by starting the bot in test mode `node index testBot`

## Batch mode
You can pass `--batch` to switch to batch mode that will not wait for every transaction but stack then and wait when the batch reach a certain amount 10 by default. You can also specify the batch size `--batch=15`  
When it's activated you will see this warning `/!\BATCH MODE ON/!\` at start


## Debug mode
You can pass `--debug` to switch to debug mode that will display real error instead of `xp error`/`point error`etc  
When it's activated you will see this warning `/!\DEBUG ON/!\` at start
