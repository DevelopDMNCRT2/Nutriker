// @ts-ignore
import api from './index'

export const platillosApi = {
  getAll() {
    return api.get('/platillos')
  },
  
  getById(id: string) {
    return api.get(`/platillos/${id}`)
  },
  
  create(data: any) {
    return api.post('/platillos', data)
  },
  
  update(id: string, data: any) {
    return api.put(`/platillos/${id}`, data)
  },
  
  delete(id: string) {
    return api.delete(`/platillos/${id}`)
  }
}
