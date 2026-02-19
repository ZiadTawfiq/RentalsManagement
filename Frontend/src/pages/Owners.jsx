
import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { IoAdd, IoPencil, IoTrash, IoPerson } from "react-icons/io5";
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import PhoneInput from '../components/PhoneInput';
import { validatePhone } from '../utils/validation';

export default function Owners() {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOwner, setEditingOwner] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            const response = await api.get('Owner');
            if (response.data.isSuccess) {
                setOwners(response.data.data);
            } else {
                setError('Failed to load owners');
            }
        } catch (err) {
            setError('Error loading owners: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingOwner) {
                const response = await api.put(`Owner/${editingOwner.id}`, { ...data, id: editingOwner.id });
                if (response.data.isSuccess) {
                    fetchOwners();
                    closeModal();
                }
            } else {
                const response = await api.post('Owner', data);
                if (response.data.isSuccess) {
                    fetchOwners();
                    closeModal();
                }
            }
        } catch (err) {
            alert('Error saving owner: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this owner?')) {
            try {
                const response = await api.delete(`Owner/${id}`);
                if (response.data.isSuccess) {
                    fetchOwners();
                }
            } catch (err) {
                alert('Error deleting owner: ' + err.message);
            }
        }
    };

    const openModal = (owner = null) => {
        setEditingOwner(owner);
        if (owner) {
            setValue('name', owner.name);
            setValue('phoneNumber', owner.phoneNumber);
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOwner(null);
        reset();
    };

    const filteredOwners = useMemo(() => {
        return owners.filter(owner => {
            const searchLower = searchTerm.toLowerCase();
            return !searchTerm ||
                owner.name?.toLowerCase().includes(searchLower) ||
                owner.phoneNumber?.toLowerCase().includes(searchLower);
        });
    }, [owners, searchTerm]);

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Real Estate Owners</h1>
                    <p className="text-gray-500 mt-1">Manage unit owners and their contact information.</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary gap-2">
                    <IoAdd size={22} />
                    Add New Owner
                </button>
            </div>

            <div className="mb-6 space-y-4">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search owners by name or phone..."
                />
                <div className="text-sm text-gray-500 font-medium">
                    Showing {filteredOwners.length} of {owners.length} owners
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="table-header w-20">ID</th>
                            <th className="table-header">Owner Name</th>
                            <th className="table-header">Phone Number</th>
                            <th className="table-header text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredOwners.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                                    {owners.length === 0
                                        ? 'No owners available in the system.'
                                        : 'No owners match your search.'}
                                </td>
                            </tr>
                        ) : (
                            filteredOwners.map((owner) => (
                                <tr key={owner.id} className="table-row">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-400">#{owner.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{owner.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{owner.phoneNumber}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(owner)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <IoPencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(owner.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <IoTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingOwner ? 'Edit Owner Details' : 'Register New Owner'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="field-group">
                        <div className="section-header">
                            <IoPerson size={18} />
                            Owner Contact Details
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="label-base">Full Legal Name</label>
                                <input
                                    type="text"
                                    {...register('name', { required: 'Full Name is required' })}
                                    className="input-base"
                                    placeholder="e.g. Ziad Tawfik"
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>}
                            </div>

                            <div>
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    rules={{
                                        required: 'Phone Number is required',
                                        validate: validatePhone
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <PhoneInput
                                            label="Active Phone Number"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={closeModal} className="btn-secondary">
                            Discard
                        </button>
                        <button type="submit" className="btn-primary">
                            {editingOwner ? 'Update Records' : 'Save Owner'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
