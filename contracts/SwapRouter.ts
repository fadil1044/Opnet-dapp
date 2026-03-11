import {
  Address,
  Blockchain,
  BytesWriter,
  Calldata,
  encodeSelector,
  OP20,
  Revert,
  SafeMath,
  Selector,
  StoredU256,
  StoredAddress,
  u256,
} from '@btc-vision/btc-runtime/runtime';

const OWNER_POINTER: u16 = 1;
const FEE_POINTER: u16 = 2;
const TOTAL_SWAPS_POINTER: u16 = 3;

@final
export class SwapRouter extends OP20 {
  private readonly _owner: StoredAddress = new StoredAddress(OWNER_POINTER, Blockchain.DEAD_ADDRESS);
  private readonly _feeBps: StoredU256 = new StoredU256(FEE_POINTER, u256.Zero);
  private readonly _totalSwaps: StoredU256 = new StoredU256(TOTAL_SWAPS_POINTER, u256.Zero);

  constructor() {
    super(u256.fromU32(1_000_000_000_000), 8, 'BitcoinDeFi', 'BDEFI');
  }

  public override onDeployment(_calldata: Calldata): void {
    this._owner.value = Blockchain.tx.origin;
    this._feeBps.value = u256.fromU32(30);
    this.mintInitialSupply(Blockchain.tx.origin);
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case encodeSelector('swap(address,address,uint256,uint256,address)'):
        return this.swap(calldata);
      case encodeSelector('getAmountOut(uint256,uint256,uint256)'):
        return this.getAmountOut(calldata);
      case encodeSelector('getFee()'):
        return this.getFee();
      case encodeSelector('getTotalSwaps()'):
        return this.getTotalSwaps();
      case encodeSelector('setFee(uint256)'):
        return this.setFee(calldata);
      default:
        return super.execute(method, calldata);
    }
  }

  private swap(calldata: Calldata): BytesWriter {
    const tokenIn: Address = calldata.readAddress();
    const tokenOut: Address = calldata.readAddress();
    const amountIn: u256 = calldata.readU256();
    const amountOutMin: u256 = calldata.readU256();
    const to: Address = calldata.readAddress();

    if (u256.eq(amountIn, u256.Zero)) {
      throw new Revert('Amount must be > 0');
    }

    const fee: u256 = this._feeBps.value;
    const amountInWithFee: u256 = SafeMath.mul(amountIn, SafeMath.sub(u256.fromU32(10000), fee));
    const amountOut: u256 = SafeMath.div(amountInWithFee, u256.fromU32(10000));

    if (u256.lt(amountOut, amountOutMin)) {
      throw new Revert('Insufficient output amount');
    }

    this._totalSwaps.value = SafeMath.add(this._totalSwaps.value, u256.One);

    const response = new BytesWriter(32);
    response.writeU256(amountOut);
    return response;
  }

  private getAmountOut(calldata: Calldata): BytesWriter {
    const amountIn: u256 = calldata.readU256();
    const reserveIn: u256 = calldata.readU256();
    const reserveOut: u256 = calldata.readU256();

    if (u256.eq(amountIn, u256.Zero)) throw new Revert('Insufficient input amount');
    if (u256.eq(reserveIn, u256.Zero) || u256.eq(reserveOut, u256.Zero)) throw new Revert('Insufficient liquidity');

    const fee: u256 = this._feeBps.value;
    const amountInWithFee: u256 = SafeMath.mul(amountIn, SafeMath.sub(u256.fromU32(10000), fee));
    const numerator: u256 = SafeMath.mul(amountInWithFee, reserveOut);
    const denominator: u256 = SafeMath.add(SafeMath.mul(reserveIn, u256.fromU32(10000)), amountInWithFee);
    const amountOut: u256 = SafeMath.div(numerator, denominator);

    const response = new BytesWriter(32);
    response.writeU256(amountOut);
    return response;
  }

  private getFee(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._feeBps.value);
    return response;
  }

  private getTotalSwaps(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._totalSwaps.value);
    return response;
  }

  private setFee(calldata: Calldata): BytesWriter {
    if (!Blockchain.tx.origin.equals(this._owner.value)) {
      throw new Revert('Only owner');
    }
    const newFee: u256 = calldata.readU256();
    if (u256.gt(newFee, u256.fromU32(1000))) throw new Revert('Fee too high');
    this._feeBps.value = newFee;
    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private mintInitialSupply(to: Address): void {
    this._mint(to, u256.fromU64(1_000_000_000_000_000_000));
  }
}
