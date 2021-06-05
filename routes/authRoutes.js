const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { jwtKey } = require("../keys");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Vendor = mongoose.model("Vendor");
const Client = mongoose.model("Client");
const Address = mongoose.model("Address");
const Service = mongoose.model("Service");
const Category = mongoose.model("Category");
const UnVerifiedVendor = mongoose.model("unverifiedvendors");
const BlockedVendor = mongoose.model("blockedvendors");
const BlockedService = mongoose.model("blockedservice");
const AcceptedOrder = mongoose.model("accpetedorder");
const CompletedOrder = mongoose.model("CompletedOrder");

router.post("/signup", async (req, res) => {
  const userName =
    req.body.firstName +
    "_" +
    req.body.lastName +
    Math.floor(Math.random() * 100);
  try {
    const vendor = new Vendor({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: userName,
      email: userName + "@gmail.com",
      cnic: req.body.cnic,
      passwordHash: await bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      image: req.body.image,
    });

    const unVerifiedVendor = new UnVerifiedVendor({
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      userName: vendor.userName,
      email: vendor.userName + "@gmail.com",
      cnic: vendor.cnic,
      passwordHash: vendor.password,
      phone: vendor.phone,
      image: vendor.image,
    });

    const vendorId = vendor._id;
    const address = new Address({
      vendorId: vendorId,
      city: req.body.city,
      street: req.body.street,
      houseNumber: req.body.houseNumber,
    });
    vendor.address = address._id;
    unVerifiedVendor.address = vendor.address;
    await address.save();
    await vendor.save();
    await unVerifiedVendor.save();
    res.send(unVerifiedVendor);
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.put("/updateProfile/:vendorId", async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.vendorId,
    {
      phone: req.body.phone,
      image: req.body.image,
    },
    {
      new: true,
    }
  );
  const address = await Address.findByIdAndUpdate(
    vendor.address,
    {
      city: req.body.city,
      street: req.body.street,
      houseNumber: req.body.houseNumber,
    },
    {
      new: true,
    }
  );
  if (!vendor) {
    return res.send({ error: "Sorry, no vendor found with this id!" });
  }
  return res.send({ vendor: vendor, vendorAddress: address });
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.send({ error: "Must provide both email and password!" });
  }
  const vendor = await Vendor.findOne({ phone });
  if (!vendor) {
    return res.send({ error: "Invalid mobile no. or password!!" });
  }
  try {
    if (bcrypt.compareSync(req.body.password, vendor.passwordHash)) {
      const unVerifiedVendor = await UnVerifiedVendor.findOne({ phone });
      if (!unVerifiedVendor) {
        const blockedVendor = await BlockedVendor.findOne({ phone });
        if (!blockedVendor) {
          const token = jwt.sign({ vendorId: vendor._id }, jwtKey);
          return res.send({ vendor: vendor, token: token });
        }
        return res.send({ error: "Your account has been blocked by admin!" });
      }
      return res.send({ error: "Your account has not been verified yet!" });
    } else {
      return res.send({ error: "Invalid mobile no. or password!" });
    }
  } catch (err) {
    return res.send({ error: err });
  }
});

router.post("/addService", async (req, res) => {
  const { phone } = req.body;
  const name = req.body.category;
  var color;
  switch (name) {
    case "Electrical":
      color = "red";
    case "Mechanical":
      color = "blue";
    case "Gardening":
      color = "green";
  }

  if (!phone) {
    return res.send({ error: "Vendor must be logged in for this purpose!" });
  }
  try {
    const vendor = await Vendor.findOne({ phone });
    console.log(vendor);
    const service = new Service({
      vendorId: vendor._id,
      vendorName: vendor.firstName + " " + vendor.lastName,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      availibility: req.body.availibility,
    });
    var category = await Category.findOne({ name });
    if (!category) {
      category = new Category({
        name: name,
        icon: "https://res.cloudinary.com/omarfarooqkhan/image/upload/v1622051952/icon_mlgd2f.png",
        color: color,
      });
      await category.save();
    }
    service.category = category._id;
    vendor.service.push(service._id);
    await service.save();
    await vendor.save();
    return res.send({ service: service });
  } catch (err) {
    return res.send(err.message);
  }
});

router.post("/editService/:id", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.send({ error: "Vendor must be logged in for this purpose!" });
  }
  try {
    const service = Service.findById(req.params.id);
    service.title = req.body.title;
    service.description = req.body.description;
    service.price = req.body.price;
    service.availibility = req.body.availibility;
    await vendor.save();
    return res.send({ service: service });
  } catch (err) {
    return res.send(err.message);
  }
});

router.get("/myServices/:phone", async (req, res) => {
  const { phone } = req.params;
  if (!phone) {
    return res.send({ error: "Vendor must be logged in for this purpose!" });
  }
  try {
    const vendor = await Vendor.findOne({ phone });
    const vendorId = vendor._id;
    const vendorName = vendor.firstName + " " + vendor.lastName;
    const services = await Service.find({ vendorId });
    const blockedServices = await BlockedService.find({ vendorName });
    var availableServices = [];
    for (var i = 0; i < services.length; i++) {
      for (var j = 0; j < blockedServices.length; j++) {
        if (services[i].title != blockedServices[j].title)
          availableServices.push(services[i]);
      }
    }
    res.send({ services: availableServices });
  } catch (err) {
    return res.send(err.message);
  }
});

router.get("/getAddress/:id", async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    res.send({ address: address });
  } catch (err) {
    return res.send(err.message);
  }
});

router.get("/getService/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    res.send({ service: service });
  } catch (err) {
    return res.send(err.message);
  }
});

router.get("/ongoingAppointments/:phone", async (req, res) => {
  const { phone } = req.params;
  if (!phone) {
    return res.send({ error: "Vendor must be logged in for this purpose!" });
  }
  try {
    const vendor = await Vendor.findOne({ phone });
    const vendorName = vendor.userName;
    const appointments = await AcceptedOrder.find({ vendorName })
      .populate("serviceId")
      .populate("clientId");
    // const completedAppointments = await CompletedOrder.find({vendorName});
    // var ongoingAppointments = [];
    // for (var i = 0; i < appointments.length; i++) {
    //     for (var j = 0; j < completedAppointments.length; j++) {
    //         if(appointments[i].dateCreated != completedAppointments[j].dateCreated)
    //         ongoingAppointments.push(appointments[i]);
    //     }
    // }
    res.send({ appointments: appointments });
  } catch (err) {
    return res.send(err.message);
  }
});

router.post("/completeAppointment/:id", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.send({ error: "Vendor must be logged in for this purpose!" });
  }
  try {
    const appointment = await AcceptedOrder.findById();
    const completedAppointment = new CompletedOrder({
      serviceId: appointment.serviceId,
      clientId: appointment.clientId,
      vendorId: appointment.vendorId,
      price: appointment.price,
      completionTime: appointment.completionTime,
      dateCreated: appointment.dateCreated,
    });
    await completedAppointment.save();
    res.send({ completedAppointment: completedAppointment });
  } catch (err) {
    return res.send(err.message);
  }
});

router.delete("/myServices/:id", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.send({ error: "Vendor must be logged in for this purpose!" });
  }
  try {
    const vendor = await Vendor.findOne({ phone });
    const service = await Service.findByIdAndDelete(req.params.id);
    await vendor.service.filter((id) => id !== service._id);
    await vendor.save;
    console.log(service);
    return res.send({ message: "Success" });
  } catch (err) {
    return res.send(err.message);
  }
});

module.exports = router;
