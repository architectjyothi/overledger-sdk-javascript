import axios, { AxiosInstance } from 'axios';
import OverledgerSDK from './';

class Search {
  sdk: OverledgerSDK;
  request: AxiosInstance;

  /**
   * @param {Object} sdk
   * @param {Object} options
   */
  constructor(sdk) {
    this.sdk = sdk;

    this.request = axios.create({
      baseURL: `${this.sdk.overledgerUri}/search`,
      timeout: 1000,
      headers: { Authorization: `Bearer ${this.sdk.mappId}:${this.sdk.bpiKey}` },
    });
  }

  /**
   * Get transaction by a transaction hash (non-deterministic)
   *
   * @param {string} transactionHash Transaction hash
   */
  async getTransaction(transactionHash) {
    try {
      const response = await this.request.get(`/transactions/${transactionHash}`);
      return response;
    } catch (e) {
      return e.response;
    }
  }

  /**
   * Get whoami
   *
   * @param {string} hash hash
   */
  async whoami(hash) {
    try {
      const response = await this.request.get(`/whoami/${hash}`);
      return response;
    } catch (e) {
      return e.response;
    }
  }

  /**
   * Get block hash
   *
   * @param {string} hash block hash
   */
  async getBlockByDltAndHash(dlt, hash) {
    try {
      const response = await this.request.get(`/chains/${dlt}/blocks/byHash/${hash}`);
      return response;
    } catch (e) {
      return e.response;
    }
  }

  /**
   * Get block number
   *
   * @param {number} number block number
   */
  async getBlockByDltAndNumber(dlt, number) {
    try {
      const response = await this.request.get(`/chains/${dlt}/blocks/byNumber/${number}`);
      return response;
    } catch (e) {
      return e.response;
    }
  }
}

export default Search;
