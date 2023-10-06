import {
    application,
    Button,
    Container,
    ControlElement,
    customElements,
    IEventBus,
    Input,
    Label,
    Module,
    Styles
} from "@ijstech/components";
import { isClientWalletConnected, State } from "../store/index";
import ScomWalletModal from "@scom/scom-wallet-modal";
import { Constants, IEventBusRegistry, Wallet } from "@ijstech/eth-wallet";
import { flowInputStyle } from "../index.css";

const Theme = Styles.Theme.ThemeVars;

interface ScomGovernanceVotingFlowInitialSetupElement extends ControlElement {
    data?: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-governanace-voting-flow-initial-setup']: ScomGovernanceVotingFlowInitialSetupElement;
        }
    }
}

@customElements('i-scom-governance-voting-flow-initial-setup')
export default class ScomGovernanceVotingFlowInitialSetup extends Module {
    private lblConnectedStatus: Label;
    private btnConnectWallet: Button;
    private edtVotingAddress: Input;
    private mdWallet: ScomWalletModal;
    private state: State;
    private tokenRequirements: any;
    private executionProperties: any;
    private invokerId: string;
    private $eventBus: IEventBus;
    private walletEvents: IEventBusRegistry[] = [];

    constructor(parent?: Container, options?: ControlElement) {
        super(parent, options);
        this.state = new State({});
        this.$eventBus = application.EventBus;
    }
    private get rpcWallet() {
        return this.state.getRpcWallet();
    }
    private get chainId() {
        return this.executionProperties.chainId || this.executionProperties.defaultChainId;
    }
    private async resetRpcWallet() {
        await this.state.initRpcWallet(this.chainId);
    }
    async setData(value: any) {
        this.executionProperties = value.executionProperties;
        this.tokenRequirements = value.tokenRequirements;
        this.invokerId = value.invokerId;
        await this.resetRpcWallet();
        await this.initializeWidgetConfig();
    }
    private async initWallet() {
        try {
            const rpcWallet = this.rpcWallet;
            await rpcWallet.init();
        } catch (err) {
            console.log(err);
        }
    }
    private async initializeWidgetConfig() {
        const connected = isClientWalletConnected();
        this.updateConnectStatus(connected);
        await this.initWallet();
    }
    private async connectWallet() {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.executionProperties.networks;
                this.mdWallet.wallets = this.executionProperties.wallets;
                this.mdWallet.showModal();
            }
        }
    }
    private updateConnectStatus(connected: boolean) {
        if (connected) {
            this.lblConnectedStatus.caption = 'Connected with ' + Wallet.getClientInstance().address;
            this.btnConnectWallet.visible = false;
        } else {
            this.lblConnectedStatus.caption = 'Please connect your wallet first';
            this.btnConnectWallet.visible = true;
        }
    }
    private registerEvents() {
        let clientWallets = Wallet.getClientInstance();
        this.walletEvents.push(
            clientWallets.registerWalletEvent(this, Constants.ClientWalletEvent.AccountsChanged, async (payload: Record<string, any>) => {
                const { account } = payload;
                let connected = !!account;
                this.updateConnectStatus(connected);
            })
        );
    }
    onHide() {
        let clientWallet = Wallet.getClientInstance();
        for (let event of this.walletEvents) {
            clientWallet.unregisterWalletEvent(event);
        }
        this.walletEvents = [];
    }
    init() {
        super.init();
        this.registerEvents();
    }
    private async handleClickStart() {
        let eventName = `${this.invokerId}:nextStep`;
        this.executionProperties.votingAddress = this.edtVotingAddress.value || "";
        this.$eventBus.dispatch(eventName, {
            isInitialSetup: true,
            tokenRequirements: this.tokenRequirements,
            executionProperties: this.executionProperties
        });
    }
    render() {
        return (
            <i-vstack gap="1rem" padding={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <i-label caption="Get Ready to Vote"></i-label>
                
                <i-vstack gap='1rem'>
                    <i-label id="lblConnectedStatus"></i-label>
                    <i-hstack>
                        <i-button
                            id="btnConnectWallet"
                            caption='Connect Wallet'
                            font={{ color: Theme.colors.primary.contrastText }}
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            onClick={this.connectWallet}
                        ></i-button>
                    </i-hstack>
                </i-vstack>
                <i-label caption="Enter voting address"></i-label>
                <i-hstack width="50%" verticalAlignment="center">
                    <i-input
                        id="edtVotingAddress"
                        class={flowInputStyle}
                        height={32}
                        width="100%"
                        border={{ radius: 6 }}
                        font={{ size: '1rem' }}
                    ></i-input>
                </i-hstack>
                <i-hstack horizontalAlignment='center'>
                    <i-button
                        id="btnStart"
                        caption="Start"
                        padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                        font={{ color: Theme.colors.primary.contrastText, size: '1.5rem' }}
                        onClick={this.handleClickStart}
                    ></i-button>
                </i-hstack>
                <i-scom-wallet-modal id="mdWallet" wallets={[]}></i-scom-wallet-modal>
            </i-vstack>
        )
    }
}