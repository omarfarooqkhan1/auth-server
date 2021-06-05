const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    userName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        default:''
    },
    cnic:{
        type: String,
        default:''
    },
    passwordHash:{
        type: String,
        default:''
    },
    phone:{
        type: String,
        default:''
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    joiningDate:{
        type: Date,
        default: Date.now
    },
    acceptedOrders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    }],
    cancelledOrders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    }],
    image:{
        type:String,
        default:''
    },
    images:[{
        type:String,
        default:''
    }],
    status:{
        type:String,
        default:''
    },
    level:{
        type:String,
        default:''
    },
    acceptanceRate:{
        type:String,
        default:''
    },
    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address'
    },
    comment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        default:[]
    }],
    service:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service',
        default:[]
    }],
    hearts:{
        type:String,
        default:'0'
    }
});

vendorSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

vendorSchema.set('toJSON', {
    virtuals: true,
});

mongoose.model('Vendor', vendorSchema);
