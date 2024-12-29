import axios, { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';

type PendingTask = {
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
}

let isRefreshing = false;
let pendingTasks: PendingTask[] = [];

axios.defaults.baseURL = 'http://localhost:3000';

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return Promise.reject('No refresh token');
  }
  const res = await axios.get(`/user/refresh?token=${refreshToken}`);
  localStorage.setItem('accessToken', res.data.accessToken);
  localStorage.setItem('refreshToken', res.data.refreshToken);
  return res;
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
  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingTasks.push({
        config,
        resolve,
      });
    });
  }
  if (status === 401 && !config.url.includes('/user/refresh?token=')) {
    isRefreshing = true;
    const res = await refreshToken();
    isRefreshing = false;
    if (res.status === 200) {
      pendingTasks.forEach((task) => {
        task.resolve(axios(task.config));
      });
      pendingTasks = [];
      // 最初的请求
      return axios(config);
    } else {
      return Promise.reject(res.data);
    }

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
      axios.get('/bbb');
      axios.get('/ccc');
      axios.get('/ddd');
      axios.get('/eee');

      console.log(aaaRes);

      setAaa(aaaRes.data);
      // setBbb(bbbRes.data);
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
