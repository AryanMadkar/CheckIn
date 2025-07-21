// src/components/attendance/AttendanceRecords.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    date: '',
    verified: 'all'
  });
  const { api, user } = useAppContext();

  useEffect(() => {
    fetchAttendanceRecords();
  }, [pagination.page]);

  useEffect(() => {
    applyFilters();
  }, [records, filters]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/records?page=${pagination.page}&limit=20`);
      setRecords(response.data.records);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (filters.search) {
      filtered = filtered.filter(record => 
        record.userId?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.userId?.email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(record => record.type === filters.type);
    }

    if (filters.date) {
      filtered = filtered.filter(record => 
        new Date(record.timestamp).toDateString() === new Date(filters.date).toDateString()
      );
    }

    if (filters.verified !== 'all') {
      filtered = filtered.filter(record => 
        filters.verified === 'verified' ? record.verified : !record.verified
      );
    }

    setFilteredRecords(filtered);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const exportRecords = () => {
    // Create CSV content
    const headers = ['Employee', 'Email', 'Type', 'Date', 'Time', 'Verified', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => {
        const { date, time } = formatDateTime(record.timestamp);
        return [
          record.userId?.name || 'N/A',
          record.userId?.email || 'N/A',
          record.type,
          date,
          time,
          record.verified ? 'Yes' : 'No',
          `"${record.location?.latitude}, ${record.location?.longitude}"`
        ].join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters & Search
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="check-in">Check In</option>
            <option value="check-out">Check Out</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          />

          {/* Verified Filter */}
          <select
            value={filters.verified}
            onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-400">
            Showing {filteredRecords.length} of {pagination.total} records
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportRecords}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-medium rounded-lg hover:from-green-400 hover:to-cyan-400 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 font-medium">Employee</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Date & Time</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => {
                  const { date, time } = formatDateTime(record.timestamp);
                  return (
                    <motion.tr
                      key={record._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-black" />
                          </div>
                          <div>
                            <p className="font-medium">{record.userId?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-400">{record.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          record.type === 'check-in' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {record.type.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{date}</p>
                          <p className="text-sm text-gray-400">{time}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {record.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className={record.verified ? 'text-green-400' : 'text-red-400'}>
                            {record.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {record.location?.latitude?.toFixed(4)}, {record.location?.longitude?.toFixed(4)}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No attendance records found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-700">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, page }))}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  page === pagination.page
                    ? 'bg-cyan-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AttendanceRecords;
