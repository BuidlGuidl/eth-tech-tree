# ETH Development Tech Tree
Test your skills and find some new ones by completing medium to hard Solidity challenges. 

## Quick Start
Run the following command to use the NPM package
```bash
       npx eth-tech-tree
```
The CLI visualizes several categories which contain challenges. Navigate with your arrow keys and hit enter to view the challenge description and see options. Follow the instructions in your CLI to complete challenges and fill out your Ethereum development tech tree.

You can also run individual commands without the tree visualization.

Set up a challenge:
```bash
       npx eth-tech-tree setup CHALLENGE_NAME INSTALL_LOCATION
```

Submit a challenge:
```bash
       npx eth-tech-tree submit CHALLENGE_NAME CONTRACT_ADDRESS
```

Reset your user state (it will re-prompt you for your address and install location):
```bash
       npx eth-tech-tree reset
```

## Development
Clone and `cd` into the repo then run this CLI application with the following commands
- `yarn install`
- `yarn build`
- `yarn cli`

Also consider contributing new challenges here: https://github.com/BuidlGuidl/eth-tech-tree-challenges