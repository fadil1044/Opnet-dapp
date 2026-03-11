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
const PROPOSAL_COUNT_POINTER: u16 = 2;
const VOTING_PERIOD_POINTER: u16 = 3;
const QUORUM_POINTER: u16 = 4;

@final
export class DAOGovernance extends OP20 {
  private readonly _owner: StoredAddress = new StoredAddress(OWNER_POINTER, Blockchain.DEAD_ADDRESS);
  private readonly _proposalCount: StoredU256 = new StoredU256(PROPOSAL_COUNT_POINTER, u256.Zero);
  private readonly _votingPeriod: StoredU256 = new StoredU256(VOTING_PERIOD_POINTER, u256.Zero);
  private readonly _quorumBps: StoredU256 = new StoredU256(QUORUM_POINTER, u256.Zero);

  constructor() {
    super(u256.fromU32(100_000_000), 8, 'BitcoinDeFi Governance', 'BDGOV');
  }

  public override onDeployment(_calldata: Calldata): void {
    this._owner.value = Blockchain.tx.origin;
    this._votingPeriod.value = u256.fromU32(144);
    this._quorumBps.value = u256.fromU32(500);
    this._mint(Blockchain.tx.origin, u256.fromU64(100_000_000_000_000_000));
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case encodeSelector('propose(string,string,address)'):
        return this.propose(calldata);
      case encodeSelector('castVote(uint256,bool,address)'):
        return this.castVote(calldata);
      case encodeSelector('executeProposal(uint256)'):
        return this.executeProposal(calldata);
      case encodeSelector('getProposalCount()'):
        return this.getProposalCount();
      case encodeSelector('getVotingPeriod()'):
        return this.getVotingPeriod();
      case encodeSelector('getQuorum()'):
        return this.getQuorum();
      case encodeSelector('setVotingPeriod(uint256)'):
        return this.setVotingPeriod(calldata);
      default:
        return super.execute(method, calldata);
    }
  }

  private propose(calldata: Calldata): BytesWriter {
    const title: string = calldata.readStringWithLength();
    const description: string = calldata.readStringWithLength();
    const proposer: Address = calldata.readAddress();

    const proposerBalance: u256 = this.balanceOf(proposer);
    const minTokens: u256 = u256.fromU64(1_000_000);
    if (u256.lt(proposerBalance, minTokens)) {
      throw new Revert('Insufficient governance tokens');
    }

    const proposalId: u256 = SafeMath.add(this._proposalCount.value, u256.One);
    this._proposalCount.value = proposalId;

    const response = new BytesWriter(32);
    response.writeU256(proposalId);
    return response;
  }

  private castVote(calldata: Calldata): BytesWriter {
    const proposalId: u256 = calldata.readU256();
    const support: bool = calldata.readBoolean();
    const voter: Address = calldata.readAddress();

    if (u256.gt(proposalId, this._proposalCount.value)) {
      throw new Revert('Proposal does not exist');
    }

    const voterBalance: u256 = this.balanceOf(voter);
    if (u256.eq(voterBalance, u256.Zero)) {
      throw new Revert('No governance tokens');
    }

    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private executeProposal(calldata: Calldata): BytesWriter {
    const proposalId: u256 = calldata.readU256();

    if (u256.gt(proposalId, this._proposalCount.value)) {
      throw new Revert('Proposal does not exist');
    }
    if (!Blockchain.tx.origin.equals(this._owner.value)) {
      throw new Revert('Only owner can execute');
    }

    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }

  private getProposalCount(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._proposalCount.value);
    return response;
  }

  private getVotingPeriod(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._votingPeriod.value);
    return response;
  }

  private getQuorum(): BytesWriter {
    const response = new BytesWriter(32);
    response.writeU256(this._quorumBps.value);
    return response;
  }

  private setVotingPeriod(calldata: Calldata): BytesWriter {
    if (!Blockchain.tx.origin.equals(this._owner.value)) {
      throw new Revert('Only owner');
    }
    this._votingPeriod.value = calldata.readU256();
    const response = new BytesWriter(1);
    response.writeBoolean(true);
    return response;
  }
}
