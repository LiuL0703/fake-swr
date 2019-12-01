import React from 'react';
import useFetch_2 from './useFetch_2';


const Home_2 = () => {
  const [data, isLoading, isError] = useFetch_2('api/home')

  return (
    <>
      { isLoading ? <div>Loading....</div> :  <div>data: {data}</div>}
      { isError && <div>Something wrong!</div> }
    </>
  );
}


export default Home_2;