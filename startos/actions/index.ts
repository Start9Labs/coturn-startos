import { sdk } from '../sdk'
import { passwordAccess } from './passwordAccess'
import { rotatePassword } from './rotatePassword'
import { showCredentials } from './showCredentials'

export const actions = sdk.Actions.of()
  .addAction(passwordAccess)
  .addAction(showCredentials)
  .addAction(rotatePassword)
