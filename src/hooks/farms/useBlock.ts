import { useCallback, useEffect, useState } from 'react'
import config from '../../config'
import axios from 'axios'

import { useActiveWeb3React } from '../../hooks'
import { IsTomoChain } from '../../utils'
// import debounce from 'debounce'

const CACHE: any = {
  time: parseInt(localStorage.getItem('CACHE_useBlock_time') || '0'),
  old: 15 * 1000,
  value: parseInt(localStorage.getItem('CACHE_useBlock_value') || '0')
}

const useBlock = () => {
  const { chainId } = useActiveWeb3React()
  const IsTomo = IsTomoChain(chainId)
  const [block, setBlock] = useState(CACHE.value)
  const getBlock = useCallback(async () => {
    if (CACHE.time + CACHE.old <= new Date().getTime()) {
      const apiUrl = IsTomo ? config.apiTOMO : config.apiETH
      const { data } = await axios.get(`${apiUrl}/blockNumber`)
      const latestBlockNumber = data.number
      if (block !== latestBlockNumber) {
        CACHE.time = new Date().getTime()
        CACHE.value = block
        localStorage.setItem('CACHE_useBlock_time', CACHE.time)
        localStorage.setItem('CACHE_useBlock_value', CACHE.value)
        setBlock(latestBlockNumber)
      }
    } else {
      setBlock(CACHE.value)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      getBlock()
    }, 15000)

    getBlock()

    return () => clearInterval(interval)
  }, [])

  return block
}

export default useBlock
