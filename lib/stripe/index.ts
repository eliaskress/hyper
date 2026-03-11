export async function createConnectAccount(_userId: string): Promise<string> {
  throw new Error("Not implemented: createConnectAccount");
}

export async function createPaymentIntent(_amount: number, _campaignId: string): Promise<string> {
  throw new Error("Not implemented: createPaymentIntent");
}

export async function createTransfer(_amount: number, _stripeAccountId: string): Promise<string> {
  throw new Error("Not implemented: createTransfer");
}
