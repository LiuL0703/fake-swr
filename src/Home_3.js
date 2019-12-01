import React from 'react';
import useFetch_3 from './useFetch_3';



const Home = () => {
  // A 和 B 两个并行请求，且 B 依赖 A 请求
  const { data: a } = useFetch('/api/a')
  const { data: b } = useFetch(() => `/api/b?id=${a.id}`)

  // ... 
}