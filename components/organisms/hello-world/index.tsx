import React, { useState, useEffect } from "react";
import { Card } from "../../atoms";
import { helloWorld } from '../../../shared/contracts'
import styles from "./style.module.css";

const HelloWorld = () => {
  const [to, setTo] = useState("");
  const [count, setCount] = useState("");
  const [incr, setIncr] = useState("");
  const [newIncrement, setNewIncrement] = useState("");
  const [message, setMessage] = useState([""]);
  const [incrementSuccess, setIncrementSuccess] = useState(false); // New state for tracking increment success


  const handleHello = async () => {
    try {
      const helloTx = (await helloWorld.hello({ to }, { fee: 100 }));
      await helloTx.signAndSend();
      console.log(`hello, ${to}`);
    } catch (error) {
      console.error("Error calling hello:", error);
    }
  };

  const handleIncrement = async () => {
    try {
      const incrementTx = await helloWorld.increment({ incr: Number(incr) }, { fee: 100 });
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
      const response = (await helloWorld.getMessage()).result;
      setMessage(response);
    } catch (error) {
      console.error("Error getting state:", error);
    }
  };

  const handleGetLastIncrement = async () => {
    try {
      const response = (await helloWorld.getLastIncrement()).result;
      setNewIncrement(response.toString());
      console.log(`Last increment: ${response}`);
    } catch (error) {
      console.error("Error getting last increment:", error);
    }
  };

  const handleGetCount = async () => {
    try {
      const response = (await helloWorld.getCount()).result;
      setCount(response.toString());
      console.log(`Count: ${response}`);
    } catch (error) {
      console.error("Error getting count:", error);
    }
  };

  return (
    <div>
      <Card>
        <h2>Smart Contract Interaction</h2>
        <div>
          <label>Recipient:</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button onClick={handleHello} >Write Message</button>
        </div>
        <br />
        <div>
          <label>Increment:</label>
          <input
            type="number"
            value={incr}
            onChange={(e) => setIncr(e.target.value)}
          />
          <button onClick={handleIncrement}>Increment</button>
        </div>
      </Card>

      {/* Next section here */}
      <div>
        <Card>
          <button onClick={handleGetMessage}>Get Message</button>
          <div>
            <strong>Message:</strong>
            <br />
            <pre>{`${message}`}</pre>
          </div>
          <br />
          {/* Next section here */}

          <div>
            <button onClick={handleGetLastIncrement}>Get Last Increment</button>
            <div>
              <strong>Last Increment:</strong>
              <pre>{newIncrement}</pre>
            </div>
          </div>
          {/* Next section here */}
          <div>
            <button onClick={handleGetCount}>Get Count</button>
            <div>
              <strong>Current Count:</strong>
              <pre>{count}</pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { HelloWorld };
