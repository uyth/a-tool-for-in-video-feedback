import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
})

export const insertLecture = payload => api.post(`/lectures`, payload)
export const getAllLectures = () => api.get(`/lectures`)
export const updateLectureById = (id, payload) => api.put(`/lectures/${id}`, payload)
export const deleteLectureById = id => api.delete(`/lectures/${id}`)
export const getLectureById = id => api.get(`/lectures/${id}`)

const apis = {
    insertLecture,
    getAllLectures,
    updateLectureById,
    deleteLectureById,
    getLectureById,
}

export default apis