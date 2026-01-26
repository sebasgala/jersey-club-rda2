import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/main.css';
import '../styles/POS.css'; // New styles specifically for POS
import { useAuth } from '../context/AuthContext';

const POS = () => {
    const { token } = useAuth();

    // ========= STATES =========
    // Products
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState(['Todas']);

    // Cart
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    // Customer
    const [customerMode, setCustomerMode] = useState('final'); // 'final' or 'registered'
    const [selectedCustomer, setSelectedCustomer] = useState(null); // { id: 'C00001', name: 'Consumidor Final', ... }
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isClientSelected, setIsClientSelected] = useState(false);

    // Payment
    const [paymentMethod, setPaymentMethod] = useState('efectivo'); // 'efectivo', 'tarjeta', 'transferencia'
    const [cashReceived, setCashReceived] = useState('');
    const [change, setChange] = useState(0);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Printing
    const [lastOrder, setLastOrder] = useState(null);

    // ========= API CALLS =========
    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5001/api/productos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setProducts(data);
                const uniqueCats = ['Todas', ...new Set(data.map(p => p.categoria).filter(Boolean))];
                setCategories(uniqueCats);
            } else if (data.data) {
                setProducts(data.data);
                const uniqueCats = ['Todas', ...new Set(data.data.map(p => p.categoria).filter(Boolean))];
                setCategories(uniqueCats);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [token]);

    // ========= EFFECTS =========
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        // Calculate total
        const t = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        setTotal(t);
    }, [cart]);

    useEffect(() => {
        // Calculate change
        if (paymentMethod === 'efectivo' && cashReceived) {
            const received = parseFloat(cashReceived);
            const c = received - total;
            setChange(c > 0 ? c : 0);
        } else {
            setChange(0);
        }
    }, [cashReceived, total, paymentMethod]);

    useEffect(() => {
        let filtered = products;

        // Filter by category
        if (selectedCategory !== 'Todas') {
            filtered = filtered.filter(p => p.categoria === selectedCategory);
        }

        // Filter by search term
        if (searchTerm.trim() !== '') {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.nombre && p.nombre.toLowerCase().includes(lower)) ||
                (p.id && String(p.id).toLowerCase().includes(lower))
            );
        }

        setFilteredProducts(filtered);
    }, [searchTerm, products, selectedCategory]);

    // ========= API CALLS =========
    // fetchProducts moved up to use with useCallback

    const registerCustomer = async (customerData) => {
        try {
            const response = await fetch('http://localhost:5001/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(customerData)
            });
            const result = await response.json();
            if (result.success) {
                setSelectedCustomer(result.data);
                setCustomerMode('registered');
                setIsClientSelected(true);
                setIsCustomerModalOpen(false);
                alert('Cliente registrado correctamente');
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al registrar cliente');
        }
    };

    const processSale = async () => {
        if (cart.length === 0) return alert('El carrito está vacío');
        if (!isClientSelected) return alert('Por favor, seleccione un cliente (Consumidor Final o Facturación)');
        if (paymentMethod === 'efectivo' && parseFloat(cashReceived) < total) return alert('El monto recibido es insuficiente');

        const orderData = {
            items: cart.map(item => ({ id: item.id, cantidad: item.cantidad, precio: item.precio })),
            total: total,
            userId: 'ADMIN', // Should come from auth context user id
            clienteId: customerMode === 'final' ? 'C00001' : selectedCustomer.id_cliente, // C00001 is Consumers Final by default or we find it
            paymentMethod,
            cashReceived: paymentMethod === 'efectivo' ? parseFloat(cashReceived) : total,
            change: change,
            tipo: 'pos'
        };

        try {
            const response = await fetch('http://localhost:5001/api/ordenes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();

            if (result.success) {
                setLastOrder({ ...result.data, items: cart, ...orderData }); // Merge local info for printing
                setIsPaymentModalOpen(false);
                setCart([]);
                setTotal(0);
                setCashReceived('');
                // Open Receipt Modal
                setTimeout(() => window.print(), 500); // Simple trigger print
            } else {
                alert('Error al procesar la venta: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    };

    // ========= HANDLERS =========
    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item));
        } else {
            setCart([...cart, { ...product, cantidad: 1 }]);
        }
        setSearchTerm(''); // Clear search to be ready for next scan
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.cantidad + delta;
                return newQty > 0 ? { ...item, cantidad: newQty } : item;
            }
            return item;
        }));
    };

    return (
        <div className="pos-container">
            {/* LEFT PANEL: PRODUCT SEARCH & LIST */}
            <div className="pos-left-panel">
                <div className="pos-header">
                    <h2><i className="fa fa-th"></i> Productos</h2>
                    <div className="pos-search-wrapper">
                        <div className="pos-search-box">
                            <i className="fa fa-search"></i>
                            <input
                                type="text"
                                placeholder="Escanear código o buscar nombre..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            {searchTerm && (
                                <button className="clear-search" onClick={() => setSearchTerm('')}>
                                    <i className="fa fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pos-category-bar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="pos-products-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="pos-product-card" onClick={() => addToCart(product)}>
                            <div className="pos-prod-img">
                                {product.imagen ? <img src={product.imagen} alt={product.nombre} /> : <i className="fa fa-box"></i>}
                            </div>
                            <div className="pos-prod-info">
                                <h4>{product.nombre}</h4>
                                <span className="price">${parseFloat(product.precio).toFixed(2)}</span>
                                <span className={`stock ${product.stock < 5 ? 'low' : ''}`}>Stock: {product.stock}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: CART & CHECKOUT */}
            <div className="pos-right-panel">
                <div className="pos-client-section">
                    <div className="client-toggle">
                        <button
                            className={`client-type-btn ${customerMode === 'final' && isClientSelected ? 'active' : ''}`}
                            onClick={() => {
                                setCustomerMode('final');
                                setSelectedCustomer({ cli_nombre: 'Consumidor', cli_apellido: 'Final', cli_ced_ruc: '9999999999999' });
                                setIsClientSelected(true);
                            }}
                        >
                            <i className="fa fa-user"></i> Consumidor Final
                        </button>
                        <button
                            className={`client-type-btn ${customerMode === 'registered' ? 'active' : ''}`}
                            onClick={() => setIsCustomerModalOpen(true)}
                        >
                            <i className="fa fa-file-invoice"></i> Facturación
                        </button>
                    </div>
                    {customerMode === 'registered' && selectedCustomer && (
                        <div className="client-info-display">
                            <strong>{selectedCustomer.cli_nombre} {selectedCustomer.cli_apellido}</strong>
                            <br />
                            <small>{selectedCustomer.cli_email || selectedCustomer.cli_telefono}</small>
                        </div>
                    )}
                </div>

                <div className="pos-cart-list">
                    {cart.length === 0 ? (
                        <div className="empty-cart-message">
                            <i className="fa fa-shopping-basket"></i>
                            <p>El carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="pos-cart-item">
                                <div className="item-name">{item.nombre}</div>
                                <div className="item-controls">
                                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                    <span>{item.cantidad}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                </div>
                                <div className="item-price">${(item.precio * item.cantidad).toFixed(2)}</div>
                                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="pos-footer">
                    <div className="totals-row">
                        <span>Subtotal:</span>
                        <span>${(total / 1.15).toFixed(2)}</span>
                    </div>
                    <div className="totals-row">
                        <span>IVA (15%):</span>
                        <span>${(total - (total / 1.15)).toFixed(2)}</span>
                    </div>
                    <div className="grand-total">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <button
                        className="checkout-btn"
                        onClick={() => setIsPaymentModalOpen(true)}
                        disabled={cart.length === 0 || !isClientSelected}
                    >
                        <i className="fa fa-credit-card"></i>
                        {!isClientSelected ? 'SELECCIONE CLIENTE' : 'COBRAR'}
                    </button>
                </div>
            </div>

            {/* MODALS will go here */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content payment-modal">
                        <h3><i className="fa fa-money-bill-wave"></i> Procesar Pago</h3>
                        <div className="payment-display">Total a Pagar: <h1>${total.toFixed(2)}</h1></div>

                        <div className="payment-methods">
                            <button className={paymentMethod === 'efectivo' ? 'selected' : ''} onClick={() => setPaymentMethod('efectivo')}>
                                <i className="fa fa-coins"></i> Efectivo
                            </button>
                            <button className={paymentMethod === 'tarjeta' ? 'selected' : ''} onClick={() => setPaymentMethod('tarjeta')}>
                                <i className="fa fa-credit-card"></i> Tarjeta
                            </button>
                            <button className={paymentMethod === 'transferencia' ? 'selected' : ''} onClick={() => setPaymentMethod('transferencia')}>
                                <i className="fa fa-university"></i> Transf.
                            </button>
                        </div>

                        {paymentMethod === 'efectivo' && (
                            <div className="cash-input-section">
                                <label>Dinero Recibido:</label>
                                <input
                                    type="number"
                                    value={cashReceived}
                                    onChange={e => setCashReceived(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                />
                                <div className={`change-display ${change > 0 ? 'has-change' : ''}`}>
                                    Cambio: <span>${change.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</button>
                            <button className="confirm-btn" onClick={processSale}>
                                <i className="fa fa-check-circle"></i> Confirmar y Facturar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Registration Modal */}
            {isCustomerModalOpen && (
                <CustomerModal
                    onClose={() => setIsCustomerModalOpen(false)}
                    onSave={registerCustomer}
                />
            )}

            {/* Invisible Print Receipt - Only visible when printing */}
            {lastOrder && (
                <div id="receipt-print-area" className="print-only">
                    <div className="receipt-header">
                        <h2>JERSEY CLUB EC</h2>
                        <p>RUC: 1726354890001</p>
                        <p>Matriz: Av. Amazonas y NNUU</p>
                        <p>Quito - Ecuador</p>
                        <hr />
                        <p>Factura N°: {lastOrder.invoiceNumber}</p>
                        <p>Fecha: {new Date().toLocaleString()}</p>
                        <p>Cliente: {customerMode === 'final' ? 'CONSUMIDOR FINAL' : `${selectedCustomer?.cli_nombre || ''} ${selectedCustomer?.cli_apellido || ''}`}</p>
                        <p>CI/RUC: {customerMode === 'final' ? '9999999999999' : (selectedCustomer?.cli_ced_ruc || 'N/A')}</p>
                    </div>
                    <div className="receipt-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cant.</th>
                                    <th>Desc.</th>
                                    <th>P.Unit</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lastOrder.items.map((it, i) => (
                                    <tr key={i}>
                                        <td>{it.cantidad}</td>
                                        <td>{it.nombre}</td>
                                        <td>${parseFloat(it.precio).toFixed(2)}</td>
                                        <td>${(parseFloat(it.precio) * it.cantidad).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="receipt-footer">
                        <div className="row"><span>Subtotal:</span> <span>${(lastOrder.total / 1.15).toFixed(2)}</span></div>
                        <div className="row"><span>IVA 15%:</span> <span>${(lastOrder.total - (lastOrder.total / 1.15)).toFixed(2)}</span></div>
                        <div className="row total"><span>TOTAL:</span> <span>${parseFloat(lastOrder.total).toFixed(2)}</span></div>
                        <div className="row"><span>Efectivo:</span> <span>${parseFloat(lastOrder.cashReceived).toFixed(2)}</span></div>
                        <div className="row"><span>Cambio:</span> <span>${parseFloat(lastOrder.change).toFixed(2)}</span></div>
                        <hr />
                        <p className="center">¡Gracias por su compra!</p>
                    </div>
                </div>
            )}

        </div>
    );
};

// Subcomponent for Customer Modal
const CustomerModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', email: '', telefono: '', direccion: '', cedula: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content customer-modal">
                <h3>Nuevo Cliente</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombres:</label>
                        <input required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Apellidos:</label>
                        <input required value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cédula/RUC:</label>
                            <input value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Teléfono:</label>
                            <input value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email (Opcional):</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Dirección:</label>
                        <input value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="confirm-btn">Guardar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default POS;
