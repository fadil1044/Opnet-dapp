import {
  Address,
  Blockchain,
  BytesWriter,
  Calldata,
  encodeSelector,
  OP721,
  Revert,
  SafeMath,
  Selector,
  StoredU256,
  StoredAddress,
  u256,
} from '@btc-vision/btc-runtime/runtime';

const OWNER_POINTER: u16 = 1;
const TOTAL_SUPPLY_POINTER: u16 = 2;
const MINT_PRICE_POINTER: u16 = 3;
const MAX_SUPPLY_POINTER: u16 = 4;

@final
export class NFTMarketplace extends OP721 {
  private readonly _owner: StoredAddress = new StoredAddress(OWNER_POINTER, Blockchain.DEAD_ADDRESS);
  private readonly _totalMinted: StoredU256 = new StoredU256(TOTAL_SUPPLY_POINTER, u256.Zero);
  private readonly _mintPrice: StoredU256 = new StoredU256(MINT_PRICE_POINTER, u256.Zero);
  private readonly _maxSupply: StoredU256 = new StoredU256(MAX_SUPPLY_POINTER, u256.Zero);

  constructor() {
    super('BitcoinDeFi NFT', 'BDFNFT');
  }

  public override onDeployment(_calldata: Calldata): void {
    this._owner.value = Blockchain.tx.origin;
    this._mintPrice.value = u256.fromU64(1_000_000);
    this._maxSupply.value = u256.fromU32(10_000);
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case encodeSelector('mint(address,string,string)'):
        return this.mint(calldata);
      case encodeSelector('purchase(uint256,address)'):
        return this.purchase(calldata);
      case encodeSelector('listForSale(uint256,uint256)'):
        return this.listForSale(calldata);
      case encodeSelector('cancelListing(uint256)'):
        return this.cancelListing(calldata);
      case encodeSelector('getMintPrice()'):
        return this.getMintPrice();
      case encodeSelector('getTotalMinted()'):
        return this.getTotalMinted();
      case encodeSelector('getMaxSupply()'):
        return this.getMaxSupply();
      case encodeSelector('setMintPrice(uint256)'):
        return this.setMintPrice(calldata);
      default:
        return super.execute(method, calldata);
    }
  }

  private mint(calldata: Calldata): BytesWriter {
    const to: Address = calldata.readAddress();
    const name: string = calldata.readStringWithLength();
    const metadataURI: string = calldata.readStringWithLength();

    const currentSupply: u256 = this._totalMinted.value;
    if (u256.gte(currentSupply, this._maxSupply.value)) {
      throw new Revert('Max supply reached');
    }

    const mintPrice: u256 = this._mintPrice.value;
    if (u256.gt(mintPrice, u256.Zero)) {
      if (u256.lt(Blockchain.tx.satoshis, mintPrice)) {
        throw new Revert('Insufficient BTC payment');
      }
    }

    const tokenId: u256 = SafeMath.add(currentSupply, u256.One);
    this._totalMinted.value = tokenId;
    this._mint(to, tokenId);

    const response = new BytesWriter(32);
    response.writeU256(tokenId);
    return response;
  }

  private purchase(calldata: Calldata): BytesWriter {
    const tokenId: u256 = calldata.readU256();
    const buyer: Address = calldata.readAddress();

    const owner: Address = this.ownerOf(tokenId);
    if (owner.equals(Blockchain.DEAD_ADDRESS)) {
      throw new Revert('Token does not exist');
    }

    this._transfer(owner, buyer, tokenId);

    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private listForSale(calldata: Calldata): BytesWriter {
    const tokenId: u256 = calldata.readU256();
    const price: u256 = calldata.readU256();

    if (!this.ownerOf(tokenId).equals(Blockchain.tx.origin)) {
      throw new Revert('Not token owner');
    }
    if (u256.eq(price, u256.Zero)) {
      throw new Revert('Price must be > 0');
    }

    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private cancelListing(calldata: Calldata): BytesWriter {
    const tokenId: u256 = calldata.readU256();

    if (!this.ownerOf(tokenId).equals(Blockchain.tx.origin)) {
      throw new Revert('Not token owner');
    }

    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private getMintPrice(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._mintPrice.value);
    return response;
  }

  private getTotalMinted(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._totalMinted.value);
    return response;
  }

  private getMaxSupply(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._maxSupply.value);
    return response;
  }

  private setMintPrice(calldata: Calldata): BytesWriter {
    if (!Blockchain.tx.origin.equals(this._owner.value)) {
      throw new Revert('Only owner');
    }
    this._mintPrice.value = calldata.readU256();
    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }
}
