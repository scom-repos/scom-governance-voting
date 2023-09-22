import { BigNumber } from "@ijstech/eth-wallet";
import { INetworkConfig } from "@scom/scom-network-picker";
import { IWalletPlugin } from "@scom/scom-wallet-modal";

export type ProposalType = 'Executive' | 'Poll';

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
    token0?: string;
    token1?: string;
    oracle?: string;
    value?: any;
    address?: string;
    lotSize?: number;
    token?: string;
}

export interface IVotingParams {
    executor: string;
    id: BigNumber;
    name: string;
    options: string[];
    voteStartTime: BigNumber;
    voteEndTime: BigNumber;
    executeDelay: BigNumber;
    status: boolean[];
    optionsWeight: BigNumber[];
    quorum: BigNumber[];
    executeParam: string[];
    executed?: boolean;
}

export interface IVotingResult {
    executor: string;
    id: BigNumber;
    address: string;
    name: string;
    options: { [key: string]: BigNumber };
    quorum: string;
    voteStartTime: Date;
    endTime: Date;
    executeDelay: BigNumber;
    executed: boolean;
    vetoed: boolean;
    totalWeight: string;
    threshold: string;
    remain: number;
    quorumRemain: string;
    veto?: boolean;
    executiveDelay?: number;
    majorityPassed?: boolean;
    thresholdPassed?: boolean;
    status?: string;
    executeParam?: IExecuteParam;
    title?: string;
}

export interface IOption {
    optionText: string;
    optionValue: string | number;
    optionWeight?: any
}