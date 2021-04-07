import axios from 'axios'

import { config } from '../config';

const api = axios.create({
    baseURL: config.url.API_URL,
})

export const insertLecture = payload => api.post(`/lectures`, payload)
export const getAllLectures = () => api.get(`/lectures`)
export const updateLectureById = (id, payload) => api.put(`/lectures/${id}`, payload)
export const deleteLectureById = id => api.delete(`/lectures/${id}`)
export const getLectureById = id => api.get(`/lectures/${id}`)
export const createSession = payload => api.post(`/sessions/`, payload)
export const logVideoEvent = (id, payload) => api.patch(`/sessions/${id}`, payload)
export const getFeedback = payload => api.post(`/feedback`, payload)

const apis = {
    insertLecture,
    getAllLectures,
    updateLectureById,
    deleteLectureById,
    getLectureById,
    createSession,
    logVideoEvent,
    getFeedback
}

export default apis