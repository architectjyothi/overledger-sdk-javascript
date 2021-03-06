import Accounts from 'web3-eth-accounts';
import Web3 from 'web3';
import AbstractDLT, { Options, Account, TransactionOptions as BaseTransactionOptions } from './AbstractDlt';
import OverledgerSDK from '../';
import { AxiosResponse } from 'axios';

class Ethereum extends AbstractDLT {
  chainId: number;
  account: Accounts;
  web3: Web3;

  /**
   * Name of the DLT
   */
  name: string = 'ethereum';

  /**
   * Symbol of the DLT
   */
  symbol: string = 'ETH';

  /**
   * @inheritdoc
   */
    // @TODO: add options statement
  constructor(sdk: OverledgerSDK, options: Options) {
    super(sdk, options);

    this.web3 = new Web3();
    this.options = options;

    if (options.privateKey) {
      this.setAccount(options.privateKey);
    }

    if (sdk.network === sdk.MAINNET) {
      this.chainId = 1;
    } else {
      this.chainId = 500;
    }
  }

  /**
   * Build the transaction
   *
   * @param {string} toAddress
   * @param {string} message
   * @param {TransactionOptions} options
   */
  buildTransaction(toAddress: string, message: string, options: TransactionOptions): Transaction {
    if (typeof options.amount === 'undefined') {
      throw new Error('options.amount must be set up');
    }

    if (typeof options.feeLimit === 'undefined') {
      throw new Error('options.feeLimit must be set up');
    }

    if (typeof options.feePrice === 'undefined') {
      throw new Error('options.feePrice must be set up');
    }

    if (typeof options.sequence === 'undefined') {
      throw new Error('options.sequence must be set up');
    }

    const transaction = {
      nonce: options.sequence,
      chainId: this.chainId,
      to: toAddress,
      gas: options.feeLimit,
      gasPrice: options.feePrice,
      value: options.amount,
      data: this.web3.utils.asciiToHex(message),
    };

    return transaction;
  }

  /**
   * Sign the transaction
   *
   * @param {string} toAddress
   * @param {string} message
   * @param {TransactionOptions} options
   */
  _sign(toAddress: string, message: string, options: TransactionOptions): Promise<string> {
    const transaction = this.buildTransaction(toAddress, message, options);

    return new Promise((resolve, reject) => {
      this.account.signTransaction(transaction, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data.rawTransaction);
      });
    });
  }

  /**
   * @inheritdoc
   */
  createAccount(): Account {
    return this.web3.eth.accounts.create();
  }

  /**
   * @inheritdoc
   */
  setAccount(privateKey: string): void {
    this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
  }

  /**
   * @inheritdoc
   */
  fundAccount(amount: string = '1000000000000000000', address: string = null): Promise<AxiosResponse> {
    return super.fundAccount(amount, address);
  }
}

export type Transaction = {
  nonce: number,
  chainId: number,
  to: string,
  gas: string,
  gasPrice: string,
  value: string,
  data: string,
};

interface TransactionOptions extends BaseTransactionOptions {
  feePrice: string;
  feeLimit: string;
  amount: string;
}

export default Ethereum;
