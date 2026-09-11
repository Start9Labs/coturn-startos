import { T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { turnHostId } from '../utils'

// RFC 7065: a TURN URI is `turn:host:port`, so `addressInfo.toUrl`'s `//` form won't do.
export async function turnUris(
  effects: T.Effects,
  port: number,
  interfaceId: string,
) {
  return (
    (await sdk.host
      .getOwn(effects, turnHostId, (host) => {
        const hostnames =
          host?.bindings[port]?.interfaces[interfaceId]?.addressInfo
            .filter({ visibility: 'public', kind: 'domain' })
            .hostnames.filter((h) => h.port != null) ?? []
        const uri = (ssl: boolean) => {
          const h = hostnames.find((x) => x.ssl === ssl)
          return h ? `${ssl ? 'turns' : 'turn'}:${h.hostname}:${h.port}` : null
        }
        return { turn: uri(false), turns: uri(true) }
      })
      .once()) ?? { turn: null, turns: null }
  )
}

export function uriResults({
  turn,
  turns,
}: Awaited<ReturnType<typeof turnUris>>) {
  return [
    { name: i18n('Address'), value: turn },
    { name: i18n('Address (TLS)'), value: turns },
  ].flatMap(({ name, value }) =>
    value
      ? [
          {
            type: 'single' as const,
            name,
            description: null,
            value,
            masked: false,
            copyable: true,
            qr: false,
          },
        ]
      : [],
  )
}
