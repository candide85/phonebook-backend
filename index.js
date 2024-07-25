const express = require('express')
const app = express()



// morgan.token('req-body',(req) =>  JSON.stringify(req.body))
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms - Body: :req-body'))




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

// const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(requestLogger)


// display all data from array data
app.get('/api/persons', (request, response) => {
    try {
        response.json(data)        
    } catch (error) {
        console.log(error);
    }
})

// display custom data
app.get('/info', (resquest, response) => {
    let contactNumber = data.length
    let date = new Date()
    response.end(
        `<p>Phonebook has info for ${contactNumber} persons</p><p>${date}</p>`
    )
})

// display a single phonebook entry
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    const singleEntry = data.find(entry => entry.id === id)

    if(singleEntry) {
        response.json(singleEntry)
    }else{
        response.status(404).end(`<p>phonebook not found</p>`)
    }

})


// Delete a single phonebook entry
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;

    const person = data.filter(entry => entry.id !== id)

    response.status(204).end('contact remove successfully', person)
    // console.log(person);
}) 


// add new person to phonebook

const generateId = () => {
    const randomNumber = Math.floor(Math.random() * 1000)
    const phoneId = data.map(num => num.id !== randomNumber) ? randomNumber : randomNumber 
    return phoneId    
}


app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name) {
        return response.status(404).json({'error': 'name is missing'})
    }

    if(!body.number) {
        return response.status(404).json({'error': 'number is missing'})
    }

    const duplicate = data.find(entry => entry.name === body.name)

    if(duplicate) {return response.status(409).json({'error': 'duplicate name, name must be unique'})}

    const entry = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    data = data.concat(entry)
    
    response.json(data)

})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)})
