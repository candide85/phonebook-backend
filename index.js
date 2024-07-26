const express = require('express')
const app = express()
require('dotenv').config()
const Contact = require('./model/contacts')



let data = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  
  const errorHandler = (error, request, response, next) => {
      console.error(error.message)
  
    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }else if(error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    
    next(error)
}



// display all data from array data
app.get('/api/persons', (request, response) => {
    Contact.find({})
    .then(contact => response.json(contact))
    .catch(error => console.log(error))
})

// display custom data
app.get('/info', (resquest, response) => {
    Contact.find({}).then(contact => response.status(200).send(`<h3>the phone book has ${contact.length} contacts</h3><h3>${contact.map(time => time.date)}</h3>`))
    
})

// display a single phonebook entry
app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    
    Contact.findById(id)
    .then(contact => {
        if(contact) {
            response.json(contact)
        }else{
            response.status(404).end()
        }
    })
    .catch(error => next(error))
    
})


// Delete a single phonebook entry
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    
    Contact.findByIdAndDelete(id)
    .then(contact => response.json(contact))
    .catch(error => console.log(error))
}) 


// async function updateUserAgeByUsername(username, newNumber) {
//     try {
//       const result = await Contact.find({}).then(res => res.forEach(user => user.name))
      
//       if (!result) {
//         console.log('No user found with the given username');
//       } else {
//         result.number = newNumber
//         console.log('User phone number updated successfully');
//       }
//     } catch (error) {
//       console.error('Error updating user age:', error);
//     }
//   }


// add new person to phonebook
app.post('/api/persons', async (request, response) => {
    const body = request.body
    
    if(!body.name) {
        return response.status(404).json({'error': 'name is missing'})
    }
    
    if(!body.number) {
        return response.status(404).json({'error': 'number is missing'})
    }
    
    
    const contact = new Contact({
        name: body.name,
        number: body.number
    })

      contact.save().then(newContact => response.json(newContact))
      .catch(error => console.log(error) )        
    
})



// UPDATE CONTACT
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id

    const updateContact = {
        name: body.name,
        number: body.number
    }
    
    Contact.findByIdAndUpdate(id,updateContact, {new: true}).then(contact => response.json(contact))
    .catch(error => next(error))
})
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)})
