export interface CoreAddress {
    OAXDEX_Governance: string;
    OAXDEX_VotingRegistry: string;
    GOV_TOKEN: string;
}
export const coreAddress: { [chainId: number]: CoreAddress } = {
    56: { // BSC
        OAXDEX_Governance: "0x510a179AA399672e26e54Ed8Ce0e822cc9D0a98D",
        OAXDEX_VotingRegistry: "0x845308010C3B699150Cdd54dCf0E7C4b8653e6B2",
        GOV_TOKEN: "0xb32aC3C79A94aC1eb258f3C830bBDbc676483c93",
    },
    97: { // BSC Testnet
        OAXDEX_Governance: "0xDfC070E2dbDAdcf892aE2ed2E2C426aDa835c528",
        OAXDEX_VotingRegistry: "0x28a5bB54A53831Db40e00a6d416FfB2dBe0Fef68",
        GOV_TOKEN: "0x45eee762aaeA4e5ce317471BDa8782724972Ee19",
    },
    137: { // Polygon
        OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        OAXDEX_VotingRegistry: "0x64062158A5Cc2aA3740B1035785F29153eA64677",
        GOV_TOKEN: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
    },
    80001: {// Polygon testnet
        OAXDEX_Governance: "0x198b150E554F46aee505a7fb574F5D7895889772",
        OAXDEX_VotingRegistry: "0xC2F105d6413aCE38B9FcB6F43Edc76191a295aC5",
        GOV_TOKEN: "0xb0AF504638BDe5e53D6EaE1119dEd13411c35cF2",
    },
    43113: { //Avalanche FUJI C-Chain
        OAXDEX_Governance: "0xC025b30e6D4cBe4B6978a1A71a86e6eCB9F87F92",
        OAXDEX_VotingRegistry: "0x05E425dD88dd7D4f725aC429D0C8C022B2004cBB",
        GOV_TOKEN: "0x27eF998b96c9A66937DBAc38c405Adcd7fa5e7DB",
    },
    43114: { //Avalanche Mainnet C-Chain
        OAXDEX_Governance: "0x845308010c3b699150cdd54dcf0e7c4b8653e6b2",
        OAXDEX_VotingRegistry: "0x0625468f8F56995Ff1C27EB6FD44ac90E96C5D22",
        GOV_TOKEN: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
    },
    42161: { // Arbitrum One
        OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        OAXDEX_VotingRegistry: "0x64062158A5Cc2aA3740B1035785F29153eA64677",
        GOV_TOKEN: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
    },
    421613: { // Arbitrum Goerli Testnet
        OAXDEX_Governance: "0x6f460B0Bf633E22503Efa460429B0Ab32d655B9D",
        OAXDEX_VotingRegistry: "0x3Eb8e7B7EbdcA63031504fe4C94b8e393D530Ec9",
        GOV_TOKEN: "0x5580B68478e714C02850251353Cc58B85D4033C3",
    }
}