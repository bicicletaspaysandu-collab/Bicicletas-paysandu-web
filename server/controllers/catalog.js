import { supabase } from '../supabaseClient.js';

/**
 * Get all products (Public)
 */
export const getProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'No se pudieron obtener los productos', details: error.message });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al obtener el catálogo', details: error.message });
  }
};

/**
 * Get a single product by ID (Public)
 */
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(400).json({ error: 'Error al buscar el producto', details: error.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al buscar el producto', details: error.message });
  }
};

/**
 * Create a new product (Admin only)
 */
export const createProduct = async (req, res) => {
  const { title, description, price, image_url, images, category, stock_status } = req.body;

  // Validation
  if (!title || !price || (!image_url && (!images || images.length === 0))) {
    return res.status(400).json({ error: 'Los campos título, precio e imagen son obligatorios' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'El precio debe ser un número válido mayor o igual a cero' });
  }

  const validCategories = ['bicicleta', 'accesorio', 'repuesto', 'indumentaria'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ error: 'Categoría de producto no válida' });
  }

  const validStockStatuses = ['in_stock', 'low_stock', 'out_of_stock', 'on_demand'];
  if (stock_status && !validStockStatuses.includes(stock_status)) {
    return res.status(400).json({ error: 'Estado de stock no válido' });
  }

  const mainImage = image_url || (images && images.length > 0 ? images[0] : '');

  const newProductPayload = {
    title,
    description,
    price: parsedPrice, // Processed and saved in USD
    image_url: mainImage,
    images: images || [mainImage],
    category: category || 'bicicleta',
    stock_status: stock_status || 'in_stock'
  };

  try {
    let { data: product, error } = await supabase
      .from('products')
      .insert([newProductPayload])
      .select()
      .single();

    // Fallback if SQL migration ALTER TABLE public.products ADD COLUMN images TEXT[] hasn't been executed yet
    if (error && (error.message?.includes('images') || error.code === 'PGRST204')) {
      delete newProductPayload.images;
      const fallback = await supabase
        .from('products')
        .insert([newProductPayload])
        .select()
        .single();
      product = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error('Database error in createProduct:', error);
      return res.status(400).json({ error: 'Error al crear el producto', details: error.message });
    }

    res.status(201).json({ message: 'Producto creado exitosamente', product });
  } catch (error) {
    console.error('Internal server error in createProduct:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear el producto', details: error.message });
  }
};

/**
 * Update an existing product (Admin only)
 */
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, image_url, images, category, stock_status } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (image_url !== undefined) updates.image_url = image_url;
  if (images !== undefined) updates.images = images;

  if (category !== undefined) {
    const validCategories = ['bicicleta', 'accesorio', 'repuesto', 'indumentaria'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Categoría de producto no válida' });
    }
    updates.category = category;
  }

  if (stock_status !== undefined) {
    const validStockStatuses = ['in_stock', 'low_stock', 'out_of_stock', 'on_demand'];
    if (!validStockStatuses.includes(stock_status)) {
      return res.status(400).json({ error: 'Estado de stock no válido' });
    }
    updates.stock_status = stock_status;
  }

  if (price !== undefined) {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número válido mayor o igual a cero' });
    }
    updates.price = parsedPrice;
  }

  try {
    let { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && (error.message?.includes('images') || error.code === 'PGRST204')) {
      delete updates.images;
      const fallback = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      product = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return res.status(400).json({ error: 'Error al actualizar el producto', details: error.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado exitosamente', product });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al actualizar el producto', details: error.message });
  }
};

/**
 * Delete a product (Admin only)
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: 'No se pudo eliminar el producto', details: error.message });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al eliminar el producto', details: error.message });
  }
};
