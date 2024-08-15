const { Router } = require("express");
const { getRepository } = require("typeorm");
const Contact = require("../entity/Contact");

const router = Router();
const contactRepository = getRepository(Contact);

router.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;
  let contacts = [];
  let flag = false;

  if (email && phoneNumber) {
    contacts = await contactRepository.find({
      where: { email, phoneNumber },
    });

    if (contacts.length === 0) {
      contacts = await contactRepository.find({
        where: [{ email }, { phoneNumber }],
      });
      flag = true;
    }
  } else if (email) {
    contacts = await contactRepository.find({ where: { email } });
    for (const contact of contacts) {
      const subContacts = await contactRepository.find({ where: { phoneNumber: contact.phoneNumber } });
      contacts = contacts.concat(subContacts);
    }
    flag = true;
  } else if (phoneNumber) {
    contacts = await contactRepository.find({ where: { phoneNumber } });
    for (const contact of contacts) {
      const subContacts = await contactRepository.find({ where: { email: contact.email } });
      contacts = contacts.concat(subContacts);
    }
    flag = true;
  }

  if (contacts.length > 0 && flag && email && phoneNumber) {
    const primaryCont = contacts.reduce((earliest, contact) => {
      return earliest.createdAt < contact.createdAt ? earliest : contact;
    }, contacts[0]);

    // Update linkPrecedence for all secondary contacts if primary is found
    await Promise.all(
      contacts.map(async (contact) => {
        if (contact.linkPrecedence === "primary" && contact.id !== primaryCont.id) {
          contact.linkPrecedence = "secondary";
          contact.linkedId = primaryCont.id;
          await contactRepository.save(contact);
        }
      })
    );

    const newContact = contactRepository.create({
      email,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      linkPrecedence: "secondary",
      linkedId: primaryCont.id,
    });

    contacts.push(newContact);
    await contactRepository.save(newContact);

    const emails = [...new Set(contacts.map((val) => val.email))];
    const phoneNumbers = [...new Set(contacts.map((val) => val.phoneNumber))];
    const secondaryContactIds = [
      ...new Set(
        contacts
          .filter((val) => val.id !== primaryCont?.id)
          .map((val) => val.id)
      ),
    ];

    return res.json({
      contact: {
        primaryContactId: primaryCont.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } else if (contacts.length === 0 && email && phoneNumber) {
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
        primaryContactId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: [],
      },
    });
  }

  // Final contact data preparation for response
  const primaryContact = contacts.find((contact) => contact.linkPrecedence === "primary") || contacts[0];

  // Update secondary contacts to have `linkPrecedence` as "secondary" if primary is found
  await Promise.all(
    contacts.map(async (contact) => {
      if (contact.linkPrecedence === "primary" && contact.id !== primaryContact.id) {
        contact.linkPrecedence = "secondary";
        contact.linkedId = primaryContact.id;
        await contactRepository.save(contact);
      }
    })
  );

  const secondaryContactIds = [
    ...new Set(
      contacts
        .filter((val) => val.id !== primaryContact?.id)
        .map((val) => val.id)
    ),
  ];

  const emails = [...new Set(contacts.map((val) => val.email))];
  const phoneNumbers = [...new Set(contacts.map((val) => val.phoneNumber))];


  return res.json({
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  });
});


  
// To get all the contacts from the database
router.get("/contacts", async (req, res) => {
    try {
      const contacts = await contactRepository.find();
      res.json(contacts);
    } catch (error) {
      
      res.status(500).json({ message: "Error fetching contacts" });
    }
  });

  router.post("/add-contact", async (req, res) => {
    const { email, phoneNumber,linkPrecedence } = req.body;
  
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
        linkPrecedence: linkPrecedence,
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
      
      res.status(500).json({ message: "Error adding contact" });
    }
  });

  router.delete("/delete", async (req, res) => {
    
  
    
  
    try {
      // Get all the documents from the database
      const contacts = await contactRepository.find();
     
  
    for(let i=0;i<contacts.length;i++){
      let cont=await contactRepository.findOne({where :{id:contacts[i].id}})
      
      contactRepository.remove(cont)  // Removing every element from the database
    }
  
      
      res.status(201).json({
        message:'deleted'
      });
    } catch (error) {
      
      res.status(500).json({ message: "Error deleting contact" });
    }
  });

module.exports = router;
