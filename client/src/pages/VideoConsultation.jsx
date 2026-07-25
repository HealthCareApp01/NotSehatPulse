import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';
import { moveToLast } from '../store/slices/appointmentSlice';

const VideoConsultation = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const apptId = searchParams.get('apptId');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const ringbackIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [timer, setTimer] = useState(600);
  const [patientJoined, setPatientJoined] = useState(false);
  const [callDeclined, setCallDeclined] = useState(false);
  const [callFailed, setCallFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    let isMounted = true;
    socketRef.current = io((import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}`));

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;

        socketRef.current.emit('join-room', roomId);

        if (user.role === 'Doctor') {
          socketRef.current.emit('doctor-calling', { patientId, roomId, apptId, doctorName: user.name });
        } else {
          socketRef.current.emit('patient-joined', { roomId });
        }

        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            {
              urls: "stun:openrelay.metered.ca:80",
            },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turns:openrelay.metered.ca:443?transport=tcp",
              username: "openrelayproject",
              credential: "openrelayproject",
            }
          ]
        };
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit('ice-candidate', { roomId, candidate: event.candidate });
          }
        };

        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'failed') {
            setCallFailed(true);
          }
        };

        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === 'failed') {
            setCallFailed(true);
          }
        };

        const pendingCandidates = [];

        // Socket listeners
        socketRef.current.on('patient-joined-room', async () => {
          setPatientJoined(true);
          if (user.role === 'Doctor') {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketRef.current.emit('offer', { roomId, offer });
          }
        });

        socketRef.current.on('offer', async (offer) => {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socketRef.current.emit('answer', { roomId, answer });

          while (pendingCandidates.length > 0) {
            await peerConnection.addIceCandidate(pendingCandidates.shift());
          }
        });

        socketRef.current.on('answer', async (answer) => {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

          while (pendingCandidates.length > 0) {
            await peerConnection.addIceCandidate(pendingCandidates.shift());
          }
        });

        socketRef.current.on('ice-candidate', async (candidate) => {
          try {
            const iceCandidate = new RTCIceCandidate(candidate);
            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(iceCandidate);
            } else {
              pendingCandidates.push(iceCandidate);
            }
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        });

        socketRef.current.on('call-ended', () => {
          alert("The other party has ended the call.");
          navigate('/appointments');
        });

        socketRef.current.on('call-declined', () => {
          setCallDeclined(true);
          setTimeout(() => {
            navigate('/appointments');
          }, 3000);
        });

      } catch (err) {
        console.error("Error accessing media devices.", err);
        alert("Please allow camera and microphone access to use this feature.");
      }
    };

    initCall();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, patientId, apptId, retryKey]); // Re-run if these change, but typically they don't

  // 15 seconds connection timeout if peers have matched but stream fails to connect
  useEffect(() => {
    let timeout;
    if (patientJoined && !remoteStream && !callFailed) {
      timeout = setTimeout(() => {
        setCallFailed(true);
      }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [patientJoined, remoteStream, callFailed]);

  // Ringback Tone Effect for Doctor
  useEffect(() => {
    if (user.role === 'Doctor' && !patientJoined) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      const playRingback = () => {
        const playTone = (startOffset, duration) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 440;
          osc2.frequency.value = 480;

          gain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
          gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startOffset + 0.05);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + startOffset + duration - 0.05);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startOffset + duration);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(ctx.currentTime + startOffset);
          osc2.start(ctx.currentTime + startOffset);
          osc1.stop(ctx.currentTime + startOffset + duration);
          osc2.stop(ctx.currentTime + startOffset + duration);
        };

        playTone(0, 0.4);
        playTone(0.6, 0.4);
      };

      playRingback();
      ringbackIntervalRef.current = setInterval(playRingback, 3000);
    } else {
      if (ringbackIntervalRef.current) {
        clearInterval(ringbackIntervalRef.current);
        ringbackIntervalRef.current = null;
      }
    }

    return () => {
      if (ringbackIntervalRef.current) {
        clearInterval(ringbackIntervalRef.current);
        ringbackIntervalRef.current = null;
      }
    };
  }, [user.role, patientJoined]);

  // Doctor timer logic
  useEffect(() => {
    let interval;
    if (user.role === 'Doctor' && !patientJoined && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (user.role === 'Doctor' && !patientJoined && timer === 0) {
      // Time is up, move patient to last
      alert("Patient did not join in time. Moving to the end of the queue.");
      dispatch(moveToLast(apptId)).unwrap().then(() => {
        endCall();
      }).catch(err => {
        console.error(err);
        endCall();
      });
    }
    return () => clearInterval(interval);
  }, [timer, patientJoined, user, apptId, dispatch]);

  const endCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('end-call', { roomId });
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/appointments');
  };

  const ringPatient = () => {
    if (socketRef.current && user.role === 'Doctor') {
      socketRef.current.emit('doctor-calling', { patientId, roomId, apptId, doctorName: user.name });
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
      setIsMuted(!localStream.getAudioTracks()[0].enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
      setIsVideoOff(!localStream.getVideoTracks()[0].enabled);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden z-[9999]">
      {/* Header */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md z-10 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Consultation Room</h1>
          {user.role === 'Doctor' && !patientJoined && (
            <div className="flex items-center gap-4 mt-1">
              <p className="text-rose-400 text-sm font-mono">
                Waiting for patient: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </p>
              <button onClick={ringPatient} className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-bold transition">Ring Again</button>
            </div>
          )}
          {patientJoined && <p className="text-emerald-400 text-sm mt-1">Patient Joined</p>}
        </div>
        <button onClick={endCall} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all">
          <PhoneOff size={20} /> End Call
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 min-h-0 p-4 sm:p-6 flex gap-8 relative">
        {/* Remote Video (Main) */}
        <div className="flex-1 bg-black rounded-[32px] overflow-hidden border border-white/10 relative shadow-2xl flex items-center justify-center">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/20 mx-auto mb-4">
                <VideoIcon size={48} />
              </div>
              <p className="text-white/40 font-medium text-lg">Waiting for remote video...</p>
            </div>
          )}

          {/* Declined Overlay */}
          {callDeclined && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-[32px]">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-4 animate-pulse">
                <PhoneOff size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Call Declined</h2>
              <p className="text-white/60 font-medium">The patient has rejected the call.</p>
              <p className="text-white/40 text-sm mt-4">Returning to appointments in 3s...</p>
            </div>
          )}

          {/* Failed Overlay */}
          {callFailed && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-[32px] p-6 text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mb-4 animate-bounce">
                <PhoneOff size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Connection Failed</h2>
              <p className="text-white/60 font-medium max-w-md">Could not establish a stable audio/video connection. Please check your network and retry.</p>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setCallFailed(false);
                    setRemoteStream(null);
                    setPatientJoined(false);
                    setRetryKey(prev => prev + 1);
                  }}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-full font-bold transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
                <button
                  onClick={endCall}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-bold transition-all cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute bottom-8 right-8 w-48 sm:w-64 h-28 sm:h-36 bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-40">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-black/60 backdrop-blur-lg flex items-center justify-center gap-6 z-10 flex-shrink-0">
        <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
          {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default VideoConsultation;
