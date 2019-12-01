import React,{ useState, useEffect} from 'react';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setDate] = useState({});
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () =>{
      setIsLoading(true);
      try {
        const res = await fetch('api/home...');
        setDate(res);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      { isLoading ? <div>Loading....</div> :  <div>data: {data}</div>}
      { isError && <div>Something wrong!</div> }
    </>
  );
}


export default Home;