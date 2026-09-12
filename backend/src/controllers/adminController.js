const { User, Store, Request, Medicine, RequestResponse } = require('../models');

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalStores = await Store.count();
    const pendingStoreApprovals = await Store.count({ where: { is_approved: false } });
    const totalRequests = await Request.count();
    const emergencyRequests = await Request.count({ where: { is_emergency: true } });
    const matchedRequests = await Request.count({ where: { status: 'matched' } });
    const resolvedRequests = await Request.count({ where: { status: 'resolved' } });
    const totalMedicines = await Medicine.count();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalPatients,
        totalStores,
        pendingStoreApprovals,
        totalRequests,
        emergencyRequests,
        matchedRequests,
        resolvedRequests,
        totalMedicines,
      },
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
};

exports.getAdminRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Store, as: 'matched_store', attributes: ['id', 'store_name', 'phone', 'address'] },
        { model: RequestResponse, as: 'responses', include: [{ model: Store, as: 'store' }] },
      ],
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('getAdminRequests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin requests.' });
  }
};
                                        