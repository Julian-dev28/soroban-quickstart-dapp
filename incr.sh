EXAMPLE_USER_SECRET="$(soroban keys show example-user)"
CONTRACT_ID="$(cat ./.soroban/hello_world_id)"

soroban contract invoke \
--network testnet \
--source $EXAMPLE_USER_SECRET \
--id $CONTRACT_ID \
-- \
increment \
--incr 7