import axios from 'axios';
import { useEffect, useState } from 'react'

axios.defaults.baseURL = 'http://localhost:3000';

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return Promise.reject('No refresh token');
  }
  const res = await axios.get(`/user/refresh?token=${refreshToken}`);
  localStorage.setItem('accessToken', res.data.accessToken);
  localStorage.setItem('refreshToken', res.data.refreshToken);
};

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (config.url?.startsWith('/user') || !token) {
    return config;
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const { status, config } = error.response;
  console.log(config);
  if (status === 401 && !config.url.includes('/user/refresh?token=')) {
    await refreshToken();
    return axios(error.config);
  }
  return Promise.reject(error);
});

function App() {
  const [aaa, setAaa] = useState('');
  const [bbb, setBbb] = useState('');

  const login = async () => {
    const res = await axios.post('/user/login', {
      username: 'duoduoxu',
      password: '123123',
    });
    console.log(res);

    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
  };

  useEffect(() => {
    const fn = async () => {
      const aaaRes = await axios.get('/aaa');
      const bbbRes = await axios.get('/bbb');

      console.log(aaaRes);

      setAaa(aaaRes.data);
      setBbb(bbbRes.data);
    }
    fn();
  }, [])

  return (
    <div>
      <button onClick={login}>登录</button>
      <p>{aaa}</p>
      <p>{bbb}</p>
    </div>
  )
}

export default App
