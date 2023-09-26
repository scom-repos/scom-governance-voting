import { Module, customModule, Container, application, Styles } from '@ijstech/components';
import { getMulticallInfoList } from '@scom/scom-multicall';
import { INetwork } from '@ijstech/eth-wallet';
import getNetworkList from '@scom/scom-network-list';
import ScomGovernanceVoting from '@scom/scom-governance-voting';

const Theme = Styles.Theme.defaultTheme;
Theme.background.main = '#2c2626';
Theme.text.primary = '#d3c0c0 ';
Theme.input.background = '#272F39';
Theme.input.fontColor = '#ffffff4d';
Theme.action.disabledBackground = "transparent linear-gradient(270deg,#351f52,#552a42) 0% 0% no-repeat padding-box";
Styles.Theme.applyTheme(Theme);

@customModule
export default class Module1 extends Module {

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        const multicalls = getMulticallInfoList();
        const networkMap = this.getNetworkMap(options.infuraId);
        application.store = {
            infuraId: options.infuraId,
            multicalls,
            networkMap
        }
    }

    private getNetworkMap = (infuraId?: string) => {
        const networkMap = {};
        const defaultNetworkList: INetwork[] = getNetworkList();
        const defaultNetworkMap: Record<number, INetwork> = defaultNetworkList.reduce((acc, cur) => {
            acc[cur.chainId] = cur;
            return acc;
        }, {});
        for (const chainId in defaultNetworkMap) {
            const networkInfo = defaultNetworkMap[chainId];
            const explorerUrl = networkInfo.blockExplorerUrls && networkInfo.blockExplorerUrls.length ? networkInfo.blockExplorerUrls[0] : "";
            if (infuraId && networkInfo.rpcUrls && networkInfo.rpcUrls.length > 0) {
                for (let i = 0; i < networkInfo.rpcUrls.length; i++) {
                    networkInfo.rpcUrls[i] = networkInfo.rpcUrls[i].replace(/{INFURA_ID}/g, infuraId);
                }
            }
            networkMap[networkInfo.chainId] = {
                ...networkInfo,
                symbol: networkInfo.nativeCurrency?.symbol || "",
                explorerTxUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}tx/` : "",
                explorerAddressUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}address/` : ""
            }
        }
        return networkMap;
    }

    async init() {
        super.init();
    }

    render() {
        return (
            <i-panel>
                <i-hstack id="mainStack" margin={{ top: '1rem', left: '1rem' }} gap="2rem">
                    <i-scom-governance-voting
                        width={1200}
                        defaultChainId={97}
                        chainId={97}
                        votingAddress="0x6C5EB51b95497A0B8801fEACFEe8634C925A42F0"
                        networks={[
                            {
                                "chainId": 43113
                            },
                            {
                                "chainId": 97
                            }
                        ]}
                        wallets={[
                            {
                                "name": "metamask"
                            }
                        ]}
                    ></i-scom-governance-voting>
                </i-hstack>
            </i-panel>
        )
    }
}