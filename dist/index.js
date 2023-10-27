var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-governance-voting/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-governance-voting/store/core.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coreAddress = void 0;
    exports.coreAddress = {
        56: {
            OAXDEX_Governance: "0x510a179AA399672e26e54Ed8Ce0e822cc9D0a98D",
            OAXDEX_VotingRegistry: "0x845308010C3B699150Cdd54dCf0E7C4b8653e6B2",
            GOV_TOKEN: "0xb32aC3C79A94aC1eb258f3C830bBDbc676483c93",
        },
        97: {
            OAXDEX_Governance: "0xDfC070E2dbDAdcf892aE2ed2E2C426aDa835c528",
            OAXDEX_VotingRegistry: "0x28a5bB54A53831Db40e00a6d416FfB2dBe0Fef68",
            GOV_TOKEN: "0x45eee762aaeA4e5ce317471BDa8782724972Ee19",
        },
        137: {
            OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
            OAXDEX_VotingRegistry: "0x64062158A5Cc2aA3740B1035785F29153eA64677",
            GOV_TOKEN: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
        },
        80001: {
            OAXDEX_Governance: "0x198b150E554F46aee505a7fb574F5D7895889772",
            OAXDEX_VotingRegistry: "0xC2F105d6413aCE38B9FcB6F43Edc76191a295aC5",
            GOV_TOKEN: "0xb0AF504638BDe5e53D6EaE1119dEd13411c35cF2",
        },
        43113: {
            OAXDEX_Governance: "0xC025b30e6D4cBe4B6978a1A71a86e6eCB9F87F92",
            OAXDEX_VotingRegistry: "0x05E425dD88dd7D4f725aC429D0C8C022B2004cBB",
            GOV_TOKEN: "0x27eF998b96c9A66937DBAc38c405Adcd7fa5e7DB",
        },
        43114: {
            OAXDEX_Governance: "0x845308010c3b699150cdd54dcf0e7c4b8653e6b2",
            OAXDEX_VotingRegistry: "0x0625468f8F56995Ff1C27EB6FD44ac90E96C5D22",
            GOV_TOKEN: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
        },
        42161: {
            OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
            OAXDEX_VotingRegistry: "0x64062158A5Cc2aA3740B1035785F29153eA64677",
            GOV_TOKEN: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
        },
        421613: {
            OAXDEX_Governance: "0x6f460B0Bf633E22503Efa460429B0Ab32d655B9D",
            OAXDEX_VotingRegistry: "0x3Eb8e7B7EbdcA63031504fe4C94b8e393D530Ec9",
            GOV_TOKEN: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        }
    };
});
define("@scom/scom-governance-voting/store/utils.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list", "@scom/scom-token-list", "@scom/scom-governance-voting/store/core.ts"], function (require, exports, components_1, eth_wallet_1, scom_network_list_1, scom_token_list_1, core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWETH = exports.isClientWalletConnected = exports.State = void 0;
    class State {
        constructor(options) {
            this.infuraId = '';
            this.networkMap = {};
            this.rpcWalletId = '';
            this.networkMap = (0, scom_network_list_1.default)();
            this.initData(options);
        }
        initData(options) {
            if (options.infuraId) {
                this.infuraId = options.infuraId;
            }
            if (options.networks) {
                this.setNetworkList(options.networks, options.infuraId);
            }
        }
        initRpcWallet(defaultChainId) {
            if (this.rpcWalletId) {
                return this.rpcWalletId;
            }
            const clientWallet = eth_wallet_1.Wallet.getClientInstance();
            const networkList = Object.values(components_1.application.store?.networkMap || []);
            const instanceId = clientWallet.initRpcWallet({
                networks: networkList,
                defaultChainId,
                infuraId: components_1.application.store?.infuraId,
                multicalls: components_1.application.store?.multicalls
            });
            this.rpcWalletId = instanceId;
            if (clientWallet.address) {
                const rpcWallet = eth_wallet_1.Wallet.getRpcWalletInstance(instanceId);
                rpcWallet.address = clientWallet.address;
            }
            return instanceId;
        }
        getRpcWallet() {
            return this.rpcWalletId ? eth_wallet_1.Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
        }
        isRpcWalletConnected() {
            const wallet = this.getRpcWallet();
            return wallet?.isConnected;
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet?.chainId;
        }
        setNetworkList(networkList, infuraId) {
            const wallet = eth_wallet_1.Wallet.getClientInstance();
            this.networkMap = {};
            const defaultNetworkList = (0, scom_network_list_1.default)();
            const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
                acc[cur.chainId] = cur;
                return acc;
            }, {});
            for (let network of networkList) {
                const networkInfo = defaultNetworkMap[network.chainId];
                if (!networkInfo)
                    continue;
                if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
                    for (let i = 0; i < network.rpcUrls.length; i++) {
                        network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                    }
                }
                this.networkMap[network.chainId] = {
                    ...networkInfo,
                    ...network
                };
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        async setApprovalModelAction(options) {
            const approvalOptions = {
                ...options,
                spenderAddress: ''
            };
            let wallet = this.getRpcWallet();
            this.approvalModel = new eth_wallet_1.ERC20ApprovalModel(wallet, approvalOptions);
            let approvalModelAction = this.approvalModel.getAction();
            return approvalModelAction;
        }
        getAddresses(chainId) {
            return core_1.coreAddress[chainId || this.getChainId()];
        }
        getGovToken(chainId) {
            let govToken;
            let address = this.getAddresses(chainId)?.GOV_TOKEN;
            if (chainId == 43113 || chainId == 43114 || chainId == 42161 || chainId == 421613 || chainId == 80001 || chainId == 137) {
                govToken = { address: address, decimals: 18, symbol: "veOSWAP", name: 'Vote-escrowed OSWAP' };
            }
            else {
                govToken = { address: address, decimals: 18, symbol: "OSWAP", name: 'OpenSwap' };
            }
            return govToken;
        }
    }
    exports.State = State;
    function isClientWalletConnected() {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
    const getWETH = (chainId) => {
        let wrappedToken = scom_token_list_1.WETHByChainId[chainId];
        return wrappedToken;
    };
    exports.getWETH = getWETH;
});
define("@scom/scom-governance-voting/store/index.ts", ["require", "exports", "@scom/scom-governance-voting/store/utils.ts"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-governance-voting/store/index.ts'/> 
    __exportStar(utils_1, exports);
});
define("@scom/scom-governance-voting/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let moduleDir = components_2.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    exports.default = {
        fullPath
    };
});
define("@scom/scom-governance-voting/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-governance-voting/data.json.ts'/> 
    exports.default = {
        "infuraId": "adc596bf88b648e2a8902bc9093930c5",
        "networks": [
            {
                "chainId": 97,
                "explorerTxUrl": "https://testnet.bscscan.com/tx/",
                "explorerAddressUrl": "https://testnet.bscscan.com/address/"
            },
            {
                "chainId": 43113,
                "explorerTxUrl": "https://testnet.snowtrace.io/tx/",
                "explorerAddressUrl": "https://testnet.snowtrace.io/address/"
            }
        ],
        "defaultBuilderData": {
            "defaultChainId": 43113,
            "networks": [
                {
                    "chainId": 43113
                },
                {
                    "chainId": 97
                },
                {
                    "chainId": 56
                },
                {
                    "chainId": 43114
                },
                {
                    "chainId": 42161
                },
                {
                    "chainId": 421613
                }
            ],
            "wallets": [
                {
                    "name": "metamask"
                }
            ],
            "showHeader": true,
            "showFooter": true
        }
    };
});
define("@scom/scom-governance-voting/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flowInputStyle = exports.modalStyle = exports.inputStyle = exports.comboBoxStyle = exports.voteListStyle = void 0;
    const Theme = components_3.Styles.Theme.ThemeVars;
    exports.default = components_3.Styles.style({
        $nest: {
            '.custom-box': {
                boxShadow: '0 3px 6px #00000029',
                backdropFilter: 'blur(74px)',
                boxSizing: 'border-box',
                overflow: 'hidden'
            },
            '.btn-os': {
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 5,
                background: Theme.background.gradient,
                $nest: {
                    '&:disabled': {
                        color: '#fff'
                    }
                }
            },
        }
    });
    exports.voteListStyle = components_3.Styles.style({
        $nest: {
            '.truncate': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            },
            '.expiry--text': {
                whiteSpace: 'inherit'
            },
            '.prevent-pointer': {
                cursor: 'not-allowed'
            },
            '.proposal-progress .i-progress_overlay, .proposal-progress .i-progress_bar': {
                borderRadius: '100px'
            }
        }
    });
    exports.comboBoxStyle = components_3.Styles.style({
        width: '100% !important',
        $nest: {
            '.selection': {
                width: '100% !important',
                maxWidth: '100%',
                padding: '0.5rem 1rem',
                color: Theme.input.fontColor,
                backgroundColor: Theme.input.background,
                borderColor: Theme.input.background,
                borderRadius: '0.625rem!important',
            },
            '.selection input': {
                color: 'inherit',
                backgroundColor: 'inherit',
                padding: 0
            },
            '> .icon-btn': {
                justifyContent: 'center',
                borderColor: Theme.input.background,
                borderRadius: '0.625rem',
                width: '42px'
            }
        }
    });
    exports.inputStyle = components_3.Styles.style({
        $nest: {
            'input': {
                color: Theme.text.third,
                padding: '0.375rem 0.5rem'
            }
        }
    });
    exports.modalStyle = components_3.Styles.style({
        $nest: {
            '.modal': {
                padding: '1rem 1.5rem',
                borderRadius: '0.5rem'
            },
            '.modal .i-modal_header': {
                paddingBottom: '1.5rem'
            }
        }
    });
    exports.flowInputStyle = components_3.Styles.style({
        $nest: {
            'input': {
                padding: '0.375rem 0.5rem'
            }
        }
    });
});
define("@scom/scom-governance-voting/api.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/oswap-openswap-contract", "@scom/scom-token-list"], function (require, exports, eth_wallet_2, oswap_openswap_contract_1, scom_token_list_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.vote = exports.getOptionVoted = exports.getVotingResult = exports.getLatestVotingAddress = exports.freezedStake = exports.stakeOf = void 0;
    function govTokenDecimals(state) {
        const chainId = state.getChainId();
        return state.getGovToken(chainId).decimals || 18;
    }
    async function stakeOf(state, address) {
        let result = new eth_wallet_2.BigNumber(0);
        try {
            const wallet = state.getRpcWallet();
            const chainId = state.getChainId();
            const gov = state.getAddresses(chainId).OAXDEX_Governance;
            const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
            let stakeOf = await govContract.stakeOf(address);
            result = eth_wallet_2.Utils.fromDecimals(stakeOf, govTokenDecimals(state));
        }
        catch (err) { }
        return result;
    }
    exports.stakeOf = stakeOf;
    async function freezedStake(state, address) {
        let result = { amount: new eth_wallet_2.BigNumber(0), timestamp: 0, lockTill: 0 };
        try {
            const wallet = state.getRpcWallet();
            const chainId = state.getChainId();
            const gov = state.getAddresses(chainId).OAXDEX_Governance;
            const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
            let freezedStake = await govContract.freezedStake(address);
            let minStakePeriod = await govContract.minStakePeriod();
            result = { amount: eth_wallet_2.Utils.fromDecimals(freezedStake.amount, govTokenDecimals(state)), timestamp: Number(freezedStake.timestamp) * 1000, lockTill: (Number(freezedStake.timestamp) + Number(minStakePeriod)) * 1000 };
        }
        catch (err) { }
        return result;
    }
    exports.freezedStake = freezedStake;
    function decodeVotingParamsRawData(rawData) {
        const data = rawData.slice(2);
        let index = 0;
        const executor = '0x' + data.slice(index, index + 64).replace('000000000000000000000000', '');
        index += 64;
        const id = new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64));
        index += 64;
        const name = '0x' + data.slice(index, index + 64);
        index += 64;
        let optionsIndex = new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64)).times(2).toNumber();
        const optionsCount = new eth_wallet_2.BigNumber('0x' + data.slice(optionsIndex, optionsIndex + 64)).toNumber();
        optionsIndex += 64;
        const options = [];
        for (let i = 0; i < optionsCount; i++) {
            options.push('0x' + data.slice(optionsIndex, optionsIndex + 64));
            optionsIndex += 64;
        }
        index += 64;
        const voteStartTime = new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64));
        index += 64;
        const voteEndTime = new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64));
        index += 64;
        const executeDelay = new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64));
        index += 64;
        const status = [
            new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64)).toNumber() === 1,
            new eth_wallet_2.BigNumber('0x' + data.slice(index + 64, index + 128)).toNumber() === 1 //vetoed
        ];
        index += 128;
        let optionsWeightIndex = new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64)).times(2).toNumber();
        const optionsWeightCount = new eth_wallet_2.BigNumber('0x' + data.slice(optionsWeightIndex, optionsWeightIndex + 64)).toNumber();
        optionsWeightIndex += 64;
        const optionsWeight = [];
        for (let i = 0; i < optionsWeightCount; i++) {
            optionsWeight.push(new eth_wallet_2.BigNumber('0x' + data.slice(optionsWeightIndex, optionsWeightIndex + 64)));
            optionsWeightIndex += 64;
        }
        index += 64;
        const quorum = [
            new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64)),
            new eth_wallet_2.BigNumber('0x' + data.slice(index + 64, index + 128)),
            new eth_wallet_2.BigNumber('0x' + data.slice(index + 128, index + 192)) //totalWeight
        ];
        index += 192;
        let executeParamIndex = new eth_wallet_2.BigNumber('0x' + data.slice(index, index + 64)).times(2).toNumber();
        const executeParamCount = new eth_wallet_2.BigNumber('0x' + data.slice(executeParamIndex, executeParamIndex + 64)).toNumber();
        executeParamIndex += 64;
        const executeParam = [];
        for (let i = 0; i < executeParamCount; i++) {
            executeParam.push('0x' + data.slice(executeParamIndex, executeParamIndex + 64));
            executeParamIndex += 64;
        }
        const struct = {
            executor: executor,
            id: id,
            name: name,
            options: options,
            voteStartTime: voteStartTime,
            voteEndTime: voteEndTime,
            executeDelay: executeDelay,
            status: status,
            optionsWeight: optionsWeight,
            quorum: quorum,
            executeParam: executeParam
        };
        return struct;
    }
    function parseVotingExecuteParam(params) {
        let executeParam;
        let _executeParam = params.executeParam;
        if (_executeParam && Array.isArray(_executeParam) && _executeParam.length) {
            let cmd = eth_wallet_2.Utils.bytes32ToString(_executeParam[0]).replace(/\x00/gi, "");
            switch (cmd) {
                case "addOldOracleToNewPair":
                    executeParam = {
                        "cmd": cmd,
                        "token0": _executeParam[1].substring(0, 42),
                        "token1": _executeParam[2].substring(0, 42),
                        "oracle": _executeParam[3].substring(0, 42)
                    };
                    break;
                case "setOracle":
                    executeParam = {
                        "cmd": cmd,
                        "token0": _executeParam[1].substring(0, 42),
                        "token1": _executeParam[2].substring(0, 42),
                        "oracle": _executeParam[3].substring(0, 42)
                    };
                    break;
            }
        }
        return executeParam;
    }
    function getVotingTitle(state, result) {
        let title;
        if (!result.executeParam)
            return title;
        const token0 = result.executeParam.token0;
        const token1 = result.executeParam.token1;
        const chainId = state.getChainId();
        let tokenMap = scom_token_list_2.tokenStore.getTokenMapByChainId(chainId);
        let symbol0 = token0 ? tokenMap[token0.toLowerCase()]?.symbol ?? '' : '';
        let symbol1 = token1 ? tokenMap[token1.toLowerCase()]?.symbol ?? '' : '';
        switch (result.executeParam.cmd) {
            case "addOldOracleToNewPair":
                title = "Add Price Oracle for Pair " + symbol0 + "/" + symbol1;
                break;
            case "setOracle":
                title = "Add New / Change Price Oracle for Pair " + symbol0 + "/" + symbol1;
                break;
        }
        return title;
    }
    function parseVotingParams(state, params) {
        let result = {
            executor: params.executor,
            address: '',
            id: params.id,
            name: eth_wallet_2.Utils.bytes32ToString(params.name).replace(/\x00/gi, ""),
            options: {},
            quorum: eth_wallet_2.Utils.fromDecimals(params.quorum[0]).toFixed(),
            voteStartTime: new Date(params.voteStartTime.times(1000).toNumber()),
            endTime: new Date(params.voteEndTime.times(1000).toNumber()),
            executeDelay: params.executeDelay,
            executed: params.status[0],
            vetoed: params.status[1],
            totalWeight: eth_wallet_2.Utils.fromDecimals(params.quorum[2]).toFixed(),
            threshold: eth_wallet_2.Utils.fromDecimals(params.quorum[1]).toFixed(),
            remain: 0,
            quorumRemain: '0'
        };
        let voteEndTime = params.voteEndTime.toNumber();
        let now = Math.ceil(Date.now() / 1000);
        let diff = Number(voteEndTime) - now;
        result.remain = diff > 0 ? diff : 0;
        let quorumRemain = new eth_wallet_2.BigNumber(result.quorum);
        let govDecimals = govTokenDecimals(state);
        for (let i = 0; i < params.options.length; i++) {
            let weight = eth_wallet_2.Utils.fromDecimals(params.optionsWeight[i], govDecimals);
            let key = eth_wallet_2.Utils.bytes32ToString(params.options[i]).replace(/\x00/gi, "");
            result.options[key] = weight;
            quorumRemain = quorumRemain.minus(weight);
        }
        result.quorumRemain = quorumRemain.lt(0) ? '0' : quorumRemain.toFixed();
        if (params.executeParam && Array.isArray(params.executeParam) && params.executeParam.length) {
            let executeDelay = Number(params.executeDelay);
            diff = (voteEndTime + executeDelay) - now;
            if (result.vetoed)
                result.veto = true;
            else if (params.executed)
                result.executed = true;
            else
                result.executiveDelay = diff > 0 ? diff : 0;
            result.majorityPassed = new eth_wallet_2.BigNumber(params.optionsWeight[0]).gt(params.optionsWeight[1]);
            result.thresholdPassed = new eth_wallet_2.BigNumber(params.optionsWeight[0]).div(new eth_wallet_2.BigNumber(params.optionsWeight[0]).plus(params.optionsWeight[1])).gt(result.threshold);
            if (result.vetoed) {
                result.status = "vetoed";
            }
            else if (result.remain > 0) {
                result.status = "in_progress";
            }
            else if (!result.majorityPassed || !result.thresholdPassed || Number(result.quorumRemain) > 0) {
                result.status = "not_passed";
            }
            else if (result.executiveDelay > 0) {
                result.status = "waiting_execution_delay";
            }
            else if (result.executed) {
                result.status = "executed";
            }
            else {
                result.status = "waiting_execution";
            }
            result.executeParam = parseVotingExecuteParam(params);
        }
        let title = getVotingTitle(state, result);
        if (title)
            result.title = title;
        return result;
    }
    async function getLatestVotingAddress(state, chainId) {
        let address = '';
        try {
            const wallet = state.getRpcWallet();
            await wallet.init();
            if (wallet.chainId != chainId)
                await wallet.switchNetwork(chainId);
            let gov = state.getAddresses(chainId).OAXDEX_Governance;
            let govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
            let votings = await govContract.allVotings();
            let votingContract = new oswap_openswap_contract_1.Contracts.OAXDEX_VotingContract(wallet);
            const getParamsTxData = wallet.encodeFunctionCall(votingContract, 'getParams', []);
            const getParamsResult = await wallet.multiCall(votings.map(v => {
                return {
                    to: v,
                    data: getParamsTxData
                };
            }));
            for (let i = votings.length - 1; i >= 0; i--) {
                let result = decodeVotingParamsRawData(getParamsResult.results[i]);
                let executeParam = parseVotingExecuteParam(result);
                if (!executeParam)
                    continue;
                address = votings[i];
                break;
            }
        }
        catch (err) { }
        return address;
    }
    exports.getLatestVotingAddress = getLatestVotingAddress;
    async function getVotingResult(state, votingAddress) {
        if (!votingAddress)
            return;
        let result;
        try {
            const wallet = state.getRpcWallet();
            const votingContract = new oswap_openswap_contract_1.Contracts.OAXDEX_VotingContract(wallet, votingAddress);
            const getParams = await votingContract.getParams();
            result = parseVotingParams(state, getParams);
            result.address = votingAddress;
        }
        catch (err) { }
        return result;
    }
    exports.getVotingResult = getVotingResult;
    async function getOptionVoted(state, votingAddress, address) {
        let result;
        const wallet = state.getRpcWallet();
        if (!address)
            address = wallet.account.address;
        if (!votingAddress)
            return result;
        const votingContract = new oswap_openswap_contract_1.Contracts.OAXDEX_VotingContract(wallet, votingAddress);
        try {
            let option = await votingContract.accountVoteOption(address);
            let weight = await votingContract.accountVoteWeight(address);
            result = { option: option, weight: weight };
        }
        catch (err) { }
        return result;
    }
    exports.getOptionVoted = getOptionVoted;
    async function vote(votingAddress, value) {
        const param = value == 'Y' ? 0 : 1;
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        const votingContract = new oswap_openswap_contract_1.Contracts.OAXDEX_VotingContract(wallet, votingAddress);
        let receipt = await votingContract.vote(param);
        return receipt;
    }
    exports.vote = vote;
});
define("@scom/scom-governance-voting/voteList.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-governance-voting/index.css.ts", "@ijstech/eth-wallet", "@scom/scom-governance-voting/api.ts"], function (require, exports, components_4, index_css_1, eth_wallet_3, api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GovernanceVoteList = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    let GovernanceVoteList = class GovernanceVoteList extends components_4.Module {
        constructor() {
            super(...arguments);
            this.userWeightVote = {};
            this.getVoteOptions = async () => {
                const address = eth_wallet_3.Wallet.getClientInstance().account.address;
                const getOptionVote = await (0, api_1.getOptionVoted)(this.state, this.data.address, address);
                this.userWeightVote = {
                    option: getOptionVote?.option,
                    weight: eth_wallet_3.Utils.fromDecimals(getOptionVote?.weight ?? "").toFixed()
                };
                if (this.hasVoted && this.data.options[this.userWeightVote.option] && this.onSelect)
                    this.onSelect(this.userWeightVote.option);
            };
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
            this.renderUI();
        }
        get state() {
            return this._state;
        }
        set state(value) {
            this._state = value;
        }
        get selectedChoiceText() {
            return this.selectedItem?.optionText || this.data?.selectedVotes[0] || this.optionValue;
        }
        get hasVoted() {
            return !(this.userWeightVote.weight == 0 || this.userWeightVote.weight == undefined);
        }
        get isDropdownDisabled() {
            if (this.remainingTimeToBeExpired > 0)
                return false;
            else
                return true;
        }
        get remainingTimeToBeExpired() {
            if (!this.data.expiry)
                return 0;
            return (0, components_4.moment)(this.data.expiry).diff(Date());
        }
        get optionValue() {
            if (!this.hasVoted || !this.data.options[this.userWeightVote.option]) {
                return 'Your choice';
            }
            else {
                const option = this.data.options[this.userWeightVote.option];
                return option.optionText;
            }
        }
        get stakeVote() {
            if (!this.hasVoted) {
                if (this.remainingTimeToBeExpired > 0)
                    return 'You have not voted yet!';
                else
                    return 'Vote has ended!';
            }
            const chainId = this.state.getChainId();
            return `You staked: ${(+this.userWeightVote.weight).toLocaleString('en-US')} ${this.state.getGovToken(chainId).symbol}`;
        }
        init() {
            super.init();
            this.classList.add(index_css_1.voteListStyle);
            this.onSelect = this.getAttribute('onSelect', true) || this.onSelect;
            const dataAttr = this.getAttribute('data', true);
            if (dataAttr)
                this.data = dataAttr;
        }
        async renderUI() {
            if (!this.dropdownStack)
                return;
            await this.getVoteOptions();
            this.dropdownStack.clearInnerHTML();
            this.btnChoice = await components_4.Button.create({
                caption: this.selectedChoiceText,
                width: '100%',
                padding: { top: '0.8rem', bottom: '0.8rem', left: '0.75rem', right: '0.75rem' },
                font: { size: '1.5rem', bold: true, color: '#fff' },
                rightIcon: { name: 'caret-down', width: 16, height: 16, fill: '#fff' },
                border: { radius: 0 },
                background: { color: `${Theme.background.gradient} !important` },
                enabled: !this.isDropdownDisabled,
                opacity: 1
            });
            this.btnChoice.onClick = () => modalElm.visible = !modalElm.visible;
            this.btnChoice.style.justifyContent = "space-between";
            if (this.isDropdownDisabled)
                this.btnChoice.classList.add('prevent-pointer');
            const modalElm = await components_4.Modal.create({
                minWidth: 300,
                showBackdrop: false,
                height: 'auto',
                popupPlacement: 'bottom'
            });
            modalElm.classList.add("account-dropdown");
            modalElm.style.width = '100%';
            const vstack = await components_4.VStack.create({
                gap: '15px'
            });
            const itemCaptions = this.data.options || [];
            itemCaptions.forEach(async (option, i) => {
                const buttonItem = await components_4.Button.create({
                    caption: option.optionText,
                    width: '100%',
                    height: 'auto',
                    padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }
                });
                buttonItem.onClick = (source, event) => {
                    event.stopPropagation();
                    this.onSelectItem(option, i);
                    modalElm.visible = false;
                    return true;
                };
                vstack.appendChild(buttonItem);
                modalElm.item = vstack;
            });
            this.dropdownStack.append(this.btnChoice, modalElm);
            if (this.lblDesc)
                this.lblDesc.caption = this.stakeVote;
        }
        onSelectItem(option, index) {
            this.selectedItem = option;
            if (this.btnChoice)
                this.btnChoice.caption = this.selectedChoiceText;
            if (this.onSelect)
                this.onSelect(index);
        }
        render() {
            return (this.$render("i-panel", null,
                this.$render("i-panel", { id: "dropdownStack", minWidth: 200 }),
                this.$render("i-label", { id: "lblDesc", caption: "Vote has ended!", margin: { top: '0.25rem' }, font: { size: '0.875rem', color: Theme.text.third }, lineHeight: 1.2 })));
        }
    };
    GovernanceVoteList = __decorate([
        (0, components_4.customElements)('i-scom-governance-voting-vote-list')
    ], GovernanceVoteList);
    exports.GovernanceVoteList = GovernanceVoteList;
});
///<amd-module name='@scom/scom-governance-voting/formSchema.ts'/> 
define("@scom/scom-governance-voting/formSchema.ts", ["require", "exports", "@scom/scom-network-picker"], function (require, exports, scom_network_picker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFormSchema = void 0;
    function getFormSchema() {
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
            customControls() {
                return {
                    "#/properties/chainId": {
                        render: () => {
                            let networkPicker = new scom_network_picker_1.default(undefined, {
                                type: 'combobox',
                                networks: [1, 56, 137, 250, 97, 80001, 43113, 43114, 42161, 421613].map(v => { return { chainId: v }; })
                            });
                            return networkPicker;
                        },
                        getData: (control) => {
                            return control.selectedNetwork?.chainId;
                        },
                        setData: (control, value) => {
                            control.setNetworkByChainId(value);
                        }
                    }
                };
            }
        };
    }
    exports.getFormSchema = getFormSchema;
});
define("@scom/scom-governance-voting/flow/initialSetup.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-governance-voting/store/index.ts", "@ijstech/eth-wallet", "@scom/scom-governance-voting/index.css.ts"], function (require, exports, components_5, index_1, eth_wallet_4, index_css_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_5.Styles.Theme.ThemeVars;
    let ScomGovernanceVotingFlowInitialSetup = class ScomGovernanceVotingFlowInitialSetup extends components_5.Module {
        constructor() {
            super(...arguments);
            this.walletEvents = [];
        }
        get state() {
            return this._state;
        }
        set state(value) {
            this._state = value;
        }
        get rpcWallet() {
            return this.state.getRpcWallet();
        }
        get chainId() {
            return this.executionProperties.chainId || this.executionProperties.defaultChainId;
        }
        async resetRpcWallet() {
            await this.state.initRpcWallet(this.chainId);
        }
        async setData(value) {
            this.executionProperties = value.executionProperties;
            this.tokenRequirements = value.tokenRequirements;
            await this.resetRpcWallet();
            await this.initializeWidgetConfig();
        }
        async initWallet() {
            try {
                const rpcWallet = this.rpcWallet;
                await rpcWallet.init();
            }
            catch (err) {
                console.log(err);
            }
        }
        async initializeWidgetConfig() {
            const connected = (0, index_1.isClientWalletConnected)();
            this.updateConnectStatus(connected);
            await this.initWallet();
        }
        async connectWallet() {
            if (!(0, index_1.isClientWalletConnected)()) {
                if (this.mdWallet) {
                    await components_5.application.loadPackage('@scom/scom-wallet-modal', '*');
                    this.mdWallet.networks = this.executionProperties.networks;
                    this.mdWallet.wallets = this.executionProperties.wallets;
                    this.mdWallet.showModal();
                }
            }
        }
        updateConnectStatus(connected) {
            if (connected) {
                this.lblConnectedStatus.caption = 'Connected with ' + eth_wallet_4.Wallet.getClientInstance().address;
                this.btnConnectWallet.visible = false;
            }
            else {
                this.lblConnectedStatus.caption = 'Please connect your wallet first';
                this.btnConnectWallet.visible = true;
            }
        }
        registerEvents() {
            let clientWallets = eth_wallet_4.Wallet.getClientInstance();
            this.walletEvents.push(clientWallets.registerWalletEvent(this, eth_wallet_4.Constants.ClientWalletEvent.AccountsChanged, async (payload) => {
                const { account } = payload;
                let connected = !!account;
                this.updateConnectStatus(connected);
            }));
        }
        onHide() {
            let clientWallet = eth_wallet_4.Wallet.getClientInstance();
            for (let event of this.walletEvents) {
                clientWallet.unregisterWalletEvent(event);
            }
            this.walletEvents = [];
        }
        init() {
            super.init();
            this.registerEvents();
        }
        async handleClickStart() {
            this.executionProperties.votingAddress = this.edtVotingAddress.value || "";
            if (this.state.handleUpdateStepStatus)
                this.state.handleUpdateStepStatus({
                    status: "Completed",
                    color: Theme.colors.success.main
                });
            if (this.state.handleNextFlowStep)
                this.state.handleNextFlowStep({
                    isInitialSetup: true,
                    tokenRequirements: this.tokenRequirements,
                    executionProperties: this.executionProperties
                });
        }
        render() {
            return (this.$render("i-vstack", { gap: "1rem", padding: { top: 10, bottom: 10, left: 20, right: 20 } },
                this.$render("i-label", { caption: "Get Ready to Vote" }),
                this.$render("i-vstack", { gap: '1rem' },
                    this.$render("i-label", { id: "lblConnectedStatus" }),
                    this.$render("i-hstack", null,
                        this.$render("i-button", { id: "btnConnectWallet", caption: 'Connect Wallet', font: { color: Theme.colors.primary.contrastText }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, onClick: this.connectWallet }))),
                this.$render("i-label", { caption: "Enter voting address" }),
                this.$render("i-hstack", { width: "50%", verticalAlignment: "center" },
                    this.$render("i-input", { id: "edtVotingAddress", class: index_css_2.flowInputStyle, height: 32, width: "100%", border: { radius: 6 }, font: { size: '1rem' } })),
                this.$render("i-hstack", { horizontalAlignment: 'center' },
                    this.$render("i-button", { id: "btnStart", caption: "Start", padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, font: { color: Theme.colors.primary.contrastText, size: '1.5rem' }, onClick: this.handleClickStart })),
                this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] })));
        }
        async handleFlowStage(target, stage, options) {
            let widget = this;
            if (!options.isWidgetConnected) {
                let properties = options.properties;
                let tokenRequirements = options.tokenRequirements;
                this.state.handleNextFlowStep = options.onNextStep;
                this.state.handleAddTransactions = options.onAddTransactions;
                this.state.handleJumpToStep = options.onJumpToStep;
                this.state.handleUpdateStepStatus = options.onUpdateStepStatus;
                await this.setData({
                    executionProperties: properties,
                    tokenRequirements
                });
            }
            return { widget };
        }
    };
    ScomGovernanceVotingFlowInitialSetup = __decorate([
        (0, components_5.customElements)('i-scom-governance-voting-flow-initial-setup')
    ], ScomGovernanceVotingFlowInitialSetup);
    exports.default = ScomGovernanceVotingFlowInitialSetup;
});
define("@scom/scom-governance-voting", ["require", "exports", "@ijstech/components", "@scom/scom-governance-voting/store/index.ts", "@scom/scom-governance-voting/assets.ts", "@scom/scom-governance-voting/data.json.ts", "@scom/scom-governance-voting/index.css.ts", "@ijstech/eth-wallet", "@scom/scom-governance-voting/api.ts", "@scom/scom-token-list", "@scom/scom-governance-voting/formSchema.ts", "@scom/scom-governance-voting/flow/initialSetup.tsx"], function (require, exports, components_6, index_2, assets_1, data_json_1, index_css_3, eth_wallet_5, api_2, scom_token_list_3, formSchema_1, initialSetup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_6.Styles.Theme.ThemeVars;
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
    };
    let GovernanceVoting = class GovernanceVoting extends components_6.Module {
        get chainId() {
            return this.state.getChainId();
        }
        get defaultChainId() {
            return this._data.defaultChainId;
        }
        set defaultChainId(value) {
            this._data.defaultChainId = value;
        }
        get wallets() {
            return this._data.wallets ?? [];
        }
        set wallets(value) {
            this._data.wallets = value;
        }
        get networks() {
            return this._data.networks ?? [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            return this._data.showHeader ?? true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
        }
        get votingAddress() {
            return this._data.votingAddress || this.latestVotingAddress || "";
        }
        get isExecutive() {
            return this.proposalType === 'Executive';
        }
        get voteList() {
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
            }
            else {
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
        get isAddVoteBallotDisabled() {
            if (!this.expiry)
                return true;
            if ((0, components_6.moment)(this.expiry).isAfter((0, components_6.moment)()))
                return Number(this.stakeOf) > 0 ? false : true;
            return true;
        }
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                chainId: 0,
                votingAddress: '',
                wallets: [],
                networks: []
            };
            this.tag = {};
            this.lockTill = 0;
            this.selectedVoteTexts = [];
            this.isVoteSelected = false;
            this.voteOptions = {};
            this.votingQuorum = '0';
            this.executeAction = '';
            this.executeValue = '0';
            this.tokenAddress = '';
            this.stakedBalance = '0';
            this.votingBalance = '0';
            this.freezeStakeAmount = new eth_wallet_5.BigNumber(0);
            this.stakeOf = new eth_wallet_5.BigNumber(0);
            this.initWallet = async () => {
                try {
                    await eth_wallet_5.Wallet.getClientInstance().init();
                    const rpcWallet = this.state.getRpcWallet();
                    await rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.initializeWidgetConfig = async () => {
                setTimeout(async () => {
                    const chainId = this.chainId;
                    scom_token_list_3.tokenStore.updateTokenMapData(chainId);
                    await this.initWallet();
                    await this.setGovBalance();
                    if (!this._data.votingAddress) {
                        this.latestVotingAddress = await (0, api_2.getLatestVotingAddress)(this.state, this.chainId);
                    }
                    this.lblVotingAddress.caption = this.votingAddress;
                    this.btnEditAddress.visible = !this._data.isFlow;
                    this.updateBalanceStack();
                    await this.getVotingResult();
                    const connected = (0, index_2.isClientWalletConnected)();
                    if (!connected || !this.state.isRpcWalletConnected()) {
                        this.btnSubmitVote.caption = connected ? "Switch Network" : "Connect Wallet";
                        this.btnSubmitVote.enabled = true;
                    }
                    else {
                        this.btnSubmitVote.enabled = !(this.isAddVoteBallotDisabled || !this.isVoteSelected);
                        this.btnSubmitVote.caption = "Submit Vote";
                    }
                    this.updateMainUI();
                });
            };
            this.showResultMessage = (status, content) => {
                if (!this.txStatusModal)
                    return;
                let params = { status };
                if (status === 'success') {
                    params.txtHash = content;
                }
                else {
                    params.content = content;
                }
                this.txStatusModal.message = { ...params };
                this.txStatusModal.showModal();
            };
            this.connectWallet = async () => {
                if (!(0, index_2.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_6.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!this.state.isRpcWalletConnected()) {
                    const clientWallet = eth_wallet_5.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(this.chainId);
                }
            };
            this.registerSendTxEvents = (confirmationCallback) => {
                const txHashCallback = async (err, receipt) => {
                    if (err) {
                        this.showResultMessage('error', err);
                    }
                    else if (receipt) {
                        this.showResultMessage('success', receipt);
                    }
                };
                const wallet = eth_wallet_5.Wallet.getClientInstance();
                wallet.registerSendTxEvents({
                    transactionHash: txHashCallback,
                    confirmation: confirmationCallback
                });
            };
            this.state = new index_2.State(data_json_1.default);
        }
        removeRpcWalletEvents() {
            const rpcWallet = this.state.getRpcWallet();
            if (rpcWallet)
                rpcWallet.unregisterAllWalletEvents();
        }
        onHide() {
            this.dappContainer.onHide();
            this.removeRpcWalletEvents();
        }
        isEmptyData(value) {
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
                const data = {
                    chainId,
                    votingAddress,
                    networks,
                    wallets,
                    defaultChainId,
                    showHeader
                };
                if (!this.isEmptyData(data)) {
                    await this.setData(data);
                }
            }
            this.loadingElm.visible = false;
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        _getActions(category) {
            const formSchema = (0, formSchema_1.getFormSchema)();
            const actions = [];
            if (category && category !== 'offers') {
                actions.push({
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = {
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
                        };
                    },
                    userInputDataSchema: formSchema.dataSchema,
                    userInputUISchema: formSchema.uiSchema,
                    customControls: formSchema.customControls()
                });
            }
            return actions;
        }
        getProjectOwnerActions() {
            const formSchema = (0, formSchema_1.getFormSchema)();
            const actions = [
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
                    getProxySelectors: async (chainId) => {
                        return [];
                    },
                    getActions: () => {
                        return this.getProjectOwnerActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
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
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData({ ...defaultData, ...data });
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Embedder Configurator',
                    target: 'Embedders',
                    getData: async () => {
                        return { ...this._data };
                    },
                    setData: async (properties, linkParams) => {
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
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            this.resetRpcWallet();
            await this.refreshUI();
        }
        async getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        setTag(value) {
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
        resetRpcWallet() {
            this.removeRpcWalletEvents();
            const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
            const rpcWallet = this.state.getRpcWallet();
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_5.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.refreshUI();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_5.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.refreshUI();
            });
            const data = {
                defaultChainId: this.defaultChainId,
                wallets: this.wallets,
                networks: this.networks,
                showHeader: this.showHeader,
                rpcWalletId: rpcWallet.instanceId
            };
            if (this.dappContainer?.setData)
                this.dappContainer.setData(data);
        }
        async refreshUI() {
            await this.initializeWidgetConfig();
        }
        async setGovBalance() {
            const wallet = this.state.getRpcWallet();
            const selectedAddress = wallet.account.address;
            this.stakeOf = await (0, api_2.stakeOf)(this.state, selectedAddress);
            let freezeStake = await (0, api_2.freezedStake)(this.state, selectedAddress);
            let freezeStakeAmount = freezeStake.amount;
            this.stakedBalance = components_6.FormatUtils.formatNumber(freezeStakeAmount.plus(this.stakeOf).toFixed(4), { decimalFigures: 4 });
            this.votingBalance = components_6.FormatUtils.formatNumber(this.stakeOf.toFixed(4), { decimalFigures: 4 });
            this.freezeStakeAmount = freezeStakeAmount;
            this.lockTill = freezeStake.lockTill;
        }
        updateBalanceStack() {
            const chainId = this.state.getChainId();
            const govTokenSymbol = this.state.getGovToken(chainId)?.symbol || '';
            const canDisplay = this.freezeStakeAmount.gt(0);
            this.lblStakedBalance.caption = `${this.stakedBalance} ${govTokenSymbol}`;
            this.lblFreezeStakeAmount.visible = canDisplay;
            if (canDisplay) {
                this.lblFreezeStakeAmount.caption = `${components_6.FormatUtils.formatNumber(this.freezeStakeAmount.toFixed(4), { decimalFigures: 4 })} ${govTokenSymbol} Available on ${(0, components_6.moment)(this.lockTill).format('MMM DD, YYYY')}`;
            }
            else {
                this.lblFreezeStakeAmount.caption = '';
            }
            this.lblVotingBalance.caption = `${this.votingBalance} ${govTokenSymbol}`;
        }
        async getVotingResult() {
            const votingResult = await (0, api_2.getVotingResult)(this.state, this.votingAddress);
            if (votingResult) {
                this.proposalType = votingResult.hasOwnProperty('executeParam') ? 'Executive' : 'Poll';
                this.expiry = votingResult.endTime;
                this.voteStartTime = votingResult.voteStartTime;
                this.lblTitle.caption = this.lblProposalDesc.caption = this.proposalType == 'Executive' ? votingResult.title : votingResult.name;
                this.voteOptions = votingResult.options;
                if (this.proposalType === 'Executive') {
                    if (votingResult.executeParam) {
                        this.executeAction = executeActionMap[votingResult.executeParam.cmd] ? executeActionMap[votingResult.executeParam.cmd] : '';
                        if (votingResult.executeParam.value) {
                            this.executeValue = votingResult.executeParam.value;
                        }
                        else if (votingResult.executeParam.address) {
                            this.executeValue = votingResult.executeParam.address;
                        }
                        else if (votingResult.executeParam.oracle) {
                            this.executeValue = votingResult.executeParam.oracle;
                        }
                        else if (votingResult.executeParam.lotSize) {
                            this.executeValue = votingResult.executeParam.lotSize;
                            this.tokenAddress = votingResult.executeParam.token;
                        }
                    }
                    this.votingQuorum = votingResult.quorum;
                }
            }
            else {
                this.proposalType = 'Executive';
                this.expiry = null;
                this.voteStartTime = null;
                this.lblTitle.caption = this.lblProposalDesc.caption = "";
                this.voteOptions = {};
                this.executeAction = '';
                this.executeValue = '0';
                this.tokenAddress = '';
                this.votingQuorum = '0';
            }
        }
        formatDate(value) {
            if (!value)
                return '';
            return (0, components_6.moment)(value).format('MMM. DD, YYYY') + ' at ' + (0, components_6.moment)(value).format('HH:mm');
        }
        updateMainUI() {
            const optionY = new eth_wallet_5.BigNumber(this.voteOptions?.Y ?? 0);
            const optionN = new eth_wallet_5.BigNumber(this.voteOptions?.N ?? 0);
            const votingQuorum = new eth_wallet_5.BigNumber(this.votingQuorum);
            this.inFavourBar.width = !votingQuorum.eq(0) ? `${optionY.div(votingQuorum).times(100).toFixed()}%` : 0;
            this.lblVoteOptionY.caption = optionY.toFixed();
            this.lblInFavourVotingQuorum.caption = votingQuorum.toFixed();
            this.againstBar.width = !votingQuorum.eq(0) ? `${optionN.div(votingQuorum).times(100).toFixed()}%` : 0;
            this.lblVoteOptionN.caption = optionN.toFixed();
            this.lblAgainstVotingQuorum.caption = votingQuorum.toFixed();
            this.lblVoteStartTime.caption = this.formatDate(this.voteStartTime);
            this.lblVoteEndTime.caption = this.formatDate(this.expiry);
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
        selectVote(index) {
            this.selectedVoteTexts = [this.voteList[index].optionText];
            this.selectedVoteObj = this.voteList[index];
            this.isVoteSelected = true;
            if (this.btnSubmitVote) {
                this.btnSubmitVote.enabled = !(this.isAddVoteBallotDisabled || !this.isVoteSelected);
            }
        }
        async onSubmitVote() {
            if (!(0, index_2.isClientWalletConnected)() || !this.state.isRpcWalletConnected()) {
                this.connectWallet();
                return;
            }
            if (this.isAddVoteBallotDisabled || !this.isVoteSelected)
                return;
            const wallet = eth_wallet_5.Wallet.getClientInstance();
            try {
                this.btnSubmitVote.rightIcon.spin = true;
                this.btnSubmitVote.rightIcon.visible = true;
                this.showResultMessage('warning');
                const voteOption = this.selectedVoteObj.optionText;
                const votingAddress = this.votingAddress;
                const chainId = this.chainId;
                const confirmationCallback = async (receipt) => {
                    if (this.state.handleUpdateStepStatus) {
                        this.state.handleUpdateStepStatus({
                            status: "Completed",
                            color: Theme.colors.success.main,
                            message: voteOption
                        });
                    }
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
                        if (this.state.handleJumpToStep) {
                            this.state.handleJumpToStep({
                                widgetName: 'scom-governance-execute-proposal',
                                executionProperties: {
                                    votingAddress,
                                    fromToken: this._data.fromToken || '',
                                    toToken: this._data.toToken || '',
                                    isFlow: true
                                }
                            });
                        }
                    }
                    wallet.registerSendTxEvents({});
                };
                this.registerSendTxEvents(confirmationCallback);
                await (0, api_2.vote)(votingAddress, this.selectedVoteObj.optionValue.toString());
                this.btnSubmitVote.rightIcon.spin = false;
                this.btnSubmitVote.rightIcon.visible = false;
            }
            catch (err) {
                this.showResultMessage('error', err);
                this.btnSubmitVote.rightIcon.spin = false;
                this.btnSubmitVote.rightIcon.visible = false;
                wallet.registerSendTxEvents({});
            }
        }
        updateAddress() {
            const regex = new RegExp('^((0x[a-fA-F0-9]{40})|([13][a-km-zA-HJ-NP-Z1-9]{25,34})|(X[1-9A-HJ-NP-Za-km-z]{33})|(4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}))$');
            const address = this.edtVotingAddress.value;
            if ((address && !regex.test(address)))
                return;
            if (address) {
                this._data.votingAddress = address;
            }
            else {
                delete this._data.votingAddress;
            }
            this.mdUpdateAddress.visible = false;
            this.refreshUI();
        }
        openAddressModal() {
            if (this._data.isFlow)
                return;
            this.edtVotingAddress.value = this._data.votingAddress || "";
            this.mdUpdateAddress.visible = true;
        }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer" },
                this.$render("i-panel", { class: index_css_3.default, background: { color: Theme.background.main } },
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay" },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_1.default.fullPath('img/loading.svg'), width: 36, height: 36 } }),
                                this.$render("i-label", { caption: "Loading...", font: { color: '#FD4A4C', size: '1.5em' }, class: "i-loading-spinner_text" }))),
                        this.$render("i-vstack", { width: "100%", height: "100%", maxWidth: 1200, padding: { top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }, margin: { left: 'auto', right: 'auto' }, gap: "0.75rem" },
                            this.$render("i-label", { id: "lblTitle", font: { size: 'clamp(1rem, 0.8rem + 1vw, 2rem)', weight: 600 } }),
                            this.$render("i-panel", { padding: { top: "1rem", bottom: "1rem" } },
                                this.$render("i-hstack", { padding: { bottom: "1rem" }, verticalAlignment: "center", gap: 4, wrap: "wrap" },
                                    this.$render("i-label", { caption: "Address: ", font: { size: '1rem', color: Theme.text.third, bold: true } }),
                                    this.$render("i-label", { id: "lblVotingAddress", font: { size: '1rem', color: Theme.text.third } }),
                                    this.$render("i-button", { id: "btnEditAddress", class: "btn-os", height: 28, width: 28, icon: { name: 'edit', height: 14, width: 14 }, margin: { left: 4 }, tooltip: { content: 'Edit', placement: 'top' }, onClick: this.openAddressModal.bind(this) }),
                                    this.$render("i-button", { class: "btn-os", height: 28, width: 28, icon: { name: 'sync', height: 14, width: 14 }, margin: { left: 4 }, tooltip: { content: 'Refresh', placement: 'top' }, onClick: this.refreshUI.bind(this) })),
                                this.$render("i-stack", { direction: "horizontal", alignItems: "start", justifyContent: "space-between", mediaQueries: [{
                                            maxWidth: '767px', properties: {
                                                direction: 'vertical', alignItems: 'start', justifyContent: 'start', gap: '1rem'
                                            }
                                        }] },
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-hstack", { gap: 4, verticalAlignment: "center", wrap: "wrap" },
                                            this.$render("i-label", { caption: "Staked Balance: ", font: { size: '1rem', color: Theme.text.third, bold: true } }),
                                            this.$render("i-label", { id: "lblStakedBalance", font: { size: '1rem', color: Theme.text.third } })),
                                        this.$render("i-label", { id: "lblFreezeStakeAmount", visible: false })),
                                    this.$render("i-vstack", null,
                                        this.$render("i-hstack", { gap: 4, verticalAlignment: "center", wrap: "wrap" },
                                            this.$render("i-label", { caption: "Voting Balance: ", font: { size: '1rem', color: Theme.text.third, bold: true } }),
                                            this.$render("i-label", { id: "lblVotingBalance", font: { size: '1rem', color: Theme.text.third } }))))),
                            this.$render("i-vstack", { padding: { top: '1rem', bottom: '1rem' }, gap: "0.75rem" },
                                this.$render("i-stack", { direction: "horizontal", minHeight: 100, alignItems: "center", gap: "1.5rem", mediaQueries: [{ maxWidth: '767px', properties: { direction: 'vertical' } }] },
                                    this.$render("i-vstack", { width: "100%", class: "custom-box", background: { color: 'rgba(255, 255, 255, 0.13)' }, padding: { top: 10, bottom: 10, left: 20, right: 20 }, border: { radius: 15, width: '1px', style: 'solid', color: '#fff' }, gap: 10 },
                                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                                            this.$render("i-label", { caption: "In Favour", font: { size: '1rem', weight: 600 } }),
                                            this.$render("i-label", { caption: "Quorum", font: { size: '1rem', weight: 600 } })),
                                        this.$render("i-panel", { height: 18, width: "100%", border: { radius: 6 }, overflow: { x: 'hidden' }, background: { color: '#fff' } },
                                            this.$render("i-hstack", { id: "inFavourBar", width: 0, height: "100%", background: { color: '#01d394' } })),
                                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                                            this.$render("i-label", { id: "lblVoteOptionY", font: { size: '1rem', weight: 600, color: '#01d394' } }),
                                            this.$render("i-label", { id: "lblInFavourVotingQuorum", font: { size: '1rem', weight: 600 } }))),
                                    this.$render("i-vstack", { width: "100%", class: "custom-box", background: { color: 'rgba(255, 255, 255, 0.13)' }, padding: { top: 10, bottom: 10, left: 20, right: 20 }, border: { radius: 15, width: '1px', style: 'solid', color: '#fff' }, gap: 10 },
                                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                                            this.$render("i-label", { caption: "Against", font: { size: '1rem', weight: 600 } }),
                                            this.$render("i-label", { caption: "Quorum", font: { size: '1rem', weight: 600 } })),
                                        this.$render("i-panel", { height: 18, width: "100%", border: { radius: 6 }, overflow: { x: 'hidden' }, background: { color: '#fff' } },
                                            this.$render("i-hstack", { id: "againstBar", width: 0, height: "100%", background: { color: '#E84F4F' } })),
                                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                                            this.$render("i-label", { id: "lblVoteOptionN", font: { size: '1rem', weight: 600, color: '#E84F4F' } }),
                                            this.$render("i-label", { id: "lblAgainstVotingQuorum", font: { size: '1rem', weight: 600 } })))),
                                this.$render("i-stack", { class: "custom-box", minHeight: 100, background: { color: 'rgba(255, 255, 255, 0.13)' }, padding: { top: 10, bottom: 10, left: 20, right: 20 }, border: { radius: 15, width: '1px', style: 'solid', color: '#fff' }, gap: "1rem", direction: "horizontal", mediaQueries: [{ maxWidth: '767px', properties: { direction: 'vertical' } }] },
                                    this.$render("i-vstack", { width: "100%", gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Date Created", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblVoteStartTime", font: { size: '1rem' } })),
                                    this.$render("i-vstack", { width: "100%", gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Vote Ends", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblVoteEndTime", font: { size: '1rem' } }))),
                                this.$render("i-grid-layout", { width: "100%", minHeight: 100, background: { color: 'rgba(255, 255, 255, 0.13)' }, padding: { top: 10, bottom: 10, left: 20, right: 20 }, border: { radius: 15, width: '1px', style: 'solid', color: '#fff' }, gap: { column: 10, row: '1rem' }, templateColumns: ['repeat(2, 1fr)'], templateRows: ['repeat(3, auto)'], verticalAlignment: "stretch", mediaQueries: [
                                        { maxWidth: '767px', properties: { templateColumns: ['repeat(1, 1fr)'], templateRows: ['auto'] } }
                                    ] },
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Description", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblProposalDesc", font: { size: '1rem' } })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Action", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblExecuteAction", font: { size: '1rem' } })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Value", margin: { top: '1rem' }, font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblExecuteValue", font: { size: '1rem' } })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Quorum", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblVotingQuorum", font: { size: '1rem' } })),
                                    this.$render("i-vstack", { gap: "0.5rem", visible: false },
                                        this.$render("i-label", { caption: "Token Address", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblTokenAddress", font: { size: '1rem' }, margin: { top: '0.5rem' } })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Your Vote", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-scom-governance-voting-vote-list", { id: "governanceVoteList", onSelect: this.selectVote.bind(this) })))),
                            this.$render("i-vstack", { width: "100%", padding: { left: "1rem", right: "1rem" } },
                                this.$render("i-button", { id: 'btnSubmitVote', class: 'btn-os', height: 'auto', caption: "Submit Vote", padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, border: { radius: 5 }, font: { weight: 600 }, rightIcon: { spin: true, visible: false }, enabled: false, onClick: this.onSubmitVote.bind(this) })))),
                    this.$render("i-modal", { id: "mdUpdateAddress", class: index_css_3.modalStyle, title: "Update Address", closeIcon: { name: 'times' }, height: 'auto', maxWidth: 640, closeOnBackdropClick: false },
                        this.$render("i-panel", null,
                            this.$render("i-vstack", { gap: 4 },
                                this.$render("i-label", { caption: "Address: ", font: { size: '1rem', color: Theme.text.third, bold: true } }),
                                this.$render("i-input", { id: "edtVotingAddress", class: index_css_3.inputStyle, height: 32, width: "100%", border: { radius: 6 }, font: { size: '1rem', color: Theme.text.third } })),
                            this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "center", gap: "10px", margin: { top: 20, bottom: 10 } },
                                this.$render("i-button", { class: "btn-os", height: 'auto', padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, border: { radius: 5 }, font: { weight: 600 }, caption: "Confirm", onClick: this.updateAddress.bind(this) })))),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
        async handleFlowStage(target, stage, options) {
            let widget;
            if (stage === 'initialSetup') {
                widget = new initialSetup_1.default();
                target.appendChild(widget);
                await widget.ready();
                widget.state = this.state;
                await widget.handleFlowStage(target, stage, options);
            }
            else {
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
                this.state.handleUpdateStepStatus = options.onUpdateStepStatus;
                await this.setData(properties);
                if (tag) {
                    this.setTag(tag);
                }
            }
            return { widget };
        }
    };
    GovernanceVoting = __decorate([
        (0, components_6.customElements)('i-scom-governance-voting')
    ], GovernanceVoting);
    exports.default = GovernanceVoting;
});
