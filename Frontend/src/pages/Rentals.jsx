
import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { IoAdd, IoPencil, IoTrash, IoPerson, IoBusiness, IoTime, IoWallet, IoDocumentText, IoFunnel } from "react-icons/io5";
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import { validatePhone } from '../utils/validation';
import SearchableSelect from '../components/SearchableSelect';
import PhoneInput from '../components/PhoneInput';


export default function Rentals() {
    const [rentals, setRentals] = useState([]);
    const [units, setUnits] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRental, setEditingRental] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [submittingNote, setSubmittingNote] = useState(false);

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProperty, setFilterProperty] = useState('');
    const [filterOwner, setFilterOwner] = useState('');
    const [filterSalesRep, setFilterSalesRep] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            sales: [{ salesRepresentitiveId: '', commissionPercentage: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sales"
    });

    const selectedUnitId = watch('unitId');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedUnitId && !editingRental) {
            const unit = units.find(u => u.id === parseInt(selectedUnitId));
            if (unit) {
                setValue('ownerId', unit.ownerId);
                setValue('propertyId', unit.propertyId);
                setValue('dayPriceOwner', unit.defaultPrice || 0);
            }
        }
    }, [selectedUnitId, editingRental]);

    const fetchData = async () => {
        try {
            const [rentalsRes, unitsRes, employeesRes] = await Promise.all([
                api.get('Rental'),
                api.get('Unit'),
                api.get('Employee')
            ]);

            if (rentalsRes.data.isSuccess) {
                const normalized = rentalsRes.data.data.map(r => {
                    // Be extremely robust with IDs
                    const id = [r.id, r.Id, r.rentalId, r.RentalId].find(val => val !== undefined && val !== null);
                    return {
                        ...r,
                        id: id,
                        unitId: r.unitId || r.UnitId,
                        unitCode: r.unitCode || r.UnitCode,
                        ownerId: r.ownerId || r.OwnerId,
                        ownerName: r.ownerName || r.OwnerName,
                        propertyId: r.propertyId || r.PropertyId,
                        propertyName: r.propertyName || r.PropertyName,
                        startDate: r.startDate || r.StartDate,
                        endDate: r.endDate || r.EndDate,
                        dayPriceCustomer: r.dayPriceCustomer || r.DayPriceCustomer,
                        dayPriceOwner: r.dayPriceOwner || r.DayPriceOwner,
                        customerDeposit: r.customerDeposit || r.CustomerDeposit,
                        ownerDeposit: r.ownerDeposit || r.OwnerDeposit,
                        securityDeposit: r.securityDeposit || r.SecurityDeposit,
                        customerFullName: r.customerFullName || r.CustomerFullName,
                        customerPhoneNumber: r.customerPhoneNumber || r.CustomerPhoneNumber,
                        totalDays: r.totalAmount !== undefined ? r.totalAmount / (r.dayPriceCustomer || 1) : (r.TotalAmount / (r.DayPriceCustomer || 1) || r.TotalDays || r.totalDays),
                        totalAmount: r.totalAmount || r.TotalAmount,
                        totalCommision: r.totalCommision || r.TotalCommision,
                        sales: r.sales || r.Sales || [],
                        rentalNotes: r.rentalNotes || r.RentalNotes || [],
                        lastNote: r.lastNote || r.LastNote,
                        customerOutstanding: r.customerOutstanding || r.CustomerOutstanding || 0,
                        ownerRemaining: r.ownerRemaining || r.OwnerRemaining || 0
                    };
                });
                // Manually fix totalDays if backend missed it
                const finalData = normalized.map(r => {
                    if (!r.totalDays || r.totalDays === 0) {
                        try {
                            const start = new Date(r.startDate);
                            const end = new Date(r.endDate);
                            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                            r.totalDays = diff > 0 ? diff : 0;
                            r.totalAmount = r.totalAmount || (r.totalDays * r.dayPriceCustomer);
                        } catch (e) { /* ignore */ }
                    }
                    return r;
                });
                setRentals(finalData);
            }
            if (unitsRes.data.isSuccess) setUnits(unitsRes.data.data);
            if (employeesRes.data.isSuccess) setEmployees(employeesRes.data.data);

        } catch (err) {
            setError('Error loading data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const salesList = (data.sales || []).filter(s => s.salesRepresentitiveId);
            const totalCommission = salesList.reduce((sum, s) => sum + (parseFloat(s.commissionPercentage) || 0), 0);
            if (totalCommission > 100) {
                alert(`Error: Total commission cannot exceed 100%. Current total: ${totalCommission}%`);
                return;
            }

            // Build payload explicitly — do NOT spread data (it contains extra form-only fields)
            const payload = {
                unitId: parseInt(data.unitId),
                ownerId: parseInt(data.ownerId),
                propertyId: parseInt(data.propertyId),
                startDate: data.startDate,
                endDate: data.endDate,
                dayPriceCustomer: parseFloat(data.dayPriceCustomer) || 0,
                dayPriceOwner: parseFloat(data.dayPriceOwner) || 0,
                customerDeposit: parseFloat(data.customerDeposit) || 0,
                ownerDeposit: parseFloat(data.ownerDeposit) || 0,
                securityDeposit: parseFloat(data.securityDeposit) || 0,
                hasCampaignDiscount: data.hasCampaignDiscount === 'true' || data.hasCampaignDiscount === true,
                customerFullName: data.customerFullName || '',
                customerPhoneNumber: data.customerPhoneNumber || '',
                // Strip the internal `id` field added by useFieldArray
                sales: salesList.map(s => ({
                    salesRepresentitiveId: s.salesRepresentitiveId,
                    commissionPercentage: parseFloat(s.commissionPercentage) || 0
                })),
                notes: newNote || null
            };

            if (editingRental) {
                const rentalId = [editingRental.id, editingRental.Id, editingRental.rentalId, editingRental.RentalId].find(val => val !== undefined && val !== null);
                const finalPayload = { ...payload, rentalId: rentalId };
                console.log('UPDATE PAYLOAD:', JSON.stringify(finalPayload, null, 2));
                const response = await api.put('Rental/update', finalPayload);
                if (response.data.isSuccess) {
                    await fetchData();
                    closeModal();
                } else {
                    alert('Failed to update rental: ' + (response.data.message || 'Unknown error'));
                }
            } else {
                const response = await api.post('Rental/create', payload);
                if (response.data.isSuccess) {
                    await fetchData();
                    closeModal();
                } else {
                    alert('Failed to create rental: ' + (response.data.message || 'Unknown error'));
                }
            }
        } catch (err) {
            // Show the actual backend error message if available
            const backendMsg = err.response?.data?.message || err.response?.data?.title || err.response?.data;
            const errorText = typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg);
            alert('Error saving rental: ' + (errorText || err.message));
        }
    };

    const handleDelete = async (rental) => {
        const id = rental.id || rental.Id || rental.rentalId || rental.RentalId;
        if (!id) return;

        if (window.confirm('Are you sure you want to delete this rental contract?')) {
            try {
                const response = await api.delete(`Rental/${id}`);
                if (response.data.isSuccess) {
                    fetchData();
                }
            } catch (err) {
                alert('Error deleting rental: ' + err.message);
            }
        }
    };

    const handleAddNote = async (rentalId) => {
        if (!newNote.trim()) return;
        setSubmittingNote(true);
        try {
            const response = await api.post(`Rental/${rentalId}/notes`, { content: newNote });
            if (response.data.isSuccess) {
                // We don't need to alert success, just update or refresh
                await fetchData(); // Refresh to get proper mapping
                setNewNote('');
            }
        } catch (err) {
            alert('Error adding note: ' + err.message);
        } finally {
            setSubmittingNote(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRental(null);
        reset({
            sales: [{ salesRepresentitiveId: '', commissionPercentage: 0 }]
        });
    };

    const openModal = (rental = null) => {
        setEditingRental(rental);
        if (rental) {
            // Data is already normalized by fetchData
            const formData = {
                id: rental.id,
                unitId: rental.unitId?.toString(),
                ownerId: rental.ownerId?.toString(),
                propertyId: rental.propertyId?.toString(),
                startDate: rental.startDate,
                endDate: rental.endDate,
                dayPriceCustomer: rental.dayPriceCustomer,
                dayPriceOwner: rental.dayPriceOwner,
                customerDeposit: rental.customerDeposit,
                customerOutstanding: rental.customerOutstanding,
                ownerDeposit: rental.ownerDeposit,
                ownerRemaining: rental.ownerRemaining,
                securityDeposit: rental.securityDeposit,
                hasCampaignDiscount: rental.hasCampaignDiscount?.toString(),
                customerFullName: rental.customerFullName,
                customerPhoneNumber: rental.customerPhoneNumber,
                sales: (rental.sales || []).map(s => {
                    const findKey = (obj, n) => {
                        const low = n.toLowerCase();
                        return Object.keys(obj).find(k => k.toLowerCase() === low);
                    };
                    return {
                        salesRepresentitiveId: s[findKey(s, 'salesRepresentativeId')] || s[findKey(s, 'salesRepresentitiveId')] || s[findKey(s, 'salesRepId')],
                        commissionPercentage: s[findKey(s, 'commissionPercentage')] || s[findKey(s, 'percentage')]
                    };
                }),
                notes: rental.lastNote || ''
            };

            if (!formData.sales.length) {
                formData.sales = [{ salesRepresentitiveId: '', commissionPercentage: 0 }];
            }

            reset(formData);
            setNewNote(formData.notes);
        } else {
            reset({
                sales: [{ salesRepresentitiveId: '', commissionPercentage: 0 }],
                notes: ''
            });
            setNewNote('');
        }
        setIsModalOpen(true);
    };

    // Filtered and searched rentals
    const filteredRentals = useMemo(() => {
        return rentals.filter(rental => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                rental.unitCode?.toLowerCase().includes(searchLower) ||
                rental.propertyName?.toLowerCase().includes(searchLower) ||
                rental.customerFullName?.toLowerCase().includes(searchLower) ||
                rental.customerPhoneNumber?.toLowerCase().includes(searchLower) ||
                rental.ownerName?.toLowerCase().includes(searchLower) ||
                rental.sales?.some(s => (s.salesRepName || s.SalesRepName || '').toLowerCase().includes(searchLower));

            // Property filter
            const matchesProperty = !filterProperty || rental.propertyId === parseInt(filterProperty);

            // Owner filter
            const matchesOwner = !filterOwner || rental.ownerId === parseInt(filterOwner);

            // Sales Rep filter
            const matchesSalesRep = !filterSalesRep || rental.sales?.some(s => (s.salesRepresentativeId || s.salesRepresentitiveId || s.salesRepId) === filterSalesRep);

            return matchesSearch && matchesProperty && matchesOwner && matchesSalesRep;
        });
    }, [rentals, searchTerm, filterProperty, filterOwner, filterSalesRep]);

    // Get unique properties and owners for filter dropdowns
    const uniqueProperties = useMemo(() => {
        const props = new Map();
        rentals.forEach(r => {
            if (r.propertyId && r.propertyName) {
                props.set(r.propertyId, r.propertyName);
            }
        });
        return Array.from(props.entries()).map(([id, name]) => ({ id, name }));
    }, [rentals]);

    const uniqueOwners = useMemo(() => {
        const owners = new Map();
        rentals.forEach(r => {
            if (r.ownerId && r.ownerName) {
                owners.set(r.ownerId, r.ownerName);
            }
        });
        return Array.from(owners.entries()).map(([id, name]) => ({ id, name }));
    }, [rentals]);

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Rental Contracts</h1>
                    <p className="text-gray-500 mt-1">Manage active leases, pricing, and multi-agent commissions.</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary gap-2">
                    <IoAdd size={22} />
                    New Rental Contract
                </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
                <div className="flex gap-3 items-center">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search units, properties, customers, or agents..."
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${showFilters || filterProperty || filterOwner || filterSalesRep
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <IoFunnel size={18} />
                        Filters
                        {(filterProperty || filterOwner || filterSalesRep) && (
                            <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-black">
                                {[filterProperty, filterOwner, filterSalesRep].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Property</label>
                                <select
                                    value={filterProperty}
                                    onChange={(e) => setFilterProperty(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Properties</option>
                                    {uniqueProperties.map(prop => (
                                        <option key={prop.id} value={prop.id}>{prop.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Owner</label>
                                <select
                                    value={filterOwner}
                                    onChange={(e) => setFilterOwner(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Owners</option>
                                    {uniqueOwners.map(owner => (
                                        <option key={owner.id} value={owner.id}>{owner.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Sales Representative</label>
                                <select
                                    value={filterSalesRep}
                                    onChange={(e) => setFilterSalesRep(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Agents</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.userName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setFilterProperty('');
                                        setFilterOwner('');
                                        setFilterSalesRep('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors w-full"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results count */}
                <div className="text-sm text-gray-500 font-medium">
                    Showing {filteredRentals.length} of {rentals.length} rental contracts
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="table-header">Lease Assignment</th>
                            <th className="table-header">Tenant Information</th>
                            <th className="table-header">Assigned Agents</th>
                            <th className="table-header">Lease Economics</th>
                            <th className="table-header">Aggregates</th>
                            <th className="table-header text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredRentals.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">
                                    {rentals.length === 0
                                        ? 'No rental contracts found in the system.'
                                        : 'No rental contracts match your search criteria.'}
                                </td>
                            </tr>
                        ) : (
                            filteredRentals.map((rental) => (
                                <tr key={rental.id} className="table-row">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                <IoBusiness size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900">{rental.unitCode}</div>
                                                <div className="text-[11px] font-bold text-blue-500 uppercase tracking-tight">{rental.propertyName}</div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-black">
                                                        {rental.startDate} → {rental.endDate}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                                                <IoPerson size={14} className="text-gray-400" />
                                                {rental.customerFullName}
                                            </div>
                                            <div className="text-[11px] text-gray-500 font-medium">{rental.customerPhoneNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            {(rental.sales || []).map((s, idx) => (
                                                <div key={idx} className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                                        <div className="text-[11px] font-black text-gray-700 truncate max-w-[120px]">
                                                            {s.salesRepName || s.SalesRepName || 'Agent'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 ml-3">
                                                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded uppercase">
                                                            {s.percentage || s.Percentage}%
                                                        </span>
                                                        <span className="text-[9px] font-bold text-gray-400">
                                                            ${(Number(s.commissionAmount || s.CommissionAmount || 0)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {!rental.sales?.length && <span className="text-[10px] text-gray-300 italic">No agents.</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-1 rounded uppercase tracking-tighter">In</span>
                                                <span className="text-xs font-black text-gray-700">${Number(rental.dayPriceCustomer || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-1 rounded uppercase tracking-tighter">Out</span>
                                                <span className="text-[11px] font-black text-gray-400">${Number(rental.dayPriceOwner || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-black text-blue-600">
                                                ${(Number(rental.totalAmount) || 0).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    {(Number(rental.totalDays) || 0)} Days Total
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-0.5 mt-1 border-t border-blue-50 pt-1">
                                                <div className="flex items-center justify-between text-[9px] font-black">
                                                    <span className="text-blue-400 uppercase">Cust Bal:</span>
                                                    <span className="text-gray-700">${Number(rental.customerOutstanding || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[9px] font-black">
                                                    <span className="text-orange-400 uppercase">Ownr Bal:</span>
                                                    <span className="text-gray-700">${Number(rental.ownerRemaining || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            {rental.lastNote && (
                                                <div className="text-[10px] text-gray-400 italic truncate max-w-[150px] mt-1" title={rental.lastNote}>
                                                    "{rental.lastNote}"
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(rental)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                            >
                                                <IoPencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rental)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRental ? 'Modify Contract Terms' : 'Register New Lease Agreement'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Section 1: Core Assignment */}
                    <div className="field-group">
                        <div className="section-header">
                            <IoBusiness size={18} />
                            Lease Assignment & Promotion
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 sm:col-span-1">
                                <Controller
                                    name="unitId"
                                    control={control}
                                    rules={{ required: 'Please select a unit' }}
                                    render={({ field, fieldState: { error } }) => (
                                        <SearchableSelect
                                            label="Real Estate Unit"
                                            placeholder="Search unit code or property..."
                                            options={units.map(u => ({
                                                id: u.id,
                                                label: u.code,
                                                sublabel: u.propertyName
                                            }))}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={error?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="label-base">Promotional Campaign</label>
                                <select {...register('hasCampaignDiscount')} className="input-base">
                                    <option value="false">Standard Rates</option>
                                    <option value="true">Active Promotion Applied</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Timeline */}
                    <div className="field-group">
                        <div className="section-header">
                            <IoTime size={18} />
                            Contract Timeline
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="label-base">Lease Commencement</label>
                                <input
                                    type="date"
                                    {...register('startDate', { required: 'Start date is required' })}
                                    className="input-base"
                                    onChange={(e) => {
                                        register('startDate').onChange(e);
                                        // Trigger calculation sync
                                        setTimeout(() => {
                                            const deposit = Number(watch('customerDeposit')) || 0;
                                            const payout = Number(watch('ownerDeposit')) || 0;
                                            const start = new Date(e.target.value);
                                            const end = new Date(watch('endDate'));
                                            const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                            setValue('customerOutstanding', Math.max(0, (days * Number(watch('dayPriceCustomer'))) - deposit));
                                            setValue('ownerRemaining', Math.max(0, (days * Number(watch('dayPriceOwner'))) - payout));
                                        }, 0);
                                    }}
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="label-base">Lease Expiration</label>
                                <input
                                    type="date"
                                    {...register('endDate', { required: 'End date is required' })}
                                    className="input-base"
                                    onChange={(e) => {
                                        register('endDate').onChange(e);
                                        setTimeout(() => {
                                            const deposit = Number(watch('customerDeposit')) || 0;
                                            const payout = Number(watch('ownerDeposit')) || 0;
                                            const start = new Date(watch('startDate'));
                                            const end = new Date(e.target.value);
                                            const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                            setValue('customerOutstanding', Math.max(0, (days * Number(watch('dayPriceCustomer'))) - deposit));
                                            setValue('ownerRemaining', Math.max(0, (days * Number(watch('dayPriceOwner'))) - payout));
                                        }, 0);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Financial Structure */}
                    <div className="field-group bg-blue-50/20 border-blue-100">
                        <div className="section-header text-blue-700">
                            <IoWallet size={18} />
                            Economic Structure
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="label-base">Customer Daily Rate ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('dayPriceCustomer', { required: true })}
                                    className="input-base font-black text-blue-700"
                                    placeholder="0.00"
                                    onChange={(e) => {
                                        register('dayPriceCustomer').onChange(e);
                                        setTimeout(() => {
                                            const deposit = Number(watch('customerDeposit')) || 0;
                                            const start = new Date(watch('startDate'));
                                            const end = new Date(watch('endDate'));
                                            const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                            setValue('customerOutstanding', Math.max(0, (days * Number(e.target.value)) - deposit));
                                        }, 0);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="label-base">Owner Daily Payout ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('dayPriceOwner', { required: true })}
                                    className="input-base font-black text-gray-700"
                                    placeholder="0.00"
                                    onChange={(e) => {
                                        register('dayPriceOwner').onChange(e);
                                        setTimeout(() => {
                                            const payout = Number(watch('ownerDeposit')) || 0;
                                            const start = new Date(watch('startDate'));
                                            const end = new Date(watch('endDate'));
                                            const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                            setValue('ownerRemaining', Math.max(0, (days * Number(e.target.value)) - payout));
                                        }, 0);
                                    }}
                                />
                            </div>

                            <div className="col-span-2">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-blue-50 mb-4">
                                    <div className="col-span-1">
                                        <label className="label-base !mb-1 text-blue-600">Customer Balance (Outstanding)</label>
                                        <Controller
                                            name="customerOutstanding"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const outstanding = Number(e.target.value) || 0;
                                                        field.onChange(outstanding);
                                                        // Sync with deposit: Deposit = Total - Outstanding
                                                        const start = new Date(watch('startDate'));
                                                        const end = new Date(watch('endDate'));
                                                        const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                                        const total = days * (Number(watch('dayPriceCustomer')) || 0);
                                                        setValue('customerDeposit', Math.max(0, total - outstanding));
                                                    }}
                                                    className="input-base !py-2 bg-blue-50/30 font-black"
                                                    placeholder="0.00"
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label-base !mb-1 text-orange-600">Owner Balance (Remaining)</label>
                                        <Controller
                                            name="ownerRemaining"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const remaining = Number(e.target.value) || 0;
                                                        field.onChange(remaining);
                                                        // Sync with payout: Payout = Total - Remaining
                                                        const start = new Date(watch('startDate'));
                                                        const end = new Date(watch('endDate'));
                                                        const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                                        const total = days * (Number(watch('dayPriceOwner')) || 0);
                                                        setValue('ownerDeposit', Math.max(0, total - remaining));
                                                    }}
                                                    className="input-base !py-2 bg-orange-50/30 font-black"
                                                    placeholder="0.00"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="label-base !mb-1">Customer Deposit</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('customerDeposit')}
                                            onChange={(e) => {
                                                const deposit = Number(e.target.value) || 0;
                                                // Sync with outstanding: Outstanding = Total - Deposit
                                                const start = new Date(watch('startDate'));
                                                const end = new Date(watch('endDate'));
                                                const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                                const total = days * (Number(watch('dayPriceCustomer')) || 0);
                                                setValue('customerOutstanding', Math.max(0, total - deposit));
                                            }}
                                            className="input-base !py-2"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-base !mb-1">Owner Payment</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('ownerDeposit')}
                                            onChange={(e) => {
                                                const payout = Number(e.target.value) || 0;
                                                // Sync with remaining: Remaining = Total - Payout
                                                const start = new Date(watch('startDate'));
                                                const end = new Date(watch('endDate'));
                                                const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                                const total = days * (Number(watch('dayPriceOwner')) || 0);
                                                setValue('ownerRemaining', Math.max(0, total - payout));
                                            }}
                                            className="input-base !py-2"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-base !mb-1">Security Fund</label>
                                        <input type="number" step="0.01" {...register('securityDeposit')} className="input-base !py-2" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Tenant Information */}
                    <div className="field-group">
                        <div className="section-header">
                            <IoPerson size={18} />
                            Tenant Particulars
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="label-base">Legal Full Name</label>
                                <input type="text" {...register('customerFullName', { required: 'Name is required' })} className="input-base" placeholder="Johnathan Doe" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <Controller
                                    name="customerPhoneNumber"
                                    control={control}
                                    rules={{
                                        required: 'Contact is required',
                                        validate: validatePhone
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <PhoneInput
                                            label="Contact Phone"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Multi-Commission */}
                    <div className="field-group border-indigo-100 bg-indigo-50/20">
                        <div className="flex justify-between items-center mb-4">
                            <div className="section-header !mb-0 text-indigo-700">
                                <IoPerson size={18} />
                                Sales Commission Split
                            </div>
                            <button type="button" onClick={() => append({ salesRepresentitiveId: '', commissionPercentage: 0 })} className="text-xs font-black bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-md shadow-indigo-200">
                                <IoAdd size={16} /> Add Agent
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-indigo-50 shadow-sm">
                                    <div className="flex-grow">
                                        <select {...register(`sales.${index}.salesRepresentitiveId`, { required: 'Required' })} className="input-base !py-2 !mt-0">
                                            <option value="">Assigned Agent...</option>
                                            {employees.filter(e => {
                                                const currentSales = watch('sales');
                                                const isSelectedElsewhere = currentSales.some((s, i) => i !== index && s.salesRepresentitiveId === e.id);
                                                return !isSelectedElsewhere;
                                            }).map(e => (
                                                <option key={e.id} value={e.id}>{e.userName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <input type="number" step="0.1" {...register(`sales.${index}.commissionPercentage`, { required: true })} className="input-base !py-2 !mt-0 text-center font-bold" placeholder="%" />
                                    </div>
                                    {fields.length > 1 && (
                                        <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg">
                                            <IoTrash size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 6: Administrative Notes History */}
                    <div className="field-group border-gray-200 bg-gray-50/30">
                        <div className="section-header !mb-3 text-gray-700">
                            <IoDocumentText size={18} />
                            Administrative Notes & Audit Log
                        </div>

                        {/* Latest Note Highlight */}
                        {(editingRental?.lastNote || editingRental?.LastNote) && (
                            <div className="mb-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 shadow-inner">
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    Latest Update
                                </div>
                                <p className="text-sm text-gray-800 font-semibold leading-relaxed">
                                    "{editingRental.lastNote || editingRental.LastNote}"
                                </p>
                            </div>
                        )}

                        {/* Add New Note */}
                        <div className="relative mb-6">
                            <label className="label-base text-[11px]">Append New Administrative Note</label>
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="input-base min-h-[100px] pr-20 pt-3"
                                placeholder="Type a professional update here..."
                            ></textarea>
                            <button
                                type="button"
                                disabled={submittingNote || !newNote.trim() || !editingRental}
                                onClick={() => {
                                    const rid = [editingRental?.id, editingRental?.Id, editingRental?.rentalId, editingRental?.RentalId].find(val => val !== undefined && val !== null);
                                    if (rid !== undefined && rid !== null) handleAddNote(rid);
                                    else alert("Could not identify rental ID. Please try closing and reopening the contract.");
                                }}
                                className={`absolute bottom-4 right-4 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xl ${!newNote.trim() || !editingRental
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200'
                                    }`}
                            >
                                {submittingNote ? 'Persisting...' : 'Append Note'}
                            </button>
                        </div>

                        {/* History Log Accordion */}
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Historical Log</span>
                                <span className="text-[10px] font-bold text-gray-300">{(editingRental?.rentalNotes || editingRental?.RentalNotes || []).length} entries</span>
                            </div>
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {(editingRental?.rentalNotes || editingRental?.RentalNotes || []).length > 0 ? (
                                    (editingRental.rentalNotes || editingRental.RentalNotes || []).map((note, idx) => (
                                        <div key={note.id || idx} className="bg-white/80 p-3.5 rounded-2xl border border-gray-100/50 shadow-sm">
                                            <div className="flex justify-between items-start mb-2 text-[10px] uppercase tracking-tighter font-black">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                        <IoPerson size={10} />
                                                    </div>
                                                    <span className="text-gray-500">{note.addedByEmployeeName || note.AddedByEmployeeName || 'Authorized User'}</span>
                                                </div>
                                                <span className="text-gray-400 font-medium">{new Date(note.createdAt || note.CreatedAt).toLocaleDateString()} at {new Date(note.createdAt || note.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{note.content || note.Content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-300 text-[11px] font-bold tracking-tight">No prior audit logs found for this contract.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-gray-100">
                        <button type="button" onClick={closeModal} className="btn-secondary">Discard</button>
                        <button type="submit" className="btn-primary">
                            {editingRental ? 'Authorize Modifications' : 'Finalize Lease Agreement'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
