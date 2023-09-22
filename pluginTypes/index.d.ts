/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <amd-module name="@scom/scom-governance-voting/interface.ts" />
declare module "@scom/scom-governance-voting/interface.ts" {
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
}
/// <amd-module name="@scom/scom-governance-voting/store/core.ts" />
declare module "@scom/scom-governance-voting/store/core.ts" {
    export interface CoreAddress {
        OAXDEX_Governance: string;
        OAXDEX_VotingRegistry: string;
        GOV_TOKEN: string;
    }
    export const coreAddress: {
        [chainId: number]: CoreAddress;
    };
}
/// <amd-module name="@scom/scom-governance-voting/store/utils.ts" />
declare module "@scom/scom-governance-voting/store/utils.ts" {
    import { ERC20ApprovalModel, IERC20ApprovalEventOptions, INetwork } from "@ijstech/eth-wallet";
    import { ITokenObject } from "@scom/scom-token-list";
    export class State {
        infuraId: string;
        networkMap: {
            [key: number]: INetwork;
        };
        rpcWalletId: string;
        approvalModel: ERC20ApprovalModel;
        constructor(options: any);
        private initData;
        initRpcWallet(defaultChainId: number): string;
        getRpcWallet(): import("@ijstech/eth-wallet").IRpcWallet;
        isRpcWalletConnected(): boolean;
        getChainId(): number;
        private setNetworkList;
        setApprovalModelAction(options: IERC20ApprovalEventOptions): Promise<import("@ijstech/eth-wallet").IERC20ApprovalAction>;
        getAddresses(chainId?: number): import("@scom/scom-governance-voting/store/core.ts").CoreAddress;
        getGovToken(chainId: number): ITokenObject;
    }
    export function isClientWalletConnected(): boolean;
    export const getWETH: (chainId: number) => ITokenObject;
}
/// <amd-module name="@scom/scom-governance-voting/store/index.ts" />
declare module "@scom/scom-governance-voting/store/index.ts" {
    export * from "@scom/scom-governance-voting/store/utils.ts";
}
/// <amd-module name="@scom/scom-governance-voting/assets.ts" />
declare module "@scom/scom-governance-voting/assets.ts" {
    function fullPath(path: string): string;
    const _default: {
        fullPath: typeof fullPath;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-governance-voting/data.json.ts" />
declare module "@scom/scom-governance-voting/data.json.ts" {
    const _default_1: {
        infuraId: string;
        networks: {
            chainId: number;
            explorerTxUrl: string;
            explorerAddressUrl: string;
        }[];
        defaultBuilderData: {
            defaultChainId: number;
            networks: {
                chainId: number;
            }[];
            wallets: {
                name: string;
            }[];
            showHeader: boolean;
            showFooter: boolean;
        };
    };
    export default _default_1;
}
/// <amd-module name="@scom/scom-governance-voting/index.css.ts" />
declare module "@scom/scom-governance-voting/index.css.ts" {
    const _default_2: string;
    export default _default_2;
    export const voteListStyle: string;
    export const comboBoxStyle: string;
}
/// <amd-module name="@scom/scom-governance-voting/api.ts" />
declare module "@scom/scom-governance-voting/api.ts" {
    import { ITokenObject } from "@scom/scom-token-list";
    import { State } from "@scom/scom-governance-voting/store/index.ts";
    export function getVotingAddresses(state: State, chainId: number, tokenA: ITokenObject, tokenB: ITokenObject): Promise<string[]>;
    export function getVotingResult(state: State, votingAddress: string): Promise<any>;
    export function getOptionVoted(state: State, votingAddress: string, address: string): Promise<any>;
}
/// <amd-module name="@scom/scom-governance-voting/voteList.tsx" />
declare module "@scom/scom-governance-voting/voteList.tsx" {
    import { ControlElement, Module } from "@ijstech/components";
    import { State } from "@scom/scom-governance-voting/store/index.ts";
    interface IOption {
        optionText: string;
        optionValue: string | number;
    }
    interface IData {
        options: IOption[];
        address: string;
        expiry: Date;
        selectedVotes?: string[];
    }
    interface IVoteListElement extends ControlElement {
        onSelect?: any;
        data?: IData;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-governance-voting-vote-list']: IVoteListElement;
            }
        }
    }
    export class GovernanceVoteList extends Module {
        private dropdownStack;
        private lblDesc;
        private btnChoice;
        private _state;
        private userWeightVote;
        private selectedItem;
        private _data;
        onSelect: any;
        get data(): IData;
        set data(value: IData);
        get state(): State;
        set state(value: State);
        private get selectedChoiceText();
        private get hasVoted();
        private get isDropdownDisabled();
        private get remainingTimeToBeExpired();
        private get optionValue();
        private get stakeVote();
        init(): void;
        private renderUI;
        private onSelectItem;
        private getVoteOptions;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-governance-voting" />
declare module "@scom/scom-governance-voting" {
    import { ControlElement, Module } from "@ijstech/components";
    import { INetworkConfig } from "@scom/scom-network-picker";
    import { IWalletPlugin } from "@scom/scom-wallet-modal";
    import { IGovernanceVoting } from "@scom/scom-governance-voting/interface.ts";
    interface ScomGovernanceVotingElement extends ControlElement {
        lazyLoad?: boolean;
        chainId: number;
        tokenFrom: string;
        tokenTo: string;
        votingAddress: string;
        networks: INetworkConfig[];
        wallets: IWalletPlugin[];
        defaultChainId?: number;
        showHeader?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-governance-voting']: ScomGovernanceVotingElement;
            }
        }
    }
    export default class GovernanceVoting extends Module {
        private dappContainer;
        private loadingElm;
        private lblTitle;
        private lblStakedBalance;
        private lblFreezeStakeAmount;
        private lblVotingBalance;
        private inFavourBar;
        private lblVoteOptionY;
        private lblInFavourVotingQuorum;
        private againstBar;
        private lblVoteOptionN;
        private lblAgainstVotingQuorum;
        private lblVoteStartTime;
        private lblVoteEndTime;
        private lblExecuteDeplay;
        private lblProposalDesc;
        private lblExecuteAction;
        private lblExecuteValue;
        private lblVotingQuorum;
        private lblTokenAddress;
        private voteList;
        private btnSubmitVote;
        private txStatusModal;
        private mdWallet;
        private state;
        private _data;
        tag: any;
        private get chainId();
        get defaultChainId(): number;
        set defaultChainId(value: number);
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        removeRpcWalletEvents(): void;
        onHide(): void;
        isEmptyData(value: IGovernanceVoting): boolean;
        init(): Promise<void>;
        private _getActions;
        private getProjectOwnerActions;
        getConfigurators(): any[];
        private getData;
        private setData;
        getTag(): Promise<any>;
        private updateTag;
        private setTag;
        private resetRpcWallet;
        private refreshUI;
        private initWallet;
        private initializeWidgetConfig;
        private showResultMessage;
        private connectWallet;
        private selectVote;
        private handleExecute;
        private onSubmitVote;
        render(): any;
    }
}
