// QR Scanner for Attendance
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';
import jsQR from 'jsqr';

function QRScanner() {
  const navigate = useNavigate();
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Camera scanning
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);

  // Attendance dashboard
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    fetchOrganizerEvents();
    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchOrganizerEvents = async () => {
    const token = localStorage.getItem('organizerToken');
    try {
      const response = await axios.get(`${API_URL}/events/my-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events');
    }
  };

  const fetchAttendanceStats = async (eventId) => {
    if (!eventId) {
      setAttendanceStats(null);
      return;
    }
    
    const token = localStorage.getItem('organizerToken');
    try {
      const response = await axios.get(`${API_URL}/registrations/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const regs = response.data.registrations || [];
      setAttendanceStats({
        total: regs.length,
        attended: regs.filter(r => r.attended).length,
        notAttended: regs.filter(r => !r.attended).length,
        registrations: regs
      });
    } catch (err) {
      console.error('Failed to fetch attendance stats');
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendanceStats(selectedEvent);
    }
  }, [selectedEvent]);

  // Start camera
  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      console.log('Camera stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      
      streamRef.current = stream;
      scanningRef.current = true;
      setCameraActive(true);
      setScanMode('camera');
      
      // Wait a bit for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Attaching stream to video element');
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            console.log('Video playing successfully');
            // Start scanning loop
            setTimeout(() => {
              console.log('Starting scan loop');
              requestAnimationFrame(scanQRCode);
            }, 500);
          }).catch(err => {
            console.error('Error playing video:', err);
            setError('Failed to play video stream');
          });
        } else {
          console.error('Video ref is null');
          setError('Video element not found');
        }
      }, 100);
    } catch (err) {
      setError('Failed to access camera. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanMode('manual');
  };

  // Scan QR code from video frame
  const scanQRCode = async () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
      console.log('Scan conditions not met:', { scanning: scanningRef.current, hasVideo: !!videoRef.current, hasCanvas: !!canvasRef.current });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data and try to decode QR
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR library to decode QR code
      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });
        
        if (code && code.data) {
          console.log('QR Code detected:', code.data);
          const qrData = code.data;
          
          let ticketId = null;
          
          // Try to parse as JSON first
          try {
            const parsed = JSON.parse(qrData);
            if (parsed.ticketId) {
              ticketId = parsed.ticketId;
            }
          } catch (e) {
            // Not JSON, try regex pattern
            const ticketMatch = qrData.match(/TKT-[A-Z0-9]+/);
            if (ticketMatch) {
              ticketId = ticketMatch[0];
            }
          }
          
          if (ticketId) {
            console.log('Valid ticket found:', ticketId);
            setTicketId(ticketId);
            stopCamera();
            handleValidate(ticketId);
            return;
          } else {
            console.log('QR code data does not contain valid ticket ID:', qrData);
          }
        }
      } catch (err) {
        console.error('QR code detection error:', err);
      }
    }
    
    // Continue scanning
    if (scanningRef.current) {
      requestAnimationFrame(scanQRCode);
    }
  };

  // Handle file upload for QR image
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });
        
        if (code && code.data) {
          const qrData = code.data;
          let ticketId = null;
          
          // Try to parse as JSON first
          try {
            const parsed = JSON.parse(qrData);
            if (parsed.ticketId) {
              ticketId = parsed.ticketId;
            }
          } catch (e) {
            // Not JSON, try regex pattern
            const ticketMatch = qrData.match(/TKT-[A-Z0-9]+/);
            if (ticketMatch) {
              ticketId = ticketMatch[0];
            }
          }
          
          if (ticketId) {
            setTicketId(ticketId);
            handleValidate(ticketId);
            return;
          }
        }
        setError('No valid QR code found in image');
      } catch (err) {
        setError('Failed to scan QR code from image');
        console.error('QR scan error:', err);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleValidate = async (id = ticketId) => {
    if (!id) {
      setError('Please enter a ticket ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const token = localStorage.getItem('organizerToken');
    
    try {
      const response = await axios.post(
        `${API_URL}/registrations/validate-qr`,
        { ticketId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
      setLoading(false);
      
      // Add to recent scans
      if (response.data.valid) {
        setRecentScans(prev => [{
          ticketId: id,
          participant: response.data.participant?.name,
          event: response.data.event?.name,
          time: new Date().toLocaleTimeString(),
          alreadyScanned: response.data.alreadyScanned
        }, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid ticket');
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (registrationId) => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.post(
        `${API_URL}/registrations/${registrationId}/attendance`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult({
        ...result,
        message: 'Attendance marked successfully!',
        alreadyScanned: true
      });
      
      // Refresh attendance stats
      if (selectedEvent) {
        fetchAttendanceStats(selectedEvent);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  // Manual override for attendance
  const handleManualOverride = async (registrationId, reason) => {
    const token = localStorage.getItem('organizerToken');
    
    try {
      await axios.post(
        `${API_URL}/registrations/${registrationId}/attendance`,
        { manualOverride: true, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Manual override applied successfully');
      if (selectedEvent) {
        fetchAttendanceStats(selectedEvent);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply manual override');
    }
  };

  // Export attendance CSV
  const handleExportAttendance = () => {
    if (!attendanceStats?.registrations?.length) {
      alert('No attendance data to export');
      return;
    }
    
    const headers = ['Name', 'Email', 'Ticket ID', 'Attendance', 'Attended At'];
    const rows = attendanceStats.registrations.map(reg => [
      `${reg.userId?.firstName || ''} ${reg.userId?.lastName || ''}`,
      reg.userId?.email || '',
      reg.ticketId || '',
      reg.attended ? 'Present' : 'Absent',
      reg.attendedAt ? new Date(reg.attendedAt).toLocaleString() : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance_report.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black text-white p-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Organizer Panel</h1>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">QR Code Scanner & Attendance</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">Scan Ticket</h2>
            
            {/* Scan Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { stopCamera(); setScanMode('manual'); }}
                className={`px-4 py-2 border-2 border-black ${scanMode === 'manual' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                Manual Entry
              </button>
              <button
                onClick={startCamera}
                className={`px-4 py-2 border-2 border-black ${scanMode === 'camera' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                📷 Camera Scan
              </button>
              <label className="px-4 py-2 border-2 border-black hover:bg-gray-100 cursor-pointer">
                📁 Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* Camera View */}
            {scanMode === 'camera' && (
              <div className="mb-4">
                <div className="relative border-2 border-black" style={{ minHeight: '300px', backgroundColor: '#000' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    style={{ minHeight: '300px', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                    playsInline
                    autoPlay
                    muted
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-4 border-green-500/50 rounded-lg"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Point camera at QR code</p>
                <button
                  onClick={stopCamera}
                  className="mt-2 px-4 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700"
                >
                  Stop Camera
                </button>
              </div>
            )}
            
            {/* Manual Entry */}
            {scanMode === 'manual' && (
              <div className="mb-6">
                <label className="block font-bold mb-2">Ticket ID</label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter ticket ID (e.g., TKT-ABC123)"
                  className="w-full border-2 border-black p-2 mb-4"
                />
                
                <button
                  onClick={() => handleValidate()}
                  disabled={loading}
                  className="w-full bg-black text-white p-3 border-2 border-black hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {loading ? 'Validating...' : 'Validate Ticket'}
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-4">
                {error}
              </div>
            )}

            {result && result.valid && (
              <div className="bg-green-100 border-2 border-green-500 p-4">
                <h3 className="font-bold text-lg mb-2">✓ Valid Ticket</h3>
                <p><strong>Participant:</strong> {result.participant?.name}</p>
                <p><strong>Email:</strong> {result.participant?.email}</p>
                <p><strong>Event:</strong> {result.event?.name}</p>
                <p><strong>Already Scanned:</strong> {result.alreadyScanned ? `Yes (at ${new Date(result.scannedAt).toLocaleString()})` : 'No'}</p>
                
                {!result.alreadyScanned && (
                  <button
                    onClick={() => handleMarkAttendance(result.registrationId)}
                    className="mt-4 w-full bg-green-600 text-white p-2 border-2 border-green-700 hover:bg-green-700"
                  >
                    Mark Attendance
                  </button>
                )}

                {result.message && (
                  <p className="mt-2 text-green-700 font-bold">{result.message}</p>
                )}
              </div>
            )}
            
            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-2">Recent Scans</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recentScans.map((scan, i) => (
                    <div key={i} className="text-sm p-2 bg-gray-100 border border-gray-300">
                      <span className="font-bold">{scan.participant}</span> - {scan.time}
                      {scan.alreadyScanned && <span className="text-yellow-600 ml-2">(duplicate)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attendance Dashboard */}
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">Live Attendance Dashboard</h2>
            
            <div className="mb-4">
              <label className="block font-bold mb-2">Select Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full border-2 border-black p-2"
              >
                <option value="">-- Select an event --</option>
                {events.filter(e => ['published', 'ongoing'].includes(e.status)).map(event => (
                  <option key={event._id} value={event._id}>{event.name}</option>
                ))}
              </select>
            </div>
            
            {attendanceStats && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="border border-gray-300 p-3 text-center">
                    <p className="text-2xl font-bold">{attendanceStats.total}</p>
                    <p className="text-sm text-gray-600">Total Registered</p>
                  </div>
                  <div className="border border-gray-300 p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{attendanceStats.attended}</p>
                    <p className="text-sm text-gray-600">Scanned</p>
                  </div>
                  <div className="border border-gray-300 p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{attendanceStats.notAttended}</p>
                    <p className="text-sm text-gray-600">Not Yet Scanned</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-4 bg-gray-200 border border-black">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${(attendanceStats.attended / attendanceStats.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-center mt-1">
                    {((attendanceStats.attended / attendanceStats.total) * 100).toFixed(1)}% checked in
                  </p>
                </div>
                
                <button
                  onClick={handleExportAttendance}
                  className="w-full px-4 py-2 border-2 border-black hover:bg-gray-100 mb-4"
                >
                  Export Attendance CSV
                </button>
                
                {/* Not Scanned List */}
                <div>
                  <h3 className="font-bold mb-2">Not Yet Scanned ({attendanceStats.notAttended})</h3>
                  <div className="max-h-60 overflow-y-auto border border-gray-300">
                    {attendanceStats.registrations
                      .filter(r => !r.attended)
                      .map(reg => (
                        <div key={reg._id} className="p-2 border-b border-gray-200 flex justify-between items-center">
                          <div>
                            <p className="font-bold">{reg.userId?.firstName} {reg.userId?.lastName}</p>
                            <p className="text-sm text-gray-600">{reg.userId?.email}</p>
                          </div>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for manual override:');
                              if (reason) handleManualOverride(reg._id, reason);
                            }}
                            className="text-xs px-2 py-1 border border-black hover:bg-gray-100"
                          >
                            Manual Check-in
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="px-4 py-2 border-2 border-black hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
