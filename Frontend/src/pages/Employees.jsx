
import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import api from '../api/axios';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import PhoneInput from '../components/PhoneInput';
import { validatePhone } from '../utils/validation';
import { IoAdd, IoTrash, IoPerson, IoKey, IoEye, IoEyeOff, IoCheckmark, IoClose, IoPencil, IoShield } from "react-icons/io5";

const ALL_ROLES = ['Admin', 'Accountant', 'Manager', 'DataEntry', 'SalesRep'];

// Password rules checker
const checkPassword = (pwd = '') => ({
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /\d/.test(pwd),
    special: /[@$!%*?&]/.test(pwd),
});

function PasswordStrength({ password }) {
    const rules = checkPassword(password);
    const items = [
        { key: 'length', label: 'At least 6 characters' },
        { key: 'upper', label: 'Uppercase letter (A-Z)' },
        { key: 'lower', label: 'Lowercase letter (a-z)' },
        { key: 'digit', label: 'Number (0-9)' },
        { key: 'special', label: 'Special character (@$!%*?&)' },
    ];
    const passed = items.filter(i => rules[i.key]).length;
    const strength = passed <= 1 ? 'Weak' : passed <= 3 ? 'Fair' : passed <= 4 ? 'Good' : 'Strong';
    const colors = { Weak: 'bg-red-500', Fair: 'bg-orange-400', Good: 'bg-yellow-400', Strong: 'bg-green-500' };

    if (!password) return null;

    return (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password Strength</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full text-white ${colors[strength]}`}>{strength}</span>
            </div>
            <div className="flex gap-1 mb-2">
                {items.map((item, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? colors[strength] : 'bg-gray-200'}`} />
                ))}
            </div>
            {items.map(item => (
                <div key={item.key} className="flex items-center gap-2">
                    {rules[item.key]
                        ? <IoCheckmark size={14} className="text-green-500 flex-shrink-0" />
                        : <IoClose size={14} className="text-red-400 flex-shrink-0" />
                    }
                    <span className={`text-xs font-medium ${rules[item.key] ? 'text-green-600' : 'text-gray-500'}`}>{item.label}</span>
                </div>
            ))}
        </div>
    );
}

function PasswordInput({ label, registration, error, watchValue, showStrength = false }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="label-base">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    {...registration}
                    className="input-base pr-10"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                >
                    {show ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
            {showStrength && <PasswordStrength password={watchValue} />}
        </div>
    );
}

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);
    const [editRolesTarget, setEditRolesTarget] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [systemRoles, setSystemRoles] = useState([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [properties, setProperties] = useState([]);

    // Registration form
    const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();
    const regPassword = watch('password');

    // Reset password form
    const {
        register: regReset,
        handleSubmit: handleResetSubmit,
        reset: resetResetForm,
        watch: watchReset,
        formState: { errors: resetErrors }
    } = useForm();
    const resetPassword = watchReset('newPassword');

    useEffect(() => { fetchEmployees(); fetchSystemRoles(); fetchProperties(); }, []);

    const fetchProperties = async () => {
        try {
            const res = await api.get('Property');
            if (res.data.isSuccess) setProperties(res.data.data);
        } catch { /* ignore */ }
    };

    const fetchSystemRoles = async () => {
        try {
            const res = await api.get('Role');
            if (res.data.isSuccess) setSystemRoles(res.data.data);
        } catch { /* silently ignore */ }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('Employee');
            if (response.data.isSuccess) {
                setEmployees(response.data.data);
            } else {
                setError('Failed to load employees');
            }
        } catch (err) {
            setError('Error loading employees: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                roles: data.roles,
                propertyId: parseInt(data.propertyId)
            };
            const response = await api.post('auth/signup', payload);
            if (response.data.isSuccess) {
                fetchEmployees();
                closeModal();
            } else {
                alert('Failed to register: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Error registering employee: ' + (err.response?.data?.message || err.message));
        }
    };

    const openResetModal = (employee) => {
        setResetTarget(employee);
        resetResetForm();
    };

    const closeResetModal = () => {
        setResetTarget(null);
        resetResetForm();
    };

    const onResetPassword = async (data) => {
        try {
            const payload = {
                userName: resetTarget.userName,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            };
            const response = await api.post('auth/ResetPassword', payload);
            if (response.data.isSuccess) {
                closeResetModal();
                alert(`Password for ${resetTarget.userName} has been reset successfully.`);
            } else {
                alert('Failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                const response = await api.delete(`Employee/${id}`);
                if (response.data.isSuccess) fetchEmployees();
            } catch (err) {
                alert('Error deleting employee: ' + err.message);
            }
        }
    };

    const openEditRolesModal = (employee) => {
        setEditRolesTarget(employee);
        setSelectedRoles(employee.roles || []);
    };

    const closeEditRolesModal = () => {
        setEditRolesTarget(null);
        setSelectedRoles([]);
    };

    const toggleRole = (role) => {
        setSelectedRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const onUpdateRoles = async () => {
        if (selectedRoles.length === 0) {
            alert('Please select at least one role.');
            return;
        }
        try {
            const response = await api.patch(`Employee/${editRolesTarget.id}/roles`, selectedRoles);
            if (response.data.isSuccess) {
                await fetchEmployees();
                closeEditRolesModal();
            } else {
                alert('Failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const addSystemRole = async () => {
        const name = newRoleName.trim();
        if (!name) return;
        try {
            const res = await api.post('Role', JSON.stringify(name), { headers: { 'Content-Type': 'application/json' } });
            if (res.data.isSuccess) {
                setNewRoleName('');
                await fetchSystemRoles();
            } else {
                alert(res.data.message || 'Failed to add role');
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const deleteSystemRole = async (roleName) => {
        if (!window.confirm(`Delete role "${roleName}" from the system?`)) return;
        try {
            const res = await api.delete(`Role/${roleName}`);
            if (res.data.isSuccess) {
                await fetchSystemRoles();
            } else {
                alert(res.data.message || 'Failed to delete role');
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const openModal = () => { reset(); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); reset(); };

    const filteredEmployees = useMemo(() =>
        employees.filter(e => !searchTerm || e.userName?.toLowerCase().includes(searchTerm.toLowerCase())),
        [employees, searchTerm]
    );

    const getPhone = (emp) =>
        emp.phoneNumber || emp.PhoneNumber || emp.phone || emp.Phone || 'N/A';

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    const passwordValidation = {
        required: 'Password is required',
        validate: (val) => {
            const r = checkPassword(val);
            if (!r.length) return 'At least 6 characters required';
            if (!r.upper) return 'Must contain an uppercase letter';
            if (!r.lower) return 'Must contain a lowercase letter';
            if (!r.digit) return 'Must contain a number';
            if (!r.special) return 'Must contain a special character (@$!%*?&)';
            return true;
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Personnel</h1>
                    <p className="text-gray-500 mt-1">Manage system access, roles, and administrative staff.</p>
                </div>
                <button onClick={openModal} className="btn-primary gap-2">
                    <IoAdd size={22} /> Register New Staff Member
                </button>
            </div>

            <div className="mb-6 space-y-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search employees by username..." />
                <div className="text-sm text-gray-500 font-medium">
                    Showing {filteredEmployees.length} of {employees.length} employees
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="table-header">Username / Login</th>
                            <th className="table-header">Contact</th>
                            <th className="table-header">Access Roles</th>
                            <th className="table-header text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                                    {employees.length === 0 ? 'No personnel registered.' : 'No employees match your search.'}
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((employee) => (
                                <tr key={employee.id} className="table-row">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{employee.userName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-600">{getPhone(employee)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(employee.roles || []).map(role => (
                                                <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tighter">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditRolesModal(employee)}
                                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Roles"
                                            >
                                                <IoPencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => openResetModal(employee)}
                                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Reset Password"
                                            >
                                                <IoKey size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(employee.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Access"
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

            {/* ── System Roles Management ── */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <IoShield size={20} className="text-indigo-600" />
                    <h2 className="text-lg font-extrabold text-gray-800">System Roles</h2>
                    <span className="text-sm text-gray-400 font-medium">— add or remove roles from the system</span>
                </div>
                <div className="card p-5">
                    <div className="flex gap-3 mb-5">
                        <input
                            type="text"
                            value={newRoleName}
                            onChange={e => setNewRoleName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addSystemRole()}
                            className="input-base flex-1"
                            placeholder="New role name (e.g. Finance)"
                        />
                        <button onClick={addSystemRole} className="btn-primary gap-2">
                            <IoAdd size={18} /> Add Role
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {systemRoles.length === 0 ? (
                            <span className="text-sm text-gray-400 italic">No roles found.</span>
                        ) : (
                            systemRoles.map(r => (
                                <div key={r.id || r.name} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                                    <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">{r.name}</span>
                                    <button
                                        onClick={() => deleteSystemRole(r.name)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                        title="Delete this role"
                                    >
                                        <IoClose size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Register New Staff Member Modal ── */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Register New Staff Member">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="field-group">
                        <div className="section-header">
                            <IoPerson size={18} /> Staff Identification & Security
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="label-base">Unique Username</label>
                                <input
                                    type="text"
                                    {...register('userName', { required: 'Username is required' })}
                                    className="input-base"
                                    placeholder="e.g. jdoe_admin"
                                />
                                {errors.userName && <p className="mt-2 text-sm text-red-600 font-medium">{errors.userName.message}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="label-base">Assign Property</label>
                                <select
                                    {...register('propertyId', { required: 'Property is required' })}
                                    className="input-base"
                                >
                                    <option value="">Select a property...</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.propertyId && <p className="mt-2 text-sm text-red-600 font-medium">{errors.propertyId.message}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="label-base mb-3">Personnel Access Roles</label>
                                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {(systemRoles.length > 0 ? systemRoles.map(r => r.name) : ['Admin', 'Accountant', 'Manager', 'DataEntry', 'SalesRep']).map((role) => (
                                        <label key={role} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={role}
                                                {...register('roles', { required: 'Select at least one role' })}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-bold text-gray-700">{role}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.roles && <p className="mt-2 text-sm text-red-600 font-medium">{errors.roles.message}</p>}
                            </div>

                            <div className="col-span-2">
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    rules={{ required: 'Phone Number is required', validate: validatePhone }}
                                    render={({ field, fieldState: { error } }) => (
                                        <PhoneInput label="Contact Phone" value={field.value} onChange={field.onChange} error={error?.message} />
                                    )}
                                />
                            </div>

                            <div className="col-span-2">
                                <PasswordInput
                                    label="Security Password"
                                    registration={register('password', passwordValidation)}
                                    error={errors.password?.message}
                                    watchValue={regPassword}
                                    showStrength
                                />
                            </div>

                            <div className="col-span-2">
                                <PasswordInput
                                    label="Confirm Password"
                                    registration={register('confirmPassword', {
                                        required: 'Please confirm the password',
                                        validate: val => val === regPassword || 'Passwords do not match'
                                    })}
                                    error={errors.confirmPassword?.message}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 font-semibold">
                        <button type="button" onClick={closeModal} className="btn-secondary">Discard</button>
                        <button type="submit" className="btn-primary">Register Staff Member</button>
                    </div>
                </form>
            </Modal>

            {/* ── Reset Password Modal ── */}
            <Modal isOpen={!!resetTarget} onClose={closeResetModal} title={`Reset Password — ${resetTarget?.userName}`}>
                <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                        Set a new secure password for <span className="font-bold text-gray-800">{resetTarget?.userName}</span>.
                    </p>

                    <PasswordInput
                        label="New Password"
                        registration={regReset('newPassword', passwordValidation)}
                        error={resetErrors.newPassword?.message}
                        watchValue={resetPassword}
                        showStrength
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        registration={regReset('confirmPassword', {
                            required: 'Please confirm the password',
                            validate: val => val === resetPassword || 'Passwords do not match'
                        })}
                        error={resetErrors.confirmPassword?.message}
                    />

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 font-semibold">
                        <button type="button" onClick={closeResetModal} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">
                            <IoKey size={16} /> Update Password
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Edit Roles Modal ── */}
            <Modal isOpen={!!editRolesTarget} onClose={closeEditRolesModal} title={`Edit Roles — ${editRolesTarget?.userName}`}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Select the roles for <span className="font-bold text-gray-800">{editRolesTarget?.userName}</span>. At least one role is required.
                    </p>
                    <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {(systemRoles.length > 0 ? systemRoles.map(r => r.name) : ALL_ROLES).map(role => (
                            <label key={role} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role)}
                                    onChange={() => toggleRole(role)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-gray-700">{role}</span>
                                {selectedRoles.includes(role) && (
                                    <IoCheckmark size={16} className="ml-auto text-blue-600" />
                                )}
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 font-semibold">
                        <button type="button" onClick={closeEditRolesModal} className="btn-secondary">Cancel</button>
                        <button type="button" onClick={onUpdateRoles} className="btn-primary">
                            <IoPencil size={16} /> Save Roles
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
