const Pet = require('../models/Pet')

const mongoose = require('mongoose')

const getToken = require('../helpers/get-tokens')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class PetController {

    static async create(req, res) {

        const { name, age, weight, color } = req.body

        const images = []

        if (req.files) {
            req.files.forEach((image) => {
                images.push(image.filename)
            })
        }

        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }

        if (!age) {
            res.status(422).json({ message: 'A idade é obrigatória!' })
            return
        }

        if (!weight) {
            res.status(422).json({ message: 'O peso é obrigatório!' })
            return
        }

        if (!color) {
            res.status(422).json({ message: 'A cor é obrigatória!' })
            return
        }

        if (images.length === 0) {
            res.status(422).json({ message: 'A imagem é obrigatória!' })
            return
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            images,
            available: true,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                image: user.image,
            }
        })

        try {

            const newPet = await pet.save()

            res.status(201).json({
                message: 'Pet cadastrado com sucesso!',
                pet: newPet
            })

        } catch (error) {
            res.status(500).json({
                message: error
            })
        }
    }

    static async getAll(req, res) {
        const pets = await Pet.find().sort('-createdAt')

        res.status(200).json({
            pets: pets
        })
    }

    static async getAllUserPets(req, res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt')

        res.status(200).json({
            pets
        })
    }

    static async getAllUserAdoptions(req, res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt')

        res.status(200).json({
            pets
        })
    }

    static async getPetById(req, res) {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({
            message: 'ID inválido!'
        })
            return
        }

        const pet = await Pet.findById(id)

        if (!pet) {
            res.status(404).json({
                message: 'Pet não encontrado!'
            })
            return
        }

        res.status(200).json({
            pet
        })
    }

    static async removePetById(req, res) {
        const id = req.params.id
        const pet = await Pet.findById(id)

        if (!pet) {
            res.status(404).json({
                message: 'Pet não encontrado!'
            })
            return
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({
                message: 'Houve um problema em processar sua solicitação!'
            })
            return
        }

        await Pet.findByIdAndDelete(id)

        res.status(200).json({
            message: 'Pet removido com sucesso!'
        })
    }


    static async updatePet(req, res) {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({
                message: 'ID inválido!'
            })
            return
        } 

        const pet = await Pet.findById(id)

        if (!pet) {
            res.status(404).json({
                message: 'Pet não encontrado!'
            })
            return
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({
                message: 'Acesso negado!'
            })
            return
        }

        const updatedData = {}

        if (req.body.name) {
            updatedData.name = req.body.name
        }

        if (req.body.age) {
            updatedData.age = req.body.age
        }

        if (req.body.weight) {
            updatedData.weight = req.body.weight
        }

        if (req.body.color) {
            updatedData.color = req.body.color
        }

        if (req.files && req.files.length > 0) {

            updatedData.images = []

            req.files.forEach((image) => {
                updatedData.images.push(image.filename)
            })
        }

        await Pet.findByIdAndUpdate(id, updatedData)

        res.status(200).json({
            message: 'Pet atualizado com sucesso!'
        })
    }

    static async schedule(req, res) {

    }

    static async concludeAdoption(req, res) {

    }
}