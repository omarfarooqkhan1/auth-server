const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
     
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'client',
       
    },
    vendorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendor',
       
    },
    
    city:{
       type:String,
       default:''
    },
    street:{
        type:String,
       default:''
       
    },
    houseNumber:{
        type:String,
        default:''
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

addressSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

addressSchema.set('toJSON', {
    virtuals: true,
});

mongoose.model('Address', addressSchema);
