import { Finding, FindingSeverity, FindingType, TransactionEvent } from "forta-agent";
import { CRITICAL_VOLUME_THRESHOLD, HIGH_VOLUME_THRESHOLD } from 'src/constants';

const getSeverity = (txCount: number): FindingSeverity.Medium | FindingSeverity.High | FindingSeverity.Critical => {
  if (txCount > CRITICAL_VOLUME_THRESHOLD) {
    return FindingSeverity.Critical;
  } else if (txCount > HIGH_VOLUME_THRESHOLD) {
    return FindingSeverity.High;
  }
  return FindingSeverity.Medium;
};

export { getSeverity }
