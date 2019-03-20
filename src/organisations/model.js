const geocoder = require('./utils/geocode');

module.exports = (mongoose) => {
  const { Schema } = mongoose;

  const pointSchema = new Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  }, { _id: false });

  const Organisation = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    website: { type: String },
    email: { type: String },
    telephone: { type: String },
    address: { type: String },
    zipcode: { type: String },
    city: { type: String },
    location: { type: pointSchema },
    venues: [{
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      autopopulate: true,
    }],
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      autopopulate: true,
    }],
    accessibility_wheelchair: {
      type: String,
      enum: [
        'yes',
        'no',
        'limited',
        'unknown',
      ],
    },
    accessibility_blind: {
      type: String,
    },
    accessibility_deaf: {
      type: String,
    },
    openingHours: {
      type: String,
    },
    types: [{
      type: String,
      enum: [
        'organisation',
        'venue',
        'organisation and venue',
      ],
    }],
  }, { timestamps: true, toJSON: { virtuals: true } });

  Organisation.index({
    name: 'text',
    description: 'text',
    website: 'text',
    address: 'text',
    city: 'text',
  });

  Organisation.index({ location: '2dsphere' });

  Organisation.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'organisation',
    autopopulate: {
      maxDepth: 1,
      select: '-password',
    },
  });

  Organisation.virtual('logo', {
    ref: 'File',
    localField: '_id',
    foreignField: 'location',
    justOne: true,
    autopopulate: {
      match: { type: 'logo' },
      maxDepth: 1,
    },
  });

  Organisation.virtual('images', {
    ref: 'File',
    localField: '_id',
    foreignField: 'location',
    autopopulate: {
      maxDepth: 1,
    },
  });

  const getFullAddress = doc => [doc.address, doc.zipcode, doc.city].join(' ');

  Organisation.method('fullAddress', function () {
    return getFullAddress(this);
  });

  // workaround for https://github.com/Automattic/mongoose/issues/964
  Organisation.pre('findOneAndUpdate', async function geocode() {
    const doc = await this.model.findById(this._conditions._id);
    if (
      doc
        && this._update.address && this._update.zipcode && this._update.city
        && (doc.fullAddress() !== getFullAddress(this._update))
    ) {
      try {
        this._update.location = await geocoder.geocode(this._update);
      } catch (err) {
        this._update.location = undefined;
        console.log('Error geocoding:', err);
      }

/*       try {
        const {
          osmId,
          wikidataId,
          accessibility,
          openingHours,
        } = await osm.getOSMData(this._update);

        if (osmId) this._update.osmId = osmId;
        if (wikidataId) this._update.wikidataId = wikidataId;
        if (accessibility) this._update.accessibility = accessibility;
        if (openingHours) this._update.openingHours = openingHours;
      } catch (err) {
        this._update.accessibility = undefined;
      } */
    }
  });

  return mongoose.model('Organisation', Organisation);
};
