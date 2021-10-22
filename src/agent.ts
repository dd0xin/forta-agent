import { Finding, FindingType, TransactionEvent } from "forta-agent";

import { transactionCounter, TransactionCounter } from 'src/TransactionCounter';
import { MEDIUM_VOLUME_THRESHOLD } from "src/constants";
import { getSeverity } from 'src/utils';

const provideHandleTransaction = (transactionCounter: TransactionCounter ) => async (txEvent: TransactionEvent): Promise<Finding[]> => {
  // report finding if transaction sender has high volume of transactions over specified time period
  const findings: Finding[] = [];
  const { from, hash: txHash } = txEvent.transaction;
  const { timestamp: blockTimestamp } = txEvent;


  // increment count for the from address
  const allTransactionsCount = transactionCounter.increment(from, txHash, blockTimestamp);

  if (allTransactionsCount < MEDIUM_VOLUME_THRESHOLD) {
    return findings;
  }

  findings.push(
    Finding.fromObject({
      name: "High Transaction Volume",
      description: `High transaction volume (${allTransactionsCount}) from ${from}`,
      alertId: "FORTA-4",
      type: FindingType.Suspicious,
      severity: getSeverity(allTransactionsCount),
      metadata: {
        from,
        transactions: JSON.stringify(transactionCounter.getTransactions(from)),
      },
    })
  );

  return findings;
}

const agent = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(transactionCounter),
}

export { agent };
