
import ScomNetworkPicker from '@scom/scom-network-picker';

export function getFormSchema() {
    return {
        dataSchema: {
            type: 'object',
            properties: {
                chainId: {
                    type: 'number'
                },
                votingAddress: {
                    type: 'string',
                    format: 'wallet-address'
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
                    scope: '#/properties/votingAddress'
                }
            ]
        },
        customControls(rpcWalletId: string, getData: Function) {
            return {
                "#/properties/chainId": {
                    render: () => {
                        let networkPicker = new ScomNetworkPicker(undefined, {
                            type: 'combobox',
                            networks: [1, 56, 137, 250, 97, 80001, 43113, 43114].map(v => { return { chainId: v } })
                        });
                        return networkPicker;
                    },
                    getData: (control: ScomNetworkPicker) => {
                        return control.selectedNetwork?.chainId;
                    },
                    setData: (control: ScomNetworkPicker, value: number) => {
                        control.setNetworkByChainId(value);
                    }
                }
            }
        }
    }
}