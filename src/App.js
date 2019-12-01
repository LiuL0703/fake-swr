import React from 'react';
import './App.css';
import { FetchConfig } from './useFetch_2';
import axios from 'axios';

function App() {
  return (
    <>
      <FetchConfig 
        value={{
          fetcher: axios
        }}
      >
          {/* <Components /> */}
          {/* <Home_2 /> */}
      </FetchConfig>
    </>
  );
}

export default App;
