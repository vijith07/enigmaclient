export const APIURL = 'http://localhost:8000'

export interface ICreateSendRequest {
  name: string
  send_type: number | null
  text_data: string
  file_data: IFileDataRequest
  notes: string
  password: string
  max_access_count: number
  hide_email: boolean
  encrypted_key: string
  iv: string
  hide_data: boolean
  expiration_time: string
  deletion_time: string
}
export interface ISend {
  access_count: number
  creation_time: string
  deletion_time: string
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
  text_data: string
  file_data: IFileData
}

export interface IFileDataRequest {
  file_name: string
  file_type: string
  file_size: number
}

export interface IFileData {
  id: string
  file_name: string
  file_type: string
  file_size: number
}

export interface IFileDataResponse {
  id: string
  file_name: string
  file_type: string
  file_size: number
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
