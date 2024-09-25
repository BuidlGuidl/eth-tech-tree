> ⚠️ Ethereum Development Tech Tree is currently under heavy construction.

# ETH Development Tech Tree
Test your skills and find some new ones by completing challenges.

There are three different types of nodes on the tree:
- Challenges: A repository that poses a problem that you must solve with Solidity. You deploy your contract and submit your contract address so we can test it to ensure your solution works, allowing you to progress.
- Quizzes: Links to source material that will help you to master a topic that will be encountered in later challenges.
- Capstone Projects: These are large scale projects that stretch your knowledge about the ecosystem. A description of the project is provided but it is up to you to fulfill the description.

## Quick Start
To run this CLI application
- `yarn install`
- `yarn build`
- `yarn cli`

If you are actively developing you may find it helpful to run the build and cli commands together each time since you have to build for your changes to be present.
- `yarn build && yarn cli`

## CLI (conceptualized)
```vbnet
Governance 
       ├─ Token Voting ♟️ - LVL 1 
       │       └─ DAO governance proposals and Voting ♟️ - LVL 2 
       │                          ├─ Moloch Rage quit ♟️ - LVL 2 
❯      │                          │         └─ OZ Governor ♟️ - LVL 2 
       │                          └─ Offchain Voting ♟️ - LVL 3 
       ├─ The DAO (for context) 📖 - LVL 1 
(Move up and down to reveal more choices)
```

## MVP
- ETT CLI enables users to see the full scope of the tech tree
- Challenges are locked/unlocked based on a users progress
- It shows them their proficiency in each branch of the tree based on challenges completed.
- They can download a challenge locally
- They can deploy and verify their contract with very few steps
- They can submit the contract address for the challenge and get real-time feedback
- There are 5 - 10 challenges available. We will limit to a few branches at the start
- CLI will show leaderboard

## Future Ambitions
- Issue onchain attestation for completion of the challenge
- Integrate with BuidlGuidl app to show their completed challenges
- Front end that shows their progress and a leaderboard - phase 1
- Front end that offers full functionality outside of the ETT CLI - phase 2
- Add the rest of challenges + add new ones + add new branches
- Add the other challenge types ("references" which require quizzes, "personal-challenges" which are very big tasks with little instruction - hard for us to test)

## Ideas
- Add a way for users to prove they have mastered certain concepts so that they can unlock harder challenges earlier 
- Granular testing so that a user is awarded points based on additional tests (also may need to allow users to go back and resubmit challenges)
- Capture the flag type NFT that a user can "steal" when they are the new leader. Might consider 1st, 2nd, 3rd place NFTs. Announcing a steal on social media would be great for encouraging user engagement