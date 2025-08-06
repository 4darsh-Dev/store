'use client'
import { VoiceInterface } from './VoiceInterface.jsx'
import { useVoiceCall } from '../hooks/useVoiceCall.js'

const ChatbotMain = () => {
  const {
    wsStatus,
    startCall,
    stopCall,
    wsRef
  } = useVoiceCall()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        width: '100px',
        height: '100px',
        zIndex: 1000,
        // boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        borderRadius: '16px',
        // background: '#fff',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <VoiceInterface
        onStartCall={startCall}
        onStopCall={stopCall}
        wsStatus={wsStatus}
        stage='idle'
        wsRef={wsRef}
      />
    </div>
  )
}

export default ChatbotMain