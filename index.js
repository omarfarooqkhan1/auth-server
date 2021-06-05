const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const { mongoUrl } = require('./keys');
require('./models/Vendor');
require('./models/Client');
require('./models/Address');
require('./models/Service');
require('./models/Category');
require('./models/UnVerifiedVendors');
require('./models/BlockedVendors');
require('./models/BlockedService');
require('./models/AcceptedOrder');
require('./models/CompletedOrder');

const authRoutes = require('./routes/authRoutes');
const requireToken = require('./middleware/requireToken');

app.use(bodyParser.json());
app.use(authRoutes);

mongoose.connect(mongoUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log("Connected to MongoDB!");
})

mongoose.connection.on('error', (err) => {
    console.log("This is error",err);
})

app.get('/',requireToken, (req, res) => {
    res.send('Your email is: '+ req.vendor.email);
})

var server = app.listen(PORT, () => {
    var port = server.address().port;
    console.log("Server is running on PORT: "+port);
})