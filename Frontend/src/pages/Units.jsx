
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { IoAdd, IoPencil, IoTrash, IoBusiness, IoPerson } from "react-icons/io5";
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';

export default function Units() {
    const [units, setUnits] = useState([]);
    const [properties, setProperties] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [unitsRes, propsRes, ownersRes] = await Promise.all([
                api.get('Unit'),
                api.get('Property'),
                api.get('Owner')
            ]);

            if (unitsRes.data.isSuccess) setUnits(unitsRes.data.data);
            if (propsRes.data.isSuccess) setProperties(propsRes.data.data);
            if (ownersRes.data.isSuccess) setOwners(ownersRes.data.data);

        } catch (err) {
            setError('Error loading data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                propertyId: parseInt(data.propertyId),
                ownerId: parseInt(data.ownerId)
            };

            if (editingUnit) {
                const response = await api.put(`Unit/${editingUnit.id}`, { ...payload, id: editingUnit.id });
                if (response.data.isSuccess) {
                    fetchData();
                    closeModal();
                }
            } else {
                const response = await api.post('Unit/Create', payload);
                if (response.data.isSuccess) {
                    fetchData();
                    closeModal();
                }
            }
        } catch (err) {
            alert('Error saving unit: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this unit?')) {
            try {
                const response = await api.delete(`Unit/${id}`);
                if (response.data.isSuccess) {
                    fetchData();
                }
            } catch (err) {
                alert('Error deleting unit: ' + err.message);
            }
        }
    };

    const openModal = (unit = null) => {
        setEditingUnit(unit);
        if (unit) {
            setValue('code', unit.code);
            setValue('propertyId', unit.propertyId);
            setValue('ownerId', unit.ownerId);
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUnit(null);
        reset();
    };

    const filteredUnits = useMemo(() => {
        return units.filter(unit => {
            const searchLower = searchTerm.toLowerCase();
            return !searchTerm ||
                unit.code?.toLowerCase().includes(searchLower) ||
                unit.propertyName?.toLowerCase().includes(searchLower) ||
                unit.ownerName?.toLowerCase().includes(searchLower);
        });
    }, [units, searchTerm]);

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Real Estate Units</h1>
                    <p className="text-gray-500 mt-1">Manage individual apartments, offices, or retail spaces.</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary gap-2">
                    <IoAdd size={22} />
                    Register New Unit
                </button>
            </div>

            <div className="mb-6 space-y-4">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search units by code, property, or owner..."
                />
                <div className="text-sm text-gray-500 font-medium">
                    Showing {filteredUnits.length} of {units.length} units
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="table-header w-20">ID</th>
                            <th className="table-header">Unit Identifier</th>
                            <th className="table-header">Property Details</th>
                            <th className="table-header">Owner Information</th>
                            <th className="table-header text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUnits.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                                    {units.length === 0
                                        ? 'No units found in the system.'
                                        : 'No units match your search.'}
                                </td>
                            </tr>
                        ) : (
                            filteredUnits.map((unit) => (
                                <tr key={unit.id} className="table-row">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-400">#{unit.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{unit.code}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                            <IoBusiness className="text-blue-400" size={14} /> {unit.propertyName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                            <IoPerson className="text-orange-400" size={14} /> {unit.ownerName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(unit)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <IoPencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(unit.id)}
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
                title={editingUnit ? 'Edit Unit Information' : 'Register New Unit Asset'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="field-group">
                        <div className="section-header">
                            <IoBusiness size={18} />
                            Unit Specifications
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="label-base">Unit Unique Code</label>
                                <input
                                    type="text"
                                    {...register('code', { required: 'Unit Code is required' })}
                                    className="input-base"
                                    placeholder="e.g. APT-101"
                                />
                                {errors.code && <p className="mt-2 text-sm text-red-600 font-medium">{errors.code.message}</p>}
                            </div>

                            <div>
                                <label className="label-base">Associated Property</label>
                                <select
                                    {...register('propertyId', { required: 'Property is required' })}
                                    className="input-base"
                                >
                                    <option value="">Assign to property...</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.propertyId && <p className="mt-2 text-sm text-red-600 font-medium">{errors.propertyId.message}</p>}
                            </div>

                            <div>
                                <label className="label-base">Beneficial Owner</label>
                                <select
                                    {...register('ownerId', { required: 'Owner is required' })}
                                    className="input-base"
                                >
                                    <option value="">Assign to owner...</option>
                                    {owners.map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                                {errors.ownerId && <p className="mt-2 text-sm text-red-600 font-medium">{errors.ownerId.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 font-semibold">
                        <button type="button" onClick={closeModal} className="btn-secondary">Discard</button>
                        <button type="submit" className="btn-primary">
                            {editingUnit ? 'Update Unit Records' : 'Save Unit Asset'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
