import axios from "axios";
import OverledgerSDK from "../src";

jest.mock("axios");

describe("Balances", () => {
  let overledger;

  beforeAll(() => {
    overledger = new OverledgerSDK("testmappid", "testbpikey", {
      dlts: [
        {
          dlt: "bitcoin"
        },
        {
          dlt: "ethereum"
        },
        {
          dlt: "ripple"
        }
      ]
    });
  });

  test("Can getBalances for multiple addresses", () => {
    const array = [
      {
        dlt: "ethereum",
        address: "0x0000000000000000000000000000000000000000"
      },
      {
        dlt: "ripple",
        address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
      }
    ];

    overledger.getBalances(array);

    axios.post.mockResolvedValue([
      {
        dlt: "ethereum",
        address: "0x0000000000000000000000000000000000000000",
        unit: "wei",
        value: "0"
      },
      {
        dlt: "ripple",
        address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
        unit: "drop",
        value: "202995413"
      }
    ]);
    expect(axios.post).toBeCalledWith("/balances", array);
  });
});
