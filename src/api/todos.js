import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 统一处理响应格式
function handleResponse(res) {
  if (res.data.status) {
    return res.data.data
  }
  return Promise.reject(new Error(res.data.message || '请求失败'))
}

export const getTodoList = () =>
  api.get('/todos').then(handleResponse)

export const getTodoById = (id) =>
  api.get(`/todos/${id}`).then(handleResponse)

export const createTodo = (data) =>
  api.post('/todos', data).then(handleResponse)

export const updateTodo = (id, data) =>
  api.put(`/todos/${id}`, data).then(handleResponse)

export const deleteTodo = (id) =>
  api.delete(`/todos/${id}`).then(handleResponse)
