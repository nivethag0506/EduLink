import { getImageUrl } from "../utils/getImageUrl";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { HiOutlinePaperAirplane, HiOutlineVideoCamera, HiOutlinePhone, HiOutlineMagnifyingGlass, HiOutlineChevronLeft } from 'react-icons/hi2';

const Chat = () => {
    const { user } = useAuth();
    const { socket, onlineUsers } = useSocket();
    const [searchParams] = useSearchParams();
    const initialUserId = searchParams.get('userId');
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [collegeUsers, setCollegeUsers] = useState([]);
    const [typing, setTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        API.get('/chat').then(res => setConversations(res.data)).catch(() => { });
        API.get('/users/college').then(res => {
            const users = res.data.filter(u => u._id !== user._id);
            setCollegeUsers(users);
            if (initialUserId) {
                const targetUser = users.find(u => u._id === initialUserId);
                if (targetUser) setSelectedUser(targetUser);
            }
        }).catch(() => { });
    }, [initialUserId, user._id]);

    useEffect(() => {
        if (selectedUser) {
            API.get(`/chat/${selectedUser._id}`).then(res => setMessages(res.data)).catch(() => { });
        }
    }, [selectedUser]);

    useEffect(() => {
        if (!socket) return;
        socket.on('receiveMessage', (msg) => {
            if (selectedUser && (msg.senderId === selectedUser._id)) {
                setMessages(prev => [...prev, msg]);
            }
            API.get('/chat').then(res => setConversations(res.data)).catch(() => { });
        });
        socket.on('userTyping', (data) => {
            if (selectedUser && data.userId === selectedUser._id) setTyping(true);
        });
        socket.on('userStopTyping', (data) => {
            if (selectedUser && data.userId === selectedUser._id) setTyping(false);
        });
        return () => {
            socket.off('receiveMessage');
            socket.off('userTyping');
            socket.off('userStopTyping');
        };
    }, [socket, selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedUser || !socket) return;
        socket.emit('sendMessage', { receiverId: selectedUser._id, message: newMessage });
        setMessages(prev => [...prev, { senderId: user._id, receiverId: selectedUser._id, message: newMessage, createdAt: new Date() }]);
        setNewMessage('');
        socket.emit('stopTyping', { receiverId: selectedUser._id });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket && selectedUser) {
            socket.emit('typing', { receiverId: selectedUser._id });
            clearTimeout(window._typingTimeout);
            window._typingTimeout = setTimeout(() => socket.emit('stopTyping', { receiverId: selectedUser._id }), 1500);
        }
    };

    const isOnline = (userId) => onlineUsers.includes(userId);

    const chatContacts = [...new Map(
        [...conversations.map(c => c.user), ...collegeUsers].filter(Boolean).map(u => [u._id, u])
    ).values()];

    const filteredContacts = chatContacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div className="flex h-[calc(100vh-8rem)] gap-0 md:gap-6 text-slate-800 animate-fade-in">
            {/* Contact list */}
            <div className={`w-full md:w-80 card border border-slate-100 rounded-3xl p-0 overflow-hidden flex-col shrink-0 bg-white ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">Messages</h2>
                        <span className="badge-primary text-[10px]">{onlineUsers.length} online</span>
                    </div>
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input-field text-xs pl-9 py-2 bg-white" 
                            placeholder="Search chats..." 
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {filteredContacts.map(contact => (
                        <button key={contact._id} onClick={() => setSelectedUser(contact)}
                            className={`w-full flex items-center gap-3.5 px-5 py-4 hover:bg-slate-50 transition-all text-left border-l-2 cursor-pointer ${selectedUser?._id === contact._id ? 'bg-primary/5 border-primary' : 'border-transparent'}`}>
                            <div className="relative shrink-0">
                                <img
                                    src={contact.profilePhoto ? getImageUrl(contact.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=6366f1&color=fff`}
                                    className="w-10 h-10 rounded-xl object-cover"
                                    alt=""
                                />
                                {isOnline(contact._id) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{contact.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{contact.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div className={`flex-1 card border border-slate-100 rounded-3xl p-0 overflow-hidden flex-col bg-white ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedUser(null)} className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200">
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <img
                                        src={selectedUser.profilePhoto ? getImageUrl(selectedUser.profilePhoto) : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=6366f1&color=fff`}
                                        className="w-10 h-10 rounded-xl object-cover"
                                        alt=""
                                    />
                                    {isOnline(selectedUser._id) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{selectedUser.name}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
                                        {isOnline(selectedUser._id) ? <span className="text-emerald-600">Active Now</span> : 'Offline'}
                                        {typing ? <span className="text-primary ml-1">· typing...</span> : ''}
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.senderId === user._id ? 'bg-primary text-white rounded-br-none shadow-primary/10' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                            <input
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                className="input-field text-xs bg-white"
                                placeholder="Type a message..."
                            />
                            <button onClick={sendMessage} className="btn-primary px-5 cursor-pointer">
                                <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50">
                        <div className="text-center max-w-sm px-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <HiOutlinePaperAirplane className="w-7 h-7 text-primary/65 rotate-90" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-base">Select a conversation</h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">Choose someone from the college directory on the left to start collaborating in real-time.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
