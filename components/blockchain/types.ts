
export enum NetworkStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Block {
  blockNumber: number;
  timestamp: string;
  txCount: number;
  dataHash: string;
  channelId: string;
  blockHash: string;
  miner?: string;
  gasUsed?: number;
  gasLimit?: number;
  difficulty?: string;
  parentHash?: string;
  transactions?: string[];
}

export interface Transaction {
  txId: string;
  status: string;
  creatorMsp: string;
  timestamp: string;
  chaincode: string;
  blockNumber: number;
  payload?: JsonObject;
  channel?: string;
  gasUsed?: number;
  gasPrice?: number;
  value?: string;
  from?: string;
  to?: string;
  nonce?: number;
}

export interface VerificationResult {
  isImmutable: boolean;
  onChainHash: string;
  referenceHash: string;
  timestamp: string;
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}
