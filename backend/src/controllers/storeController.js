const { Store, User } = require('../models');
const { filterStoresByRadius, calculateDistance } = require('../services/geoService');

exports.getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius, is_emergency } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude query parameters are required.' });
    }

    const patientLat = parseFloat(lat);
    const patientLng = parseFloat(lng);
    const radiusKm = parseFloat(radius) || (is_emergency === 'true' ? 10.0 : 5.0);

    const stores = await Store.findAll({
      where: {
        is_approved: true,
        is_active: true,
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });

    const nearbyStores = filterStoresByRadius(stores, patientLat, patientLng, radiusKm);

    return res.json({
      success: true,
      count: nearbyStores.length,
      radius_km: radiusKm,
      stores: nearbyStores,
    });
  } catch (error) {
    console.error('getNearbyStores error:', error);
    return res.status(500).json({ success: false, message: 'Failed to find nearby medical stores.' });
  }
};

exports.registerStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { store_name, license_number, address, phone, latitude, longitude, operating_hours } = req.body;

    if (!store_name || !license_number || !address) {
      return res.status(400).json({ success: false, message: 'Store name, license number, and address are required.' });
    }

    const existing = await Store.findOne({ where: { user_id: userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A store profile already exists for this account.' });
    }

    const store = await Store.create({
      user_id: userId,
      store_name,
      license_number,
      address,
      phone: phone || req.user.phone || '',
      latitude: latitude ? parseFloat(latitude) : 18.5204,
      longitude: longitude ? parseFloat(longitude) : 73.8567,
      operating_hours: operating_hours || '24 Hours / 7 Days',
      is_approved: false,
      is_online: true,
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Store registered successfully. Waiting for admin approval.',
      store,
    });
  } catch (error) {
    console.error('registerStore error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register store profile.' });
  }
};

exports.getStoreProfile = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }],
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store profile not found for this account.' });
    }

    return res.json({ success: true, store });
  } catch (error) {
    console.error('getStoreProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve store profile.' });
  }
};

exports.updateOnlineStatus = async (req, res) => {
  try {
    const { is_online } = req.body;
    const store = await Store.findOne({ where: { user_id: req.user.id } });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store profile not found.' });
    }

    store.is_online = Boolean(is_online);
    await store.save();

    return res.json({
      success: true,
      message: `Store is now ${store.is_online ? 'Online (Accepting Emergency Requests)' : 'Offline'}`,
      is_online: store.is_online,
    });
  } catch (error) {
    console.error('updateOnlineStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update store online status.' });
  }
};

exports.approveStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    store.is_approved = is_approved !== undefined ? Boolean(is_approved) : true;
    await store.save();

    return res.json({
      success: true,
      message: `Store ${store.store_name} approval status updated to ${store.is_approved ? 'Approved' : 'Unapproved'}.`,
      store,
    });
  } catch (error) {
    console.error('approveStore error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update store approval.' });
  }
};

exports.toggleStoreActive = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    store.is_active = !store.is_active;
    await store.save();

    return res.json({
      success: true,
      message: `Store ${store.store_name} is now ${store.is_active ? 'Active' : 'Deactivated'}.`,
      store,
    });
  } catch (error) {
    console.error('toggleStoreActive error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle store active state.' });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['created_at', 'DESC']],
    });

    return res.json({ success: true, count: stores.length, stores });
  } catch (error) {
    console.error('getAllStores error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stores.' });
  }
};
