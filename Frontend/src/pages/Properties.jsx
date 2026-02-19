
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { IoAdd, IoPencil, IoTrash, IoBusiness } from "react-icons/io5";
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';

export default function Properties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await api.get('Property');
            if (response.data.isSuccess) {
                setProperties(response.data.data);
            } else {
                setError('Failed to load properties');
            }
        } catch (err) {
            setError('Error loading properties: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingProperty) {
                const response = await api.put(`Property/${editingProperty.id}`, { ...data, id: editingProperty.id });
                if (response.data.isSuccess) {
                    fetchProperties();
                    closeModal();
                }
            } else {
                const response = await api.post('Property/Create', data);
                if (response.data.isSuccess) {
                    fetchProperties();
                    closeModal();
                }
            }
        } catch (err) {
            alert('Error saving property: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await api.delete(`Property/${id}`);
                if (response.data.isSuccess) {
                    fetchProperties();
                }
            } catch (err) {
                alert('Error deleting property: ' + err.message);
            }
        }
    };

    const openModal = (property = null) => {
        setEditingProperty(property);
        if (property) {
            setValue('name', property.name);
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProperty(null);
        reset();
    };

    const filteredProperties = useMemo(() => {
        return properties.filter(property => {
            const searchLower = searchTerm.toLowerCase();
            return !searchTerm || property.name?.toLowerCase().includes(searchLower);
        });
    }, [properties, searchTerm]);

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Real Estate Properties</h1>
                    <p className="text-gray-500 mt-1">Organize and manage your primary property assets.</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary gap-2">
                    <IoAdd size={22} />
                    Add Property
                </button>
            </div>

            <div className="mb-6 space-y-4">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search properties by name..."
                />
                <div className="text-sm text-gray-500 font-medium">
                    Showing {filteredProperties.length} of {properties.length} properties
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="table-header w-20">ID</th>
                            <th className="table-header">Property Name</th>
                            <th className="table-header text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProperties.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-400 font-medium">
                                    {properties.length === 0
                                        ? 'No properties registered yet.'
                                        : 'No properties match your search.'}
                                </td>
                            </tr>
                        ) : (
                            filteredProperties.map((property) => (
                                <tr key={property.id} className="table-row">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-400">#{property.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{property.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(property)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <IoPencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(property.id)}
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
                title={editingProperty ? 'Modify Property Details' : 'Register New Property'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="field-group">
                        <div className="section-header">
                            <IoBusiness size={18} />
                            Property Identity
                        </div>
                        <div>
                            <label className="label-base">Property Display Name</label>
                            <input
                                type="text"
                                {...register('name', { required: 'Property Name is required' })}
                                className="input-base"
                                placeholder="e.g. Marina View Tower"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={closeModal} className="btn-secondary">Discard</button>
                        <button type="submit" className="btn-primary">
                            {editingProperty ? 'Save Changes' : 'Create Property'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
