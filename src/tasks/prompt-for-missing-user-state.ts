import { getUser, upsertUser } from "../modules/api";
import {
  UserState
} from "../types";
import inquirer from "inquirer";
import { saveUserState } from "../utils/stateManager";
import { isValidAddressOrENS, getDevice, checkValidPathOrCreate, isValidAddress } from "../utils/helpers";

// default values for unspecified args
const defaultOptions: Partial<UserState> = {
  installLocation: process.cwd() + '/challenges',
};

export async function promptForMissingUserState(
  userState: UserState
): Promise<UserState> {
  const userDevice = getDevice();
  let identifier = userState.address;

  if (!userState.address) {
    const answer = await inquirer.prompt({
      type: "input",
      name: "identifier",
      message: "Your wallet address (or ENS):",
      validate: isValidAddressOrENS,
    });

    identifier = answer.identifier;
  }

  // Fetch the user data from the server - also handles ens resolution
  let user = await getUser(identifier as string);
  const newUser = !user?.address;
  const existingInstallLocation = user?.installLocations?.find((loc: {location: string, device: string}) => loc.device === userDevice);
  
  // New user
  if (newUser) {
    if (isValidAddress(identifier as string)) {
      user.address = identifier as string;
    } else {
      user.ens = identifier as string;
    }
  }

  // Prompt for install location if it doesn't exist on device
  if (!existingInstallLocation) {
    const answer = await inquirer.prompt({
      type: "input",
      name: "installLocation",
      message: "Where would you like to download the challenges?",
      default: defaultOptions.installLocation,
      validate: checkValidPathOrCreate,
    });

    // Create (or update) the user with their preferred install location for this device
    user.location = answer.installLocation;
    user.device = userDevice;
    user = await upsertUser(user);
  }
  
  const { address, ens, installLocations } = user;
  const thisDeviceLocation = installLocations.find((loc: {location: string, device: string}) => loc.device === userDevice);
  const newState = { address, ens, installLocation: thisDeviceLocation.location };
  if (JSON.stringify(userState) !== JSON.stringify(newState)) {
    // Save the new state locally
    await saveUserState(newState);
  }

  return newState;
}
