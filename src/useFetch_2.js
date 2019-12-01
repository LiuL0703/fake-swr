/**
 * 每次调用都需要自己传fetcher 考虑将其做统一默认配置，自定义配置可覆盖默认配置
 */

import { useState, useEffect,useContext} from 'react';
import fetchConfigContext from './fetch-config-context';


/**
 * @param {String} url 
 * @param {Function} fetcher 
 */
const useFetch_2 = (url, fetcher, options={}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setDate] = useState(undefined);
  const [isError, setIsError] = useState(false);

  const config = Object.assign(
    {},
    useContext(fetchConfigContext),
    options,
  );

  let fn = fetcher;

  if (typeof fn === 'undefined') {
    // use a global fetcher
    fn = config.fetcher
  }



  useEffect(() => {
    const fetchData = async () =>{
      setIsLoading(true);

      try {
        const res = await fn(url);
        setDate(res);
      } catch (error) {

        setIsError(true);
      }
      setIsLoading(false);
    }

    fetchData();

  }, [url]);

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

export default useFetch_2;