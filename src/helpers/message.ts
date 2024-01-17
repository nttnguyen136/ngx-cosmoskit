import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';

export function GenerateDelegateMessage(
  senderAddress,
  { to, amount },
  coinMinimalDenom: string
) {
  /* istanbul ignore next */
  const msg = MsgDelegate.fromPartial({
    delegatorAddress: senderAddress,
    validatorAddress: to[0],
    amount: {
      amount: amount,
      denom: coinMinimalDenom,
    },
  });
  return {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    value: msg,
  };
}
