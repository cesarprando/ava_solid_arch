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

    }

    static async getAllUserPets(req, res) {

    }

    static async getAllUserAdoptions(req, res) {

    }

    static async getPetById(req, res) {

    }

    static async removePetById(req, res) {

    }


    static async updatePet(req, res) {

    }

    static async schedule(req, res) {

    }

    static async concludeAdoption(req, res) {

    }
}