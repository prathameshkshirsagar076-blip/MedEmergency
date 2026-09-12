const { Request, Prescription, PrescriptionMedicine, RequestResponse, Store, User, Notification, Medicine } = require('../models');
const { filterStoresByRadius, calculateDistance } = require('../services/geoService');
const {
  broadcastNewRequestToStores,
  emitMatchFound,
  emitResponseUpdate,
  emitRequestStatusChange,
} = require('../services/socketService');

exports.createRequest = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { prescription_id, is_emergency, patient_lat, patient_lng, medicines } = req.body;

    const lat = parseFloat(patient_lat) || 18.5204;
    const lng = parseFloat(patient_lng) || 73.8567;
    const emergencyFlag = Boolean(is_emergency);
    const initialRadius = emergencyFlag ? 10.0 : 5.0;

    // Create Request
    const newRequest = await Request.create({
      prescription_id: prescription_id || null,
      patient_id: patientId,
      is_emergency: emergencyFlag,
      search_radius_km: initialRadius,
      patient_lat: lat,
      patient_lng: lng,
      status: 'pending',
    });

    // If medicines passed directly or from prescription, ensure PrescriptionMedicines exist
    let medicineList = [];
    if (prescription_id) {
      const pMeds = await PrescriptionMedicine.findAll({
        where: { prescription_id, is_selected: true },
        include: [{ model: Medicine, as: 'master_medicine' }],
      });
      medicineList = pMeds.map((m) => ({
        name: m.custom_name,
        dosage_instruction: m.dosage_instruction,
        generic_name: m.master_medicine?.generic_name,
      }));
    } else if (Array.isArray(medicines) && medicines.length > 0) {
      medicineList = medicines.map((m) => ({
        name: typeof m === 'string' ? m : m.name,
        dosage_instruction: m.dosage_instruction || '',
        generic_name: m.generic_name || '',
      }));
    }

    // Find all approved & active stores
    const allStores = await Store.findAll({
      where: { is_approved: true, is_active: true },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'phone'] }],
    });

    const nearbyStores = filterStoresByRadius(allStores, lat, lng, initialRadius);

    // Create DB Notifications for stores
    for (const store of nearbyStores) {
      await Notification.create({
        store_id: store.id,
        request_id: newRequest.id,
        title: emergencyFlag ? '🚨 EMERGENCY MEDICINE REQUEST' : 'New Medicine Request',
        message: `A patient ${store.distance_km}km away needs: ${medicineList.map(m => m.name).join(', ')}`,
        type: emergencyFlag ? 'emergency_request' : 'standard_request',
        is_read: false,
      });
    }

    // Broadcast in real-time via Socket.io
    broadcastNewRequestToStores(nearbyStores, {
      requestId: newRequest.id,
      patientId: newRequest.patient_id,
      patientName: req.user.name,
      is_emergency: emergencyFlag,
      search_radius_km: initialRadius,
      patient_lat: lat,
      patient_lng: lng,
      medicines: medicineList,
      created_at: newRequest.created_at,
    });

    return res.status(201).json({
      success: true,
      message: `Request broadcasted successfully to ${nearbyStores.length} nearby medical stores.`,
      request: {
        id: newRequest.id,
        status: newRequest.status,
        is_emergency: newRequest.is_emergency,
        search_radius_km: newRequest.search_radius_km,
        nearbyStoresCount: nearbyStores.length,
        medicines: medicineList,
        created_at: newRequest.created_at,
      },
    });
  } catch (error) {
    console.error('createRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create emergency request.' });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id, {
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'phone', 'email'],
        },
        {
          model: Store,
          as: 'matched_store',
          include: [{ model: User, as: 'owner', attributes: ['name', 'phone'] }],
        },
        {
          model: Prescription,
          as: 'prescription',
          include: [{ model: PrescriptionMedicine, as: 'medicines' }],
        },
        {
          model: RequestResponse,
          as: 'responses',
          include: [{ model: Store, as: 'store' }],
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Compute live distances for matched store and responses
    const reqObj = request.toJSON();
    if (reqObj.matched_store) {
      reqObj.matched_store.distance_km = calculateDistance(
        reqObj.patient_lat,
        reqObj.patient_lng,
        reqObj.matched_store.latitude,
        reqObj.matched_store.longitude
      );
    }

    if (reqObj.responses) {
      reqObj.responses = reqObj.responses.map((resp) => ({
        ...resp,
        store: {
          ...resp.store,
          distance_km: calculateDistance(
            reqObj.patient_lat,
            reqObj.patient_lng,
            resp.store.latitude,
            resp.store.longitude
          ),
        },
      })).sort((a, b) => (a.store.distance_km || 0) - (b.store.distance_km || 0));
    }

    return res.json({ success: true, request: reqObj });
  } catch (error) {
    console.error('getRequestById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve request.' });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, notes } = req.body; // 'available' | 'not_available'

    if (!['available', 'not_available'].includes(response)) {
      return res.status(400).json({ success: false, message: 'Response must be "available" or "not_available".' });
    }

    // Find store for this user
    const store = await Store.findOne({ where: { user_id: req.user.id } });
    if (!store) {
      return res.status(403).json({ success: false, message: 'Only registered medical stores can respond to requests.' });
    }

    const request = await Request.findByPk(id, {
      include: [{ model: User, as: 'patient' }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.status === 'resolved' || request.status === 'expired') {
      return res.status(400).json({ success: false, message: `This request is already ${request.status}.` });
    }

    // Upsert response
    let [reqResponse, created] = await RequestResponse.findOrCreate({
      where: { request_id: request.id, store_id: store.id },
      defaults: {
        response,
        notes: notes || '',
        responded_at: new Date(),
      },
    });

    if (!created) {
      reqResponse.response = response;
      reqResponse.notes = notes || reqResponse.notes;
      reqResponse.responded_at = new Date();
      await reqResponse.save();
    }

    const distanceKm = calculateDistance(
      request.patient_lat,
      request.patient_lng,
      store.latitude,
      store.longitude
    );

    const storeDetails = {
      id: store.id,
      store_name: store.store_name,
      license_number: store.license_number,
      address: store.address,
      phone: store.phone || req.user.phone,
      operating_hours: store.operating_hours,
      latitude: store.latitude,
      longitude: store.longitude,
      distance_km: distanceKm,
    };

    let isFirstMatch = false;

    if (response === 'available') {
      // If request is still pending, this store is the FIRST store to respond "Available"
      if (request.status === 'pending') {
        request.status = 'matched';
        request.matched_store_id = store.id;
        await request.save();
        isFirstMatch = true;
      }

      // Fetch all available stores for this request
      const allResponses = await RequestResponse.findAll({
        where: { request_id: request.id, response: 'available' },
        include: [{ model: Store, as: 'store' }],
      });

      const allAvailableStores = allResponses.map((r) => ({
        ...r.store.toJSON(),
        distance_km: calculateDistance(
          request.patient_lat,
          request.patient_lng,
          r.store.latitude,
          r.store.longitude
        ),
        responded_at: r.responded_at,
      })).sort((a, b) => a.distance_km - b.distance_km);

      // Emit real-time Socket update
      if (isFirstMatch) {
        emitMatchFound(request.id, request.patient_id, storeDetails, allAvailableStores);
      } else {
        emitResponseUpdate(request.id, {
          requestId: request.id,
          store: storeDetails,
          response: 'available',
          allAvailableStores,
        });
      }
    } else {
      // Responded not available
      emitResponseUpdate(request.id, {
        requestId: request.id,
        storeId: store.id,
        storeName: store.store_name,
        response: 'not_available',
      });
    }

    return res.json({
      success: true,
      message: response === 'available'
        ? (isFirstMatch ? 'You are the FIRST MATCH! Patient has received your contact details.' : 'Availability recorded.')
        : 'Response recorded.',
      isFirstMatch,
      status: request.status,
      store: storeDetails,
    });
  } catch (error) {
    console.error('respondToRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record store response.' });
  }
};

exports.resolveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (req.user.role === 'patient' && request.patient_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the requesting patient can mark this request as resolved.' });
    }

    request.status = 'resolved';
    request.resolved_at = new Date();
    await request.save();

    emitRequestStatusChange(request.id, 'resolved', { resolved_at: request.resolved_at });

    return res.json({
      success: true,
      message: 'Request marked as resolved. Glad you found your medicine!',
      request,
    });
  } catch (error) {
    console.error('resolveRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to resolve request.' });
  }
};

exports.expandRadius = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id, {
      include: [{ model: Prescription, as: 'prescription', include: [{ model: PrescriptionMedicine, as: 'medicines' }] }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const currentRadius = request.search_radius_km || 5.0;
    const newRadius = currentRadius < 10.0 ? 10.0 : (currentRadius < 15.0 ? 15.0 : 25.0);

    request.search_radius_km = newRadius;
    await request.save();

    // Find newly reachable stores
    const allStores = await Store.findAll({
      where: { is_approved: true, is_active: true },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'phone'] }],
    });

    const newlyTargeted = filterStoresByRadius(allStores, request.patient_lat, request.patient_lng, newRadius)
      .filter((s) => s.distance_km > currentRadius);

    const medicineList = request.prescription?.medicines?.map(m => ({ name: m.custom_name })) || [];

    // Create notifications for newly targeted stores
    for (const store of newlyTargeted) {
      await Notification.create({
        store_id: store.id,
        request_id: request.id,
        title: '🚨 EXPANDED SEARCH: Emergency Medicine Needed',
        message: `Search radius expanded to ${newRadius}km. Patient is ${store.distance_km}km away.`,
        type: 'emergency_request',
        is_read: false,
      });
    }

    // Broadcast to newly targeted stores
    broadcastNewRequestToStores(newlyTargeted, {
      requestId: request.id,
      patientId: request.patient_id,
      is_emergency: request.is_emergency,
      search_radius_km: newRadius,
      patient_lat: request.patient_lat,
      patient_lng: request.patient_lng,
      medicines: medicineList,
      created_at: request.created_at,
    });

    emitRequestStatusChange(request.id, request.status, {
      new_radius_km: newRadius,
      additional_stores: newlyTargeted.length,
    });

    return res.json({
      success: true,
      message: `Search radius expanded to ${newRadius} km. Broadcasted to ${newlyTargeted.length} additional stores.`,
      search_radius_km: newRadius,
      newly_targeted_stores: newlyTargeted.length,
    });
  } catch (error) {
    console.error('expandRadius error:', error);
    return res.status(500).json({ success: false, message: 'Failed to expand search radius.' });
  }
};

exports.getMyPatientRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { patient_id: req.user.id },
      include: [
        {
          model: Store,
          as: 'matched_store',
          attributes: ['id', 'store_name', 'phone', 'address', 'latitude', 'longitude'],
        },
        {
          model: Prescription,
          as: 'prescription',
          include: [{ model: PrescriptionMedicine, as: 'medicines' }],
        },
        {
          model: RequestResponse,
          as: 'responses',
          include: [{ model: Store, as: 'store' }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('getMyPatientRequests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch patient requests.' });
  }
};

exports.getStoreActiveRequests = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { user_id: req.user.id } });
    if (!store) {
      return res.status(403).json({ success: false, message: 'Store profile not found.' });
    }

    // Find all pending & recent matched requests within store vicinity
    const requests = await Request.findAll({
      where: {
        status: ['pending', 'matched'],
      },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: Prescription,
          as: 'prescription',
          include: [{ model: PrescriptionMedicine, as: 'medicines' }],
        },
        {
          model: RequestResponse,
          as: 'responses',
        },
        {
          model: Store,
          as: 'matched_store',
          attributes: ['id', 'store_name'],
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    // Filter by distance to this store & format responses
    const filtered = requests
      .map((r) => {
        const rObj = r.toJSON();
        const dist = calculateDistance(rObj.patient_lat, rObj.patient_lng, store.latitude, store.longitude);
        const myResponse = rObj.responses?.find((resp) => resp.store_id === store.id);

        return {
          ...rObj,
          distance_km: dist,
          my_response: myResponse ? myResponse.response : null,
          is_matched_to_me: rObj.matched_store_id === store.id,
        };
      })
      .filter((r) => r.distance_km <= (r.search_radius_km || 15.0));

    return res.json({ success: true, count: filtered.length, requests: filtered });
  } catch (error) {
    console.error('getStoreActiveRequests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch store incoming requests.' });
  }
};

exports.getStoreHistory = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { user_id: req.user.id } });
    if (!store) {
      return res.status(403).json({ success: false, message: 'Store profile not found.' });
    }

    const responses = await RequestResponse.findAll({
      where: { store_id: store.id },
      include: [
        {
          model: Request,
          as: 'request',
          include: [
            { model: User, as: 'patient', attributes: ['id', 'name', 'phone'] },
            { model: Prescription, as: 'prescription', include: [{ model: PrescriptionMedicine, as: 'medicines' }] },
          ],
        },
      ],
      order: [['responded_at', 'DESC']],
    });

    return res.json({ success: true, count: responses.length, history: responses });
  } catch (error) {
    console.error('getStoreHistory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch store history.' });
  }
};
