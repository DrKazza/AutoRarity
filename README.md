# AutoRarity

### Helper
```
    Rarity Autolevelling commands are:
        node index.js sum/summary                   - gives a summary of your characters
        node index.js gl/globalStats                - gives global stats (gold/materials1/number of token of each classes)
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
        node index.js gp                            - get current gas price
        node index.js cn                            - get current nonce
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
the `dotenv_config_path` param will be ignored

## Debug mode
You can pass `--debug=true` to switch to debug mode that will display real error instead of `xp error`/`point error`etc  
When it's activated you will see this warning `/!\DEBUG ON/!\` at start
