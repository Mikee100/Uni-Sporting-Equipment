const BorrowedEquipment = require('../models/borrowedEquipment');
const Penalties = require('../models/penalties');

const getAllBorrowed = async (req, res) => {
  try {
    const records = await BorrowedEquipment.getAll();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch borrowed equipment.', error: error.message });
  }
};

const getBorrowedById = async (req, res) => {
  try {
    const record = await BorrowedEquipment.getById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch record.', error: error.message });
  }
};

const getBorrowedByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    console.log('getBorrowedByUser called for userId:', userId, 'req.user:', req.user); // Debug log
    const records = await BorrowedEquipment.getByUser(userId);
    console.log('Records found:', records.length); // Debug log
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user records.', error: error.message });
  }
};

const borrowEquipment = async (req, res) => {
  try {
    const { user_id, equipment_id, notes, due_date } = req.body;
    if (!user_id || !equipment_id) {
      return res.status(400).json({ message: 'user_id and equipment_id are required.' });
    }
    const record = await BorrowedEquipment.borrow({ user_id, equipment_id, notes, due_date });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to borrow equipment.', error: error.message });
  }
};

const returnEquipment = async (req, res) => {
  try {
    const { due_date, status, notes } = req.body;
    console.log('Return request:', { due_date, status, notes });
    const record = await BorrowedEquipment.returnEquipment(req.params.id, { due_date, status, notes });

    // Fetch the borrow record to get user_id, equipment_id, due_date
    const borrowRecord = await BorrowedEquipment.getById(req.params.id);
    console.log('Borrow record:', borrowRecord);

    // Automatic penalty for lost or damaged equipment
    if (status === 'lost' || status === 'damaged') {
      if (borrowRecord) {
        const penaltyAmount = status === 'lost' ? 100 : 50; // Example: $100 for lost, $50 for damaged
        const reason = status === 'lost' ? 'Equipment lost' : 'Equipment damaged';
        console.log('Creating penalty for lost/damaged:', { user_id: borrowRecord.user_id, borrowed_equipment_id: borrowRecord.id, amount: penaltyAmount, reason });
        await Penalties.create({
          user_id: borrowRecord.user_id,
          borrowed_equipment_id: borrowRecord.id,
          amount: penaltyAmount,
          reason,
          status: 'unpaid'
        });
      }
    }

    // Automatic penalty for late return
    if (borrowRecord && borrowRecord.due_date && status === 'returned') {
      const actualReturnDate = due_date ? new Date(due_date) : new Date();
      const dueDate = new Date(borrowRecord.due_date);
      console.log('Comparing dates for late penalty:', { actualReturnDate, dueDate });
      if (actualReturnDate > dueDate) {
        console.log('Creating penalty for late return:', { user_id: borrowRecord.user_id, borrowed_equipment_id: borrowRecord.id, amount: 20 });
        await Penalties.create({
          user_id: borrowRecord.user_id,
          borrowed_equipment_id: borrowRecord.id,
          amount: 20, // Example: $20 for late return
          reason: 'Late return',
          status: 'unpaid'
        });
      }
    }

    res.json(record);
  } catch (error) {
    console.error('Error in returnEquipment:', error);
    res.status(500).json({ message: 'Failed to return equipment.', error: error.message });
  }
};

const requestBorrow = async (req, res) => {
  try {
    const { equipment_id, notes, due_date } = req.body;
    const user_id = req.user.id;
    if (!equipment_id) {
      return res.status(400).json({ message: 'equipment_id is required.' });
    }
    const record = await BorrowedEquipment.request({ user_id, equipment_id, notes, due_date });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to request borrow.', error: error.message });
  }
};

const cancelBorrowRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;
    // Only allow deleting if the request is pending and belongs to the user
    const record = await BorrowedEquipment.getById(id);
    if (!record) return res.status(404).json({ message: 'Request not found.' });
    if (record.user_id !== user_id) return res.status(403).json({ message: 'Not authorized.' });
    if (record.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be cancelled.' });
    await BorrowedEquipment.delete(id);
    res.json({ message: 'Request cancelled.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel request.', error: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  console.log('Controller: getPendingRequests called by user:', req.user ? req.user.id : 'unknown');
  try {
    const records = await BorrowedEquipment.getPending();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending requests.', error: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const id = req.params.id;
    // Optionally, check if already approved/rejected
    const record = await BorrowedEquipment.getById(id);
    if (!record) return res.status(404).json({ message: 'Request not found.' });
    if (record.status !== 'pending') return res.status(400).json({ message: 'Request is not pending.' });
    // Set status to 'borrowed'
    const updated = await BorrowedEquipment.updateStatus(id, 'borrowed');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve request.', error: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const record = await BorrowedEquipment.getById(id);
    if (!record) return res.status(404).json({ message: 'Request not found.' });
    if (record.status !== 'pending') return res.status(400).json({ message: 'Request is not pending.' });
    // Set status to 'rejected'
    const updated = await BorrowedEquipment.updateStatus(id, 'rejected');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request.', error: error.message });
  }
};

module.exports = {
  getAllBorrowed,
  getBorrowedById,
  getBorrowedByUser,
  borrowEquipment,
  returnEquipment,
  requestBorrow,
  cancelBorrowRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest
}; 