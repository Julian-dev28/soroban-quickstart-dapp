import React, { useState, useEffect } from "react";
import { Card } from "../../atoms";
import { helloWorld } from "../../../shared/contracts";
import styles from "./style.module.css";
import { SorobanRpc, TransactionBuilder, xdr, TimeoutInfinite } from '@stellar/stellar-sdk';
import { Client, Spec, ClientOptions, AssembledTransaction, } from '@stellar/stellar-sdk/contract';
import { getPublicKey, signTransaction } from "@stellar/freighter-api";
import { Server } from "@stellar/stellar-sdk/rpc";

// Helper function to get spec from contract
async function getSpecFromContract(contractId: string): Promise<Spec> {
    const clientOptions: ClientOptions = {
        contractId: contractId,
        networkPassphrase: 'Test SDF Network ; September 2015',
        rpcUrl: 'https://soroban-testnet.stellar.org',
    };
    const rpc = new Server(clientOptions.rpcUrl);
    const wasmByteCode = await rpc.getContractWasmByContractId(contractId);
    const spec = (await Client.fromWasm(wasmByteCode, clientOptions)).spec;
    return spec;
}

export class HelloContract extends Client {
    static spec: any;

    private constructor(spec: any, clientOptions: ClientOptions) {
        super(spec, clientOptions);
    }

    static async create(contractId: string): Promise<HelloContract> {
        const spec = await getSpecFromContract(contractId);
        const clientOptions: ClientOptions = {
            contractId: contractId,
            networkPassphrase: 'Test SDF Network ; September 2015',
            rpcUrl: 'https://soroban-testnet.stellar.org',
        };
        HelloContract.spec = spec; // Set the spec to the static property
        return new HelloContract(spec, clientOptions);
    }

    async hello(to: string): Promise<string> {
        return HelloContract.spec.getFunc('hello').toXDR({ to });
    }

    async increment(incr: number): Promise<string> {
        return HelloContract.spec.getFunc('increment').toXDR({ incr });
    }

    async get_message(): Promise<string> {
        return HelloContract.spec.getFunc('get_message').toXDR();
    }

    async get_last_increment(): Promise<string> {
        return HelloContract.spec.getFunc('get_last_increment').toXDR();
    }

    async get_count(): Promise<string> {
        return HelloContract.spec.getFunc('get_count').toXDR();
    }
}

const HelloWorld = () => {
  const [to, setTo] = useState("");
  const [count, setCount] = useState("");
  const [incr, setIncr] = useState("");
  const [newIncrement, setNewIncrement] = useState("");
  const [message, setMessage] = useState("");
  const [incrementSuccess, setIncrementSuccess] = useState(false); // New state for tracking increment success
  const [helloTx, setHelloTx] = useState<AssembledTransaction<string[]> | undefined>(undefined); // State to hold hello transaction

  useEffect(() => { 
    const createHelloTx = async () => {
      try {
        let result = await helloWorld.hello({ to: to.toString() });
        const contractId = 'CC4KCNLZBUNSNAWRRBNDJXQRRPJ64776OUFJLMEQ5DPFG5TUSF5PSGZ2';
        const helloContract = await HelloContract.create(contractId);
        const tx = await helloContract.hello(to);
        setHelloTx(result);
      } catch (error) {
        console.error("Error creating hello transaction:", error);
      }
    };

    if (to) {
      createHelloTx();
    }
  }, [to]);

  const handleHello = async () => {
    try {
      if (helloTx && helloTx.built) {
        const txXdr = helloTx.built.toXDR();
        await signTransaction(txXdr);
        console.log(`hello, ${to}`);
      } else {
        console.error("Transaction is not ready.");
      }
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
      await incrementTx.signAndSend();
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
          <div>
            <button onClick={handleGetLastIncrement} className={styles.button}>
              Get Last Increment
            </button>
            <div>
              <strong className={styles.strongText}>Last Increment:</strong>
              <pre className={styles.preFormattedText}>{newIncrement}</pre>
            </div>
          </div>
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
