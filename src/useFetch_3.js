/**
 *  依赖请求
 * ==============
 * 通常情况下比如两个请求之间相互依赖，如b依赖于a的返回值做请求参数
 * 
 * 数据依赖关系其实是一个 DAG（有向无环图）。有些数据依赖于其他，有的则无依赖性
 * 对数据的请求则是对这个有向无环图的遍历。最高效的请求方式一定是在拓扑序上尽可能地
 * 并行（每当一个数据的依赖都就绪时，立即发起请求）。
 * 大部分时候（请求并不复杂时），我们都用 Promise.all 来描述这个 DAG。 例如：
 * Promise.all([fetchA(), fetchB()]).then([a, b] => fetchC(a, b))
 * 
 * 如果依赖更复杂写起就更麻烦了
 *  https://pbs.twimg.com/media/EIJViLOX0AEqjj3?format=jpg&name=orig
 */


 /**
 *  A 和 B 两个并行请求，且 B 依赖 A 请求
 * ======
 * const a = await A('api/a');
 * const b = await B(`api/b?id=${a.id}`);
 */


/***
 *  💡 ：
 * 当a还没返回时，去请求b，因为a的值还undefined，
 * 所以请求b是拿不到a.id的所以请求会抛出异常
 * 
 * 
 * *****************************
 * 我们可以这么认为当调用接口时url参数抛出异常，就意味着这个请求还未准备好，我们可以暂停
 * 这个请求，等到它准备好(也就是依赖项返回后),然后对它重新发起请求
 * *****************************
 * 
 * 依赖项准备就绪的时机也就是在任一请求完成时，
 * 如上面的 /api/a 请求完成时 useFetch 会通过 setState 触发重新渲染，
 * 同时 /api/b?id=${a.id} 得到更新，只需要将该 url 作为 useEffect的依赖项即可自动监听并触发新一轮的请求。
 * 
 * 
 * 所以useFetch的依赖请求逻辑主要分为三步
 * 1. 约定url可以字符串或者是一个函数并且该函数返回一个字符串 将这个url作为请求的唯一标识
 * 2. 当调用这个函数触发异常则表示还未准备就绪，就⏸这个请求
 * 3. 当依赖项请求完成，通过setState触发渲染，此时url会被更新，
 *   同时通过 useEffect监听 url是否有改变，然后对就绪的数据发起新的一轮请求
 * 
 * 
 * 
 * ================================
 * 主要原理主要是通过约定key为一个函数进行 `try catch`处理 并巧妙结合React的UI=f(data)
 *  模型来触发请求，以此确保最大程度的并行。
 * ================================
 * 
 */



import { useState, useEffect,useContext, useCallback } from 'react';
import fetchConfigContext from './fetch-config-context';
import { unstable_batchedUpdates } from 'react-dom'



/**
 * @param {String} url 
 * @param {Function} fetcher 
 */
const useFetch_3 = (url, fetcher, options={}) => {

  const config = Object.assign(
    {},
    useContext(fetchConfigContext),
    options,
  );

  const [isLoading, setIsLoading] = useState(false)
  const [data, setDate] = useState(undefined)
  const [isError, setIsError] = useState(false)


  let fn = fetcher

  if (typeof fn === 'undefined') {
    // use a global fetcher
    fn = config.fetcher
  }


  const getKeyArgs = key => {
    // 核心步骤
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

      setIsLoading(true)
      let loading = true
      let newData

      try {
        // 请求超时触发 onLoadingSlow回调函数
        if (config.loadingTimeout) {
          setTimeout(() => {
            if (loading) config.onLoadingSlow(key, config)
          }, config.loadingTimeout)
        }

        newData = await fn(key);

        // 触发请求成功时的回调函数
        config.onSuccess && config.onSuccess(newData, key, config)

        // 批量更新
        unstable_batchedUpdates(() => {
          setDate(newData)
          setIsLoading(false)
        })

      } catch (error) {
        unstable_batchedUpdates(() => {
          setIsError(true)
          setIsLoading(false)
        })

        // 触发请求失败时的回调函数
        config.onError && config.onError(error, key, config)
        setIsError(true);
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
    data,
    isLoading,
    isError,
  ];
}

const FetchConfig = fetchConfigContext.Provider;

export {
  FetchConfig
};

export default useFetch_3;