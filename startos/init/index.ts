import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedSecret } from './seedSecret'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedSecret,
  setInterfaces,
  setDependencies,
  actions,
)

export const uninit = sdk.setupUninit(versionGraph)
