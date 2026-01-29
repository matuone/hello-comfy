import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

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

    // Buscar en Customer
    const clientes = await Customer.find(filtros).sort({ createdAt: -1 });

    // Buscar en User (solo usuarios normales, no admins)
    const userFiltros = {};
    if (search) {
      userFiltros.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
      ];
    }
    userFiltros.isAdmin = false;
    const usuarios = await User.find(userFiltros).select("name email whatsapp dni birthdate address createdAt").sort({ createdAt: -1 });

    // Unificar formato para frontend
    const usuariosAdaptados = usuarios.map(u => ({
      _id: u._id,
      nombre: u.name,
      email: u.email,
      whatsapp: u.whatsapp,
      telefono: u.address?.phone || "",
      direccion: u.address?.street ? `${u.address.street} ${u.address.number || ''}` : "",
      ciudad: u.address?.city || "",
      codigoPostal: u.address?.postalCode || "",
      birthdate: u.birthdate,
      dni: u.dni,
      createdAt: u.createdAt,
      tipo: "user"
    }));

    // Los de Customer ya están en formato esperado, solo agregamos tipo
    const clientesAdaptados = clientes.map(c => ({
      ...c.toObject(),
      tipo: "customer"
    }));

    // Unir y ordenar por fecha de creación descendente
    const todos = [...clientesAdaptados, ...usuariosAdaptados].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(todos);
  } catch (err) {
    console.error("Error al obtener clientes");
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
    console.error("Error al obtener compradores");
    res.status(500).json({ error: "Error al obtener compradores" });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    let { email } = req.params;
    if (!email) return res.status(400).json({ error: "Email requerido" });
    // Normalizar email: minúsculas y sin espacios
    email = email.trim().toLowerCase();
    // Buscar primero en Customer
    let cliente = await Customer.findOne({ email });
    if (cliente) {
      return res.json({ ...cliente.toObject(), tipo: "customer" });
    }
    // Si no está en Customer, buscar en User
    const usuario = await User.findOne({ email }).select("-password");
    if (usuario) {
      return res.json({ ...usuario.toObject(), tipo: "user" });
    }
    // Si no se encuentra en ninguno
    return res.status(404).json({ error: "Cliente o usuario no encontrado" });
  } catch (err) {
    console.error("Error al obtener cliente/usuario", err);
    res.status(500).json({ error: "Error al obtener cliente/usuario" });
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
    console.error("Error al crear cliente");
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
    console.error("Error al actualizar cliente");
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
    console.error("Error al eliminar cliente");
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};
