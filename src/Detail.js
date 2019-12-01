import React,{ useState, useEffect} from 'react';


const Detail = (props) => {
  const { id = '1003078' } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setDate] = useState({});
  const [isError, setIsError] = useState(false);


  useEffect(() => {
    const fetchData = async () =>{
      setIsLoading(true);
      try {
        const res = await fetch(`https://douban.uieee.com/v2/book/${id}`);
        setDate(res);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    }
    fetchData();

  }, [id]);
  // console.log(data)
  return (
    <>
      { isLoading ? <div>Loading....</div> : <h1>title: {data.title}</h1>}
      { isError && <div>Something wrong!</div> }
    </>
  );
}



export default Detail;