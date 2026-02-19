
import { IoClose } from "react-icons/io5";

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Modal content */}
                <div className="relative bg-white rounded-3xl shadow-2xl border border-white overflow-hidden">
                    {/* Decorative Header Bar */}
                    <div className="h-2 bg-blue-600 w-full" />

                    {/* Modal header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-all active:scale-90"
                        >
                            <IoClose size={28} />
                        </button>
                    </div>
                    {/* Modal body */}
                    <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
