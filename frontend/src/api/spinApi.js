import { http } from './httpClient'

export function spinWheelRequest() {
  return http('/api/spin', {
    method: 'POST',
  })
}
