'use client'
import { VoiceInterface } from "./components/VoiceInterface"
import { useVoiceCall } from './hooks/useVoiceCall.js'

const VoiceAssistant = () => {
  const {
    callStatus,
    wsStatus,
    micStatus,
    recordingStatus,
    sttTranscript,
    timestamps,
    metrics,
    startCall,
    stopCall,
    resetTimestamps,
    wsRef
  } = useVoiceCall()

  return (
    <VoiceInterface
      onStartCall={startCall}
      onStopCall={stopCall}
      wsStatus={wsStatus}
      stage='idle'
      wsRef={wsRef}
    />
  )
}

export default VoiceAssistant
