/**
 * 扩展 自定义fetch
 */

import { useState, useEffect} from 'react';


/**
 * @param {String} url 
 * @param {Function} fetcher 
 */
const useFetch_1 = (url, fetcher) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setDate] = useState(undefined);
  const [isError, setIsError] = useState(false);


  useEffect(() => {
    const fetchData = async () =>{
      setIsLoading(true);

      try {
        const res = await fetcher(url);
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

export default useFetch_1;