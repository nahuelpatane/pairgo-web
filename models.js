import mongoose from 'mongoose';

const { Schema } = mongoose;

const COLORS = ['#e8654a','#60a5fa','#a78bfa','#34d399','#f472b6','#fbbf24','#6ee7b7','#c084fc'];

const jsonTransform = {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
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
  // manager
  venueName:      String,
  city:           String,
  venueType:      String,
  roleNeeded:     String,
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
  rating:       { type: Number, default: null },
}, { strict: false, timestamps: true, toJSON: jsonTransform });

// ── JobPost ───────────────────────────────────────────────────

const jobPostSchema = new Schema({
  managerId:      { type: String, required: true },
  venueName:      { type: String, required: true },
  position:       { type: String, required: true },
  location:       { type: String, required: true },
  salaryRate:     String,
  contractType:   { type: String, enum: ['Casual', 'Part-time', 'Full-time'] },
  scheduleNeeded: Schema.Types.Mixed,
  description:    String,
  status:         { type: String, default: 'active' },
}, { timestamps: true, toJSON: jsonTransform });

// ── AvailabilityPost ──────────────────────────────────────────

const availabilityPostSchema = new Schema({
  backpackerId:            { type: String, required: true, unique: true },
  visaStatus:              String,
  languages:               [String],
  currentCity:             String,
  targetCity:              String,
  arrivalDate:             String,
  availabilityGrid:        Schema.Types.Mixed,
  isActive:                { type: Boolean, default: true },
  introVideoUrl:           String,
  verifiedExperienceCount: { type: Number, default: 0 },
}, { timestamps: true, toJSON: jsonTransform });

export const User             = mongoose.model('User',             userSchema);
export const Position         = mongoose.model('Position',         positionSchema);
export const SwapRequest      = mongoose.model('SwapRequest',      swapRequestSchema);
export const JobPost          = mongoose.model('JobPost',          jobPostSchema);
export const AvailabilityPost = mongoose.model('AvailabilityPost', availabilityPostSchema);
