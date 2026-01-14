import Customer from "../models/Customer.js";

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
