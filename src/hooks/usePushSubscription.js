import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getCoroActual } from '../lib/coro'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushSubscription(user) {
  useEffect(() => {
    if (!user) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    async function suscribir() {
      try {
        const coro = await getCoroActual()
        if (!coro) return

        const registration = await navigator.serviceWorker.ready
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        })

        const { endpoint, keys } = subscription.toJSON()

        await supabase.from('push_suscripciones').upsert({
          perfil_id: user.id,
          coro_id: coro.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth
        }, { onConflict: 'perfil_id,endpoint' })

      } catch (err) {
        console.error('Error al suscribir push:', err)
      }
    }

    suscribir()
  }, [user])
}