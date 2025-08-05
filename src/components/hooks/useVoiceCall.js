import { useState, useCallback } from 'react'
import { useWebSocket } from './useWebSocket.js'
import { useAudioRecording } from './useAudioRecording.js'
import { useAudioPlayback } from './useAudioPlayback.js'
import { usePerformanceMetrics } from './usePerformanceMetrics.js'

export const useVoiceCall = () => {
  const [callStatus, setCallStatus] = useState('idle')
  const [sttTranscript, setSttTranscript] = useState('')
  const {
    timestamps,
    metrics,
    resetTimestamps,
    updateTimestamp,
    calculateMetrics,
    setTimestamps
  } = usePerformanceMetrics()

  const { stopCurrentAudio, playMP3AudioChunk } = useAudioPlayback({
    onTimestampUpdate: updateTimestamp,
    onCalculateMetrics: calculateMetrics
  })

  const handleWebSocketMessage = useCallback(
    (message) => {
      if (message.type === 'utterance_end') {
        setSttTranscript(message.response)
      } else if (message.type === 'audio_chunk' && message.data) {
        playMP3AudioChunk(message.data)
      } else if (message.type === 'audio_interrupt') {
        stopCurrentAudio()
      }
    },
    [playMP3AudioChunk, stopCurrentAudio]
  )

  const handleFirstAudioChunk = useCallback(
    (timestamp) => {
      setTimestamps((prev) => {
        if (!prev.firstAudioChunk) {
          const ttsLatency = timestamp - (prev.ttsStart || timestamp)
          console.log(`🎵 First audio chunk in: ${ttsLatency.toFixed(2)}ms`)
          return { ...prev, firstAudioChunk: timestamp }
        }
        return prev
      })
    },
    [setTimestamps]
  )

  const { wsStatus, wsRef, connectWebSocket, disconnectWebSocket } =
    useWebSocket({
      onMessage: handleWebSocketMessage,
      onTimestampUpdate: updateTimestamp,
      onResetTimestamps: resetTimestamps,
      timestamps: timestamps,
      setTimestamps: setTimestamps
    })

  const { micStatus, recordingStatus, startRecording, stopRecording } =
    useAudioRecording()

  const startCall = useCallback(async () => {
    if (callStatus === 'connecting' || callStatus === 'connected') {
      console.warn('Call is already in progress or connecting.')
      return
    }

    setCallStatus('connecting')

    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.log('Connecting to WebSocket...')
        await connectWebSocket()
        console.log('WebSocket connected successfully!')
      }

      if (recordingStatus !== 'recording') {
        console.log('Starting recording...')
        await startRecording(wsRef.current)
      }

      setCallStatus('connected')
      console.log('Call started successfully!')
      return true
    } catch (error) {
      console.error('Failed to start call:', error)
      setCallStatus('idle')
      alert(`Failed to start call: ${error.message}`)
      return false
    }
  }, [callStatus, wsRef, connectWebSocket, recordingStatus, startRecording])

  const stopCall = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      stopRecording()
      disconnectWebSocket()
      setCallStatus('idle')
    } else {
      console.warn('WebSocket is not connected, cannot stop call.')
    }
  }, [wsRef, stopRecording, disconnectWebSocket])

  return {
    // States
    callStatus,
    wsStatus,
    micStatus,
    recordingStatus,
    sttTranscript,
    timestamps,
    metrics,

    // Actions
    startCall,
    stopCall,
    resetTimestamps,

    // WebSocket
    wsRef
  }
}
