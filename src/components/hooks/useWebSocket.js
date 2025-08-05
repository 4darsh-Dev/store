import { useState, useRef, useCallback, useEffect } from 'react'
import { WEBSOCKET_URL } from '../utils/constants.js'

export const useWebSocket = ({
  onMessage,
  onTimestampUpdate,
  onResetTimestamps,
  timestamps,
  setTimestamps
}) => {
  const [wsStatus, setWsStatus] = useState('disconnected')
  const wsRef = useRef(null)
  const connectWebSocket = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('WebSocket already open.')
        setWsStatus('connected')
        resolve()
        return
      }

      setWsStatus('connecting')
      const newWs = new WebSocket(WEBSOCKET_URL)

      const connectionTimeout = setTimeout(() => {
        newWs.close()
        reject(new Error('WebSocket connection timeout'))
      }, 10000)

      newWs.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log('WebSocket connection established.')
        setWsStatus('connected')
        resolve()
      }

      newWs.onerror = (error) => {
        clearTimeout(connectionTimeout)
        console.error('WebSocket error:', error)
        setWsStatus('disconnected')
        newWs.close()
        reject(error)
      }

      newWs.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log('WebSocket connection closed:', event.code, event.reason)
        setWsStatus('disconnected')
        wsRef.current = null
      }

      newWs.onmessage = async (event) => {
        try {
          let message
          if (typeof event.data === 'string') {
            message = JSON.parse(event.data)
          } else {
            message = event.data
          }

          const now = performance.now()

          if (message.type === 'utterance_start') {
            onTimestampUpdate('utteranceStart', now)
            console.log(`🎤 Utterance started at: ${now}ms`)
          } else if (message.type === 'utterance_end') {
            onTimestampUpdate('utteranceEnd', now)
            console.log(`📝 STT completed at ${Date.now()}ms universal time`)
            onMessage?.(message)
          } else if (message.type === 'llm_start') {
            onTimestampUpdate('llmStart', now)
            console.log(`🧠 LLM processing started at: ${now}ms`)
          } else if (message.type === 'llm_complete') {
            onTimestampUpdate('llmEnd', now)
            console.log(`🧠 LLM completed`)
          } else if (message.type === 'tts_start') {
            onTimestampUpdate('ttsStart', now)
            console.log(`🗣️ TTS processing started at: ${now}ms`)
          } else if (message.type === 'audio_chunk') {
            console.log(
              `🎵 Audio chunk received at: ${now}ms for task ${message.task_id}`
            )

            setTimestamps((prev) => {
              if (!prev.firstAudioChunk) {
                const ttsLatency = now - (prev.ttsStart || now)
                const totalResTime = now - (prev.utteranceEnd || now)
                console.log(
                  `🎵 First audio chunk in: ${ttsLatency.toFixed(
                    2
                  )}ms after ${totalResTime.toFixed(
                    2
                  )}ms of utterance end for task ${
                    message.task_id
                  } and at ${Date.now()}ms universal time`
                )
                return { ...prev, firstAudioChunk: now }
              }
              return { ...prev, lastAudioChunk: now }
            })
            onMessage?.(message)
          } else if (message.type === 'audio_interrupt') {
            console.log('🛑 Audio interrupt received')
            onMessage?.(message)
            onResetTimestamps?.()
          }
        } catch (e) {
          console.error('WebSocket message error:', e)
        }
      }

      wsRef.current = newWs
    })
  }, [onMessage, onTimestampUpdate, onResetTimestamps])

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log('Disconnecting WebSocket...')
      wsRef.current.close()
      wsRef.current = null
      setWsStatus('disconnected')
      console.log('WebSocket disconnected manually.')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    wsStatus,
    wsRef,
    connectWebSocket,
    disconnectWebSocket
  }
}
