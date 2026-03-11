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
const TOTAL_SUPPLIED_POINTER: u16 = 2;
const TOTAL_BORROWED_POINTER: u16 = 3;
const SUPPLY_APY_POINTER: u16 = 4;
const BORROW_APY_POINTER: u16 = 5;
const LTV_POINTER: u16 = 6;

@final
export class LendingProtocol extends OP20 {
  private readonly _owner: StoredAddress = new StoredAddress(OWNER_POINTER, Blockchain.DEAD_ADDRESS);
  private readonly _totalSupplied: StoredU256 = new StoredU256(TOTAL_SUPPLIED_POINTER, u256.Zero);
  private readonly _totalBorrowed: StoredU256 = new StoredU256(TOTAL_BORROWED_POINTER, u256.Zero);
  private readonly _supplyApyBps: StoredU256 = new StoredU256(SUPPLY_APY_POINTER, u256.Zero);
  private readonly _borrowApyBps: StoredU256 = new StoredU256(BORROW_APY_POINTER, u256.Zero);
  private readonly _ltvBps: StoredU256 = new StoredU256(LTV_POINTER, u256.Zero);

  constructor() {
    super(u256.fromU32(0), 8, 'BitcoinDeFi Lending', 'BDLEND');
  }

  public override onDeployment(_calldata: Calldata): void {
    this._owner.value = Blockchain.tx.origin;
    this._supplyApyBps.value = u256.fromU32(240);
    this._borrowApyBps.value = u256.fromU32(410);
    this._ltvBps.value = u256.fromU32(7500);
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case encodeSelector('supply(string,uint256,address)'):
        return this.supply(calldata);
      case encodeSelector('withdraw(string,uint256,address)'):
        return this.withdraw(calldata);
      case encodeSelector('borrow(string,uint256,address)'):
        return this.borrow(calldata);
      case encodeSelector('repay(string,uint256,address)'):
        return this.repay(calldata);
      case encodeSelector('getTotalSupplied()'):
        return this.getTotalSupplied();
      case encodeSelector('getTotalBorrowed()'):
        return this.getTotalBorrowed();
      case encodeSelector('getUtilizationRate()'):
        return this.getUtilizationRate();
      case encodeSelector('getSupplyAPY()'):
        return this.getSupplyAPY();
      case encodeSelector('getBorrowAPY()'):
        return this.getBorrowAPY();
      case encodeSelector('getLTV()'):
        return this.getLTV();
      default:
        return super.execute(method, calldata);
    }
  }

  private supply(calldata: Calldata): BytesWriter {
    const asset: string = calldata.readStringWithLength();
    const amount: u256 = calldata.readU256();
    const supplier: Address = calldata.readAddress();

    if (u256.eq(amount, u256.Zero)) {
      throw new Revert('Amount must be > 0');
    }
    if (asset == 'BTC') {
      if (u256.lt(Blockchain.tx.satoshis, amount)) {
        throw new Revert('Insufficient BTC sent');
      }
    }

    this._totalSupplied.value = SafeMath.add(this._totalSupplied.value, amount);
    this._mint(supplier, amount);

    const response = new BytesWriter(32);
    response.writeU256(amount);
    return response;
  }

  private withdraw(calldata: Calldata): BytesWriter {
    const asset: string = calldata.readStringWithLength();
    const amount: u256 = calldata.readU256();
    const withdrawer: Address = calldata.readAddress();

    if (u256.eq(amount, u256.Zero)) throw new Revert('Amount must be > 0');

    const balance: u256 = this.balanceOf(withdrawer);
    if (u256.lt(balance, amount)) throw new Revert('Insufficient balance');

    const available: u256 = SafeMath.sub(this._totalSupplied.value, this._totalBorrowed.value);
    if (u256.lt(available, amount)) throw new Revert('Insufficient liquidity');

    this._burn(withdrawer, amount);
    this._totalSupplied.value = SafeMath.sub(this._totalSupplied.value, amount);

    const response = new BytesWriter(32);
    response.writeU256(amount);
    return response;
  }

  private borrow(calldata: Calldata): BytesWriter {
    const asset: string = calldata.readStringWithLength();
    const amount: u256 = calldata.readU256();
    const borrower: Address = calldata.readAddress();

    if (u256.eq(amount, u256.Zero)) throw new Revert('Amount must be > 0');

    const available: u256 = SafeMath.sub(this._totalSupplied.value, this._totalBorrowed.value);
    if (u256.lt(available, amount)) throw new Revert('Insufficient liquidity');

    this._totalBorrowed.value = SafeMath.add(this._totalBorrowed.value, amount);

    const response = new BytesWriter(32);
    response.writeU256(amount);
    return response;
  }

  private repay(calldata: Calldata): BytesWriter {
    const asset: string = calldata.readStringWithLength();
    const amount: u256 = calldata.readU256();
    const repayer: Address = calldata.readAddress();

    if (u256.eq(amount, u256.Zero)) throw new Revert('Amount must be > 0');
    if (u256.lt(this._totalBorrowed.value, amount)) throw new Revert('Amount exceeds borrowed');

    this._totalBorrowed.value = SafeMath.sub(this._totalBorrowed.value, amount);

    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private getTotalSupplied(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._totalSupplied.value);
    return response;
  }

  private getTotalBorrowed(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._totalBorrowed.value);
    return response;
  }

  private getUtilizationRate(): BytesWriter {
    const response = new BytesWriter(32);
    const supplied = this._totalSupplied.value;
    const borrowed = this._totalBorrowed.value;
    if (u256.eq(supplied, u256.Zero)) {
      response.writeU256(u256.Zero);
    } else {
      const rate: u256 = SafeMath.div(SafeMath.mul(borrowed, u256.fromU32(10000)), supplied);
      response.writeU256(rate);
    }
    return response;
  }

  private getSupplyAPY(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._supplyApyBps.value);
    return response;
  }

  private getBorrowAPY(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._borrowApyBps.value);
    return response;
  }

  private getLTV(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._ltvBps.value);
    return response;
  }
}
