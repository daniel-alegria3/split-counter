import { persistentJSON } from '@nanostores/persistent'

export type CountsMap = Record<string, string[]>

export const countsStore = persistentJSON<CountsMap>('counts', {})
