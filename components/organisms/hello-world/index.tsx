import React, { useState, useEffect } from "react";
import { Card } from "../../atoms";
import * as HelloWorldContract from "hello-world-contract";
import { helloWorld } from "../../../shared/contracts";
import styles from "./style.module.css";
import { getPublicKey, signTransaction } from "@stellar/freighter-api";
import { Client, Spec, ClientOptions } from "@stellar/stellar-sdk/contract";
import {
  Contract,
  SorobanRpc,
  Networks,
  xdr,
  BASE_FEE,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

export class HelloContract extends Contract {
  rpc: SorobanRpc.Server;
  spec!: Spec;

  constructor(address: string) {
    super(address);
    this.rpc = new SorobanRpc.Server("https://soroban-testnet.stellar.org", {
      allowHttp: true,
    });
  }

  public async init(address: string) {
    this.spec = await this.getSpecFromContract(address);
  }

  public hello(to: string): xdr.Operation {
    const invokeArgs = this.spec.funcArgsToScVals("hello", { to });
    const operation = this.call("hello", ...invokeArgs);
    return operation;
  }

  public async getSpecFromContract(contractId: string): Promise<Spec> {
    const clientOptions: ClientOptions = {
      contractId: "CC4KCNLZBUNSNAWRRBNDJXQRRPJ64776OUFJLMEQ5DPFG5TUSF5PSGZ2",
      networkPassphrase: Networks.TESTNET,
      rpcUrl: "https://soroban-testnet.stellar.org",
    };
    const wasmByteCode = await this.rpc.getContractWasmByContractId(contractId);
    const spec = await (
      await Client.fromWasm(wasmByteCode, clientOptions)
    ).spec;
    return spec;
  }
}

const HelloWorld = () => {
  const [to, setTo] = useState("");
  const [count, setCount] = useState("");
  const [incr, setIncr] = useState("");
  const [newIncrement, setNewIncrement] = useState("");
  const [message, setMessage] = useState("");
  const [incrementSuccess, setIncrementSuccess] = useState(false); // New state for tracking increment success
  const contractId = HelloWorldContract.networks.testnet.contractId;

  const handleHello = async () => {
    try {
      const RPCServer = new SorobanRpc.Server(
        "https://soroban-testnet.stellar.org",
        { allowHttp: true }
      );
      const myContract = new HelloContract(contractId);
      await myContract.init(contractId);

      // const operation = myContract.hello(to);
      // console.log(operation);
      // const sourceAccount = await RPCServer.getAccount(await getPublicKey());
      // const tx = new TransactionBuilder(sourceAccount, {
      //   fee: BASE_FEE,
      //   networkPassphrase: Networks.TESTNET,
      // })
      //   .addOperation(operation)
      //   .setTimeout(30)
      //   .build();
      // console.log(tx);

      const helloTx = await helloWorld.hello({ to }, { fee: 100 });
      const txXDR = helloTx.built?.toXDR?.() ?? "404";
      await signTransaction(txXDR.toString(), {
        network: "testnet",
        networkPassphrase: Networks.TESTNET,
      });
      console.log(`Hello ${to}`);
    } catch (error) {
      console.error("Error calling hello:", error);
    }
  };

  const handleIncrement = async () => {
    try {
      const incrementTx = await helloWorld.increment(
        { incr: Number(incr) },
        { fee: 100 }
      );
      const txXDR = incrementTx.built?.toXDR?.() ?? "404";
      await signTransaction(txXDR.toString(), {
        network: "testnet",
        networkPassphrase: Networks.TESTNET,
      });
      console.log(`incremented by ${incr}`);
      setIncrementSuccess(true); // Set success state to true on successful increment
    } catch (error) {
      console.error("Error calling increment:", error);
      setIncrementSuccess(false); // Set success state to false on error
    }
  };

  const handleGetMessage = async () => {
    try {
      const response = (await helloWorld.get_message()).result;
      setMessage(response.toString());
      console.log(`Message: ${response}`);
    } catch (error) {
      console.error("Error getting state:", error);
    }
  };

  const handleGetLastIncrement = async () => {
    try {
      const response = (await helloWorld.get_last_increment()).result;
      setNewIncrement(response.toString());
      console.log(`Last increment: ${response}`);
    } catch (error) {
      console.error("Error getting last increment:", error);
    }
  };

  const handleGetCount = async () => {
    try {
      const response = (await helloWorld.get_count()).result;
      setCount(response.toString());
      console.log(`Count: ${response}`);
    } catch (error) {
      console.error("Error getting count:", error);
    }
  };

  return (
    <div>
      <Card>
        <h2>Call Contract Functions</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Recipient:</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleHello} className={styles.button}>
            Write Message
          </button>
        </div>
        <br />
        <br />
        <div className={styles.formGroup}>
          <label className={styles.label}>Increment:</label>
          <input
            type="number"
            value={incr}
            onChange={(e) => setIncr(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleIncrement} className={styles.button}>
            Increment
          </button>
        </div>
      </Card>

      {/* Next section here */}
      <div>
        <Card>
          <h2>Get Contract State Variables</h2>
          <button onClick={handleGetMessage} className={styles.button}>
            Get Message
          </button>
          <div>
            <strong className={styles.strongText}>Message:</strong>
            <br />
            <pre className={styles.preFormattedText}>{`${message}`}</pre>
          </div>
          <br />
          {/* Next section here */}

          <div>
            <button onClick={handleGetLastIncrement} className={styles.button}>
              Get Last Increment
            </button>
            <div>
              <strong className={styles.strongText}>Last Increment:</strong>
              <pre className={styles.preFormattedText}>{newIncrement}</pre>
            </div>
          </div>
          {/* Next section here */}
          <div>
            <button onClick={handleGetCount} className={styles.button}>
              Get Count
            </button>
            <div>
              <strong className={styles.strongText}>Current Count:</strong>
              <pre className={styles.preFormattedText}>{count}</pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { HelloWorld };
