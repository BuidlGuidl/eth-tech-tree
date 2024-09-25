# Developer Guide

This project is aimed to be consumed via `npx eth-tech-tree`. The code in this repo is the source used to generate the consumable script.

The steps you should follow to make changes to the code are the following:

1. Clone and `cd` into the repo
2. Start a development server watching changes with `yarn dev`. This process will build the script as you save changes.

Now there are two scenarios depending on if you want to change the CLI tool itself, or the project resulting from running the CLI.

To avoid confusion when talking about this project or resulting projects, we'll refer to projects created via the CLI tool as "instance projects".

## Changes to the CLI

The CLI tool source code can be found under `src/`. As you make changes in those files, the development server will compile the source and generate the script inside `bin/`.

To run the script you can simply run

```bash
yarn cli
```

This command will run the compiled script inside `bin/`.

You can send any option or flag to the CLI command. For example, a handy command is `yarn cli -s` to tell the CLI to skip installing dependencies or `yarn cli [project_path]` example `yarn cli ../test-cli` this will skip the "Project Name" prompt and use the provided path where project instance will be created in.

You may find it helpful to set environment variables that can be found in `src/config.ts` to use a local [backend](https://github.com/BuidlGuidl/eth-tech-tree-backend) or point to a different repository for setting up challenges.

## Back-merging main branch / Publishing to NPM (TODO: Update to main branch workflow)

1. Make sure you have the latest changes from `main` branch
2. Checkout to `cli` branch and create a new branch from it eg: `cli-backmerge`
3. Checkout to `cli-backmerge` branch and `git merge main`
4. If there are any conflicts, resolve them and commit the changes
5. Add changeset by doing `yarn changeset add` follow prompt and commit changes, learn more about changeset [here](https://github.com/scaffold-eth/scaffold-eth-2/blob/cli/CONTRIBUTING.md#changeset)
6. Push the branch and create a PR against `cli` branch

> NOTE: The `cli-backmerge` branch should be merged with "Create a merge commit" option instead of "Squash and merge" option into `cli` branch to preserve the commit history and not needing to create an extra commit directly into `cli` to merge `main` to resolve conflicts.

### Publishing to NPM

Once the previous PR containing `changeset` is merged to `cli` branch, github bot will automatically create a new PR against `cli` branch containing version increment in `package.json` based on `changeset` and will also update `CHANGELOG.md` with respective `changesets` present.

After this GH bot PR is merged to `cli`. It will auto publish a new release to NPM.
