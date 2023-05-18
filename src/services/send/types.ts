export const APIURL = 'http://localhost:8000'

export interface ISend {
  name: string
  type: number
  text: string
  hideText: boolean
  expiryDate: string
  deleteDate: string
  notes: string
  password: string
  shareOnSave: boolean
  hideEmail: boolean
  accessLimit: number
}
export interface ISendResponse {
  access_count: number
  creation_time: string
  text_data: string
  file_data: IFileData
  deletion_time: string
  disabled: boolean
  encrypted_key: string
  expiration_time: string
  hide_data: boolean
  hide_email: boolean
  id: string
  iv: string
  max_access_count: number
  name: string
  notes: string
  password: string
  revision_time: string
  send_type: number
  user_id: number
}

export interface IFileDataRequest {
  name: string
  type: string
  size: number
}

export interface IFileData {
  id: string
  name: string
  type: string
  size: number
}

export interface IFileDataResponse {
  id: string
  name: string
  type: string
  size: number
  url: string
}
export interface IAccessSend {
  send_type: number
  text_data: string
  file_data: IFileDataResponse
  encrypted_key: string
  password?: string
  hide_data: boolean
  email?: string
  name: string
  iv: string
}
