
import { FindingType, FindingSeverity, Finding, TransactionEvent, createTransactionEvent } from 'forta-agent';
import { transactionCounter } from 'src/TransactionCounter';
import { agent } from 'src/agent';

const mockTransaction = {
  transaction: {
    from: "0x1",
    hash: "0xa",
  } as any,
  block: {
    timestamp: 100,
  } as any,
  receipt: {} as any,
}

describe("high volume agent", () => {

  let handleTransaction: (txEvent: TransactionEvent) => Promise<Finding[]>;

  beforeAll(() => {
    handleTransaction = agent.provideHandleTransaction(transactionCounter);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('handleTransaction', () => {
    const transactionEvent = createTransactionEvent(mockTransaction);

    it('returns empty findings if volume is below threshold', async () => {
      jest.spyOn(transactionCounter, 'increment').mockReturnValueOnce(1);

      const findings = await handleTransaction(transactionEvent);

      expect(transactionCounter.increment).toHaveBeenCalledTimes(1);
      expect(transactionCounter.increment).toHaveBeenCalledWith(
        transactionEvent.from,
        transactionEvent.hash,
        transactionEvent.timestamp
      );
      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if volume is above threshold', async () => {
      const transactions = [
        transactionEvent.hash,
      ];

      jest.spyOn(transactionCounter, 'increment').mockReturnValueOnce(11);
      jest.spyOn(transactionCounter, 'getTransactions').mockReturnValueOnce(transactions);

      const findings = await handleTransaction(transactionEvent);

      expect(transactionCounter.increment).toHaveBeenCalledTimes(1);
      expect(transactionCounter.increment).toHaveBeenCalledWith(
        transactionEvent.from,
        transactionEvent.hash,
        transactionEvent.timestamp
      );
      expect(transactionCounter.getTransactions).toHaveBeenCalledTimes(1);
      expect(transactionCounter.getTransactions).toHaveBeenCalledWith(transactionEvent.from);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Transaction Volume",
          description: `High transaction volume (11) from ${transactionEvent.from}`,
          alertId: "FORTA-4",
          type: FindingType.Suspicious,
          severity: FindingSeverity.Medium,
          metadata: {
            from: transactionEvent.from,
            transactions: JSON.stringify(transactions),
          },
        }),
      ]);
    });
  });
});