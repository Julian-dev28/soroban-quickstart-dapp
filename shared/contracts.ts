import * as HelloWorld from 'hello-world-contract'
import { Server } from 'soroban-client'
import config from './config.json'
const { network, rpcUrl } = config

export const helloWorld = new HelloWorld.Contract({
  rpcUrl,
  ...HelloWorld.networks[network as keyof typeof HelloWorld.networks],
})

export const server = new Server(rpcUrl, { allowHttp: rpcUrl.startsWith('http:') })