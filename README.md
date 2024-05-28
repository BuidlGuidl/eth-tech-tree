> ⚠️ Ethereum Development Tech Tree is currently under heavy construction.

# ETH Development Tech Tree
Test your skills and find some new ones by completing challenges.

There are three different types of nodes on the tree:
- Challenges: A repository that poses a problem that you must solve with Solidity. Your code is then tested to ensure your solution works, allowing you to progress.
- References: Links to source material that will help you to master a topic that will be encountered in later challenges.
- Personal Challenges: These are large scale projects that stretch your knowledge about the ecosystem. A description of the project is provided but it is up to you to fulfill the description.

## Quick Start
To run this CLI application
- `yarn install`
- `yarn build`
- `yarn cli`

If you are actively developing you may find it helpful to run the build and cli commands together each time since you have to build for your changes to be present.
- `yarn build && yarn cli`

## MVP
- ETT CLI enables users to see the full scope of the tech tree
- They can see clearly which ones are unlocked and which ones are still locked
- It only allows them to interact with the challenges that are unlocked
- It shows them their progress/general score on each challenge and total score on each branch of the tree
- They can download a challenge locally
- They can deploy and verify their contract with very few steps
- They can submit the contract address for the challenge and get real-time feedback
- If they pass the challenge it unlocks the next set of challenges
- There are 5 - 10 challenges available. We will limit to a few branches at the start
- CLI will show leaderboard

## Future Ambitions
- Issue onchain attestation for completion of the challenge
- Front end that shows their progress and a leaderboard - phase 1
- Front end that offers full functionality outside of the ETT CLI - phase 2
- Add the rest of challenges + add new ones + add new branches
- Add the other challenge types ("references" which require quizzes, "personal-challenges" which are very big tasks with little instruction - hard for us to test)

## Ideas
- Add a way for users to prove they have mastered certain concepts so that they can unlock harder challenges earlier 
- Granular testing so that a user is awarded points based on additional tests (also may need to allow users to go back and resubmit challenges)
- Capture the flag type NFT that a user can "steal" when they are the new leader. Might consider 1st, 2nd, 3rd place NFTs. Announcing a steal on social media would be great for encouraging user engagement