import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

export const getAllCustomers = async (req, res) => {
  try {
    const { search, estado } = req.query;

    const filtros = {};

    if (estado) {
      filtros.estado = estado;
    }

    if (search) {
      filtros.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
      ];
    }

    const clientes = await Customer.find(filtros).sort({ createdAt: -1 });
    res.json(clientes);
  } catch (err) {
    console.error("Error al obtener clientes:", err);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

export const getAllBuyers = async (req, res) => {
  try {
    const { search, estado } = req.query;

    // 1. Obtener todos los clientes registrados
    const filtros = {};
    if (estado) {
      filtros.estado = estado;
    }
    if (search) {
      filtros.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
      ];
    }

    const registrados = await Customer.find(filtros).sort({ createdAt: -1 });

    // 2. Obtener emails únicos de órdenes
    const orders = await Order.find({}, { 'customer.email': 1, 'customer.name': 1, date: 1, totals: 1 }).sort({ date: -1 });
    const emailsEnOrdenes = new Set(orders.map(o => o.customer?.email).filter(Boolean));

    // 3. Crear lista de compradores sin registrarse que no estén en Customer
    const registradosEmails = new Set(registrados.map(c => c.email));
    const compradoresSinRegistro = [];

    orders.forEach(order => {
      const email = order.customer?.email;
      if (email && !registradosEmails.has(email)) {
        const existing = compradoresSinRegistro.find(c => c.email === email);
        if (!existing) {
          compradoresSinRegistro.push({
            _id: `guest-${email}`,
            nombre: order.customer?.name || 'Sin nombre',
            email: email,
            whatsapp: null,
            telefono: null,
            estado: 'inactivo',
            esComprador: true,
            createdAt: order.date,
          });
        }
      }
    });

    // 4. Combinar y ordenar
    const todos = [...registrados, ...compradoresSinRegistro].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    res.json(todos);
  } catch (err) {
    console.error("Error al obtener compradores:", err);
    res.status(500).json({ error: "Error al obtener compradores" });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { email } = req.params;
    const cliente = await Customer.findOne({ email });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (err) {
    console.error("Error al obtener cliente:", err);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { nombre, email, whatsapp, telefono, direccion, ciudad, codigoPostal, notas } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: "Nombre y email son requeridos" });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "El email ya existe" });
    }

    const nuevoCliente = new Customer({
      nombre,
      email,
      whatsapp,
      telefono,
      direccion,
      ciudad,
      codigoPostal,
      notas,
    });

    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (err) {
    console.error("Error al crear cliente:", err);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { email } = req.params;
    const updates = req.body;

    const cliente = await Customer.findOneAndUpdate(
      { email },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (err) {
    console.error("Error al actualizar cliente:", err);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { email } = req.params;

    const cliente = await Customer.findOneAndDelete({ email });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente eliminado", cliente });
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};
