import React, { useState, useRef, useCallback } from 'react';

const VoiceRecorder = ({ onRecordingComplete, onAudioChunk, isGenerating, hasExistingDiagram }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioLevelTimerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    if (isGenerating) return;

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Set up audio analysis for visual feedback
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Set up MediaRecorder for streaming
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          
          // Stream audio chunks in real-time if callback provided
          if (onAudioChunk && isStreaming) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Chunk = reader.result.split(',')[1];
              onAudioChunk(base64Chunk);
            };
            reader.readAsDataURL(event.data);
          }
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          console.log('Audio blob size:', audioBlob.size);
          
          if (audioBlob.size === 0) {
            console.error('Audio blob is empty');
            alert('Recording failed: No audio data captured');
            return;
          }
          
          // Convert directly to base64 without WAV conversion for now
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1];
            console.log('Base64 audio length:', base64Audio.length);
            console.log('Base64 audio sample:', base64Audio.substring(0, 100));
            onRecordingComplete(base64Audio);
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            alert('Failed to convert audio to base64');
          };
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error in onstop handler:', error);
          alert('Failed to process recording');
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      setIsStreaming(true);
      
      // Start recording with small time slices for streaming (500ms chunks)
      mediaRecorder.start(500);

      // Start timers
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Audio level monitoring
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255); // Normalize to 0-1
        }
      };

      audioLevelTimerRef.current = setInterval(updateAudioLevel, 100);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  }, [isGenerating, onRecordingComplete, isStreaming, onAudioChunk]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsStreaming(false);
      setAudioLevel(0);
      
      // Clear timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
    }
  }, [isRecording]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    startRecording();
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    stopRecording();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    startRecording();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopRecording();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <span>🎤</span>
        <span>
          {hasExistingDiagram 
            ? "Hold to record voice command for diagram editing" 
            : "Hold to record voice command to create diagram"
          }
        </span>
      </div>
      
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop if mouse leaves button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={isGenerating}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: isRecording ? '#dc3545' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isGenerating ? 0.6 : 1,
          transition: 'all 0.2s ease',
          userSelect: 'none',
          boxShadow: isRecording ? '0 0 20px rgba(220, 53, 69, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {isRecording ? (
          <>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'white',
              borderRadius: '2px',
              animation: 'pulse 1s infinite'
            }} />
            <span>Recording... {formatTime(recordingTime)} {isStreaming && '(Streaming)'}</span>
          </>
        ) : isGenerating ? (
          <span>Processing...</span>
        ) : (
          <>
            <span style={{ fontSize: '20px' }}>🎤</span>
            <span>Hold to Record</span>
          </>
        )}
      </button>

      {/* Audio Level Indicator */}
      {isRecording && (
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#eee',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${audioLevel * 100}%`,
            height: '100%',
            backgroundColor: '#ff4444',
            transition: 'width 0.1s',
            borderRadius: '2px'
          }} />
        </div>
      )}

      {/* Instructions */}
      <div style={{
        fontSize: '12px',
        color: '#888',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        <p style={{ margin: '0 0 4px 0' }}>
          💡 <strong>Tip:</strong> Speak clearly and describe what you want to add or modify
        </p>
        <p style={{ margin: 0 }}>
          Examples: "Add a start node" • "Connect process A to decision B" • "Delete the database node"
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecorder;