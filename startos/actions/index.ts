import { sdk } from '../sdk'
import { passwordAccess } from './passwordAccess'
import { rotatePassword } from './rotatePassword'
import { rotateSecret } from './rotateSecret'
import { showCredentials } from './showCredentials'
import { showSecret } from './showSecret'

export const actions = sdk.Actions.of()
  .addAction(showSecret)
  .addAction(rotateSecret)
  .addAction(passwordAccess)
  .addAction(showCredentials)
  .addAction(rotatePassword)
