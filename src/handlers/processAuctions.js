import { closeAuction } from "../lib/closeAuction";
import { getEndedAuctions } from "../lib/getEndedAuctions";
import createError from "http-errors";

async function processAuctions(event, context) {

    try {

        const auctionsToClose = await getEndedAuctions(id);
        const closePromises = auctionsToClose.map(auction => closeAuction(auction.id));
        // remember async doesn't work in map function.
        // here instead we have used genrate array of promises. 
        await Promise.all(closePromises);

        // we are not returning any status here because
        // this fucntion will not triggered by API Getway
        return { closed: closePromises.length };

    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

}
export const handler = processAuctions;

// async function processAuctions(event, context) {
//     // auction should be closed after one hour
//     console.log('processing auctions!');
//     // to see the log
//     // type this command in cmd:
//
//     // sls logs -f processAuctions -t
//     // sls logs -f processAuctions -t
//     // sls logs -f processAuctions --startTime 1m
//     // sls logs -f processAuctions --startTime 1h
//
//     // or if manually run then
//
//     // sls invoke -f processAuctions -l
//
//     return {
//
//     }
// }

