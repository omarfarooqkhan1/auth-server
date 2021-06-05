const mongoose = require('mongoose');

const accpetedOrderSchema = mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    },
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    vendorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        
    },
    price:{
       type:String,
       default:'0'
    },
    completionTime:{
        type:String,
        default:'0'
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

accpetedOrderSchema .virtual('id').get(function () {
    return this._id.toHexString();
});

accpetedOrderSchema.set('toJSON', {
    virtuals: true,
});


mongoose.model('accpetedorder', accpetedOrderSchema);
