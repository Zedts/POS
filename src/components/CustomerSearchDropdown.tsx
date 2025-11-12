import { useState, useEffect, useRef } from 'react';
import { searchCustomersAPI } from '../api';

interface Customer {
  id: number;
  full_name: string;
  class: string;
  major: string;
  nisn: string;
}

interface CustomerSearchDropdownProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

function CustomerSearchDropdown({ selectedCustomer, onSelectCustomer }: CustomerSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search customers
  useEffect(() => {
    const searchCustomers = async () => {
      if (searchQuery.trim().length < 2) {
        setCustomers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await searchCustomersAPI(searchQuery);
        if (response.success) {
          setCustomers(response.data);
        }
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    setSearchQuery('');
    setIsOpen(false);
    setCustomers([]);
  };

  const handleClearCustomer = () => {
    onSelectCustomer(null);
    setSearchQuery('');
    setCustomers([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Customer <span className="text-red-500">*</span>
      </label>

      {selectedCustomer ? (
        <div 
          className="flex items-center justify-between p-3 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
        >
          <div>
            <p className="font-medium">{selectedCustomer.full_name}</p>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {selectedCustomer.class} - {selectedCustomer.major}
            </p>
          </div>
          <button
            onClick={handleClearCustomer}
            className="ml-2 px-3 py-1 rounded-lg text-sm hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: 'var(--color-danger)',
              color: 'white'
            }}
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Cari nama customer..."
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          />

          {isOpen && searchQuery.trim().length >= 2 && (
            <div 
              className="absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              {loading ? (
                <div className="p-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: 'var(--color-primary)' }}></div>
                  <p className="mt-2 text-sm">Mencari customer...</p>
                </div>
              ) : customers.length > 0 ? (
                <div className="py-1">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full px-4 py-3 text-left hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }}
                    >
                      <p className="font-medium">{customer.full_name}</p>
                      <p className="text-sm opacity-80">
                        {customer.class} - {customer.major} | NISN: {customer.nisn}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  <p className="text-sm">Customer tidak ditemukan</p>
                </div>
              )}
            </div>
          )}

          {isOpen && searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
            <div 
              className="absolute z-50 w-full mt-1 rounded-lg border shadow-lg p-4 text-center"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)'
              }}
            >
              <p className="text-sm">Ketik minimal 2 karakter untuk mencari</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerSearchDropdown;
