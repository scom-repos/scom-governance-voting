import { INetworkConfig } from "@scom/scom-network-picker";
import { IWalletPlugin } from "@scom/scom-wallet-modal";

export interface IGovernanceVoting {
    chainId: number;
    tokenFrom: string;
    tokenTo: string;
    votingAddress: string;
    wallets: IWalletPlugin[];
    networks: INetworkConfig[];
    defaultChainId?: number;
    showHeader?: boolean;
}

export interface IExecuteParam {
    cmd: string;
    token0: string;
    token1: string;
    oracle: string;
}