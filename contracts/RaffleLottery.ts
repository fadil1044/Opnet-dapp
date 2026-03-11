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
const RAFFLE_COUNT_POINTER: u16 = 2;
const TOTAL_PRIZES_POINTER: u16 = 3;

@final
export class RaffleLottery extends OP20 {
  private readonly _owner: StoredAddress = new StoredAddress(OWNER_POINTER, Blockchain.DEAD_ADDRESS);
  private readonly _raffleCount: StoredU256 = new StoredU256(RAFFLE_COUNT_POINTER, u256.Zero);
  private readonly _totalPrizesAwarded: StoredU256 = new StoredU256(TOTAL_PRIZES_POINTER, u256.Zero);

  constructor() {
    super(u256.fromU32(0), 8, 'BitcoinDeFi Raffle', 'BDRAFFLE');
  }

  public override onDeployment(_calldata: Calldata): void {
    this._owner.value = Blockchain.tx.origin;
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case encodeSelector('createRaffle(uint256,uint256,uint256)'):
        return this.createRaffle(calldata);
      case encodeSelector('buyTickets(uint256,uint256,address)'):
        return this.buyTickets(calldata);
      case encodeSelector('drawWinner(uint256)'):
        return this.drawWinner(calldata);
      case encodeSelector('claimPrize(uint256)'):
        return this.claimPrize(calldata);
      case encodeSelector('getRaffleCount()'):
        return this.getRaffleCount();
      case encodeSelector('getTotalPrizesAwarded()'):
        return this.getTotalPrizesAwarded();
      default:
        return super.execute(method, calldata);
    }
  }

  private createRaffle(calldata: Calldata): BytesWriter {
    const ticketPrice: u256 = calldata.readU256();
    const maxTickets: u256 = calldata.readU256();
    const prize: u256 = calldata.readU256();

    if (!Blockchain.tx.origin.equals(this._owner.value)) {
      throw new Revert('Only owner can create raffles');
    }
    if (u256.eq(ticketPrice, u256.Zero)) throw new Revert('Ticket price must be > 0');
    if (u256.eq(maxTickets, u256.Zero)) throw new Revert('Max tickets must be > 0');

    const raffleId: u256 = SafeMath.add(this._raffleCount.value, u256.One);
    this._raffleCount.value = raffleId;

    const response = new BytesWriter(32);
    response.writeU256(raffleId);
    return response;
  }

  private buyTickets(calldata: Calldata): BytesWriter {
    const raffleId: u256 = calldata.readU256();
    const count: u256 = calldata.readU256();
    const buyer: Address = calldata.readAddress();

    if (u256.gt(raffleId, this._raffleCount.value)) throw new Revert('Raffle does not exist');
    if (u256.eq(count, u256.Zero)) throw new Revert('Must buy at least 1 ticket');
    if (u256.eq(Blockchain.tx.satoshis, u256.Zero)) throw new Revert('Must send BTC');

    const response = new BytesWriter(32);
    response.writeU256(count);
    return response;
  }

  private drawWinner(calldata: Calldata): BytesWriter {
    const raffleId: u256 = calldata.readU256();

    if (!Blockchain.tx.origin.equals(this._owner.value)) throw new Revert('Only owner');
    if (u256.gt(raffleId, this._raffleCount.value)) throw new Revert('Raffle does not exist');

    const blockHash: u256 = Blockchain.blockHash;
    const blockNumber: u256 = u256.fromU64(Blockchain.block.numberU64);
    const seed: u256 = SafeMath.add(blockHash, blockNumber);

    this._totalPrizesAwarded.value = SafeMath.add(this._totalPrizesAwarded.value, u256.One);

    const response = new BytesWriter(32);
    response.writeU256(seed);
    return response;
  }

  private claimPrize(calldata: Calldata): BytesWriter {
    const raffleId: u256 = calldata.readU256();

    if (u256.gt(raffleId, this._raffleCount.value)) throw new Revert('Raffle does not exist');

    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private getRaffleCount(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._raffleCount.value);
    return response;
  }

  private getTotalPrizesAwarded(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._totalPrizesAwarded.value);
    return response;
  }
}
