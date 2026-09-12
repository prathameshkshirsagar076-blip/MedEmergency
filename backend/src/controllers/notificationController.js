const { Notification, Store } = require('../models');

exports.getStoreNotifications = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { user_id: req.user.id } });
    if (!store) {
      return res.status(403).json({ success: false, message: 'Store profile not found.' });
    }

    const notifications = await Notification.findAll({
      where: { store_id: store.id },
      order: [['created_at', 'DESC']],
      limit: 30,
    });

    const unreadCount = await Notification.count({
      where: { store_id: store.id, is_read: false },
    });

    return res.json({ success: true, unread_count: unreadCount, notifications });
  } catch (error) {
    console.error('getStoreNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findOne({ where: { user_id: req.user.id } });
    if (!store) {
      return res.status(403).json({ success: false, message: 'Store profile not found.' });
    }

    const notification = await Notification.findOne({
      where: { id, store_id: store.id },
    });

    if (notification) {
      notification.is_read = true;
      await notification.save();
    }

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};
