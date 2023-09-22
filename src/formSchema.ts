import { ComboBox, IComboItem } from '@ijstech/components';
import ScomNetworkPicker from '@scom/scom-network-picker';
import ScomTokenInput from '@scom/scom-token-input';
import { tokenStore } from '@scom/scom-token-list';
import { getVotingAddresses } from './api';
import { comboBoxStyle } from './index.css';
import { IGovernanceVoting } from './interface';
import { State } from './store/index';

const chainIds = [56, 97, 137, 80001, 43113, 43114];
const networks = chainIds.map(v => { return { chainId: v } });

export function getFormSchema(state: State) {
    return {
        dataSchema: {
            type: 'object',
            properties: {
                chainId: {
                    type: 'number',
                    required: true
                },
                tokenFrom: {
                    type: 'string',
                    required: true
                },
                tokenTo: {
                    type: 'string',
                    required: true
                },
                votingAddress: {
                    type: 'string',
                    required: true
                }
            }
        },
        uiSchema: {
            type: 'VerticalLayout',
            elements: [
                {
                    type: 'Control',
                    scope: '#/properties/chainId'
                },
                {
                    type: 'Control',
                    scope: '#/properties/tokenFrom'
                },
                {
                    type: 'Control',
                    scope: '#/properties/tokenTo'
                },
                {
                    type: 'Control',
                    scope: '#/properties/votingAddress'
                }
            ]
        },
        customControls(rpcWalletId: string, getData: Function) {
            let networkPicker: ScomNetworkPicker;
            let firstTokenInput: ScomTokenInput;
            let secondTokenInput: ScomTokenInput;
            let comboVotingAddress: ComboBox;
            let votingAddresses: IComboItem[] = [];
            const onSelectToken = async () => {
                const chainId = networkPicker?.selectedNetwork?.chainId;
                if (chainId && firstTokenInput.token && secondTokenInput.token) {
                    const addresses = await getVotingAddresses(state, chainId, firstTokenInput.token, secondTokenInput.token);
                    comboVotingAddress.items = votingAddresses = addresses.map(address => ({ label: address, value: address }));
                }
            }
            const setTokenData = (control: ScomTokenInput, value: string) => {
                if (!value) {
                    const chainId = networkPicker?.selectedNetwork?.chainId;
                    const tokens = tokenStore.getTokenList(chainId);
                    let token = tokens.find(token => !token.address);
                    control.token = token;
                } else {
                    control.address = value;
                }
            };
            return {
                "#/properties/chainId": {
                    render: () => {
                        networkPicker = new ScomNetworkPicker(undefined, {
                            type: 'combobox',
                            networks: [1, 56, 137, 250, 97, 80001, 43113, 43114].map(v => { return { chainId: v } }),
                            onCustomNetworkSelected: () => {
                                const chainId = networkPicker.selectedNetwork?.chainId;
                                if (firstTokenInput.chainId != chainId) {
                                    firstTokenInput.token = null;
                                    secondTokenInput.token = null;
                                    comboVotingAddress.items = votingAddresses = [];
                                    comboVotingAddress.clear();
                                }
                                firstTokenInput.chainId = chainId;
                                secondTokenInput.chainId = chainId;
                            }
                        });
                        return networkPicker;
                    },
                    getData: (control: ScomNetworkPicker) => {
                        return control.selectedNetwork?.chainId;
                    },
                    setData: (control: ScomNetworkPicker, value: number) => {
                        control.setNetworkByChainId(value);
                        if (firstTokenInput) firstTokenInput.chainId = value;
                        if (secondTokenInput) secondTokenInput.chainId = value;
                    }
                },
                "#/properties/tokenFrom": {
                    render: () => {
                        firstTokenInput = new ScomTokenInput(undefined, {
                            type: 'combobox',
                            isBalanceShown: false,
                            isBtnMaxShown: false,
                            isInputShown: false
                        });
                        firstTokenInput.rpcWalletId = rpcWalletId;
                        const chainId = networkPicker?.selectedNetwork?.chainId;
                        if (chainId && firstTokenInput.chainId !== chainId) {
                            firstTokenInput.chainId = chainId;
                        }
                        firstTokenInput.onSelectToken = onSelectToken;
                        return firstTokenInput;
                    },
                    getData: (control: ScomTokenInput) => {
                        return control.token?.address || "";
                    },
                    setData: setTokenData
                },
                "#/properties/tokenTo": {
                    render: () => {
                        secondTokenInput = new ScomTokenInput(undefined, {
                            type: 'combobox',
                            isBalanceShown: false,
                            isBtnMaxShown: false,
                            isInputShown: false
                        });
                        secondTokenInput.rpcWalletId = rpcWalletId;
                        const chainId = networkPicker?.selectedNetwork?.chainId;
                        if (chainId && secondTokenInput.chainId !== chainId) {
                            secondTokenInput.chainId = chainId;
                        }
                        secondTokenInput.onSelectToken = onSelectToken;
                        return secondTokenInput;
                    },
                    getData: (control: ScomTokenInput) => {
                        return control.token?.address || "";
                    },
                    setData: setTokenData
                },
                "#/properties/votingAddress": {
                    render: () => {
                        comboVotingAddress = new ComboBox(undefined, {
                            height: '42px',
                            icon: {
                                name: 'caret-down'
                            },
                            items: votingAddresses
                        });
                        comboVotingAddress.classList.add(comboBoxStyle);
                        return comboVotingAddress;
                    },
                    getData: (control: ComboBox) => {
                        return Number((control.selectedItem as IComboItem)?.value);
                    },
                    setData: async (control: ComboBox, value: string) => {
                        const data: IGovernanceVoting = getData();
                        if (data.chainId && data.tokenFrom != null && data.tokenTo != null) {
                            const tokens = tokenStore.getTokenList(data.chainId);
                            let tokenFrom = tokens.find(token => (token.address ?? "") == data.tokenFrom);
                            let tokenTo = tokens.find(token => (token.address ?? "") == data.tokenTo);
                            const addresses = await getVotingAddresses(state, data.chainId, tokenFrom, tokenTo);
                            comboVotingAddress.items = votingAddresses = addresses.map(address => ({ label: address, value: address }));
                        }
                        control.selectedItem = votingAddresses.find(v => v.value === value) || null;
                    }
                }
            }
        }
    }
}