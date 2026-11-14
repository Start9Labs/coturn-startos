import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_4_18_0_6 } from './v4.18.0_6'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_4_18_0_6],
})
