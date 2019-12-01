import React from 'react';
import useFetch_1 from './useFetch_1';
import axios from 'axios';


const customFetch = async (...args) => await axios(...args);


const Home_0 = () => {
  const [data, isLoading, isError] = useFetch_1('api/home', customFetch)

  return (
    <>
      { isLoading ? <div>Loading....</div> :  <div>data: {data}</div>}
      { isError && <div>Something wrong!</div> }
    </>
  );
}


export default Home_0;