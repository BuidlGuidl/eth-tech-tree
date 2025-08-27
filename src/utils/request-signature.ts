import { SafeSigner } from "safe-signer";

export const requestSignature = async (message: string) => {
    const signer = new SafeSigner();
    await signer.start(); 
    const response = await signer.sendRequest({message} as any);
    signer.stop();
    return response;
}
