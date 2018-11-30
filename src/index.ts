import axios, { AxiosInstance } from 'axios';
import Search from './Search';
import ucFirst from './utils/ucFirst';
import AbstractDLT, { ApiCall, TransactionOptions } from './dlts/AbstractDlt';

class OverledgerSDK {
  TESTNET: string = 'testnet';

  MAINNET: string = 'mainnet';

  /**
   * The object storing the DLTs loaded by the Overledger sdk
   */
  dlts = {};

  overledgerUri: string;
  mappId: string;
  bpiKey: string;
  network: string;
  request: AxiosInstance;

  search: Search;

  /**
   * @param {string} mappId
   * @param {string} bpiKey
   * @param {Object} options
   */
  constructor(mappId: string, bpiKey: string, options: SDKOptions) {
    this.mappId = mappId;
    this.bpiKey = bpiKey;

    this.validateOptions(options);
    this.configure(options);
  }

  /**
   * Validate the provided options
   *
   * @param {Object} options
   */
  private validateOptions(options: SDKOptions): void {
    if (!options.dlts) {
      throw new Error('The dlts are missing');
    }
  }

  /**
   * Configure the provided options
   *
   * @param {Object} options
   */
  private configure(options: SDKOptions): void {
    options.dlts.forEach((dltConfig: DltOptions) => {
      const dlt = this.loadDlt(dltConfig);
      this.dlts[dlt.name] = dlt;
    });

    this.network = options.network || this.TESTNET;

    if (this.network === this.MAINNET) {
      this.overledgerUri = 'https://bpi.overledger.io/v1';
    } else {
      this.overledgerUri = 'http://bpi.devnet.overledger.io/v1';
    }

    this.request = axios.create({
      baseURL: this.overledgerUri,
      timeout: 1000,
      headers: {
        Authorization: `Bearer ${this.mappId}:${this.bpiKey}`,
      },
    });

    this.search = new Search(this);
  }

  /**
   * Sign transactions for the provided DLTs
   *
   * @param {Object} dlts Object of the DLTs where you want to send a transaction
   */
  public async sign(dlts: SignOptions): Promise<any> {
    if (!Array.isArray(dlts)) {
      throw new Error('The dlts object must be an array');
    }

    const responseDlts = await Promise.all(dlts.map(async (dlt) => {
      return {
        dlt: dlt.dlt,
        signedTransaction: await this.dlts[dlt.dlt].sign(dlt.toAddress, dlt.message, dlt.options),
      };
    }));

    return responseDlts;
  }

  /**
   * Wrap the DLTData with the api schema
   *
   * @param {array} dltData
   */
  private buildWrapperApiCall(dltData: ApiCall[]): WrapperApiCall {
    return {
      dltData,
      mappId: this.mappId,
    };
  }

  /**
   * Send signed transactions to the provided DLTs
   *
   * @param {Object} signedTransactions Object of the DLTs where you want to send a transaction
   */
  public send(signedTransactions): Promise<any> {
    const apiCall = signedTransactions.map(
      dlt => this.dlts[dlt.dlt].buildApiCall(dlt.signedTransaction),
    );

    return this.request.post(`${this.overledgerUri}/transactions`, this.buildWrapperApiCall(apiCall));
  }

  /**
   * Load the dlt to the Overledger SDK
   *
   * @param {Object} config
   *
   * @return {Provider}
   */
  private loadDlt(config: DltOptions): AbstractDLT {
    // Need to improve this loading
    const Provider = require(`./dlts/${ucFirst(config.dlt)}`).default;

    return new Provider(this, config);
  }

  /**
   * Read by mapp id
   */
  public async readTransactionsByMappId(): Promise<Object> {
    try {
      const response = await this.request.get(`${this.overledgerUri}/mapp/${this.mappId}/transactions`);
      return response.data;
    } catch (e) {
      return e.response.data;
    }
  }

  /**
   * read by overledger transaction id
   *
   * @param {string} ovlTransactionId
   */
  public async readByTransactionId(ovlTransactionId: string): Promise<Object> {
    try {
      const response = await this.request.get(`${this.overledgerUri}/transactions/${ovlTransactionId}`);
      return response.data;
    } catch (e) {
      return e.response.data;
    }
  }

  /**
   * Set the mapp id
   *
   * @param {string} mappId
   */
  public setMappId(mappId: string): void {
    this.mappId = mappId;
  }

  /**
   * get the mapp id
   */
  public getMappId(): string {
    return this.mappId;
  }

  /**
   * set the bpi key
   *
   * @param {string} bpiKey
   */
  public setBpiKey(bpiKey: string): void {
    this.bpiKey = bpiKey;
  }

  /**
   * get the bpi key
   */
  public getBpiKey(): string {
    return this.bpiKey;
  }
}

export type SDKOptions = {
  dlts: DltOptions[],
  network?: 'mainnet' | 'testnet',
};

export type DltOptions = {
  dlt: string,
  privateKey?: string,
};

export type WrapperApiCall = {
  mappId: string,
  dltData: ApiCall[],
};

export type SignOptions = [{
  dlt: string,
  toAddress: string,
  message: string,
  options: TransactionOptions,
}];

export default OverledgerSDK;