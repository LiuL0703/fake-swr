import React from 'react';
import useFetch_0 from './useFetch_0';



const Home_0 = () => {
  const [data, isLoading, isError] = useFetch_0('api/home', {})

  return (
    <>
      { isLoading ? <div>Loading....</div> :  <div>data: {data}</div>}
      { isError && <div>Something wrong!</div> }
    </>
  );
}


export default Home_0;