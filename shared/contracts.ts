import * as HelloWorld from "hello-world-contract";

export const helloWorld = new HelloWorld.Client({
  ...HelloWorld.networks.testnet,
  rpcUrl: 'https://soroban-testnet.stellar.org',
  allowHttp: true,

})