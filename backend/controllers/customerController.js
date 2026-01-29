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

    // 1. Clientes (Customer)
    const custFiltros = {};
    if (estado) custFiltros.estado = estado;
    if (search) {
      custFiltros.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
      ];
    }
    const registrados = await Customer.find(custFiltros).sort({ createdAt: -1 });
    const registradosEmails = new Set(registrados.map((c) => (c.email || "").trim().toLowerCase()));

    // 2. Usuarios registrados (User) — incluir para mostrar WhatsApp en la lista
    const userFiltros = { isAdmin: false };
    if (search) {
      userFiltros.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(userFiltros)
      .select("name email whatsapp address createdAt")
      .sort({ createdAt: -1 });
    const usuariosAdaptados = users.map((u) => ({
      _id: u._id,
      nombre: u.name,
      email: u.email,
      whatsapp: u.whatsapp,
      telefono: u.address?.phone || "",
      estado: "activo",
      tipo: "user",
      createdAt: u.createdAt,
    }));
    const userEmails = new Set(usuariosAdaptados.map((u) => (u.email || "").trim().toLowerCase()));

    // 3. Compradores sin registro (solo emails de órdenes que no están en Customer ni User)
    const orders = await Order.find(
      {},
      { "customer.email": 1, "customer.name": 1, date: 1 }
    ).sort({ date: -1 });
    const compradoresSinRegistro = [];
    for (const order of orders) {
      const raw = order.customer?.email;
      if (!raw) continue;
      const email = raw.trim().toLowerCase();
      if (registradosEmails.has(email) || userEmails.has(email)) continue;
      const existing = compradoresSinRegistro.some(
        (c) => (c.email || "").trim().toLowerCase() === email
      );
      if (!existing) {
        compradoresSinRegistro.push({
          _id: `guest-${order.customer.email}`,
          nombre: order.customer?.name || "Sin nombre",
          email: order.customer.email,
          whatsapp: null,
          telefono: null,
          estado: "inactivo",
          esComprador: true,
          createdAt: order.date,
        });
      }
    }

    // 4. Unificar y deduplicar por email: User > Customer > guest
    const byEmail = new Map();
    const add = (x) => {
      const e = (x.email || "").trim().toLowerCase();
      const prio = x.tipo === "user" ? 0 : x.tipo === "customer" ? 1 : 2;
      const cur = byEmail.get(e);
      const curPrio = cur ? (cur.tipo === "user" ? 0 : cur.tipo === "customer" ? 1 : 2) : 3;
      if (!cur || prio < curPrio) byEmail.set(e, x);
    };
    const withTipo = registrados.map((c) => ({ ...c.toObject(), tipo: "customer" }));
    [...usuariosAdaptados, ...withTipo, ...compradoresSinRegistro].forEach(add);

    const todos = [...byEmail.values()].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    res.json(todos);
  } catch (err) {
    console.error("Error al obtener compradores", err);
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
