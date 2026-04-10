import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';

export async function addActivity(event) {
  try {
    await dbConnect();

    // Rolling 50-activity cap: delete oldest if at limit
    const all = await Activity.find({ userId: event.userId })
      .sort({ createdAt: -1 })
      .limit(51)
      .lean();

    if (all.length >= 50) {
      await Activity.findByIdAndDelete(all[all.length - 1]._id);
    }

    await Activity.create({
      userId:    event.userId,
      role:      event.role,
      type:      event.type,
      message:   event.message,
      meta:      event.meta || {},
      read:      false,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
