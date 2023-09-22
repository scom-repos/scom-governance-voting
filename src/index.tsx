import {
    application,
    Button,
    ControlElement,
    customElements,
    HStack,
    Label,
    Module,
    Panel,
    Styles
} from "@ijstech/components";
import ScomDappContainer from "@scom/scom-dapp-container";
import { INetworkConfig } from "@scom/scom-network-picker";
import ScomWalletModal, { IWalletPlugin } from "@scom/scom-wallet-modal";
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { IGovernanceVoting } from "./interface";
import { isClientWalletConnected, State } from "./store/index";
import Assets from './assets';
import configData from './data.json';
import customStyles from './index.css';
import { Constants, Wallet } from "@ijstech/eth-wallet";
import { GovernanceVoteList } from './voteList';

const Theme = Styles.Theme.ThemeVars;

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
    private lblProposalDesc: Label;
    private lblExecuteAction: Label;
    private lblExecuteValue: Label;
    private lblVotingQuorum: Label;
    private lblTokenAddress: Label;
    private voteList: GovernanceVoteList;
    private btnSubmitVote: Button;
    private txStatusModal: ScomTxStatusModal;
    private mdWallet: ScomWalletModal;

    private state: State;
    private _data: IGovernanceVoting = {
        chainId: 0,
        tokenFrom: '',
        tokenTo: '',
        votingAddress: '',
        wallets: [],
        networks: []
    };
    tag: any = {};

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
        this.state = new State(configData);
        this.voteList.state = this.state;
        const lazyLoad = this.getAttribute('lazyLoad', true, false);
        if (!lazyLoad) {
            const defaultChainId = this.getAttribute('defaultChainId', true);
            const chainId = this.getAttribute('chainId', true, defaultChainId || 0);
            const tokenFrom = this.getAttribute('tokenFrom', true, '');
            const tokenTo = this.getAttribute('tokenTo', true, '');
            const votingAddress = this.getAttribute('votingAddress', true, '');
            const networks = this.getAttribute('networks', true);
            const wallets = this.getAttribute('wallets', true);
            const showHeader = this.getAttribute('showHeader', true);
            const data: IGovernanceVoting = {
                chainId,
                tokenFrom,
                tokenTo,
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
        const actions: any[] = [];
        return actions;
    }

    private getProjectOwnerActions() {
        const actions: any[] = [
        ];
        return actions;
    }

    getConfigurators() {
        return [
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
            await this.initWallet();
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

    private selectVote(index: number) { }

    private async handleExecute() { }

    private async onSubmitVote() { }

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
                                <i-stack
                                    direction="horizontal" alignItems="center" justifyContent="space-between"
                                    mediaQueries={[{
                                        maxWidth: '767px', properties: {
                                            direction: 'vertical', alignItems: 'start', justifyContent: 'start', gap: '1rem'
                                        }
                                    }]}
                                >
                                    <i-vstack gap="0.5rem">
                                        <i-hstack gap={4} verticalAlignment="center">
                                            <i-label caption="Staked Balance: " font={{ size: '1rem', color: Theme.text.third, bold: true }}></i-label>
                                            <i-label id="lblStakedBalance" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                        </i-hstack>
                                        <i-label id="lblFreezeStakeAmount" visible={false}></i-label>
                                    </i-vstack>
                                    <i-vstack>
                                        <i-hstack gap={4} verticalAlignment="center">
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
                                        <i-label id="lblVoteStartTime"></i-label>
                                    </i-vstack>
                                    <i-vstack width="100%" gap="0.5rem">
                                        <i-label
                                            caption="Vote Ends"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblVoteEndTime"></i-label>
                                    </i-vstack>
                                    <i-vstack width="100%" gap="0.5rem">
                                        <i-label
                                            caption="Execute Delay"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblExecuteDeplay"></i-label>
                                    </i-vstack>
                                    <i-hstack width="100%" horizontalAlignment="end" verticalAlignment="center">
                                        <i-button
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
                                        <i-label id="lblProposalDesc"></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Action"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblExecuteAction"></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Value" margin={{ top: '1rem' }}
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblExecuteValue"></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Quorum"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblVotingQuorum"></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem" visible={false}>
                                        <i-label
                                            caption="Token Address"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-label id="lblTokenAddress" margin={{ top: '0.5rem' }}></i-label>
                                    </i-vstack>
                                    <i-vstack gap="0.5rem">
                                        <i-label
                                            caption="Your Vote"
                                            font={{ size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true }}
                                        ></i-label>
                                        <i-scom-governance-voting-vote-list id="voteList" onSelect={this.selectVote.bind(this)} />
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
                    <i-scom-tx-status-modal id="txStatusModal" />
                    <i-scom-wallet-modal id="mdWallet" wallets={[]} />
                </i-panel>
            </i-scom-dapp-container>
        )
    }
} 