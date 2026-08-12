import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

const SearchModal = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    const handleSearch = useCallback(async (val) => {
        setQuery(val);
        if (!val.trim()) { setResults([]); return; }
        setSearching(true);
        try {
            const { data } = await API.get(`/users/college?search=${encodeURIComponent(val)}`);
            setResults(data);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    const goToProfile = (id) => {
        navigate(`/profile/${id}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
            onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-xl bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Search input */}
                <div className="flex items-center gap-3 p-4 border-b border-dark-border">
                    <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                        autoFocus
                        value={query}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Search people by name..."
                        className="flex-1 bg-transparent text-white text-base placeholder-gray-500 outline-none"
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); setResults([]); }} className="text-gray-500 hover:text-white">
                            <HiOutlineXMark className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-sm font-medium ml-2">
                        Esc
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {searching && (
                        <div className="text-center text-gray-500 text-sm py-8">Searching...</div>
                    )}

                    {!searching && query && results.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-8">No users found for "{query}"</div>
                    )}

                    {!searching && !query && (
                        <div className="text-center text-gray-600 text-sm py-10">
                            <HiOutlineMagnifyingGlass className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            Start typing to search your college community
                        </div>
                    )}

                    {results.map(u => (
                        <button
                            key={u._id}
                            onClick={() => goToProfile(u._id)}
                            className="w-full flex items-center gap-4 px-5 py-3 hover:bg-dark-hover transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                                {u.profilePhoto
                                    ? <img src={`/${u.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                                    : u.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm">{u.name}</p>
                                <p className="text-gray-400 text-xs">{u.role} · {u.branch}</p>
                            </div>
                            <span className="text-xs text-primary-light font-medium">View Profile →</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
