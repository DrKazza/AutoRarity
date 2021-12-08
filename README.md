# AutoRarity
**NOTE IN CASE YOU GET AN ERROR IN NODE 17**
if you get an error like this:

`node:internal/crypto/hash:67
  this[kHandle] = new _Hash(algorithm, xofLen);
                  ^
Error: error:0308010C:digital envelope routines::unsupported`

For Linux/MacOS go to a terminal and type:

`export NODE_OPTIONS=--openssl-legacy-provider`

then run as normal:
node index.js

For Windows setting the environment variables is a bit more annoying
just do this instead:
`node --openssl-legacy-provider index.js`