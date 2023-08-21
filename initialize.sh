#!/bin/bash

set -e

NETWORK="$1"

SOROBAN_RPC_HOST="$2"

# PATH=./target/bin:$PATH

if [[ -f "./.soroban-example-dapp" ]]; then
  echo "Removing previous deployments"

  rm -rf ./.soroban-example-dapp
  rm -rf ./.soroban
fi

if [[ "$SOROBAN_RPC_HOST" == "" ]]; then
  # If soroban-cli is called inside the soroban-preview docker container,
  # it can call the stellar standalone container just using its name "stellar"
  if [[ "$IS_USING_DOCKER" == "true" ]]; then
    SOROBAN_RPC_HOST="http://stellar:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  elif [[ "$NETWORK" == "futurenet" ]]; then
    SOROBAN_RPC_HOST="https://rpc-futurenet.stellar.org:443"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  else
     # assumes standalone on quickstart, which has the soroban/rpc path
    SOROBAN_RPC_HOST="http://localhost:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST/soroban/rpc"
  fi
else 
  SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"  
fi

case "$1" in
standalone)
  SOROBAN_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
  FRIENDBOT_URL="$SOROBAN_RPC_HOST/friendbot"
  ;;
futurenet)
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
  FRIENDBOT_URL="https://friendbot-futurenet.stellar.org/"
  ;;
*)
  echo "Usage: $0 standalone|futurenet [rpc-host]"
  exit 1
  ;;
esac

echo "Using $NETWORK network"
echo "  RPC URL: $SOROBAN_RPC_URL"
echo "  Friendbot URL: $FRIENDBOT_URL"

echo Add the $NETWORK network to cli client
soroban config network add \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE" "$NETWORK"

echo Add $NETWORK to .soroban-example-dapp for use with npm scripts
mkdir -p .soroban-example-dapp
echo $NETWORK > ./.soroban-example-dapp/network
echo $SOROBAN_RPC_URL > ./.soroban-example-dapp/rpc-url
echo "$SOROBAN_NETWORK_PASSPHRASE" > ./.soroban-example-dapp/passphrase

if !(soroban config identity ls | grep example-user 2>&1 >/dev/null); then
  echo Create the example-user identity
  soroban config identity generate example-user
fi
EXAMPLE_USER_ADDRESS="$(soroban config identity address example-user)"

# This will fail if the account already exists, but it'll still be fine.
echo Fund example-user account from friendbot
curl --silent -X POST "$FRIENDBOT_URL?addr=$EXAMPLE_USER_ADDRESS" >/dev/null

ARGS="--network $NETWORK --source example-user"

echo Build contracts
make build

echo Deploy the hello world contract
HELLO_WORLD_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/soroban_modified_hello_world_contract.wasm
)"
echo "Contract deployed succesfully with ID: $HELLO_WORLD_ID"
echo "$HELLO_WORLD_ID" > .soroban-example-dapp/hello_world_id

echo "Done"
