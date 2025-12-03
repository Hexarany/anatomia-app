import axios from 'axios'
import type { Category, Topic, Quiz, SubscriptionPlan, CurrentSubscription, Subscription, MassageProtocol, HygieneGuideline, AnatomyModel3D, TriggerPoint } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor для автоматического добавления токена во все запросы
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories')
  return response.data
}

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`)
  return response.data
}

// Topics
export const getTopics = async (): Promise<Topic[]> => {
  const response = await api.get('/topics')
  return response.data
}

export const getTopicById = async (id: string): Promise<Topic> => {
  const response = await api.get(`/topics/${id}`)
  return response.data
}

export const getTopicsByCategory = async (categoryId: string): Promise<Topic[]> => {
  const response = await api.get(`/topics/category/${categoryId}`)
  return response.data
}

// --- TOPICS CRUD (Для Admin Panel) ---

export const createTopic = async (topicData: any, token: string): Promise<Topic> => {
  const response = await api.post('/topics', topicData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateTopic = async (id: string, topicData: any, token: string): Promise<Topic> => {
  const response = await api.put(`/topics/${id}`, topicData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteTopic = async (id: string, token: string): Promise<void> => {
  await api.delete(`/topics/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Topic Images Management
export const addImageToTopic = async (topicId: string, imageData: { url: string; filename: string; caption?: { ru: string; ro: string } }, token: string): Promise<Topic> => {
  const response = await api.post(`/topics/${topicId}/images`, imageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const removeImageFromTopic = async (topicId: string, imageId: string, token: string): Promise<Topic> => {
  const response = await api.delete(`/topics/${topicId}/images/${imageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateImageCaption = async (topicId: string, imageId: string, caption: { ru: string; ro: string }, token: string): Promise<Topic> => {
  const response = await api.put(`/topics/${topicId}/images/${imageId}`, { caption }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// Quizzes
export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get('/quizzes')
  return response.data
}

export const getQuizById = async (id: string): Promise<Quiz> => {
  const response = await api.get(`/quizzes/${id}`)
  return response.data
}

export const getQuizzesByTopic = async (topicId: string): Promise<Quiz[]> => {
  const response = await api.get(`/quizzes/topic/${topicId}`)
  return response.data
}

// --- QUIZZES CRUD (Для Admin Panel) ---

export const createQuiz = async (quizData: any, token: string): Promise<Quiz> => {
  const response = await api.post('/quizzes', quizData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateQuiz = async (id: string, quizData: any, token: string): Promise<Quiz> => {
  const response = await api.put(`/quizzes/${id}`, quizData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteQuiz = async (id: string, token: string): Promise<void> => {
  await api.delete(`/quizzes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Media
export const uploadMedia = async (file: File, token: string): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getMediaList = async (token: string): Promise<any[]> => {
  const response = await api.get('/media/list', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteMedia = async (id: string, token: string): Promise<void> => {
  await api.delete(`/media/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Subscriptions
export const getSubscriptionPlans = async (): Promise<{ plans: SubscriptionPlan[]; trialDays: number }> => {
  const response = await api.get('/subscriptions/plans')
  return response.data
}

export const getCurrentSubscription = async (token: string): Promise<CurrentSubscription> => {
  const response = await api.get('/subscriptions/current', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const startTrial = async (token: string): Promise<any> => {
  const response = await api.post('/subscriptions/start-trial', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const cancelSubscription = async (token: string): Promise<any> => {
  const response = await api.post('/subscriptions/cancel', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getSubscriptionHistory = async (token: string): Promise<{ subscriptions: Subscription[] }> => {
  const response = await api.get('/subscriptions/history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// PayPal
export const createPayPalOrder = async (token: string, planId: string): Promise<any> => {
  const response = await api.post('/paypal/create-order', { planId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const capturePayPalOrder = async (token: string, orderId: string, planId: string): Promise<any> => {
  const response = await api.post('/paypal/capture-order', { orderId, planId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// Massage Protocols
export const getMassageProtocols = async (): Promise<MassageProtocol[]> => {
  const response = await api.get('/massage-protocols')
  return response.data
}

export const getMassageProtocolById = async (id: string): Promise<MassageProtocol> => {
  const response = await api.get(`/massage-protocols/${id}`)
  return response.data
}

export const createMassageProtocol = async (data: any, token: string): Promise<MassageProtocol> => {
  const response = await api.post('/massage-protocols', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateMassageProtocol = async (id: string, data: any, token: string): Promise<MassageProtocol> => {
  const response = await api.put(`/massage-protocols/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteMassageProtocol = async (id: string, token: string): Promise<void> => {
  await api.delete(`/massage-protocols/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Massage Protocol Images
export const addImageToMassageProtocol = async (protocolId: string, imageData: { url: string; filename: string; caption?: { ru: string; ro: string } }, token: string): Promise<MassageProtocol> => {
  const response = await api.post(`/massage-protocols/${protocolId}/images`, imageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const removeImageFromMassageProtocol = async (protocolId: string, imageId: string, token: string): Promise<MassageProtocol> => {
  const response = await api.delete(`/massage-protocols/${protocolId}/images/${imageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateMassageProtocolImageCaption = async (protocolId: string, imageId: string, caption: { ru: string; ro: string }, token: string): Promise<MassageProtocol> => {
  const response = await api.put(`/massage-protocols/${protocolId}/images/${imageId}`, { caption }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// Massage Protocol Videos
export const addVideoToMassageProtocol = async (protocolId: string, videoData: { url: string; filename: string; caption?: { ru: string; ro: string } }, token: string): Promise<MassageProtocol> => {
  const response = await api.post(`/massage-protocols/${protocolId}/videos`, videoData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const removeVideoFromMassageProtocol = async (protocolId: string, videoId: string, token: string): Promise<MassageProtocol> => {
  const response = await api.delete(`/massage-protocols/${protocolId}/videos/${videoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateMassageProtocolVideoCaption = async (protocolId: string, videoId: string, caption: { ru: string; ro: string }, token: string): Promise<MassageProtocol> => {
  const response = await api.put(`/massage-protocols/${protocolId}/videos/${videoId}`, { caption }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// Hygiene Guidelines
export const getHygieneGuidelines = async (category?: string): Promise<HygieneGuideline[]> => {
  const response = await api.get('/hygiene-guidelines', {
    params: category ? { category } : {},
  })
  return response.data
}

export const getHygieneGuidelineById = async (id: string): Promise<HygieneGuideline> => {
  const response = await api.get(`/hygiene-guidelines/${id}`)
  return response.data
}

export const createHygieneGuideline = async (data: any, token: string): Promise<HygieneGuideline> => {
  const response = await api.post('/hygiene-guidelines', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateHygieneGuideline = async (id: string, data: any, token: string): Promise<HygieneGuideline> => {
  const response = await api.put(`/hygiene-guidelines/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteHygieneGuideline = async (id: string, token: string): Promise<void> => {
  await api.delete(`/hygiene-guidelines/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const addImageToHygieneGuideline = async (guidelineId: string, imageData: { url: string; filename: string; caption?: { ru: string; ro: string } }, token: string): Promise<HygieneGuideline> => {
  const response = await api.post(`/hygiene-guidelines/${guidelineId}/images`, imageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const removeImageFromHygieneGuideline = async (guidelineId: string, imageId: string, token: string): Promise<HygieneGuideline> => {
  const response = await api.delete(`/hygiene-guidelines/${guidelineId}/images/${imageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// Anatomy 3D Models
export const getAnatomyModels3D = async (category?: string): Promise<AnatomyModel3D[]> => {
  const response = await api.get('/anatomy-models-3d', { params: category ? { category } : {} })
  return response.data
}

export const getAnatomyModel3DById = async (id: string): Promise<AnatomyModel3D> => {
  const response = await api.get(`/anatomy-models-3d/${id}`)
  return response.data
}

export const getAnatomyModel3DBySlug = async (slug: string): Promise<AnatomyModel3D> => {
  const response = await api.get(`/anatomy-models-3d/slug/${slug}`)
  return response.data
}

export const createAnatomyModel3D = async (data: any, token: string): Promise<AnatomyModel3D> => {
  const response = await api.post('/anatomy-models-3d', data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const updateAnatomyModel3D = async (id: string, data: any, token: string): Promise<AnatomyModel3D> => {
  const response = await api.put(`/anatomy-models-3d/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const deleteAnatomyModel3D = async (id: string, token: string): Promise<void> => {
  await api.delete(`/anatomy-models-3d/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Trigger Points
export const getTriggerPoints = async (category?: string): Promise<TriggerPoint[]> => {
  const params = category ? { category } : {}
  const response = await api.get('/trigger-points', { params })
  return response.data
}

export const getTriggerPointById = async (id: string): Promise<TriggerPoint> => {
  const response = await api.get(`/trigger-points/${id}`)
  return response.data
}

export const getTriggerPointBySlug = async (slug: string): Promise<TriggerPoint> => {
  const response = await api.get(`/trigger-points/slug/${slug}`)
  return response.data
}

export const createTriggerPoint = async (data: any, token: string): Promise<TriggerPoint> => {
  const response = await api.post('/trigger-points', data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const updateTriggerPoint = async (id: string, data: any, token: string): Promise<TriggerPoint> => {
  const response = await api.put(`/trigger-points/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const deleteTriggerPoint = async (id: string, token: string): Promise<void> => {
  await api.delete(`/trigger-points/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Chat
export const getUserConversations = async (): Promise<any[]> => {
  const response = await api.get('/chat/conversations')
  return response.data
}

export const getConversationById = async (conversationId: string): Promise<any> => {
  const response = await api.get(`/chat/conversations/${conversationId}`)
  return response.data
}

export const createOrGetPrivateConversation = async (otherUserId: string): Promise<any> => {
  const response = await api.post('/chat/conversations/private', { otherUserId })
  return response.data
}

export const createGroupConversation = async (participantIds: string[], name: string, avatar?: string): Promise<any> => {
  const response = await api.post('/chat/conversations/group', { participantIds, name, avatar })
  return response.data
}

export const getConversationMessages = async (conversationId: string, page = 1, limit = 50): Promise<any> => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit },
  })
  return response.data
}

export const deleteConversation = async (conversationId: string): Promise<void> => {
  await api.delete(`/chat/conversations/${conversationId}`)
}

export const searchUsers = async (query: string): Promise<any[]> => {
  const response = await api.get('/chat/users/search', {
    params: { query },
  })
  return response.data
}

// Search
export interface SearchResult {
  type: 'topic' | 'protocol' | 'trigger_point' | 'hygiene' | 'model_3d' | 'quiz'
  id: string
  title: {
    ru: string
    ro: string
  }
  description?: {
    ru: string
    ro: string
  }
  slug?: string
  category?: string
  thumbnail?: string
}

export interface SearchResponse {
  query: string
  total: number
  results: SearchResult[]
}

export const globalSearch = async (query: string, type?: string, lang?: string): Promise<SearchResponse> => {
  const response = await api.get('/search', {
    params: { query, type, lang },
  })
  return response.data
}

export const getSearchHistory = async (): Promise<string[]> => {
  const response = await api.get('/search/history')
  return response.data
}

export const saveSearchQuery = async (query: string): Promise<void> => {
  await api.post('/search/history', { query })
}

// Bookmarks and Folders
export interface Bookmark {
  _id: string
  userId: string
  contentType: 'topic' | 'protocol' | 'trigger_point' | 'hygiene' | 'model_3d' | 'quiz'
  contentId: string
  folderId?: string
  notes?: string
  content: any
  createdAt: string
  updatedAt: string
}

export interface BookmarkFolder {
  _id: string
  userId: string
  name: {
    ru: string
    ro: string
  }
  color: string
  icon: string
  order: number
  bookmarksCount?: number
  createdAt: string
  updatedAt: string
}

export const getUserBookmarks = async (folderId?: string | null, contentType?: string): Promise<Bookmark[]> => {
  const response = await api.get('/bookmarks', {
    params: { folderId, contentType },
  })
  return response.data
}

export const addBookmark = async (contentType: string, contentId: string, folderId?: string, notes?: string): Promise<Bookmark> => {
  const response = await api.post('/bookmarks', { contentType, contentId, folderId, notes })
  return response.data
}

export const updateBookmark = async (bookmarkId: string, data: { folderId?: string | null; notes?: string }): Promise<Bookmark> => {
  const response = await api.put(`/bookmarks/${bookmarkId}`, data)
  return response.data
}

export const deleteBookmark = async (bookmarkId: string): Promise<void> => {
  await api.delete(`/bookmarks/${bookmarkId}`)
}

export const checkBookmark = async (contentType: string, contentId: string): Promise<{ isBookmarked: boolean; bookmark?: Bookmark }> => {
  const response = await api.get('/bookmarks/check', {
    params: { contentType, contentId },
  })
  return response.data
}

export const getUserFolders = async (): Promise<BookmarkFolder[]> => {
  const response = await api.get('/folders')
  return response.data
}

export const createFolder = async (name: { ru: string; ro: string }, color?: string, icon?: string): Promise<BookmarkFolder> => {
  const response = await api.post('/folders', { name, color, icon })
  return response.data
}

export const updateFolder = async (
  folderId: string,
  data: { name?: { ru: string; ro: string }; color?: string; icon?: string; order?: number }
): Promise<BookmarkFolder> => {
  const response = await api.put(`/folders/${folderId}`, data)
  return response.data
}

export const deleteFolder = async (folderId: string): Promise<void> => {
  await api.delete(`/folders/${folderId}`)
}

export default api