
import { TIME_INTERVAL_MINS } from 'src/constants';

interface ITransactionMap {
  txHash: string;
  timestamp: number;
}

class TransactionCounter {
  timeIntervalMs: number;
  transactionMap: { [key: string]: ITransactionMap[] };

  constructor(timeIntervalMins: number) {
    this.timeIntervalMs = timeIntervalMins * 60 * 1000;
    this.transactionMap = {};
  }

  increment = (from: string, txHash: string, blockTimestamp: number) => {
    // if transactions array does not exist, initialize it
    if (!this.transactionMap[from]) {
      this.transactionMap[from] = [];
    }

    //convert seconds to ms
    const blockTimestampMs = blockTimestamp * 1000;

    // append transaction
    this.transactionMap[from].push({
      txHash,
      timestamp: blockTimestampMs,
    });

    // filter out any transactions that fall outside of the time interval
    this.transactionMap[from] = this.transactionMap[from].filter(
      (t) => t.timestamp > blockTimestampMs - this.timeIntervalMs
    );

    return this.transactionMap[from].length;
  }

  getTransactions = (from: string) => {
    return this.transactionMap[from]
      ? this.transactionMap[from].map((t) => t.txHash)
      : [];
  }

}

const transactionCounter = new TransactionCounter(TIME_INTERVAL_MINS);

export { transactionCounter, TransactionCounter };
