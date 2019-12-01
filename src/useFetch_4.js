/**
 * 使用useReducer 更好的管理state
 */



import { useEffect,useContext, useCallback, useReducer } from 'react';
import fetchConfigContext from './fetch-config-context';



function mergeState(state, payload) {
  return { ...state, ...payload }
}


/**
 * @param {String} url 
 * @param {Function} fetcher 
 */
const useFetch_4 = (url, fetcher, options={}) => {

  // const [isLoading, setIsLoading] = useState(false)
  // const [data, setDate] = useState(undefined)
  // const [isError, setIsError] = useState(false)

  const config = Object.assign(
    {},
    useContext(fetchConfigContext),
    options,
  );

  let fn = fetcher

  if (typeof fn === 'undefined') {
    // use a global fetcher
    fn = config.fetcher
  }

  //****************** */

  const initialData = config.initialData
  const initialError = undefined;

  let [state, dispatch] = useReducer(mergeState, {
    data: initialData,
    error: initialError,
    isLoading: false
  })

  //******************** */

  const getKeyArgs = key => {
    if (typeof key === 'function') {
      try {
        key = key()
      } catch (err) {
        // dependencies not ready
        key = ''
      }
    }
    return key
  }

  const key = getKeyArgs(url)

  const fetchData = useCallback(
    async () => {
      if(!key) return false

      // setIsLoading(true)
      dispatch({
        isLoading: true,
      })

      let loading = true
      let newData

      try {

        if (config.loadingTimeout) {
          setTimeout(() => {
            if (loading) config.onLoadingSlow(key, config)
          }, config.loadingTimeout)
        }

        newData = await fn(key);

        // 触发请求成功时的回调函数
        config.onSuccess && config.onSuccess(newData, key, config)

        
        // 批量更新
        // unstable_batchedUpdates(() => {
        //   setDate(newData)
        //   setIsLoading(false)
        // })
        dispatch({
          isLoading: false,
          data: newData
        })

      } catch (error) {
        // unstable_batchedUpdates(() => {
        //   setIsError(true)
        //   setIsLoading(false)
        // })
        dispatch({
          isLoading: false,
          error: error
        })

        // 触发请求失败时的回调函数
        config.onError && config.onError(error, key, config)

        // .....

      }

      loading = false;
      return true
    },
    [url]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [
    state.data,
    state.isLoading,
    state.isError,
  ];
}

const FetchConfig = fetchConfigContext.Provider;

export {
  FetchConfig
};

export default useFetch_4;

