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
            var _a, _b, _c;
            if (this.rpcWalletId) {
                return this.rpcWalletId;
            }
            const clientWallet = eth_wallet_1.Wallet.getClientInstance();
            const networkList = Object.values(((_a = components_1.application.store) === null || _a === void 0 ? void 0 : _a.networkMap) || []);
            const instanceId = clientWallet.initRpcWallet({
                networks: networkList,
                defaultChainId,
                infuraId: (_b = components_1.application.store) === null || _b === void 0 ? void 0 : _b.infuraId,
                multicalls: (_c = components_1.application.store) === null || _c === void 0 ? void 0 : _c.multicalls
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
            return wallet === null || wallet === void 0 ? void 0 : wallet.isConnected;
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet === null || rpcWallet === void 0 ? void 0 : rpcWallet.chainId;
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
                this.networkMap[network.chainId] = Object.assign(Object.assign({}, networkInfo), network);
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        async setApprovalModelAction(options) {
            const approvalOptions = Object.assign(Object.assign({}, options), { spenderAddress: '' });
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
            let address = this.getAddresses(chainId).GOV_TOKEN;
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
    exports.comboBoxStyle = exports.voteListStyle = void 0;
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
});
define("@scom/scom-governance-voting/api.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/oswap-openswap-contract", "@scom/scom-token-list", "@scom/scom-governance-voting/store/index.ts"], function (require, exports, eth_wallet_2, oswap_openswap_contract_1, scom_token_list_2, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOptionVoted = exports.getVotingResult = exports.getVotingAddresses = void 0;
    function govTokenDecimals(state) {
        const chainId = state.getChainId();
        return state.getGovToken(chainId).decimals || 18;
    }
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
            executor_: executor,
            id_: id,
            name_: name,
            options_: options,
            voteStartTime_: voteStartTime,
            voteEndTime_: voteEndTime,
            executeDelay_: executeDelay,
            status_: status,
            optionsWeight_: optionsWeight,
            quorum_: quorum,
            executeParam_: executeParam
        };
        return struct;
    }
    function parseVotingExecuteParam(params) {
        let executeParam;
        let _executeParam = params.executeParam_;
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
    function getVotingTitle(result) {
        var _a, _b, _c, _d;
        let title;
        if (!result.addTitle)
            return title;
        const token0 = result.executeParam.token0;
        const token1 = result.executeParam.token1;
        let symbol0 = token0 ? (_b = (_a = scom_token_list_2.tokenStore.tokenMap[token0.toLowerCase()]) === null || _a === void 0 ? void 0 : _a.symbol) !== null && _b !== void 0 ? _b : '' : '';
        let symbol1 = token1 ? (_d = (_c = scom_token_list_2.tokenStore.tokenMap[token1.toLowerCase()]) === null || _c === void 0 ? void 0 : _c.symbol) !== null && _d !== void 0 ? _d : '' : '';
        switch (result.executeParam.cmd) {
            case "addOldOracleToNewPair":
                ;
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
            executor: params.executor_,
            address: params.address,
            id: params.id_,
            name: eth_wallet_2.Utils.bytes32ToString(params.name_),
            options: {},
            quorum: eth_wallet_2.Utils.fromDecimals(params.quorum_[0]).toFixed(),
            voteStartTime: new Date(params.voteStartTime_ * 1000),
            endTime: new Date(params.voteEndTime_ * 1000),
            executeDelay: params.executeDelay_,
            executed: params.status_[0],
            vetoed: params.status_[1],
            totalWeight: eth_wallet_2.Utils.fromDecimals(params.quorum_[2]).toFixed(),
            threshold: eth_wallet_2.Utils.fromDecimals(params.quorum_[1]).toFixed(),
            remain: 0,
            quorumRemain: '0'
        };
        let voteEndTime = Number(params.voteEndTime_);
        let now = Math.ceil(Date.now() / 1000);
        let diff = Number(voteEndTime) - now;
        result.remain = diff > 0 ? diff : 0;
        let quorumRemain = new eth_wallet_2.BigNumber(result.quorum);
        let govDecimals = govTokenDecimals(state);
        for (let i = 0; i < params.options_.length; i++) {
            let weight = eth_wallet_2.Utils.fromDecimals(params.optionsWeight_[i], govDecimals);
            result.options[eth_wallet_2.Utils.bytes32ToString(params.options_[i])] = weight;
            quorumRemain = quorumRemain.minus(weight);
        }
        result.quorumRemain = quorumRemain.lt(0) ? '0' : quorumRemain.toFixed();
        if (params.executeParam_ && Array.isArray(params.executeParam_) && params.executeParam_.length) {
            let executeDelay = Number(params.executeDelay_);
            diff = (voteEndTime + executeDelay) - now;
            if (result.vetoed_)
                result.veto = true;
            else if (params.executed_)
                result.executed = true;
            else
                result.executiveDelay = diff > 0 ? diff : 0;
            result.majorityPassed = new eth_wallet_2.BigNumber(params.optionsWeight_[0]).gt(params.optionsWeight_[1]);
            result.thresholdPassed = new eth_wallet_2.BigNumber(params.optionsWeight_[0]).div(new eth_wallet_2.BigNumber(params.optionsWeight_[0]).plus(params.optionsWeight_[1])).gt(result.threshold);
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
        let title = getVotingTitle(result);
        if (title)
            result.title = title;
        return result;
    }
    async function getVotingAddresses(state, chainId, tokenA, tokenB) {
        let addresses = [];
        try {
            const wallet = state.getRpcWallet();
            await wallet.init();
            if (wallet.chainId != chainId)
                await wallet.switchNetwork(chainId);
            let gov = state.getAddresses(chainId).OAXDEX_Governance;
            let govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
            let votings = await govContract.allVotings();
            const WETH9 = (0, index_1.getWETH)(chainId);
            let tokens = [tokenA, tokenB].map(e => (e === null || e === void 0 ? void 0 : e.address) ? e : WETH9);
            if (!new eth_wallet_2.BigNumber(tokens[0].address.toLowerCase()).lt(tokens[1].address.toLowerCase())) {
                tokens = [tokens[1], tokens[0]];
            }
            let votingContract = new oswap_openswap_contract_1.Contracts.OAXDEX_VotingContract(wallet);
            const getParamsTxData = wallet.encodeFunctionCall(votingContract, 'getParams', []);
            const getParamsResult = await wallet.multiCall(votings.map(v => {
                return {
                    to: v,
                    data: getParamsTxData
                };
            }));
            for (let i = 0; i < votings.length; i++) {
                let result = decodeVotingParamsRawData(getParamsResult.results[i]);
                let executeParam = parseVotingExecuteParam(result);
                if (!executeParam)
                    continue;
                if (executeParam.token0 === tokens[0].address && executeParam.token1 === tokens[1].address) {
                    addresses.push(votings[i]);
                }
            }
        }
        catch (err) { }
        return addresses;
    }
    exports.getVotingAddresses = getVotingAddresses;
    async function getVotingResult(state, votingAddress) {
        const wallet = state.getRpcWallet();
        const votingContract = new oswap_openswap_contract_1.Contracts.OAXDEX_VotingContract(wallet, votingAddress);
        const getParams = await votingContract.getParams();
        let result = parseVotingParams(state, getParams);
        result.address = votingAddress;
        return result;
    }
    exports.getVotingResult = getVotingResult;
    async function getOptionVoted(state, votingAddress, address) {
        let result;
        const wallet = state.getRpcWallet();
        if (!address)
            address = wallet.account.address;
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
                    option: getOptionVote.option,
                    weight: eth_wallet_3.Utils.fromDecimals(getOptionVote.weight).toFixed()
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
            var _a, _b;
            return ((_a = this.selectedItem) === null || _a === void 0 ? void 0 : _a.optionText) || ((_b = this.data) === null || _b === void 0 ? void 0 : _b.selectedVotes[0]) || this.optionValue;
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
define("@scom/scom-governance-voting", ["require", "exports", "@ijstech/components", "@scom/scom-governance-voting/store/index.ts", "@scom/scom-governance-voting/assets.ts", "@scom/scom-governance-voting/data.json.ts", "@scom/scom-governance-voting/index.css.ts", "@ijstech/eth-wallet"], function (require, exports, components_5, index_2, assets_1, data_json_1, index_css_2, eth_wallet_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_5.Styles.Theme.ThemeVars;
    let GovernanceVoting = class GovernanceVoting extends components_5.Module {
        constructor() {
            super(...arguments);
            this._data = {
                chainId: 0,
                tokenFrom: '',
                tokenTo: '',
                votingAddress: '',
                wallets: [],
                networks: []
            };
            this.tag = {};
            this.initWallet = async () => {
                try {
                    await eth_wallet_4.Wallet.getClientInstance().init();
                    const rpcWallet = this.state.getRpcWallet();
                    await rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.initializeWidgetConfig = async () => {
                setTimeout(async () => {
                    await this.initWallet();
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
                this.txStatusModal.message = Object.assign({}, params);
                this.txStatusModal.showModal();
            };
            this.connectWallet = async () => {
                if (!(0, index_2.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_5.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!this.state.isRpcWalletConnected()) {
                    const clientWallet = eth_wallet_4.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(this.chainId);
                }
            };
        }
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
            var _a;
            return (_a = this._data.wallets) !== null && _a !== void 0 ? _a : [];
        }
        set wallets(value) {
            this._data.wallets = value;
        }
        get networks() {
            var _a;
            return (_a = this._data.networks) !== null && _a !== void 0 ? _a : [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            var _a;
            return (_a = this._data.showHeader) !== null && _a !== void 0 ? _a : true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
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
            this.state = new index_2.State(data_json_1.default);
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
                const data = {
                    chainId,
                    tokenFrom,
                    tokenTo,
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
            const actions = [];
            return actions;
        }
        getProjectOwnerActions() {
            const actions = [];
            return actions;
        }
        getConfigurators() {
            return [];
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
            var _a;
            this.tag[type] = (_a = this.tag[type]) !== null && _a !== void 0 ? _a : {};
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
            var _a;
            this.removeRpcWalletEvents();
            const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
            const rpcWallet = this.state.getRpcWallet();
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.refreshUI();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.refreshUI();
            });
            const data = {
                defaultChainId: this.defaultChainId,
                wallets: this.wallets,
                networks: this.networks,
                showHeader: this.showHeader,
                rpcWalletId: rpcWallet.instanceId
            };
            if ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.setData)
                this.dappContainer.setData(data);
        }
        async refreshUI() {
            await this.initializeWidgetConfig();
        }
        selectVote(index) { }
        async handleExecute() { }
        async onSubmitVote() { }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer" },
                this.$render("i-panel", { class: index_css_2.default, background: { color: Theme.background.main } },
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay" },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_1.default.fullPath('img/loading.svg'), width: 36, height: 36 } }),
                                this.$render("i-label", { caption: "Loading...", font: { color: '#FD4A4C', size: '1.5em' }, class: "i-loading-spinner_text" }))),
                        this.$render("i-vstack", { width: "100%", height: "100%", maxWidth: 1200, padding: { top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }, margin: { left: 'auto', right: 'auto' }, gap: "0.75rem" },
                            this.$render("i-label", { id: "lblTitle", font: { size: 'clamp(1rem, 0.8rem + 1vw, 2rem)', weight: 600 } }),
                            this.$render("i-panel", { padding: { top: "1rem", bottom: "1rem" } },
                                this.$render("i-stack", { direction: "horizontal", alignItems: "center", justifyContent: "space-between", mediaQueries: [{
                                            maxWidth: '767px', properties: {
                                                direction: 'vertical', alignItems: 'start', justifyContent: 'start', gap: '1rem'
                                            }
                                        }] },
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                                            this.$render("i-label", { caption: "Staked Balance: ", font: { size: '1rem', color: Theme.text.third, bold: true } }),
                                            this.$render("i-label", { id: "lblStakedBalance", font: { size: '1rem', color: Theme.text.third } })),
                                        this.$render("i-label", { id: "lblFreezeStakeAmount", visible: false })),
                                    this.$render("i-vstack", null,
                                        this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
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
                                        this.$render("i-label", { id: "lblVoteStartTime" })),
                                    this.$render("i-vstack", { width: "100%", gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Vote Ends", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblVoteEndTime" })),
                                    this.$render("i-vstack", { width: "100%", gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Execute Delay", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblExecuteDeplay" })),
                                    this.$render("i-hstack", { width: "100%", horizontalAlignment: "end", verticalAlignment: "center" },
                                        this.$render("i-button", { class: "btn-os", height: "auto", caption: "Execute", enabled: false, padding: { top: '0.35rem', bottom: '0.35rem', left: '1.5rem', right: '1.5rem' }, onClick: this.handleExecute.bind(this) }))),
                                this.$render("i-grid-layout", { width: "100%", minHeight: 100, background: { color: 'rgba(255, 255, 255, 0.13)' }, padding: { top: 10, bottom: 10, left: 20, right: 20 }, border: { radius: 15, width: '1px', style: 'solid', color: '#fff' }, gap: { column: 10, row: '1rem' }, templateColumns: ['repeat(2, 1fr)'], templateRows: ['repeat(3, auto)'], verticalAlignment: "stretch", mediaQueries: [
                                        { maxWidth: '767px', properties: { templateColumns: ['repeat(1, 1fr)'], templateRows: ['auto'] } }
                                    ] },
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Description", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblProposalDesc" })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Action", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblExecuteAction" })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Value", margin: { top: '1rem' }, font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblExecuteValue" })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Quorum", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblVotingQuorum" })),
                                    this.$render("i-vstack", { gap: "0.5rem", visible: false },
                                        this.$render("i-label", { caption: "Token Address", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-label", { id: "lblTokenAddress", margin: { top: '0.5rem' } })),
                                    this.$render("i-vstack", { gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Your Vote", font: { size: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)', color: Theme.colors.primary.main, bold: true } }),
                                        this.$render("i-scom-governance-voting-vote-list", { id: "voteList", onSelect: this.selectVote.bind(this) })))),
                            this.$render("i-vstack", { width: "100%", padding: { left: "1rem", right: "1rem" } },
                                this.$render("i-button", { id: 'btnSubmitVote', class: 'btn-os', height: 'auto', caption: "Submit Vote", padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, border: { radius: 5 }, font: { weight: 600 }, rightIcon: { spin: true, visible: false }, enabled: false, onClick: this.onSubmitVote.bind(this) })))),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
    };
    GovernanceVoting = __decorate([
        (0, components_5.customElements)('i-scom-governance-voting')
    ], GovernanceVoting);
    exports.default = GovernanceVoting;
});
