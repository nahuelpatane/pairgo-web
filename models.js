import mongoose from 'mongoose';

const { Schema } = mongoose;

const COLORS = ['#e8654a','#60a5fa','#a78bfa','#34d399','#f472b6','#fbbf24','#6ee7b7','#c084fc'];

const jsonTransform = {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    // subdocuments declared with { _id: false } have no _id
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    return ret;
  },
};

// ── User ──────────────────────────────────────────────────────

const userSchema = new Schema({
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  name:           { type: String, required: true, trim: true },
  initials:       String,
  avatarColor:    String,
  role:           { type: String, enum: ['backpacker', 'manager'], required: true },
  // shared
  phone:          String,
  nationality:    String,
  languages:      [String],
  profilePhoto:   String,
  bio:            String,
  // backpacker
  currentCity:    String,
  targetCity:     String,
  visaType:       String,
  certifications: [String],
  availableFrom:  String,
  currentRole:    String,
  availability:   Schema.Types.Mixed,
  videoUrl:       String,
  workExperience: [Schema.Types.Mixed],
  // manager
  venueName:      String,
  city:           String,
  venueType:      String,
  roleNeeded:     String,
  lookingForSwap: { type: Boolean, default: false },
}, { timestamps: true, toJSON: jsonTransform });

userSchema.pre('save', function () {
  if (this.isNew && !this.avatarColor) {
    const id = this._id.toString();
    this.avatarColor = COLORS[id.charCodeAt(id.length - 1) % COLORS.length] || '#e8654a';
  }
});

// ── Position ──────────────────────────────────────────────────

const positionSchema = new Schema({
  status: { type: String, default: 'open' },
}, { strict: false, timestamps: true, toJSON: jsonTransform });

// ── SwapRequest ───────────────────────────────────────────────

const swapRequestSchema = new Schema({
  backpackerId: String,
  managerId:    String,
  positionId:   String,
  status:       { type: String, default: 'pending' },
  rating:       { type: Schema.Types.Mixed, default: null }, // { score, comment, createdAt }
}, { strict: false, timestamps: true, toJSON: jsonTransform });

// ── Employment ────────────────────────────────────────────────
// Links a worker to the venue they currently work at. The manager confirms it,
// which is what makes the worker "verified" and eligible for swaps.

export const EMPLOYMENT_STATUSES = ['pending', 'active', 'rejected', 'cancelled', 'ended'];

const employmentSchema = new Schema({
  workerId:  { type: String, required: true, index: true },
  managerId: { type: String, required: true, index: true },
  role:      { type: String, required: true, trim: true },
  startDate: String,
  // snapshot of the venue at the time of linking
  venueName: String,
  city:      String,
  status:    { type: String, enum: EMPLOYMENT_STATUSES, default: 'pending' },
  confirmedAt: Date,
  endedAt:     Date,
}, { timestamps: true, toJSON: jsonTransform });

// ── Swap ──────────────────────────────────────────────────────
// Two verified workers in different cities trade jobs. A proposes, B accepts,
// then both managers must approve before it is confirmed.
//
// proposed → accepted → confirmed → active → completed
//          ↘ declined  ↘ rejected / cancelled

export const SWAP_STATUSES = ['proposed', 'accepted', 'confirmed', 'active', 'completed', 'declined', 'rejected', 'cancelled'];
export const OPEN_SWAP_STATUSES = ['proposed', 'accepted', 'confirmed', 'active'];

const swapSideSchema = new Schema({
  workerId:     { type: String, required: true },
  managerId:    { type: String, required: true },
  employmentId: { type: String, required: true },
  venueName:    String,
  city:         String,
  approval:     { type: Boolean, default: null }, // manager decision: null = pending
}, { _id: false });

const swapSchema = new Schema({
  a:         { type: swapSideSchema, required: true }, // proposer
  b:         { type: swapSideSchema, required: true },
  role:      { type: String, required: true },
  startDate: String,
  message:   { type: String, maxlength: 500 },
  status:    { type: String, enum: SWAP_STATUSES, default: 'proposed', index: true },
  history:   [{ _id: false, status: String, by: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true, toJSON: jsonTransform });

swapSchema.index({ 'a.workerId': 1 });
swapSchema.index({ 'b.workerId': 1 });
swapSchema.index({ 'a.managerId': 1 });
swapSchema.index({ 'b.managerId': 1 });

export const User             = mongoose.model('User',             userSchema);
export const Swap             = mongoose.model('Swap',             swapSchema);
export const Employment       = mongoose.model('Employment',       employmentSchema);
export const Position         = mongoose.model('Position',         positionSchema);
export const SwapRequest      = mongoose.model('SwapRequest',      swapRequestSchema);
