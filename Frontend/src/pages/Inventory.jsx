import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoCubeOutline, IoAddOutline, IoRemoveOutline, IoTimeOutline,
    IoSearchOutline, IoFilterCircleOutline, IoTrendingUpOutline, IoTrendingDownOutline,
    IoCloseOutline, IoCalendarOutline
} from 'react-icons/io5';

export default function Inventory() {
    const [assets, setAssets] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [txType, setTxType] = useState('All');

    // Modals
    const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [isRemoveStockModalOpen, setIsRemoveStockModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [modifyAmount, setModifyAmount] = useState('');
    const [modifyDescription, setModifyDescription] = useState('');
    
    // New Asset Form
    const [newAssetName, setNewAssetName] = useState('');
    const [newAssetQuantity, setNewAssetQuantity] = useState('');
    const [newAssetDesc, setNewAssetDesc] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetsRes, historyRes] = await Promise.all([
                api.get('Inventory'),
                api.get('Inventory/History')
            ]);
            if (assetsRes.data.isSuccess) setAssets(assetsRes.data.data);
            if (historyRes.data.isSuccess) setHistory(historyRes.data.data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('Inventory', {
                name: newAssetName,
                quantity: parseInt(newAssetQuantity) || 0,
                description: newAssetDesc
            });
            if (res.data.isSuccess) {
                setIsAddAssetModalOpen(false);
                setNewAssetName('');
                setNewAssetQuantity('');
                setNewAssetDesc('');
                fetchData();
            }
        } catch (err) {
            console.error('Add asset failed:', err);
        }
    };

    const handleModifyQuantity = async (e, amount, actionType) => {
        if (e) e.preventDefault();
        try {
            const res = await api.post('Inventory/ModifyQuantity', {
                assetId: selectedAsset.id,
                amount: parseInt(amount),
                description: modifyDescription
            });
            if (res.data.isSuccess) {
                setIsAddStockModalOpen(false);
                setIsRemoveStockModalOpen(false);
                setModifyAmount('');
                setModifyDescription('');
                fetchData();
            }
        } catch (err) {
            console.error('Modify quantity failed:', err);
        }
    };

    const filteredAssets = assets.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHistory = history.filter(h => {
        if (selectedDate) {
            const txDate = new Date(h.date).toISOString().split('T')[0];
            if (txDate !== selectedDate) return false;
        }
        if (txType !== 'All' && h.type !== txType) return false;
        return true;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Inventory...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Main Inventory</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Manage assets and track item movements</p>
                </div>
                <button 
                    onClick={() => setIsAddAssetModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all active:scale-95"
                >
                    <IoAddOutline size={20} /> New Asset
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Assets List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl flex-1">
                            <IoSearchOutline className="text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search items..."
                                className="bg-transparent font-bold text-gray-900 outline-none w-full text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAssets.map(asset => (
                            <motion.div 
                                key={asset.id}
                                layoutId={`asset-${asset.id}`}
                                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                        <IoCubeOutline size={24} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">{asset.name}</h3>
                                <p className="text-xs text-gray-400 font-medium mb-6 line-clamp-2">{asset.description || 'No comments'}</p>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Stock</span>
                                        <span className={`text-2xl font-black ${asset.quantity > 0 ? 'text-gray-900' : 'text-rose-500'}`}>
                                            {asset.quantity}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { setSelectedAsset(asset); setIsRemoveStockModalOpen(true); }}
                                            className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-90"
                                            title="Remove stock"
                                        >
                                            <IoRemoveOutline size={20} />
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedAsset(asset); setIsAddStockModalOpen(true); }}
                                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all active:scale-90"
                                            title="Add stock"
                                        >
                                            <IoAddOutline size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* History Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <IoTimeOutline size={16} /> Movement Log
                            </h4>
                        </div>
                        {/* ... existing history filters ... */}

                        <div className="space-y-4 mb-6">
                             <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl">
                                <IoCalendarOutline className="text-gray-400" size={18} />
                                <input 
                                    type="date"
                                    className="bg-transparent font-black text-gray-900 outline-none w-full text-[10px] uppercase cursor-pointer"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl">
                                <IoFilterCircleOutline className="text-gray-400" size={18} />
                                <select 
                                    className="bg-transparent font-black text-gray-900 outline-none w-full text-[10px] uppercase cursor-pointer"
                                    value={txType}
                                    onChange={e => setTxType(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Addition">Addition</option>
                                    <option value="Removal">Removal</option>
                                    <option value="Correction">Correction</option>
                                </select>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {filteredHistory.map(item => (
                                <div key={item.id} className="py-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-black text-gray-900">{item.assetName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{item.description}</p>
                                        </div>
                                        <div className={`text-xs font-black px-2 py-1 rounded-lg ${item.quantityChanged > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {item.quantityChanged > 0 ? '+' : ''}{item.quantityChanged}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase">
                                        <span>{new Date(item.date).toLocaleDateString()}</span>
                                        <span>By {item.performedByUserName}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddAssetModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">New Asset</h2>
                                <button onClick={() => setIsAddAssetModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddAsset} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                                    <input 
                                        required
                                        type="text"
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:opacity-50"
                                        placeholder="e.g. Desk Fan, Master Bed"
                                        value={newAssetName}
                                        onChange={e => setNewAssetName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Quantity</label>
                                    <input 
                                        required
                                        type="number"
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold"
                                        placeholder="0"
                                        value={newAssetQuantity}
                                        onChange={e => setNewAssetQuantity(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Comment</label>
                                    <textarea 
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold min-h-[100px]"
                                        placeholder="Optional notes about this asset..."
                                        value={newAssetDesc}
                                        onChange={e => setNewAssetDesc(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs mt-4 hover:shadow-xl transition-all active:scale-95 leading-none">
                                    Add Asset
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isAddStockModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Add Stock</h2>
                                <button onClick={() => setIsAddStockModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm"><IoCubeOutline size={20} /></div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{selectedAsset?.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Current: {selectedAsset?.quantity} units</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity to Add</label>
                                    <input 
                                        required
                                        type="number"
                                        placeholder="e.g. 5"
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold"
                                        value={modifyAmount}
                                        onChange={e => setModifyAmount(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Note (Optional)</label>
                                    <input 
                                        type="text"
                                        placeholder="Reason for addition..."
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold"
                                        value={modifyDescription}
                                        onChange={e => setModifyDescription(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={(e) => handleModifyQuantity(e, Math.abs(parseInt(modifyAmount)))}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl shadow-emerald-500/20 mt-4 h-14"
                                >
                                    Add
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isRemoveStockModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Remove Stock</h2>
                                <button onClick={() => setIsRemoveStockModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm"><IoCubeOutline size={20} /></div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{selectedAsset?.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Current: {selectedAsset?.quantity} units</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity to Remove</label>
                                    <input 
                                        required
                                        type="number"
                                        placeholder="e.g. 2"
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold"
                                        value={modifyAmount}
                                        onChange={e => setModifyAmount(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Note (Optional)</label>
                                    <input 
                                        type="text"
                                        placeholder="Reason for removal..."
                                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold"
                                        value={modifyDescription}
                                        onChange={e => setModifyDescription(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={(e) => handleModifyQuantity(e, -Math.abs(parseInt(modifyAmount)))}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl shadow-rose-500/20 mt-4 h-14"
                                >
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
