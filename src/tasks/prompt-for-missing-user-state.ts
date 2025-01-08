import { getUser, upsertUser } from "../modules/api";
import { IUser } from "../types";
import { input } from "@inquirer/prompts";
import { saveUserState } from "../utils/state-manager";
import { isValidAddressOrENS, getDevice, checkValidPathOrCreate, isValidAddress } from "../utils/helpers";

// default values for unspecified args
const defaultOptions: Partial<IUser> = {
  installLocation: process.cwd() + '/challenges',
};

export async function promptForMissingUserState(
  userState: IUser,
  skipInstallLocation: boolean = false
): Promise<IUser> {
  const userDevice = getDevice();
  let identifier = userState.address;

  if (!userState.address) {
    const answer = await input({
      message: "Your wallet address (or ENS):",
      validate: isValidAddressOrENS,
    });

    identifier = answer;
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
  if (!existingInstallLocation && !skipInstallLocation) {
    const answer = await input({
      message: "Where would you like to download the challenges?",
      default: defaultOptions.installLocation,
      validate: checkValidPathOrCreate,
    });

    // Create (or update) the user with their preferred install location for this device
    user.location = answer;
    user.device = userDevice;
    user = await upsertUser(user);
  }
  
  const { address, ens, installLocations, challenges, creationTimestamp } = user;
  const thisDeviceLocation = installLocations?.find((loc: {location: string, device: string}) => loc.device === userDevice);
  const newState = { address, ens, installLocation: thisDeviceLocation?.location, challenges, creationTimestamp };
  if (JSON.stringify(userState) !== JSON.stringify(newState)) {
    // Save the new state locally
    await saveUserState(newState);
  }

  return newState;
}
