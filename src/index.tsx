import {
    application,
    Button,
    Container,
    Control,
    ControlElement,
    customElements,
    FormatUtils,
    HStack,
    Input,
    Label,
    Modal,
    Module,
    moment,
    Panel,
    Styles
} from "@ijstech/components";
import ScomDappContainer from "@scom/scom-dapp-container";
import { INetworkConfig } from "@scom/scom-network-picker";
import ScomWalletModal, { IWalletPlugin } from "@scom/scom-wallet-modal";
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { IGovernanceVoting, IOption, ProposalType } from "./interface";
import { isClientWalletConnected, State } from "./store/index";
import Assets from './assets';
import configData from './data.json';
import customStyles, { inputStyle, modalStyle } from './index.css';
import { BigNumber, Constants, Wallet } from "@ijstech/eth-wallet";
import { GovernanceVoteList } from './voteList';
import { execute, freezedStake, getLatestVotingAddress, getVotingResult, stakeOf, vote } from "./api";
import { tokenStore } from "@scom/scom-token-list";
import { getFormSchema } from "./formSchema";
import ScomGovernanceVotingFlowInitialSetup from "./flow/initialSetup";

const Theme = Styles.Theme.ThemeVars;

const executeActionMap = {
    setTradeFee: 'Set Trade Fee',
    setProtocolFee: 'Set Protocol Fee',
    setOracleProtocolFee: 'Set Oracle Protocol Fee',
    setOracleTradeFee: 'Set Oracle Trade Fee',
    setProtocolFeeTo: 'Set Protocol Fee Address',
    setMinLotSize: 'Set Min Lot Size',
    setVotingConfig: 'Set Voting Config',
    setMaxAdmin: 'Set Max Admin',
    addAdmin: 'Add Admin',
    removeAdmin: 'Remove Admin',
    setSecurityScoreOracle: 'Set Security Score Oracle',
    setOracle: 'Modify Oracle',
    setMinStakePeriod: 'Set Minimum Stake Period',
}

interface ScomGovernanceVotingElement extends ControlElement {
    lazyLoad?: boolean;
    chainId: number;
    votingAddress: string;
    networks: INetworkConfig[];
    wallets: IWalletPlugin[];
    defaultChainId?: number;
    showHeader?: boolean;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-governance-voting']: ScomGovernanceVotingElement;
        }
    }
}

@customElements('i-scom-governance-voting')
export default class GovernanceVoting extends Module {
    private dappContainer: ScomDappContainer;
    private loadingElm: Panel;
    private lblTitle: Label;
    private lblVotingAddress: Label;
    private mdUpdateAddress: Modal;
    private edtVotingAddress: Input;
    private lblStakedBalance: Label;
    private lblFreezeStakeAmount: Label;
    private lblVotingBalance: Label;
    private inFavourBar: HStack;
    private lblVoteOptionY: Label;
    private lblInFavourVotingQuorum: Label;
    private againstBar: HStack;
    private lblVoteOptionN: Label;
    private lblAgainstVotingQuorum: Label;
    private lblVoteStartTime: Label;
    private lblVoteEndTime: Label;
    private lblExecuteDeplay: Label;
    private btnExecute: Button;
    private lblProposalDesc: Label;
    private lblExecuteAction: Label;
    private lblExecuteValue: Label;
    private lblVotingQuorum: Label;
    private lblTokenAddress: Label;
    private governanceVoteList: GovernanceVoteList;
    private btnSubmitVote: Button;
    private txStatusModal: ScomTxStatusModal;
    private mdWallet: ScomWalletModal;

    private state: State;
    private _data: IGovernanceVoting = {
        chainId: 0,
        votingAddress: '',
        wallets: [],
        networks: []
    };
    tag: any = {};
    private lockTill: number = 0;
    private selectedVoteTexts: string[] = [];
    private selectedVoteObj: IOption;
    private isVoteSelected: boolean = false;
    private proposalType: ProposalType;
    private voteOptions: any = {};
    private votingQuorum: string = '0';
    private executeAction: string = '';
    private executeValue: number | string = '0';
    private tokenAddress: string = '';
    private executeDelaySeconds: number = 0;
    private voteStartTime: Date;
    private executeDelayDatetime: Date;
    private stakedBalance: string = '0';
    private votingBalance: string = '0';
    private freezeStakeAmount: BigNumber = new BigNumber(0);
    private stakeOf: BigNumber = new BigNumber(0);
    private expiry: Date;
    private isCanExecute: boolean;
    private latestVotingAddress: string;

    private get chainId() {
        return this.state.getChainId();
    }

    get defaultChainId() {
        return this._data.defaultChainId;
    }

    set defaultChainId(value: number) {
        this._data.defaultChainId = value;
    }

    get wallets() {
        return this._data.wallets ?? [];
    }
    set wallets(value: IWalletPlugin[]) {
        this._data.wallets = value;
    }

    get networks() {
        return this._data.networks ?? [];
    }
    set networks(value: INetworkConfig[]) {
        this._data.networks = value;
    }

    get showHeader() {
        return this._data.showHeader ?? true;
    }
    set showHeader(value: boolean) {
        this._data.showHeader = value;
    }

    get votingAddress() {
        return this._data.votingAddress || this.latestVotingAddress || "";
    }

    private get isExecutive() {
        return this.proposalType === 'Executive';
    }

    private get voteList(): IOption[] {
        if (this.isExecutive) {
            return [
                {
                    optionText: 'In Favour',
                    optionValue: 'Y',
                },
                {
                    optionText: 'Against',
                    optionValue: 'N',
                },
            ];
        } else {
            return this.voteOptions
                ? Object.keys(this.voteOptions).map((v, i) => {
                    return {
                        optionText: v,
                        optionValue: i,
                        optionWeight: this.voteOptions[v],
                    };
                })
                : [];
        }
    }

    private get isAddVoteBallotDisabled() {
        if (!this.expiry) return true;
        if (moment(this.expiry).isAfter(moment()))
            return Number(this.stakeOf) > 0 ? false : true;
        return true;
    }

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        this.state = new State(configData);
    }

    removeRpcWalletEvents() {
        const rpcWallet = this.state.getRpcWallet();
        if (rpcWallet) rpcWallet.unregisterAllWalletEvents();
    }

    onHide() {
        this.dappContainer.onHide();
        this.removeRpcWalletEvents();
    }

    isEmptyData(value: IGovernanceVoting) {
        return !value || !value.networks || value.networks.length === 0;
    }

    async init() {
        this.isReadyCallbackQueued = true;
        super.init();
        this.governanceVoteList.state = this.state;
        const lazyLoad = this.getAttribute('lazyLoad', true, false);
        if (!lazyLoad) {
            const defaultChainId = this.getAttribute('defaultChainId', true);
            const chainId = this.getAttribute('chainId', true, defaultChainId || 0);
            const votingAddress = this.getAttribute('votingAddress', true, '');
            const networks = this.getAttribute('networks', true);
            const wallets = this.getAttribute('wallets', true);
            const showHeader = this.getAttribute('showHeader', true);
            const data: IGovernanceVoting = {
                chainId,
                votingAddress,
                networks,
                wallets,
                defaultChainId,
                showHeader
            }
            if (!this.isEmptyData(data)) {
                await this.setData(data);
            }
        }
        this.loadingElm.visible = false;
        this.isReadyCallbackQueued = false;
        this.executeReadyCallback();
    }

    private _getActions(category?: string) {
        const formSchema: any = getFormSchema();
        const rpcWallet = this.state.getRpcWallet();
        const actions: any[] = [];
        if (category && category !== 'offers') {
            actions.push({
                name: 'Edit',
                icon: 'edit',
                command: (builder: any, userInputData: any) => {
                    let oldData: IGovernanceVoting = {
                        chainId: 0,
                        votingAddress: '',
                        wallets: [],
                        networks: []
                    };
                    let oldTag = {};
                    return {
                        execute: () => {
                            oldData = JSON.parse(JSON.stringify(this._data));
                            const { chainId, votingAddress } = userInputData;
                            const themeSettings = {};
                            this._data.chainId = this._data.defaultChainId = chainId;
                            this._data.votingAddress = votingAddress;
                            this.resetRpcWallet();
                            this.refreshUI();
                            if (builder?.setData)
                                builder.setData(this._data);

                            oldTag = JSON.parse(JSON.stringify(this.tag));
                            if (builder?.setTag)
                                builder.setTag(themeSettings);
                            else
                                this.setTag(themeSettings);
                            if (this.dappContainer)
                                this.dappContainer.setTag(themeSettings);
                        },
                        undo: () => {
                            this._data = JSON.parse(JSON.stringify(oldData));
                            this.refreshUI();
                            if (builder?.setData)
                                builder.setData(this._data);

                            this.tag = JSON.parse(JSON.stringify(oldTag));
                            if (builder?.setTag)
                                builder.setTag(this.tag);
                            else
                                this.setTag(this.tag);
                            if (this.dappContainer)
                                this.dappContainer.setTag(this.tag);
                        },
                        redo: () => { }
                    }
                },
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            });
        }
        return actions;
    }

    private getProjectOwnerActions() {
        const formSchema: any = getFormSchema();
        const rpcWallet = this.state.getRpcWallet();
        const actions: any[] = [
            {
                name: 'Settings',
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            }
        ];
        return actions;
    }

    getConfigurators() {
        return [
            {
                name: 'Project Owner Configurator',
                target: 'Project Owners',
                getProxySelectors: async (chainId: number) => {
                    return [];
                },
                getActions: () => {
                    return this.getProjectOwnerActions();
                },
                getData: this.getData.bind(this),
                setData: async (data: any) => {
                    await this.setData(data);
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            },
            {
                name: 'Builder Configurator',
                target: 'Builders',
                getActions: this._getActions.bind(this),
                getData: this.getData.bind(this),
                setData: async (data: any) => {
                    const defaultData = configData.defaultBuilderData;
                    await this.setData({ ...defaultData, ...data });
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            },
            {
                name: 'Embedder Configurator',
                target: 'Embedders',
                getData: async () => {
                    return { ...this._data }
                },
                setData: async (properties: IGovernanceVoting, linkParams?: Record<string, any>) => {
                    let resultingData = {
                        ...properties
                    };
                    if (!properties.defaultChainId && properties.networks?.length) {
                        resultingData.defaultChainId = properties.networks[0].chainId;
                    }
                    await this.setData(resultingData);
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            }
        ];
    }

    private getData() {
        return this._data;
    }

    private async setData(data: IGovernanceVoting) {
        this._data = data;
        this.resetRpcWallet();
        await this.refreshUI();
    }

    async getTag() {
        return this.tag;
    }

    private updateTag(type: 'light' | 'dark', value: any) {
        this.tag[type] = this.tag[type] ?? {};
        for (let prop in value) {
            if (value.hasOwnProperty(prop))
                this.tag[type][prop] = value[prop];
        }
    }

    private setTag(value: any) {
        const newValue = value || {};
        for (let prop in newValue) {
            if (newValue.hasOwnProperty(prop)) {
                if (prop === 'light' || prop === 'dark')
                    this.updateTag(prop, newValue[prop]);
                else
                    this.tag[prop] = newValue[prop];
            }
        }
        if (this.dappContainer)
            this.dappContainer.setTag(this.tag);
    }

    private resetRpcWallet() {
        this.removeRpcWalletEvents();
        const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
        const rpcWallet = this.state.getRpcWallet();
        const chainChangedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
            this.refreshUI();
        });
        const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
            this.refreshUI();
        });
        const data: any = {
            defaultChainId: this.defaultChainId,
            wallets: this.wallets,
            networks: this.networks,
            showHeader: this.showHeader,
            rpcWalletId: rpcWallet.instanceId
        };
        if (this.dappContainer?.setData) this.dappContainer.setData(data);
    }

    private async refreshUI() {
        await this.initializeWidgetConfig();
    }

    private initWallet = async () => {
        try {
            await Wallet.getClientInstance().init();
            const rpcWallet = this.state.getRpcWallet();
            await rpcWallet.init();
        } catch (err) {
            console.log(err);
        }
    }

    private initializeWidgetConfig = async () => {
        setTimeout(async () => {
            const chainId = this.chainId;
            tokenStore.updateTokenMapData(chainId);
            await this.initWallet();
            await this.setGovBalance();
            if (!this._data.votingAddress) {
                this.latestVotingAddress = await getLatestVotingAddress(this.state, this.chainId);
            }
            this.lblVotingAddress.caption = this.votingAddress;
            this.updateBalanceStack();
            await this.getVotingResult();
            const connected = isClientWalletConnected();
            if (!connected || !this.state.isRpcWalletConnected()) {
                this.btnSubmitVote.caption = connected ? "Switch Network" : "Connect Wallet";
                this.btnSubmitVote.enabled = true;
            } else {
                this.btnSubmitVote.enabled = !(this.isAddVoteBallotDisabled || !this.isVoteSelected);
                this.btnSubmitVote.caption = "Submit Vote";
            }
            this.updateMainUI();
        });
    }

    private showResultMessage = (status: 'warning' | 'success' | 'error', content?: string | Error) => {
        if (!this.txStatusModal) return;
        let params: any = { status };
        if (status === 'success') {
            params.txtHash = content;
        } else {
            params.content = content;
        }
        this.txStatusModal.message = { ...params };
        this.txStatusModal.showModal();
    }

    private connectWallet = async () => {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.networks;
                this.mdWallet.wallets = this.wallets;
                this.mdWallet.showModal();
            }
            return;
        }
        if (!this.state.isRpcWalletConnected()) {
            const clientWallet = Wallet.getClientInstance();
            await clientWallet.switchNetwork(this.chainId);
        }
    }

    private async setGovBalance() {
        const wallet = this.state.getRpcWallet();
        const selectedAddress = wallet.account.address;
        this.stakeOf = await stakeOf(this.state, selectedAddress);
        let freezeStake = await freezedStake(this.state, selectedAddress);
        let freezeStakeAmount = freezeStake.amount;
        this.stakedBalance = FormatUtils.formatNumber(freezeStakeAmount.plus(this.stakeOf).toFixed(4), { decimalFigures: 4 });
        this.votingBalance = FormatUtils.formatNumber(this.stakeOf.toFixed(4), { decimalFigures: 4 });
        this.freezeStakeAmount = freezeStakeAmount;
        this.lockTill = freezeStake.lockTill;
    }

    private updateBalanceStack() {
        const chainId = this.state.getChainId();
        const govTokenSymbol = this.state.getGovToken(chainId)?.symbol || '';
        const canDisplay = this.freezeStakeAmount.gt(0);
        this.lblStakedBalance.caption = `${this.stakedBalance} ${govTokenSymbol}`;
        this.lblFreezeStakeAmount.visible = canDisplay;
        if (canDisplay) {
            this.lblFreezeStakeAmount.caption = `${FormatUtils.formatNumber(this.freezeStakeAmount.toFixed(4), { decimalFigures: 4 })} ${govTokenSymbol} Available on ${moment(this.lockTill).format('MMM DD, YYYY')}`;
        } else {
            this.lblFreezeStakeAmount.caption = '';
        }
        this.lblVotingBalance.caption = `${this.votingBalance} ${govTokenSymbol}`;
    }

    private async getVotingResult() {
        const votingResult = await getVotingResult(this.state, this.votingAddress);
        if (votingResult) {
            this.proposalType = votingResult.hasOwnProperty('executeParam') ? 'Executive' : 'Poll';
            this.isCanExecute = votingResult.status == "waiting_execution";
            this.expiry = votingResult.endTime;
            this.voteStartTime = votingResult.voteStartTime;
            this.lblTitle.caption = this.lblProposalDesc.caption = this.proposalType == 'Executive' ? votingResult.title : votingResult.name;
            // this.remain= votingResults.remain;
            this.voteOptions = votingResult.options;
            if (this.proposalType === 'Executive') {
                // this.executiveDelay = votingResults.executiveDelay;
                if (votingResult.executeParam) {
                    this.executeAction = executeActionMap[votingResult.executeParam.cmd] ? executeActionMap[votingResult.executeParam.cmd] : '';
                    if (votingResult.executeParam.value) {
                        this.executeValue = votingResult.executeParam.value;
                    } else if (votingResult.executeParam.address) {
                        this.executeValue = votingResult.executeParam.address;
                    } else if (votingResult.executeParam.oracle) {
                        this.executeValue = votingResult.executeParam.oracle;
                    } else if (votingResult.executeParam.lotSize) {
                        this.executeValue = votingResult.executeParam.lotSize;
                        this.tokenAddress = votingResult.executeParam.token;
                    }
                }
                this.executeDelaySeconds = votingResult.executeDelay.toNumber();
                this.executeDelayDatetime = moment(votingResult.endTime)
                    .add(this.executeDelaySeconds, 'seconds')
                    .toDate();
                this.votingQuorum = votingResult.quorum;
            } else {
                // Render Chart
            }
        } else {
            this.proposalType = 'Executive';
            this.isCanExecute = false;
            this.expiry = null;
            this.voteStartTime = null;
            this.lblTitle.caption = this.lblProposalDesc.caption = "";
            this.voteOptions = {};
            this.executeAction = '';
            this.executeValue = '0';
            this.tokenAddress = '';
            this.executeDelaySeconds = 0;
            this.executeDelayDatetime = null;
            this.votingQuorum = '0';
        }
    }

    private formatDate(value: Date) {
        if (!value) return '';
        return moment(value).format('MMM. DD, YYYY') + ' at ' + moment(value).format('HH:mm')
    }

    private updateMainUI() {
        const optionY = new BigNumber(this.voteOptions?.Y ?? 0);
        const optionN = new BigNumber(this.voteOptions?.N ?? 0);
        const votingQuorum = new BigNumber(this.votingQuorum);
        this.inFavourBar.width = !votingQuorum.eq(0) ? `${optionY.div(votingQuorum).times(100).toFixed()}%` : 0;
        this.lblVoteOptionY.caption = optionY.toFixed();
        this.lblInFavourVotingQuorum.caption = votingQuorum.toFixed();
        this.againstBar.width = !votingQuorum.eq(0) ? `${optionN.div(votingQuorum).times(100).toFixed()}%` : 0;
        this.lblVoteOptionN.caption = optionN.toFixed();
        this.lblAgainstVotingQuorum.caption = votingQuorum.toFixed();
        this.lblVoteStartTime.caption = this.formatDate(this.voteStartTime);
        this.lblVoteEndTime.caption = this.formatDate(this.expiry);
        this.lblExecuteDeplay.caption = this.formatDate(this.executeDelayDatetime);
        this.btnExecute.enabled = this.isCanExecute;
        this.lblExecuteAction.caption = this.executeAction;
        this.lblExecuteValue.caption = this.executeValue.toString();
        this.lblVotingQuorum.caption = this.votingQuorum;
        this.lblTokenAddress.caption = this.tokenAddress;
        this.governanceVoteList.data = {
            address: this.votingAddress,
            expiry: this.expiry,
            selectedVotes: this.selectedVoteTexts,
            options: this.voteList
        };
    }

    private selectVote(index: number) {
        this.selectedVoteTexts = [this.voteList[index].optionText];
        this.selectedVoteObj = this.voteList[index];
        this.isVoteSelected = true;
        if (this.btnSubmitVote) {
            this.btnSubmitVote.enabled = !(this.isAddVoteBallotDisabled || !this.isVoteSelected);
        }
    }

    private registerSendTxEvents = () => {
        const txHashCallback = async (err: Error, receipt?: string) => {
            if (err) {
                this.showResultMessage('error', err);
            } else if (receipt) {
                this.showResultMessage('success', receipt);
            }
        }

        const confirmationCallback = async (receipt: any) => {
            this.refreshUI();
        };

        const wallet = Wallet.getClientInstance();
        wallet.registerSendTxEvents({
            transactionHash: txHashCallback,
            confirmation: confirmationCallback
        });
    }

    private async handleExecute() {
        try {
            if (this.isCanExecute) {
                this.btnExecute.rightIcon.spin = true;
                this.btnExecute.rightIcon.visible = true;
                const votingAddress = this.votingAddress;
                const chainId = this.chainId;
                this.showResultMessage('warning', `Executing proposal ${votingAddress}`);
                this.registerSendTxEvents();
                const receipt = await execute(votingAddress);
                if (this.state.handleAddTransactions && receipt) {
                    const timestamp = await this.state.getRpcWallet().getBlockTimestamp(receipt.blockNumber.toString());
                    const transactionsInfoArr = [
                        {
                            desc: 'Execute proposal',
                            chainId: chainId,
                            fromToken: null,
                            toToken: null,
                            fromTokenAmount: '',
                            toTokenAmount: '-',
                            hash: receipt.transactionHash,
                            timestamp,
                            value: votingAddress
                        }
                    ];
                    this.state.handleAddTransactions({
                        list: transactionsInfoArr
                    });
                }
                if (this.state.handleJumpToStep) {
                    this.state.handleJumpToStep({
                        widgetName: 'scom-group-queue-pair',
                        executionProperties: {
                            fromToken: this._data.fromToken || '',
                            toToken: this._data.toToken || '',
                            isFlow: true
                        }
                    })
                }
                this.btnExecute.rightIcon.spin = false;
                this.btnExecute.rightIcon.visible = false;
            }
        } catch (err) {
            this.showResultMessage('error', err);
            this.btnExecute.rightIcon.spin = false;
            this.btnExecute.rightIcon.visible = false;
        }
    }

    private async onSubmitVote() {
        if (!isClientWalletConnected() || !this.state.isRpcWalletConnected()) {
            this.connectWallet();
            return;
        }
        if (this.isAddVoteBallotDisabled || !this.isVoteSelected) return;
        try {
            this.btnSubmitVote.rightIcon.spin = true;
            this.btnSubmitVote.rightIcon.visible = true;
            this.showResultMessage('warning');
            this.registerSendTxEvents();
            const voteOption = this.selectedVoteObj.optionText;
            const votingAddress = this.votingAddress;
            const chainId = this.chainId;
            const receipt = await vote(votingAddress, this.selectedVoteObj.optionValue.toString());

            if (this.state.handleAddTransactions && receipt) {
                const timestamp = await this.state.getRpcWallet().getBlockTimestamp(receipt.blockNumber.toString());
                const transactionsInfoArr = [
                    {
                        desc: `Vote on proposal ${votingAddress}`,
                        chainId: chainId,
                        fromToken: null,
                        toToken: null,
                        fromTokenAmount: '',
                        toTokenAmount: '-',
                        hash: receipt.transactionHash,
                        timestamp,
                        value: voteOption,
                    }
                ];
                this.state.handleAddTransactions({
                    list: transactionsInfoArr
                });
            }
            this.btnSubmitVote.rightIcon.spin = false;
            this.btnSubmitVote.rightIcon.visible = false;
        } catch (err) {
            this.showResultMessage('error', err);
            this.btnSubmitVote.rightIcon.spin = false;
            this.btnSubmitVote.rightIcon.visible = false;
        }
    }

    private updateAddress() {
        const regex = new RegExp('^((0x[a-fA-F0-9]{40})|([13][a-km-zA-HJ-NP-Z1-9]{25,34})|(X[1-9A-HJ-NP-Za-km-z]{33})|(4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}))$');
        const address = this.edtVotingAddress.value;
        if ((address && !regex.test(address))) return;
        if (address) {
            this._data.votingAddress = address;
        } else {
            delete this._data.votingAddress;
        }
        this.mdUpdateAddress.visible = false;
        this.refreshUI();
    }

    private openModal() {
        this.edtVotingAddress.value = this._data.votingAddress || "";
        this.mdUpdateAddress.visible = true;
    }

    render() {
        return (
            <i-scom-dapp-container id="dappContainer">
                <i-panel class={customStyles} background={{ color: Theme.background.main }}>
                    <i-panel>
                        <i-vstack id="loadingElm" class="i-loading-overlay">
                            <i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
                                <i-icon
                                    class="i-loading-spinner_icon"
                                    image={{ url: Assets.fullPath('img/loading.svg'), width: 36, height: 36 }}
                                />
                                <i-label
                                    caption="Loading..." font={{ color: '#FD4A4C', size: '1.5em' }}
                                    class="i-loading-spinner_text"
                                />
                            </i-vstack>
                        </i-vstack>
                        <i-vstack
                            width="100%"
                            height="100%"
                            maxWidth={1200}
                            padding={{ top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }}
                            margin={{ left: 'auto', right: 'auto' }}
                            gap="0.75rem"
                        >
                            <i-label id="lblTitle" font={{ size: 'clamp(1rem, 0.8rem + 1vw, 2rem)', weight: 600 }}></i-label>
                            <i-panel padding={{ top: "1rem", bottom: "1rem" }}>
                                <i-hstack padding={{ bottom: "1rem" }} verticalAlignment="center" gap={4} wrap="wrap">
                                    <i-label caption="Address: " font={{ size: '1rem', color: Theme.text.third, bold: true }}></i-label>
                                    <i-label id="lblVotingAddress" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                    <i-button
                                        class="btn-os"
                                        height={28}
                                        width={28}
                                        icon={{ name: 'edit', height: 14, width: 14 }}
                                        margin={{ left: 4 }}
                                        tooltip={{ content: 'Edit', placement: 'top' }}
                                        onClick={this.openModal.bind(this)}
                                    ></i-button>
                                    <i-button
                                        class="btn-os"
                                        height={28}
                                        width={28}
                                        icon={{ name: 'sync', height: 14, width: 14 }}
                                        margin={{ left: 4 }}
                                        tooltip={{ content: 'Refresh', placement: 'top' }}
                                        onClick={this.refreshUI.bind(this)}
                                    ></i-button>
                                </i-hstack>
                                <i-stack
                                    direction="horizontal" alignItems="start" justifyContent="space-between"
                                    mediaQueries={[{
                                        maxWidth: '767px', properties: {
                                            direction: 'vertical', alignItems: 'start', justifyContent: 'start', gap: '1rem'
                                        }
                                    }]}
                                >
                                    <i-vstack gap="0.5rem">
                                        <i-hstack gap={4} verticalAlignment="center" wrap="wrap">
                                            <i-label caption="Staked Balance: " font={{ size: '1rem', color: Theme.text.third, bold: true }}></i-label>
                                            <i-label id="lblStakedBalance" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                        </i-hstack>
                                        <i-label id="lblFreezeStakeAmount" visible={false}></i-label>
                                    </i-vstack>
                                    <i-vstack>
                                        <i-hstack gap={4} verticalAlignment="center" wrap="wrap">
                                            <i-label caption="Voting Balance: " font={{ size: '1rem', color: Theme.text.third, bold: true }}></i-label>
                                            <i-label id="lblVotingBalance" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                        </i-hstack>
                                    </i-vstack>
                                </i-stack>
                            </i-panel>
                            <i-vstack padding={{ top: '1rem', bottom: '1rem' }} gap="0.75rem">
                                <i-stack
                                    direction="horizontal"
                                    minHeight={100}
                                    alignItems="center"
                                    gap="1.5rem"
                                    mediaQueries={[{ maxWidth: '767px', properties: { direction: 'vertical' } }]}
                                >
                                    <i-vstack
                                        width="100%"
                                        class="custom-box"
                                        background={{ color: 'rgba(255, 255, 255, 0.13)' }}
                                        padding={{ top: 10, bottom: 10, left: 20, right: 20 }}
                                        border={{ radius: 15, width: '1px', style: 'solid', color: '#fff' }}
                                        gap={10}
                                    >
                                        <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                                            <i-label caption="In Favour" font={{ size: '1rem', weight: 600 }}></i-label>
                                            <i-label caption="Quorum" font={{ size: '1rem', weight: 600 }}></i-label>
                                        </i-hstack>
                                        <i-panel
                                            height={18} width="100%"
                                            border={{ radius: 6 }}
                                            overflow={{ x: 'hidden' }}
                                            background={{ color: '#fff' }}
                                        >
                                            <i-hstack
                                                id="inFavourBar"
                                                width={0}
                                                height="100%"
                                                background={{ color: '#01d394' }}
                                            ></i-hstack>
                                        </i-panel>

                                        <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                                            <i-label id="lblVoteOptionY" font={{ size: '1rem', weight: 600, color: '#01d394' }}></i-label>
                                            <i-label id="lblInFavourVotingQuorum" font={{ size: '1rem', weight: 600 }}></i-label>
                                        </i-hstack>
                                    </i-vstack>
                                    <i-vstack
                                        width="100%"
                                        class="custom-box"
                                        background={{ color: 'rgba(255, 255, 255, 0.13)' }}
                                        padding={{ top: 10, bottom: 10, left: 20, right: 20 }}
                                        border={{ radius: 15, width: '1px', style: 'solid', color: '#fff' }}
                                        gap={10}
                                    >
                                        <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                                            <i-label caption="Against" font={{ size: '1rem', weight: 600 }}></i-label>
                                            <i-label caption="Quorum" font={{ size: '1rem', weight: 600 }}></i-label>
                                        </i-hstack>
                                        <i-panel
                                            height={18} width="100%"
                                            border={{ radius: 6 }}
                                            overflow={{ x: 'hidden' }}
                                            background={{ color: '#fff' }}
                                        >
                                            <i-hstack
                                                id="againstBar"
                                                width={0}
                                                height="100%"
                                                background={{ color: '#E84F4F' }}
                                            ></i-hstack>
                                        </i-panel>
                                        <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                                            <i-label id="lblVoteOptionN" font={{ size: '1rem', weight: 600, color: '#E84F4F' }}></i-label>
                                            <i-label id="lblAgainstVotingQuorum" font={{ size: '1rem', weight: 600 }}></i-label>
                                        </i-hstack>
                                    </i-vstack>

                                </i-stack>
                                <i-stack
                                    class="custom-box"
                                    minHeight={100}
                                    background={{ color: 'rgba(255, 255, 255, 0.13)' }}
                                    padding={{ top: 10, bottom: 10, left: 20, right: 20 }}
                                    border={{ radius: 15, width: '1px', style: 'solid', color: '#fff' }}
                                    gap="1rem"
                                    direction="horizontal"
                                    mediaQueries={[{ maxWidth: '767px', properties: { direction: 'vertical' } }]}
                                >
                                    <i-vstack width="100%" gap="0.5rem">
                                        <i-label
                                            caption="Date Created"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblVoteStartTime" font={{ size: '1rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack width="100%" gap="0.5rem">
                                        <i-label
                                            caption="Vote Ends"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblVoteEndTime" font={{ size: '1rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack width="100%" gap="0.5rem">
                                        <i-label
                                            caption="Execute Delay"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblExecuteDeplay" font={{ size: '1rem' }}></i-label>
                                    </i-vstack>
                                    <i-hstack width="100%" horizontalAlignment="end" verticalAlignment="center">
                                        <i-button
                                            id="btnExecute"
                                            class="btn-os"
                                            height="auto"
                                            caption="Execute"
                                            enabled={false}
                                            padding={{ top: '0.35rem', bottom: '0.35rem', left: '1.5rem', right: '1.5rem' }}
                                            onClick={this.handleExecute.bind(this)}
                                        ></i-button>
                                    </i-hstack>
                                </i-stack>
                                <i-grid-layout
                                    width="100%" minHeight={100}
                                    background={{ color: 'rgba(255, 255, 255, 0.13)' }}
                                    padding={{ top: 10, bottom: 10, left: 20, right: 20 }}
                                    border={{ radius: 15, width: '1px', style: 'solid', color: '#fff' }}
                                    gap={{ column: 10, row: '1rem' }}
                                    templateColumns={['repeat(2, 1fr)']}
                                    templateRows={['repeat(3, auto)']}
                                    verticalAlignment="stretch"
                                    mediaQueries={[
                                        { maxWidth: '767px', properties: { templateColumns: ['repeat(1, 1fr)'], templateRows: ['auto'] } }
                                    ]}
                                >
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Description"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblProposalDesc" font={{ size: '1rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Action"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblExecuteAction" font={{ size: '1rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Value" margin={{ top: '1rem' }}
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblExecuteValue" font={{ size: '1rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Quorum"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblVotingQuorum" font={{ size: '1rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem" visible={false}>
                                        <i-label
                                            caption="Token Address"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblTokenAddress" font={{ size: '1rem' }} margin={{ top: '0.5rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Your Vote"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-scom-governance-voting-vote-list id="governanceVoteList" onSelect={this.selectVote.bind(this)} />
                                    </i-vstack>
                                </i-grid-layout>
                            </i-vstack>
                            <i-vstack
                                width="100%"
                                padding={{ left: "1rem", right: "1rem" }}
                            >
                                <i-button
                                    id='btnSubmitVote'
                                    class='btn-os'
                                    height='auto'
                                    caption="Submit Vote"
                                    padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                    border={{ radius: 5 }}
                                    font={{ weight: 600 }}
                                    rightIcon={{ spin: true, visible: false }}
                                    enabled={false}
                                    onClick={this.onSubmitVote.bind(this)}
                                ></i-button>
                            </i-vstack>
                        </i-vstack>
                    </i-panel>
                    <i-modal
                        id="mdUpdateAddress"
                        class={modalStyle}
                        title="Update Address"
                        closeIcon={{ name: 'times' }}
                        height='auto'
                        maxWidth={640}
                        closeOnBackdropClick={false}
                    >
                        <i-panel>
                            <i-vstack gap={4}>
                                <i-label caption="Address: " font={{ size: '1rem', color: Theme.text.third, bold: true }}></i-label>
                                <i-input
                                    id="edtVotingAddress"
                                    class={inputStyle}
                                    height={32}
                                    width="100%"
                                    border={{ radius: 6 }}
                                    font={{ size: '1rem', color: Theme.text.third }}
                                ></i-input>
                            </i-vstack>
                            <i-hstack verticalAlignment="center" horizontalAlignment="center" gap="10px" margin={{ top: 20, bottom: 10 }}>
                                <i-button
                                    class="btn-os"
                                    height='auto'
                                    padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                    border={{ radius: 5 }}
                                    font={{ weight: 600 }}
                                    caption="Confirm"
                                    onClick={this.updateAddress.bind(this)}
                                />
                            </i-hstack>
                        </i-panel>
                    </i-modal>
                    <i-scom-tx-status-modal id="txStatusModal" />
                    <i-scom-wallet-modal id="mdWallet" wallets={[]} />
                </i-panel>
            </i-scom-dapp-container>
        )
    }

    async handleFlowStage(target: Control, stage: string, options: any) {
        let widget;
        if (stage === 'initialSetup') {
            widget = new ScomGovernanceVotingFlowInitialSetup();
            target.appendChild(widget);
            await widget.ready();
            widget.state = this.state;
            await widget.handleFlowStage(target, stage, options);
        } else {
            widget = this;
            if (!options.isWidgetConnected) {
                target.appendChild(widget);
                await widget.ready();
            }
            let properties = options.properties;
            let tag = options.tag;
            this.state.handleNextFlowStep = options.onNextStep;
            this.state.handleAddTransactions = options.onAddTransactions;
            this.state.handleJumpToStep = options.onJumpToStep;
            await this.setData(properties);
            if (tag) {
                this.setTag(tag);
            }
        }

        return { widget };
    }
} 