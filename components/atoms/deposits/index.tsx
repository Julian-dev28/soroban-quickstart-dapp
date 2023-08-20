import React from 'react'
import styles from './style.module.css'
import { Utils } from '../../../shared/utils'
import { Spacer } from '../../atoms/spacer'
import { get_rsrvs as getBalance } from 'liquidity-pool-contract'

export interface IDepositsProps {
  address: string
  decimals: number
  name?: string
  symbol?: string
  idCrowdfund: string
}

export function Deposits(props: IDepositsProps) {
  const [balance, setBalance] = React.useState<BigInt>(BigInt(0))

  React.useEffect(() => {
    getBalance().then((balances) => {
      // Assuming that the first item in the tuple is the balance you're interested in
      setBalance(balances[0])
    })
  }, [props.address])

  return (
    <>
      <Spacer rem={2} />
      <h6>You’ve Pledged</h6>
      <div className={styles.pledgeContainer}>
        <span className={styles.values}>
          {Utils.formatAmount(balance, props.decimals)}{' '}
          <span title={props.name}>{props.symbol}</span>
        </span>
        {/*<a>
          <h6>
            09/22/22 <Image src={OpenSvg} width={12} height={12} alt={'Open'} />
          </h6>
        </a>*/}
      </div>
    </>
  )
}
