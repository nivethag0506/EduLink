import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineVideoCamera, HiOutlineMicrophone } from 'react-icons/hi2';

const Call = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const audioOnly = searchParams.get('audioOnly') === 'true';
    const apiRef = useRef(null);

    useEffect(() => {
        const container = document.querySelector('#jitsi-container');
        if (!container || !window.JitsiMeetExternalAPI) {
            console.warn('Jitsi SDK not loaded yet');
            return;
        }

        const domain = 'meet.jit.si';
        const options = {
            roomName: id,
            width: '100%',
            height: window.innerHeight - 200,
            parentNode: container,
            userInfo: {
                displayName: user?.name || 'Guest',
                email: user?.email || '',
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: audioOnly, // audio-only mode
                prejoinPageEnabled: false,
                disableDeepLinking: true,
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                BRAND_WATERMARK_LINK: '',
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop',
                    'fullscreen', 'fodeviceselection', 'hangup', 'chat',
                    'settings', 'raisehand', 'videoquality', 'filmstrip',
                    'tileview', 'videobackgroundblur', 'help', 'mute-everyone',
                ],
            },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addEventListener('videoConferenceLeft', () => {
            navigate(-1);
        });

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
        };
    }, [id, user, navigate, audioOnly]);

    return (
        <div className="max-w-5xl mx-auto py-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        {audioOnly
                            ? <><HiOutlineMicrophone className="w-5 h-5 text-primary" /> Audio Call — CampusBridge</>
                            : <><HiOutlineVideoCamera className="w-5 h-5 text-primary" /> Video Call — CampusBridge</>
                        }
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {audioOnly ? 'You joined in audio-only mode.' : 'Full HD video session. Your camera & mic are active.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {audioOnly ? (
                        <a href={`/call/${id}`} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
                            <HiOutlineVideoCamera className="w-4 h-4" /> Switch to Video
                        </a>
                    ) : (
                        <a href={`/call/${id}?audioOnly=true`} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
                            <HiOutlineMicrophone className="w-4 h-4" /> Audio Only
                        </a>
                    )}
                    <button onClick={() => navigate(-1)} className="btn-secondary text-xs text-red-500 border-red-100 hover:bg-red-50 cursor-pointer">
                        Leave
                    </button>
                </div>
            </div>

            {/* Jitsi container */}
            <div
                id="jitsi-container"
                className="w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white"
                style={{ minHeight: '600px' }}
            />
        </div>
    );
};

export default Call;
