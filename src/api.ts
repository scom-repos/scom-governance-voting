import { BigNumber, Utils } from "@ijstech/eth-wallet";
import { Contracts } from "@scom/oswap-openswap-contract";
import { ITokenObject } from "@scom/scom-token-list";
import { IExecuteParam } from "./interface";
import { getWETH, State } from "./store/index";

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

function parseVotingExecuteParam(result: any) {
    let executeParam: IExecuteParam;
    let _executeParam = result.executeParam_;
    if (_executeParam && Array.isArray(_executeParam) && _executeParam.length) {
        let cmd = Utils.bytes32ToString(_executeParam[0]);
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

export async function getVotingAddresses(state: State, chainId: number, tokenA: ITokenObject, tokenB: ITokenObject) {
    let addresses: string[] = [];
    try {
        const wallet = state.getRpcWallet();
        await wallet.init();
        if (wallet.chainId != chainId) await wallet.switchNetwork(chainId);
        let gov = state.getAddresses(chainId).OAXDEX_Governance;
        let govContract = new Contracts.OAXDEX_Governance(wallet, gov);
        let votings = await govContract.allVotings();
        const WETH9 = getWETH(chainId);
        let tokens = [tokenA, tokenB].map(e => e?.address ? e : WETH9);
        if (!new BigNumber(tokens[0].address.toLowerCase()).lt(tokens[1].address.toLowerCase())) {
            tokens = [tokens[1], tokens[0]];
        }

        let votingContract = new Contracts.OAXDEX_VotingContract(wallet);

        const getParamsTxData = wallet.encodeFunctionCall(votingContract, 'getParams', []);
        const getParamsResult = await wallet.multiCall(votings.map(v => {
            return {
                to: v,
                data: getParamsTxData
            }
        }));

        for (let i = 0; i < votings.length; i++) {
            let result = decodeVotingParamsRawData(getParamsResult.results[i]);
            let executeParam = parseVotingExecuteParam(result);
            if (!executeParam) continue;
            if (executeParam.token0 === tokens[0].address && executeParam.token1 === tokens[1].address) {
                addresses.push(votings[i]);
            }
        }
    } catch (err) { }
    return addresses;
}