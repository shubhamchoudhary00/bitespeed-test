const { Router } = require("express");
const { getRepository } = require("typeorm");
const Contact = require("../entity/Contact");

const router = Router();
const contactRepository = getRepository(Contact);

router.post("/identify", async (req, res) => {
    const { email, phoneNumber } = req.body;
    let contacts = [];
    let flag=false;
    
    if (email && phoneNumber) {
        contacts = await contactRepository.find({
          where: { email , phoneNumber },
        });
        console.log('and'+contacts)
        
        if(contacts.length===0){
            contacts = await contactRepository.find({
                where: [{ email }, {phoneNumber }],
              });
            flag=true;      
        }

    } else if (email) {
      contacts = await contactRepository.find({ where: { email } });
      flag=true;
   
    } else if (phoneNumber) {
      contacts = await contactRepository.find({ where: { phoneNumber } });
      flag=true;
     
    }
  
    // If no contacts found, create a new primary contact
    if (contacts.length >0 && flag ) {
        console.log("in it")
        console.log('contacts', contacts);

        const primaryCont = contacts.reduce((earliest, contact) => {
          return earliest.createdAt < contact.createdAt ? earliest : contact;
        }, contacts[0]);
        
        console.log('primary', primaryCont);
        
        const newContact = contactRepository.create({
            email,
            phoneNumber,
            createdAt: new Date(),
            updatedAt: new Date(),
            linkPrecedence: "secondary",
            linkedId:primaryCont.id
          });
          await contactRepository.save(newContact);
          return res.json({
            contact: {
              primaryContatctId: newContact.id,
              emails: [newContact.email],
              phoneNumbers: [newContact.phoneNumber],
              secondaryContactIds: [],
            },
          });
    }else if(contacts.length===0){
        const newContact = contactRepository.create({
            email,
            phoneNumber,
            createdAt: new Date(),
            updatedAt: new Date(),
            linkPrecedence: "primary",
            
          });
          await contactRepository.save(newContact);
          return res.json({
            contact: {
              primaryContatctId: newContact.id,
              emails: [newContact.email],
              phoneNumbers: [newContact.phoneNumber],
              secondaryContactIds: [],
            },
          });
    }
  
    // Group contacts by primary and secondary
    const primaryContact = contacts.find((contact) => contact.linkPrecedence === "primary");
    const secondaryContacts = contacts.filter((contact) => contact.linkPrecedence === "secondary");
  
    // Use a map to track processed phone numbers and emails
    const phoneToEmailMap = new Map();
    const emailSet = new Set();
    const phoneSet = new Set();
    const secondaryContactIds = [];
  
    contacts.forEach((contact) => {
      if (contact.phoneNumber) {
        phoneToEmailMap.set(contact.phoneNumber, contact.email);
        phoneSet.add(contact.phoneNumber);
      }
      if (contact.email) {
        emailSet.add(contact.email);
      }
      if (contact.linkPrecedence === "secondary") {
        secondaryContactIds.push(contact.id);
      }
    });
  
    // Add emails for all phone numbers and vice versa
    const emails = Array.from(emailSet);
    const phoneNumbers = Array.from(phoneSet);
  
    // Ensure we add emails corresponding to the phone numbers
    phoneNumbers.forEach((phone) => {
      const email = phoneToEmailMap.get(phone);
      if (email) {
        emailSet.add(email);
      }
    });
  
    // Ensure we add phone numbers corresponding to the emails
    emails.forEach((email) => {
      contacts.forEach((contact) => {
        if (contact.email === email && contact.phoneNumber) {
          phoneSet.add(contact.phoneNumber);
        }
      });
    });
  
    return res.json({
      contact: {
        primaryContatctId: primaryContact?.id || contacts[0].id,
        emails: Array.from(emailSet),
        phoneNumbers: Array.from(phoneSet),
        secondaryContactIds,
      },
    });
  });
  

router.get("/contacts", async (req, res) => {
    try {
      const contacts = await contactRepository.find();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Error fetching contacts" });
    }
  });

  router.post("/add-contact", async (req, res) => {
    const { email, phoneNumber } = req.body;
  
    // Check if email and phoneNumber are provided
    if (!email || !phoneNumber) {
      return res.status(400).json({ message: "Email and phoneNumber are required" });
    }
  
    try {
      // Create a new contact
      const newContact = contactRepository.create({
        email,
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        linkPrecedence: "primary",
      });
  
      // Save the contact to the database
      await contactRepository.save(newContact);
  
      // Respond with the created contact
      res.status(201).json({
        contact: {
          id: newContact.id,
          email: newContact.email,
          phoneNumber: newContact.phoneNumber,
        },
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      res.status(500).json({ message: "Error adding contact" });
    }
  });

module.exports = router;
