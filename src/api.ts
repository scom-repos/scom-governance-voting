import { BigNumber, Utils, Wallet } from "@ijstech/eth-wallet";
import { Contracts } from "@scom/oswap-openswap-contract";
import { ITokenObject, tokenStore } from "@scom/scom-token-list";
import { IExecuteParam, IVotingParams, IVotingResult } from "./interface";
import { getWETH, State } from "./store/index";

function govTokenDecimals(state: State) {
    const chainId = state.getChainId();
    return state.getGovToken(chainId).decimals || 18
}

export async function stakeOf(state: State, address: string) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    let result = await govContract.stakeOf(address);
    result = Utils.fromDecimals(result, govTokenDecimals(state));
    return result;
}

export async function freezedStake(state: State, address: string) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    let result = await govContract.freezedStake(address);
    let minStakePeriod = await govContract.minStakePeriod();
    let newResult = { amount: Utils.fromDecimals(result.amount, govTokenDecimals(state)), timestamp: Number(result.timestamp) * 1000, lockTill: (Number(result.timestamp) + Number(minStakePeriod)) * 1000 };
    return newResult;
}

function decodeVotingParamsRawData(rawData: string) {
    const data = rawData.slice(2);
    let index = 0;

    const executor = '0x' + data.slice(index, index + 64).replace('000000000000000000000000', '');
    index += 64;

    const id = new BigNumber('0x' + data.slice(index, index + 64));
    index += 64;

    const name = '0x' + data.slice(index, index + 64);
    index += 64;

    let optionsIndex = new BigNumber('0x' + data.slice(index, index + 64)).times(2).toNumber();
    const optionsCount = new BigNumber('0x' + data.slice(optionsIndex, optionsIndex + 64)).toNumber();
    optionsIndex += 64;
    const options = [];
    for (let i = 0; i < optionsCount; i++) {
        options.push('0x' + data.slice(optionsIndex, optionsIndex + 64));
        optionsIndex += 64;
    }
    index += 64;

    const voteStartTime = new BigNumber('0x' + data.slice(index, index + 64));
    index += 64;

    const voteEndTime = new BigNumber('0x' + data.slice(index, index + 64));
    index += 64;

    const executeDelay = new BigNumber('0x' + data.slice(index, index + 64));
    index += 64;

    const status = [
        new BigNumber('0x' + data.slice(index, index + 64)).toNumber() === 1, //executed
        new BigNumber('0x' + data.slice(index + 64, index + 128)).toNumber() === 1 //vetoed
    ];
    index += 128;

    let optionsWeightIndex = new BigNumber('0x' + data.slice(index, index + 64)).times(2).toNumber();
    const optionsWeightCount = new BigNumber('0x' + data.slice(optionsWeightIndex, optionsWeightIndex + 64)).toNumber();
    optionsWeightIndex += 64;
    const optionsWeight = [];
    for (let i = 0; i < optionsWeightCount; i++) {
        optionsWeight.push(new BigNumber('0x' + data.slice(optionsWeightIndex, optionsWeightIndex + 64)));
        optionsWeightIndex += 64;
    }
    index += 64;

    const quorum = [
        new BigNumber('0x' + data.slice(index, index + 64)), //quorum
        new BigNumber('0x' + data.slice(index + 64, index + 128)), //threshold
        new BigNumber('0x' + data.slice(index + 128, index + 192)) //totalWeight
    ];
    index += 192;

    let executeParamIndex = new BigNumber('0x' + data.slice(index, index + 64)).times(2).toNumber();
    const executeParamCount = new BigNumber('0x' + data.slice(executeParamIndex, executeParamIndex + 64)).toNumber();
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

function parseVotingExecuteParam(params: IVotingParams) {
    let executeParam: IExecuteParam;
    let _executeParam = params.executeParam;
    if (_executeParam && Array.isArray(_executeParam) && _executeParam.length) {
        let cmd = Utils.bytes32ToString(_executeParam[0]).replace(/\x00/gi, "");
        switch (cmd) {
            case "addOldOracleToNewPair":
                executeParam = {
                    "cmd": cmd,
                    "token0": _executeParam[1].substring(0, 42),
                    "token1": _executeParam[2].substring(0, 42),
                    "oracle": _executeParam[3].substring(0, 42)
                }
                break;
            case "setOracle":
                executeParam = {
                    "cmd": cmd,
                    "token0": _executeParam[1].substring(0, 42),
                    "token1": _executeParam[2].substring(0, 42),
                    "oracle": _executeParam[3].substring(0, 42)
                }
                break;
        }
    }
    return executeParam;
}

function getVotingTitle(state: State, result: any) {
    let title: string;
    if (!result.executeParam) return title;
    const token0 = result.executeParam.token0;
    const token1 = result.executeParam.token1;
    const chainId = state.getChainId();
    let tokenMap = tokenStore.getTokenMapByChainId(chainId);
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

function parseVotingParams(state: State, params: IVotingParams) {
    let result: IVotingResult = {
        executor: params.executor,
        address: '',
        id: params.id,
        name: Utils.bytes32ToString(params.name).replace(/\x00/gi, ""),
        options: {},
        quorum: Utils.fromDecimals(params.quorum[0]).toFixed(),
        voteStartTime: new Date(params.voteStartTime.times(1000).toNumber()),
        endTime: new Date(params.voteEndTime.times(1000).toNumber()),
        executeDelay: params.executeDelay,
        executed: params.status[0],
        vetoed: params.status[1],
        totalWeight: Utils.fromDecimals(params.quorum[2]).toFixed(),
        threshold: Utils.fromDecimals(params.quorum[1]).toFixed(),
        remain: 0,
        quorumRemain: '0'
    };
    let voteEndTime = params.voteEndTime.toNumber();
    let now = Math.ceil(Date.now() / 1000);
    let diff = Number(voteEndTime) - now;
    result.remain = diff > 0 ? diff : 0;
    let quorumRemain = new BigNumber(result.quorum);
    let govDecimals = govTokenDecimals(state);
    for (let i = 0; i < params.options.length; i++) {
        let weight = Utils.fromDecimals(params.optionsWeight[i], govDecimals);
        let key = Utils.bytes32ToString(params.options[i]).replace(/\x00/gi, "");
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
            result.executiveDelay = diff > 0 ? diff : 0

        result.majorityPassed = new BigNumber(params.optionsWeight[0]).gt(params.optionsWeight[1]);
        result.thresholdPassed = new BigNumber(params.optionsWeight[0]).div(new BigNumber(params.optionsWeight[0]).plus(params.optionsWeight[1])).gt(result.threshold);

        if (result.vetoed) {
            result.status = "vetoed";
        } else if (result.remain > 0) {
            result.status = "in_progress";
        } else if (!result.majorityPassed || !result.thresholdPassed || Number(result.quorumRemain) > 0) {
            result.status = "not_passed";
        } else if (result.executiveDelay > 0) {
            result.status = "waiting_execution_delay";
        } else if (result.executed) {
            result.status = "executed";
        } else {
            result.status = "waiting_execution";
        }
        result.executeParam = parseVotingExecuteParam(params);
    }
    let title = getVotingTitle(state, result);
    if (title) result.title = title;

    return result;
}

export async function getLatestVotingAddress(state: State, chainId: number) {
    let address: string = '';
    try {
        const wallet = state.getRpcWallet();
        await wallet.init();
        if (wallet.chainId != chainId) await wallet.switchNetwork(chainId);
        let gov = state.getAddresses(chainId).OAXDEX_Governance;
        let govContract = new Contracts.OAXDEX_Governance(wallet, gov);
        let votings = await govContract.allVotings();

        let votingContract = new Contracts.OAXDEX_VotingContract(wallet);

        const getParamsTxData = wallet.encodeFunctionCall(votingContract, 'getParams', []);
        const getParamsResult = await wallet.multiCall(votings.map(v => {
            return {
                to: v,
                data: getParamsTxData
            }
        }));

        for (let i = votings.length - 1; i >= 0; i--) {
            let result = decodeVotingParamsRawData(getParamsResult.results[i]);
            let executeParam = parseVotingExecuteParam(result);
            if (!executeParam) continue;
            address = votings[i];
            break;
        }
    } catch (err) { }
    return address;
}

export async function getVotingResult(state: State, votingAddress: string) {
    if (!votingAddress) return;
    const wallet = state.getRpcWallet();
    const votingContract = new Contracts.OAXDEX_VotingContract(wallet, votingAddress);
    const getParams = await votingContract.getParams();
    let result = parseVotingParams(state, getParams);
    result.address = votingAddress;
    return result;
}

export async function getOptionVoted(state: State, votingAddress: string, address: string) {
    let result;
    const wallet = state.getRpcWallet();
    if (!address) address = wallet.account.address;
    if (!votingAddress) return result;
    const votingContract = new Contracts.OAXDEX_VotingContract(wallet, votingAddress);
    try {
        let option = await votingContract.accountVoteOption(address);
        let weight = await votingContract.accountVoteWeight(address);
        result = { option: option, weight: weight };
    } catch (err) {}
    return result;
}

export async function execute(votingAddress: string) {
    const wallet = Wallet.getClientInstance();
    const votingContract = new Contracts.OAXDEX_VotingContract(wallet, votingAddress);
    let receipt = await votingContract.execute();
    return receipt;
}

export async function vote(votingAddress: string, value: string) {
    const param = value == 'Y' ? 0 : 1;
    const wallet = Wallet.getClientInstance();
    const votingContract = new Contracts.OAXDEX_VotingContract(wallet, votingAddress);
    let receipt = await votingContract.vote(param);
    return receipt;
}