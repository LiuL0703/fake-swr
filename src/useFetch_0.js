/**
 * 初步抽象 逻辑复用
 */

import { useState, useEffect} from 'react';
import fetch from 'fetch';


/**
 * @param {String} url 
 * @param {Object} initState 
 */
const useFetch_0 = (url, initState) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setDate] = useState(initState);
  const [isError, setIsError] = useState(false);


  useEffect(() => {
    const fetchData = async () =>{
      setIsLoading(true);
      try {
        const res = await fetch(url);
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

export default useFetch_0;