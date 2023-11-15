import Creator from '@arianee/creator'
import Core from "@arianee/core"

const core = Core.fromRandom()
const creator = new Creator({
    core: core,
    creatorAddress: core.getAddress(),
    transactionStrategy: "DO_NOT_WAIT_TRANSACTION_RECEIPT"
})
export const calculateImprint = (content):Promise<string> => {
    return creator.utils.calculateImprint(content)
}
