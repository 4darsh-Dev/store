import { useState, useRef, useCallback } from 'react'
import { AUDIO_CONFIG } from '../utils/constants.js'

export const useAudioRecording = () => {
  const [micStatus, setMicStatus] = useState('idle')
  const [recordingStatus, setRecordingStatus] = useState('idle')
  const mediaRecorderRef = useRef(null)
  const audioStreamRef = useRef(null)

  const startRecording = useCallback(
    async (wsReference = null) => {
      if (!wsReference || wsReference.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket not ready for recording')
        return
      }

      if (recordingStatus === 'recording') {
        console.log('Already recording.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: AUDIO_CONFIG.RECORDING
        })

        audioStreamRef.current = stream
        setMicStatus('granted')

        mediaRecorderRef.current = new MediaRecorder(
          stream,
          AUDIO_CONFIG.MEDIA_RECORDER
        )

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (
            event.data.size > 0 &&
            wsReference.readyState === WebSocket.OPEN
          ) {
            wsReference.send(event.data)
          }
        }

        mediaRecorderRef.current.onstop = () => {
          console.log('MediaRecorder stopped.')

          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => {
              track.stop()
              console.log('Audio track stopped:', track.kind)
            })
            audioStreamRef.current = null
          }

          if (wsReference && wsReference.readyState === WebSocket.OPEN) {
            wsReference.send(JSON.stringify({ type: 'audio_end' }))
            console.log('Sent audio_end signal to backend.')
          }

          setRecordingStatus('idle')
        }

        mediaRecorderRef.current.start(AUDIO_CONFIG.CHUNK_INTERVAL)
        setRecordingStatus('recording')
        console.log('Recording started...')
      } catch (err) {
        console.error('Error accessing microphone:', err)
        setMicStatus('denied')
        alert(
          'Please allow microphone access to record audio. Error: ' +
            err.message
        )
      }
    },
    [recordingStatus]
  )

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop()
      setRecordingStatus('processing')
      console.log('Recording stopped, processing...')
    }
  }, [])

  return {
    micStatus,
    recordingStatus,
    startRecording,
    stopRecording
  }
}
