import { persistentJSON } from '@nanostores/persistent'

export interface Variable {
  id: string
  name: string
}

export const variablesStore = persistentJSON<Variable[]>('variables', [])
